// Historical/optional Ubuntu tooling. Not used or invoked by Vercel.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');
const { paths, APPROVED_OBJECTS, configurationHash, parseEnvironment } = require('./bigquery-readonly');

function log(msg) {
  console.log(`[Activation] ${msg}`);
}

function logError(msg) {
  console.error(`[Activation ERROR] ${msg}`);
}

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'unknown-commit';
  }
}

function atomicWrite(file, content, mode = 0o640) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o750 });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  fs.writeFileSync(temporary, content, { mode, flag: 'wx' });
  fs.chmodSync(temporary, mode);
  fs.renameSync(temporary, file);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');

    // Extract approval reference
    let approvalRef = '';
    const approvalIndex = args.indexOf('--approval');
    if (approvalIndex !== -1 && approvalIndex + 1 < args.length) {
      approvalRef = args[approvalIndex + 1].trim();
    }

    if (!approvalRef) {
      logError('Explicit approval reference is required. Use: --approval <reference>');
      process.exit(3); // Usage failure
    }

    const testRoot = process.env.DASHBOARD_BIGQUERY_TEST_ROOT || '';
    const targetPaths = paths(testRoot);

    log('Running activation controls...');

    // 1. Check preflight evidence file path safety
    const repoRoot = path.resolve(__dirname, '../..');
    const absoluteEvidencePath = path.resolve(targetPaths.evidenceFile);
    if (absoluteEvidencePath.startsWith(repoRoot)) {
      logError(`Security violation: evidence file path must not be inside the repository root (${repoRoot}).`);
      process.exit(2);
    }

    // 2. Check preflight evidence file exists
    if (!fs.existsSync(targetPaths.evidenceFile)) {
      logError(`Preflight evidence file not found at: ${targetPaths.evidenceFile}`);
      process.exit(1);
    }

    // 3. Parse configuration and check match
    let environment, configuration;
    try {
      const parsed = require('./bigquery-readonly').loadConfiguration(targetPaths);
      environment = parsed.environment;
      configuration = parsed.configuration;
    } catch (e) {
      logError(`Configuration verification failed: ${e.message}`);
      process.exit(1);
    }

    // Unsafe DATA_MODE checks
    const targetDataMode = (environment.DASHBOARD_DATA_MODE || environment.DATA_MODE || '').toLowerCase();
    if (targetDataMode !== 'mock' && targetDataMode !== 'bigquery') {
      logError(`Unsafe DATA_MODE configured: "${targetDataMode}". Only "mock" or "bigquery" are permitted.`);
      process.exit(1);
    }

    // Live GBV check
    if (environment.ENABLE_LIVE_GBV === 'true') {
      logError('Security violation: live GBV must not be enabled.');
      process.exit(2);
    }

    const currentHash = configurationHash(configuration);

    // 4. Load and validate evidence
    let evidence;
    try {
      evidence = JSON.parse(fs.readFileSync(targetPaths.evidenceFile, 'utf8'));
    } catch (e) {
      logError(`Failed to parse evidence file: ${e.message}`);
      process.exit(1);
    }

    // Validate evidence digest/hash matches current configuration
    if (evidence.configurationHash !== currentHash) {
      logError('Evidence configuration hash mismatch. Configuration has changed since preflight.');
      process.exit(1);
    }

    // Validate evidence age (must be within 60 minutes)
    const now = new Date();
    const validatedAt = new Date(evidence.validatedAt);
    const ageMs = now.getTime() - validatedAt.getTime();
    const maxAgeMs = 60 * 60 * 1000; // 60 minutes

    if (isNaN(ageMs) || ageMs < 0 || ageMs > maxAgeMs) {
      logError(`Evidence file is expired or invalid. Age: ${Math.round(ageMs / 1000 / 60)} minutes (Max approved: 60 minutes).`);
      process.exit(1);
    }

    // Validate all four aggregate objects are present and rowCount >= 1
    if (!Array.isArray(evidence.objects) || evidence.objects.length !== APPROVED_OBJECTS.length) {
      logError('Evidence objects contract validation failed.');
      process.exit(1);
    }

    for (const name of APPROVED_OBJECTS) {
      const obj = evidence.objects.find((o) => o.name === name);
      if (!obj || !obj.exists || Number(obj.rowCount) < 1) {
        logError(`Evidence verification failed: Reporting object "${name}" is missing or empty.`);
        process.exit(1);
      }
    }
    log('All four aggregate objects validated and passed.');

    // 5. Verify Next.js build is successful
    const buildIdPath = path.join(__dirname, '../../.next/BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      logError('Production Next.js build is not available. Run "npm run build" first.');
      process.exit(2);
    }

    // 6. Check if apply requires root (uid === 0) on Linux
    const uid = typeof process.getuid === 'function' ? process.getuid() : 0;
    if (apply && process.platform !== 'win32' && uid !== 0) {
      logError('Root/sudo permission is required to apply activation configuration.');
      process.exit(1);
    }

    // 7. Record Git Commit
    const commitHash = getGitCommit();
    log(`Current Git Commit recorded: ${commitHash}`);

    const result = {
      dryRun: !apply,
      activationReady: true,
      dashboardDataMode: apply ? 'bigquery' : 'mock',
      approvalReference: approvalRef,
      gitCommit: commitHash,
      liveGbvEnabled: false,
    };

    if (!apply) {
      log('Dry run completed. Configuration was NOT updated. Use --apply to execute.');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    // 8. Create runtime configuration backup
    const backupDir = testRoot ? path.join(testRoot, '/var/backups/unfpa-mel-dashboard') : '/var/backups/unfpa-mel-dashboard';
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o750 });
    const backupFile = path.join(backupDir, `dashboard.env.bak.${Date.now()}`);

    let backupCreated = false;
    if (fs.existsSync(targetPaths.runtimeEnvironmentFile)) {
      try {
        fs.copyFileSync(targetPaths.runtimeEnvironmentFile, backupFile);
        backupCreated = true;
        log(`Created runtime configuration backup at: ${backupFile}`);
      } catch (e) {
        logError(`Failed to create configuration backup: ${e.message}`);
        process.exit(1);
      }
    } else {
      log('No existing runtime configuration file found to back up.');
    }

    // 9. Update runtime configuration atomically
    let runtimeEnv = {};
    if (backupCreated) {
      try {
        runtimeEnv = parseEnvironment(fs.readFileSync(backupFile, 'utf8'));
      } catch (e) {
        log('Starting with new runtime configuration environment.');
      }
    }

    // Switch data mode to bigquery
    runtimeEnv.DASHBOARD_DATA_MODE = 'bigquery';
    runtimeEnv.DATA_MODE = 'bigquery';
    runtimeEnv.ENABLE_GBV_SUPPRESSION = 'true';
    runtimeEnv.BIGQUERY_PROJECT_ID = configuration.projectId;
    runtimeEnv.BIGQUERY_DATASET_ID = configuration.datasetId;
    runtimeEnv.BIGQUERY_LOCATION = configuration.location;
    runtimeEnv.GOOGLE_CLIENT_EMAIL = configuration.clientEmail;
    runtimeEnv.GOOGLE_PRIVATE_KEY_FILE = configuration.privateKeyFile;
    runtimeEnv.BIGQUERY_MAX_BYTES_BILLED = configuration.maximumBytesBilled || '';

    // Verify git commit mapping
    runtimeEnv.ACTIVATION_COMMIT = commitHash;
    runtimeEnv.ACTIVATION_APPROVAL = approvalRef;

    const updatedContent = Object.entries(runtimeEnv)
      .map(([key, val]) => `${key}=${val}`)
      .join('\n') + '\n';

    const tempFile = path.join(path.dirname(targetPaths.runtimeEnvironmentFile), `.dashboard.env.tmp.${crypto.randomUUID()}`);

    try {
      // Step 9.1: Write to temporary file with restrictive permissions
      fs.writeFileSync(tempFile, updatedContent, { mode: 0o600, flag: 'wx' });
      fs.chmodSync(tempFile, 0o600);

      // Step 9.2: Atomically replace target
      fs.renameSync(tempFile, targetPaths.runtimeEnvironmentFile);
      log(`Successfully updated runtime configuration at: ${targetPaths.runtimeEnvironmentFile}`);

      // Step 9.3: Verify the resulting configuration
      const verifiedContent = fs.readFileSync(targetPaths.runtimeEnvironmentFile, 'utf8');
      const verifiedEnv = parseEnvironment(verifiedContent);
      if (verifiedEnv.DASHBOARD_DATA_MODE !== 'bigquery' || verifiedEnv.DATA_MODE !== 'bigquery') {
        throw new Error('Verification failed: Written configuration does not have bigquery mode activated.');
      }
      log('Runtime configuration verification passed.');
    } catch (e) {
      logError(`Configuration verification failed: ${e.message}. Restoring backup...`);
      // Restore backup if validation failed
      if (backupCreated) {
        fs.copyFileSync(backupFile, targetPaths.runtimeEnvironmentFile);
        log('Restored runtime configuration backup successfully.');
      } else {
        if (fs.existsSync(targetPaths.runtimeEnvironmentFile)) {
          fs.unlinkSync(targetPaths.runtimeEnvironmentFile);
        }
      }
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
      process.exit(1);
    }

    // Log the successful activation to a local log file
    const activationLogPath = testRoot ? path.join(testRoot, '/var/lib/unfpa-mel-dashboard/activation.log') : '/var/lib/unfpa-mel-dashboard/activation.log';
    const logEntry = `[${new Date().toISOString()}] Activated BigQuery. Approval Ref: ${approvalRef}, Commit: ${commitHash}\n`;
    fs.mkdirSync(path.dirname(activationLogPath), { recursive: true });
    fs.appendFileSync(activationLogPath, logEntry, 'utf8');

    log('Dashboard BigQuery activation successful.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    logError(`Usage error: ${error.stack || error.message}`);
    process.exit(3);
  }
}

main();
