// Historical/optional Ubuntu tooling. Not used or invoked by Vercel.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { paths, parseEnvironment } = require('./bigquery-readonly');

function log(msg) {
  console.log(`[Rollback] ${msg}`);
}

function logError(msg) {
  console.error(`[Rollback ERROR] ${msg}`);
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

    let reason = 'Manual rollback requested';
    const reasonIndex = args.indexOf('--reason');
    if (reasonIndex !== -1 && reasonIndex + 1 < args.length) {
      reason = args[reasonIndex + 1].trim();
    }

    const testRoot = process.env.DASHBOARD_BIGQUERY_TEST_ROOT || '';
    const targetPaths = paths(testRoot);

    log('Running safe mock rollback controls...');

    // 1. Locate backup directory and find the latest backup
    const backupDir = testRoot ? path.join(testRoot, '/var/backups/unfpa-mel-dashboard') : '/var/backups/unfpa-mel-dashboard';
    let backupFileToRestore = null;

    if (!fs.existsSync(backupDir)) {
      logError(`Rollback failed: Backup directory does not exist at: ${backupDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter((f) => f.startsWith('dashboard.env.bak.'))
      .map((f) => path.join(backupDir, f))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs); // Sort newest first

    if (backups.length === 0) {
      logError('Rollback failed: No backup files found.');
      process.exit(1);
    }

    // Check for ambiguous backups (e.g. if we have multiple backups with the exact same modification time)
    if (backups.length > 1) {
      const time1 = fs.statSync(backups[0]).mtimeMs;
      const time2 = fs.statSync(backups[1]).mtimeMs;
      if (time1 === time2) {
        logError(`Ambiguous backup target. Multiple backups have the same modification timestamp: ${backups[0]} and ${backups[1]}`);
        process.exit(1);
      }
    }

    backupFileToRestore = backups[0];

    if (!apply) {
      log(`Dry run: Rollback would set DASHBOARD_DATA_MODE and DATA_MODE to "mock".`);
      log(`Dry run: Would restore configuration from latest backup: ${backupFileToRestore}`);
      log('Command to verify health after rollback:');
      console.log('  curl -f http://127.0.0.1:3000/api/health');
      process.exit(0);
    }

    // 2. Perform rollback
    let rollbackContent = '';
    try {
      rollbackContent = fs.readFileSync(backupFileToRestore, 'utf8');
      log(`Restoring configuration from backup: ${backupFileToRestore}`);
    } catch (e) {
      logError(`Failed to read backup file ${backupFileToRestore}: ${e.message}`);
      process.exit(1);
    }
    // If we restored from backup, double check that DATA_MODE/DASHBOARD_DATA_MODE are set to mock
    let env = {};
    try {
      env = parseEnvironment(rollbackContent);
    } catch (e) {}
    env.DATA_MODE = 'mock';
    env.DASHBOARD_DATA_MODE = 'mock';
    rollbackContent = Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n';

    // Write to target paths
    try {
      atomicWrite(targetPaths.runtimeEnvironmentFile, rollbackContent);
      log(`Successfully restored runtime configuration at: ${targetPaths.runtimeEnvironmentFile}`);
    } catch (e) {
      logError(`Failed to write runtime environment: ${e.message}`);
      process.exit(1);
    }

    // 3. Log rollback event
    const logFile = testRoot ? path.join(testRoot, '/var/lib/unfpa-mel-dashboard/rollback.log') : '/var/lib/unfpa-mel-dashboard/rollback.log';
    const logEntry = `[${new Date().toISOString()}] Rollback to mock. Reason: ${reason}\n`;
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, logEntry, 'utf8');

    log('Rollback complete. Health check recommendation:');
    console.log('  curl -f http://127.0.0.1:3000/api/health');
    process.exit(0);
  } catch (error) {
    logError(`Usage error: ${error.stack || error.message}`);
    process.exit(3);
  }
}

main();
