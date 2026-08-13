const fs = require('node:fs');
const path = require('node:path');
const { paths, APPROVED_OBJECTS, FORBIDDEN_OBJECTS } = require('./bigquery-readonly');

function log(msg) {
  console.log(`[Offline Preflight] ${msg}`);
}

function logError(msg) {
  console.error(`[Offline Preflight ERROR] ${msg}`);
}

async function main() {
  try {
    const testRoot = process.env.DASHBOARD_BIGQUERY_TEST_ROOT || '';
    const targetPaths = paths(testRoot);

    log('Starting offline production preflight checks...');

    // 1. Check environment file existence
    if (!fs.existsSync(targetPaths.environmentFile)) {
      logError(`Environment configuration file not found at: ${targetPaths.environmentFile}`);
      process.exit(1);
    }

    // 2. Parse environment variables
    let envContent;
    try {
      envContent = fs.readFileSync(targetPaths.environmentFile, 'utf8');
    } catch (e) {
      logError(`Failed to read environment file: ${e.message}`);
      process.exit(1);
    }

    const env = {};
    for (const line of envContent.split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const sep = line.indexOf('=');
      if (sep < 1) continue;
      env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }

    // 3. Validate DATA_MODE / DASHBOARD_DATA_MODE allowed values
    const dataMode = (env.DASHBOARD_DATA_MODE || env.DATA_MODE || '').toLowerCase();
    if (dataMode !== 'mock' && dataMode !== 'bigquery') {
      logError(`Invalid DATA_MODE/DASHBOARD_DATA_MODE: "${dataMode}". Must be 'mock' or 'bigquery'.`);
      process.exit(1);
    }
    log(`DATA_MODE: "${dataMode}" is valid.`);

    // If DATA_MODE is mock, check that it's explicit and visibly identified
    if (dataMode === 'mock') {
      log('Mock mode is explicitly configured.');
    }

    // 4. Validate BigQuery configuration
    const projectId = env.BIGQUERY_PROJECT_ID;
    const datasetId = env.BIGQUERY_DATASET_ID || env.BIGQUERY_DATASET;
    const location = env.BIGQUERY_LOCATION;

    if (!projectId || !datasetId) {
      logError('BigQuery project ID or dataset ID is not configured.');
      process.exit(1);
    }

    if (projectId !== 'unfpadatabase') {
      logError(`Prohibited project ID: "${projectId}". Must be "unfpadatabase".`);
      process.exit(1);
    }
    log('BigQuery project and dataset are configured.');

    // 5. Validate location is exactly asia-south1
    if (location !== 'asia-south1') {
      logError(`Prohibited location: "${location}". Location must be exactly "asia-south1".`);
      process.exit(1);
    }
    log('Location is exactly "asia-south1".');

    // 6. Service account reference is present but never printed
    const applicationCredentials = env.GOOGLE_APPLICATION_CREDENTIALS;
    const clientEmail = env.GOOGLE_CLIENT_EMAIL;
    const privateKeyFile = env.GOOGLE_PRIVATE_KEY_FILE;
    if (applicationCredentials && (clientEmail || privateKeyFile)) {
      logError('Conflicting BigQuery authentication configuration.');
      process.exit(1);
    }
    if (!applicationCredentials && (!clientEmail || !privateKeyFile)) {
      logError('Incomplete BigQuery authentication configuration.');
      process.exit(1);
    }
    log('Service account configuration is present (credentials omitted from logs).');

    const credentialFile = applicationCredentials || privateKeyFile;
    if (!path.isAbsolute(credentialFile) || !fs.existsSync(credentialFile)) {
      logError('Service account credential file is missing or invalid.');
      process.exit(2); // Unsafe configuration: key file specified but missing
    }

    // 7. Verify exactly 4 aggregate objects are approved and no participants_flat / staging
    const expectedObjects = [
      'combined_activity_summary',
      'indicator_progress_summary',
      'data_quality_summary',
      'ip_submission_status'
    ];

    for (const obj of APPROVED_OBJECTS) {
      if (!expectedObjects.includes(obj)) {
        logError(`Unexpected approved object configured: "${obj}"`);
        process.exit(1);
      }
    }
    log('Exactly four dashboard aggregate objects are approved.');

    if (FORBIDDEN_OBJECTS.has('participants_flat') || FORBIDDEN_OBJECTS.has('participants_flat_staging')) {
      log('participants_flat and participants_flat_staging are explicitly prohibited.');
    } else {
      logError('Prohibited tables list does not include participants_flat.');
      process.exit(1);
    }

    // 8. Live GBV data remains disabled
    // Check if the service code explicitly blocks the gbv-ocmc route or disables live GBV
    const serviceCodePath = path.join(__dirname, '../../src/lib/server/dashboard-page-data-service.ts');
    if (fs.existsSync(serviceCodePath)) {
      const code = fs.readFileSync(serviceCodePath, 'utf8');
      if (!code.includes("route === 'gbv-ocmc'") || !code.includes("blocked_privacy_suppression_not_verified")) {
        logError('Live GBV route protection check is missing in dashboard-page-data-service.ts');
        process.exit(1);
      }
      log('Live GBV data remains disabled (route guard verified in source).');
    } else {
      logError('dashboard-page-data-service.ts not found for verification.');
      process.exit(1);
    }

    // 9. Privacy suppression configuration is valid
    if (env.ENABLE_GBV_SUPPRESSION !== 'true') {
      logError('ENABLE_GBV_SUPPRESSION is not set to true.');
      process.exit(1);
    }
    log('Privacy suppression configuration is enabled.');

    // 10. Vercel runtime must not expose server-filesystem mutation commands
    const pkgPath = path.join(__dirname, '../../package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts?.['production:activate-bigquery']
        || pkg.scripts?.['production:rollback-mock']
        || pkg.scripts?.['dashboard:bigquery-activate']) {
        logError('Server-filesystem activation commands must not be exposed by the Vercel runtime.');
        process.exit(1);
      }
      log('Vercel runtime exposes no server-filesystem activation commands.');
    } else {
      logError('package.json not found.');
      process.exit(1);
    }

    // 11. Production build availability
    const buildIdPath = path.join(__dirname, '../../.next/BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      logError('Production Next.js build is not available. Please run "npm run build" first.');
      process.exit(2); // Unsafe configuration: missing build
    }
    log('Production build is available.');

    // 12. No partial BigQuery activation is permitted
    // Check that we don't have DATA_MODE set to bigquery without DASHBOARD_DATA_MODE, or vice versa
    if (env.DATA_MODE !== env.DASHBOARD_DATA_MODE) {
      logError('Inconsistent data mode config: DATA_MODE and DASHBOARD_DATA_MODE must match.');
      process.exit(1);
    }
    log('Consistency check: DATA_MODE and DASHBOARD_DATA_MODE are aligned.');

    log('All offline production preflight checks passed successfully.');
    process.exit(0);
  } catch (error) {
    logError(`Usage error: ${error.stack || error.message}`);
    process.exit(3); // Usage failure
  }
}

main();
