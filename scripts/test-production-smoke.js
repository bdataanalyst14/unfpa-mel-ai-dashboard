const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function load(relativePath, overrides = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (request) => {
    if (Object.prototype.hasOwnProperty.call(overrides, request)) {
      return overrides[request];
    }
    return require(request);
  };
  Function('require', 'module', 'exports', output)(
    localRequire,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

async function runTests() {
  console.log('Running offline production readiness integration tests...');

  // 1. Test four-object contract & participants_flat prohibition
  const bqClient = load('src/lib/server/bigquery-client.ts', {
    'server-only': {},
    '@google-cloud/bigquery': {
      BigQuery: class MockBigQuery {}
    },
    './private-key-file': {
      readPrivateKeyFile: () => 'mock-private-key'
    },
    './vercel-gcp-wif': {
      createVercelWifAuthClient: () => ({ kind: 'mock-wif-auth-client' })
    },
    './readiness-manifest-contract': {
      loadAndValidateManifest: () => false
    }
  });

  assert.deepEqual(bqClient.APPROVED_OBJECTS, [
    'combined_activity_summary',
    'indicator_progress_summary',
    'data_quality_summary',
    'ip_submission_status'
  ]);
  console.log('  - APPROVED_OBJECTS matches the four-object contract exactly.');

  // Verify query safety guards
  // Case changes check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM PaRtIcIpAnTs_FlAt'), /prohibited/);
  // Backtick check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `participants_flat`'), /prohibited/);
  // Fully qualified check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `unfpadatabase.reporting.participants_flat`'), /prohibited/);
  // Join check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM combined_activity_summary JOIN participants_flat ON c.id = p.id'), /prohibited/);
  // Staging check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `reporting.combined_activity_summary_staging`'), /prohibited/);
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM staging_table'), /prohibited/);
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM other_table_not_approved'), /prohibited/);

  // DDL / DML checks
  const statements = [
    'INSERT INTO combined_activity_summary VALUES (1)',
    'UPDATE combined_activity_summary SET event_count = 1',
    'DELETE FROM combined_activity_summary',
    'MERGE INTO combined_activity_summary USING ...',
    'CREATE TABLE test (id INT)',
    'ALTER TABLE combined_activity_summary ADD COLUMN new_col INT',
    'DROP TABLE combined_activity_summary',
    'TRUNCATE TABLE combined_activity_summary'
  ];
  for (const stmt of statements) {
    assert.throws(() => bqClient.validateQuerySafety(stmt), /prohibited/i);
  }

  // Multiple statements check
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM combined_activity_summary; SELECT * FROM ip_submission_status'), /Multiple SQL statements/);

  // SQL comments hiding prohibited names
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM combined_activity_summary -- FROM participants_flat'), /prohibited/);
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM combined_activity_summary /* JOIN participants_flat */'), /prohibited/);

  // Unapproved project or dataset
  process.env.BIGQUERY_PROJECT_ID = 'unfpadatabase';
  process.env.BIGQUERY_DATASET_ID = 'reporting';
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `otherproject.reporting.combined_activity_summary`'), /unapproved project/);
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `unfpadatabase.otherdataset.combined_activity_summary`'), /unapproved dataset/);

  // Unknown aggregate table
  assert.throws(() => bqClient.validateQuerySafety('SELECT * FROM `unfpadatabase.reporting.unknown_table`'), /prohibited/);

  // Verify allowed queries (positive tests)
  assert.doesNotThrow(() => bqClient.validateQuerySafety('SELECT * FROM combined_activity_summary'));
  assert.doesNotThrow(() => bqClient.validateQuerySafety('SELECT * FROM indicator_progress_summary'));
  assert.doesNotThrow(() => bqClient.validateQuerySafety('SELECT * FROM data_quality_summary'));
  assert.doesNotThrow(() => bqClient.validateQuerySafety('SELECT * FROM ip_submission_status'));
  assert.doesNotThrow(() => bqClient.validateQuerySafety('SELECT * FROM `unfpadatabase.reporting.combined_activity_summary`'));
  assert.doesNotThrow(() => bqClient.validateQuerySafety(`
    WITH filtered AS (SELECT * FROM combined_activity_summary)
    SELECT * FROM filtered
  `));
  console.log('  - Adversarial query-guards and positive SELECT tests verified.');

  // 2. Test wrong location rejection
  process.env.BIGQUERY_LOCATION = 'us-central1';
  await assert.rejects(
    async () => bqClient.runSafeBigQuery('SELECT * FROM combined_activity_summary'),
    /Invalid location configured/
  );
  process.env.BIGQUERY_LOCATION = 'asia-south1';
  console.log('  - Query execution correctly rejects non-asia-south1 locations.');

  // 3. Test missing/empty evidence file check
  process.env.DASHBOARD_DATA_MODE = 'bigquery';
  process.env.DATA_MODE = 'bigquery';
  process.env.BIGQUERY_PROJECT_ID = 'unfpadatabase';
  process.env.BIGQUERY_DATASET = 'reporting';
  process.env.BIGQUERY_LOCATION = 'asia-south1';
  process.env.GOOGLE_CLIENT_EMAIL = 'test@unfpa.org';
  process.env.GOOGLE_PRIVATE_KEY_FILE = 'non-existent-key-file';

  const configStatus = bqClient.getBigQueryConfigStatus();
  assert.equal(configStatus.configured, false);
  console.log('  - Config status fails closed to false when evidence file / key file is missing.');

  // 4. Test suppression logic
  const suppression = load('src/lib/server/suppression.ts', {
    'server-only': {}
  });

  // Verify non-zero count below 5 is suppressed to <5
  assert.deepEqual(suppression.suppressCount(1), { displayValue: '<5', value: null, suppressed: true, suppression_reason: 'small_cell' });
  assert.deepEqual(suppression.suppressCount(4), { displayValue: '<5', value: null, suppressed: true, suppression_reason: 'small_cell' });

  // Verify 0 is not suppressed
  assert.deepEqual(suppression.suppressCount(0), { displayValue: '0', value: 0, suppressed: false });

  // Verify 5 and above is not suppressed
  assert.deepEqual(suppression.suppressCount(5), { displayValue: '5', value: 5, suppressed: false });
  console.log('  - Small-cell suppression rules (non-zero < 5) verified.');

  // 5. Test Credentials and SQL leakage protection in API errors
  const mockRequest = (paramsObj) => ({
    nextUrl: {
      searchParams: {
        get: (key) => paramsObj[key] ?? null
      }
    }
  });

  const apiOverviewRoute = load('src/app/api/dashboard/executive-overview/route.ts', {
    'next/server': {
      NextResponse: {
        json: (data, init) => ({
          status: init?.status ?? 200,
          headers: init?.headers,
          json: async () => data
        })
      }
    },
    '@/lib/server/auth-guard': {
      requireDashboardApiAccess: async () => ({ allowed: true, status: 401 }),
    },
    '@/lib/server/bigquery-dashboard-service': {
      getExecutiveOverviewData: async () => {
        throw new Error('Secret SQL Query: SELECT * FROM `unfpa.secrets` -- Credentials: API_KEY_123');
      }
    }
  });

  const overviewErrorResponse = await apiOverviewRoute.GET(mockRequest({}));
  assert.equal(overviewErrorResponse.status, 500);
  const errorJson = await overviewErrorResponse.json();
  assert.equal(errorJson.error, 'Executive Overview data is temporarily unavailable.');
  assert.equal(errorJson.hasOwnProperty('sql'), false);
  assert.equal(JSON.stringify(errorJson).includes('API_KEY_123'), false);
  console.log('  - API routes correctly prevent leaking SQL or credentials in error responses.');

  // 6. Test Health Endpoint
  const apiHealthRoute = load('src/app/api/health/route.ts', {
    'next/server': {
      NextResponse: {
        json: (data, init) => ({
          status: init?.status ?? 200,
          headers: init?.headers,
          json: async () => data
        })
      }
    },
    '../../../../package.json': {
      version: '0.1.0'
    }
  });

  const healthResponse = await apiHealthRoute.GET();
  assert.equal(healthResponse.status, 200);
  const healthJson = await healthResponse.json();
  assert.equal(healthJson.status, 'ok');
  assert.equal(healthJson.application, 'unfpa-mel-dashboard');
  console.log('  - Health endpoint exposes only safe static response fields.');

  // 7. Check critical routes mapping
  const routeMatrix = fs.readFileSync(path.join(root, 'docs/agentic_workflow/UNFPA_ROUTE_DATA_MODE_MATRIX.md'), 'utf8');
  assert.match(routeMatrix, /\/dashboard\/executive-overview/);
  assert.match(routeMatrix, /\/dashboard\/activity-progress/);
  assert.match(routeMatrix, /\/dashboard\/participant-reach/);
  assert.match(routeMatrix, /\/dashboard\/data-quality/);
  assert.match(routeMatrix, /\/dashboard\/ip-performance/);
  assert.match(routeMatrix, /\/dashboard\/geographic-coverage/);
  assert.match(routeMatrix, /\/dashboard\/indicator-progress/);
  assert.match(routeMatrix, /\/dashboard\/management-decision-centre/);
  assert.match(routeMatrix, /\/dashboard\/activity-detail/);
  console.log('  - Critical route references verified in the documentation matrix.');

  // 8. Test CLI commands using child_process and a temporary root
  console.log('Running offline CLI integration tests...');
  const { execSync } = require('node:child_process');
  const os = require('node:os');
  const crypto = require('node:crypto');

  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unfpa-cli-test-'));
  const testEnvFile = path.join(testDir, 'etc/unfpa-mel-dashboard/bigquery-readonly.env');
  const testKeyFile = path.join(testDir, 'etc/unfpa-mel/secrets/google-private-key.pem');
  const testRuntimeEnvFile = path.join(testDir, 'etc/unfpa-mel/dashboard.env');
  const testEvidenceFile = path.join(testDir, 'var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json');

  // Prepare directories
  fs.mkdirSync(path.dirname(testEnvFile), { recursive: true });
  fs.mkdirSync(path.dirname(testKeyFile), { recursive: true });
  fs.mkdirSync(path.dirname(testRuntimeEnvFile), { recursive: true });
  fs.mkdirSync(path.dirname(testEvidenceFile), { recursive: true });

  // Write files
  fs.writeFileSync(testKeyFile, 'fixture-private-key\n');
  fs.writeFileSync(testEnvFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${testKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=mock',
    'DATA_MODE=mock',
    'ENABLE_GBV_SUPPRESSION=true',
    ''
  ].join('\n'));

  fs.writeFileSync(testRuntimeEnvFile, 'DASHBOARD_DATA_MODE=mock\nDATA_MODE=mock\nENABLE_GBV_SUPPRESSION=true\n');

  // Stub command runner options
  const execOptions = {
    env: {
      ...process.env,
      DASHBOARD_BIGQUERY_TEST_ROOT: testDir,
      DASHBOARD_EVIDENCE_FILE: testEvidenceFile
    },
    stdio: 'pipe'
  };

  // Test preflight (should pass because data mode is mock and files exist)
  try {
    const preflightOut = execSync('node scripts/dashboard/production-preflight.js', execOptions).toString();
    assert.match(preflightOut, /All offline production preflight checks passed/);
    console.log('  - production-preflight.js passed with mock mode config.');
  } catch (e) {
    assert.fail(`Preflight failed: ${e.stdout?.toString() || e.message}`);
  }

  // Create valid preflight evidence
  const mockConfigHash = crypto.createHash('sha256').update(JSON.stringify({
    projectId: 'unfpadatabase',
    datasetId: 'reporting',
    location: 'asia-south1',
    clientEmail: 'readonly@unfpadatabase.iam.gserviceaccount.com',
    privateKeyFile: testKeyFile,
    applicationCredentials: '',
    maximumBytesBilled: '1000000',
  })).digest('hex');

  const validEvidence = {
    version: 1,
    validatedAt: new Date().toISOString(),
    configurationHash: mockConfigHash,
    objects: [
      { name: 'combined_activity_summary', exists: true, rowCount: 100 },
      { name: 'indicator_progress_summary', exists: true, rowCount: 50 },
      { name: 'data_quality_summary', exists: true, rowCount: 200 },
      { name: 'ip_submission_status', exists: true, rowCount: 15 }
    ]
  };

  fs.writeFileSync(testEvidenceFile, JSON.stringify(validEvidence, null, 2) + '\n');

  // Test activation dry-run
  try {
    const actDryOut = execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123', execOptions).toString();
    assert.match(actDryOut, /dryRun": true/);
    assert.match(actDryOut, /Dry run completed/);
    console.log('  - production-activate-bigquery.js dry-run passed.');
  } catch (e) {
    assert.fail(`Activation dry-run failed: ${e.stdout?.toString() || e.message}`);
  }

  // Test activation apply
  try {
    const actApplyOut = execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions).toString();
    assert.match(actApplyOut, /dryRun": false/);
    assert.match(actApplyOut, /activationReady": true/);
    // Verify runtime env was written
    const updatedRuntime = fs.readFileSync(testRuntimeEnvFile, 'utf8');
    assert.match(updatedRuntime, /^DATA_MODE=bigquery$/m);
    assert.match(updatedRuntime, /^DASHBOARD_DATA_MODE=bigquery$/m);
    console.log('  - production-activate-bigquery.js apply successfully updated runtime environment.');
  } catch (e) {
    assert.fail(`Activation apply failed: ${e.stdout?.toString() || e.message}`);
  }

  // Test activation check with expired evidence
  const expiredEvidence = {
    ...validEvidence,
    validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  };
  fs.writeFileSync(testEvidenceFile, JSON.stringify(expiredEvidence, null, 2) + '\n');
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);
  }, /Evidence file is expired/);
  console.log('  - production-activate-bigquery.js correctly rejects expired evidence.');

  // Test activation check with modified evidence hash
  const modifiedEvidence = {
    ...validEvidence,
    configurationHash: 'wrong-hash'
  };
  fs.writeFileSync(testEvidenceFile, JSON.stringify(modifiedEvidence, null, 2) + '\n');
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);
  }, /Evidence configuration hash mismatch/);
  console.log('  - production-activate-bigquery.js correctly rejects modified evidence hash.');

  // Test activation check with incomplete four-object result (e.g. rowCount = 0)
  const incompleteEvidence = {
    ...validEvidence,
    objects: [
      { name: 'combined_activity_summary', exists: true, rowCount: 100 },
      { name: 'indicator_progress_summary', exists: true, rowCount: 0 }, // 0 rows!
      { name: 'data_quality_summary', exists: true, rowCount: 200 },
      { name: 'ip_submission_status', exists: true, rowCount: 15 }
    ]
  };
  fs.writeFileSync(testEvidenceFile, JSON.stringify(incompleteEvidence, null, 2) + '\n');
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);
  }, /Reporting object "indicator_progress_summary" is missing or empty/i);
  console.log('  - production-activate-bigquery.js correctly rejects incomplete four-object result.');

  // Test activation check with missing approval reference
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --apply', execOptions);
  }, /approval reference is required/i);
  console.log('  - production-activate-bigquery.js correctly rejects missing approval reference.');

  // Test activation check with unsafe DATA_MODE (e.g. live)
  fs.writeFileSync(testEnvFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${testKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=live', // Unsafe DATA_MODE!
    'DATA_MODE=live',
    'ENABLE_GBV_SUPPRESSION=true',
    ''
  ].join('\n'));
  fs.writeFileSync(testEvidenceFile, JSON.stringify(validEvidence, null, 2) + '\n');
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);
  }, /Unsafe DATA_MODE configured/i);
  console.log('  - production-activate-bigquery.js correctly rejects unsafe DATA_MODE.');

  // Test activation check with live GBV enabled
  fs.writeFileSync(testEnvFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${testKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=mock',
    'DATA_MODE=mock',
    'ENABLE_GBV_SUPPRESSION=true',
    'ENABLE_LIVE_GBV=true', // Live GBV enabled!
    ''
  ].join('\n'));
  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);
  }, /live GBV must not be enabled/i);
  console.log('  - production-activate-bigquery.js correctly rejects live GBV configuration.');

  // Test activation check with evidence file inside Git repository
  // Restore valid env file first
  fs.writeFileSync(testEnvFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${testKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=mock',
    'DATA_MODE=mock',
    'ENABLE_GBV_SUPPRESSION=true',
    ''
  ].join('\n'));

  const repoTestRoot = path.join(__dirname, '../docs/production/test-fixture');
  const repoExecOptions = {
    env: {
      ...process.env,
      DASHBOARD_BIGQUERY_TEST_ROOT: repoTestRoot
    },
    stdio: 'pipe'
  };

  const repoEvidenceFile = path.join(repoTestRoot, 'var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json');
  fs.mkdirSync(path.dirname(repoEvidenceFile), { recursive: true });
  fs.writeFileSync(repoEvidenceFile, JSON.stringify(validEvidence, null, 2) + '\n');

  const repoEnvFile = path.join(repoTestRoot, 'etc/unfpa-mel-dashboard/bigquery-readonly.env');
  fs.mkdirSync(path.dirname(repoEnvFile), { recursive: true });
  fs.writeFileSync(repoEnvFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${testKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=mock',
    'DATA_MODE=mock',
    'ENABLE_GBV_SUPPRESSION=true',
    ''
  ].join('\n'));

  assert.throws(() => {
    execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', repoExecOptions);
  }, /must not be inside the repository root/i);

  fs.rmSync(repoTestRoot, { recursive: true, force: true });
  console.log('  - production-activate-bigquery.js correctly rejects evidence file inside the repository.');

  // Test rollback
  // Write back valid activation state to test rollback backup and apply
  fs.writeFileSync(testEvidenceFile, JSON.stringify(validEvidence, null, 2) + '\n');
  execSync('node scripts/dashboard/production-activate-bigquery.js --approval REF-123 --apply', execOptions);

  try {
    const rollbackOut = execSync('node scripts/dashboard/production-rollback-mock.js --apply --reason "Test rollback"', execOptions).toString();
    assert.match(rollbackOut, /Rollback complete/);
    const rolledBackRuntime = fs.readFileSync(testRuntimeEnvFile, 'utf8');
    assert.match(rolledBackRuntime, /^DATA_MODE=mock$/m);
    assert.match(rolledBackRuntime, /^DASHBOARD_DATA_MODE=mock$/m);
    console.log('  - production-rollback-mock.js successfully restored mock configuration.');
  } catch (e) {
    assert.fail(`Rollback failed: ${e.stdout?.toString() || e.message}`);
  }

  // Test rollback check with missing backup directory
  const noBackupDirExecOptions = {
    env: {
      ...execOptions.env,
      DASHBOARD_BIGQUERY_TEST_ROOT: path.join(testDir, 'does-not-exist')
    },
    stdio: 'pipe'
  };
  assert.throws(() => {
    execSync('node scripts/dashboard/production-rollback-mock.js --apply --reason "Test failure"', noBackupDirExecOptions);
  }, /Backup directory does not exist/i);
  console.log('  - production-rollback-mock.js correctly rejects missing backup directory.');

  // Test rollback check with empty backup directory
  const emptyBackupDir = path.join(testDir, 'empty-backups');
  fs.mkdirSync(path.join(emptyBackupDir, 'var/backups/unfpa-mel-dashboard'), { recursive: true });
  const emptyBackupExecOptions = {
    env: {
      ...execOptions.env,
      DASHBOARD_BIGQUERY_TEST_ROOT: emptyBackupDir
    },
    stdio: 'pipe'
  };
  assert.throws(() => {
    execSync('node scripts/dashboard/production-rollback-mock.js --apply --reason "Test failure"', emptyBackupExecOptions);
  }, /No backup files found/i);
  console.log('  - production-rollback-mock.js correctly rejects missing backup files.');

  // Test rollback check with ambiguous backups (same modification timestamp)
  const ambiguousBackupDir = path.join(testDir, 'ambiguous-backups');
  const ambBackupPath = path.join(ambiguousBackupDir, 'var/backups/unfpa-mel-dashboard');
  fs.mkdirSync(ambBackupPath, { recursive: true });

  const backup1 = path.join(ambBackupPath, 'dashboard.env.bak.1');
  const backup2 = path.join(ambBackupPath, 'dashboard.env.bak.2');
  fs.writeFileSync(backup1, 'DATA_MODE=bigquery\n');
  fs.writeFileSync(backup2, 'DATA_MODE=bigquery\n');

  const sameTime = new Date(2026, 6, 30, 10, 0, 0);
  fs.utimesSync(backup1, sameTime, sameTime);
  fs.utimesSync(backup2, sameTime, sameTime);

  const ambiguousBackupExecOptions = {
    env: {
      ...execOptions.env,
      DASHBOARD_BIGQUERY_TEST_ROOT: ambiguousBackupDir
    },
    stdio: 'pipe'
  };
  assert.throws(() => {
    execSync('node scripts/dashboard/production-rollback-mock.js --apply --reason "Test failure"', ambiguousBackupExecOptions);
  }, /Ambiguous backup target/i);
  console.log('  - production-rollback-mock.js correctly rejects ambiguous backup targets.');

  // Cleanup test directory
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('  - Cleaned up CLI test directories.');

  console.log('All offline production readiness integration tests passed.');
}

runTests().catch((e) => {
  console.error('Integration tests failed:');
  console.error(e.stack || e.message);
  process.exit(1);
});
