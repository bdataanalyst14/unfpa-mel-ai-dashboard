const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const contract = require('../src/lib/server/readiness-manifest-contract');
const { generate } = require('./dashboard/generate-vercel-readiness-manifest');

const root = path.resolve(__dirname, '..');
const approved = [
  'combined_activity_summary',
  'indicator_progress_summary',
  'data_quality_summary',
  'ip_submission_status',
];
const mockEnv = { DATA_MODE: 'mock', DASHBOARD_DATA_MODE: 'mock' };
const wifEnv = {
  DATA_MODE: 'bigquery',
  DASHBOARD_DATA_MODE: 'bigquery',
  BIGQUERY_PROJECT_ID: 'fixture-project',
  BIGQUERY_DATASET_ID: 'fixture_dataset',
  BIGQUERY_LOCATION: 'asia-south1',
  GCP_PROJECT_NUMBER: '123456789012',
  GCP_SERVICE_ACCOUNT_EMAIL: 'fixture-preview@fixture-project.iam.gserviceaccount.com',
  GCP_WORKLOAD_IDENTITY_POOL_ID: 'fixture-pool',
  GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: 'fixture-provider',
};

function loadTypeScript(file, mocks) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (id) => Object.prototype.hasOwnProperty.call(mocks, id)
    ? mocks[id]
    : require(id);
  Function('require', 'module', 'exports', '__filename', '__dirname', output)(
    localRequire, loadedModule, loadedModule.exports, file, path.dirname(file),
  );
  return loadedModule.exports;
}

function changed(name, value) {
  const env = { ...wifEnv, [name]: value };
  return contract.createManifest(env).configurationHash;
}

function main() {
  const mockA = contract.createManifest(mockEnv);
  const mockB = contract.createManifest(mockEnv);
  assert.deepEqual(mockA, mockB);
  assert.equal(mockA.dataMode, 'mock');
  assert.equal(mockA.authMode, 'NONE');

  const manifest = contract.createManifest(wifEnv, 'a'.repeat(40));
  assert.equal(manifest.contractVersion, 1);
  assert.equal(manifest.authMode, 'VERCEL_GCP_WIF');
  assert.deepEqual(manifest.approvedObjects, approved);
  assert(contract.validateManifest(manifest, wifEnv));
  assert.equal(manifest.configurationHash, contract.createManifest(wifEnv).configurationHash);

  for (const name of [
    'GCP_PROJECT_NUMBER', 'GCP_SERVICE_ACCOUNT_EMAIL',
    'GCP_WORKLOAD_IDENTITY_POOL_ID', 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
    'BIGQUERY_PROJECT_ID', 'BIGQUERY_DATASET_ID', 'BIGQUERY_LOCATION',
  ]) {
    const env = { ...wifEnv }; delete env[name];
    assert.throws(() => contract.createManifest(env), /Missing required|Invalid Vercel readiness location/);
  }
  assert.throws(() => contract.createManifest({ ...wifEnv, BIGQUERY_LOCATION: 'us-central1' }), /asia-south1/);

  const baseHash = manifest.configurationHash;
  for (const [name, replacement] of [
    ['BIGQUERY_PROJECT_ID', 'changed-project'],
    ['BIGQUERY_DATASET_ID', 'changed_dataset'],
    ['GCP_SERVICE_ACCOUNT_EMAIL', 'changed@fixture-project.iam.gserviceaccount.com'],
    ['GCP_WORKLOAD_IDENTITY_POOL_ID', 'changed-pool'],
    ['GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID', 'changed-provider'],
  ]) {
    assert.notEqual(changed(name, replacement), baseHash);
  }
  const changedLocationPayload = contract.createSemanticPayload(wifEnv);
  changedLocationPayload.bigQuery.location = 'asia-south2';
  assert.notEqual(contract.configurationHash(changedLocationPayload), baseHash);

  assert.deepEqual(contract.createManifest({
    ...wifEnv,
    APPROVED_OBJECTS: 'participants_flat,participants_flat_staging,extra',
  }).approvedObjects, approved);

  const secretBearingEnv = {
    ...wifEnv,
    VERCEL_OIDC_TOKEN: 'fixture-oidc-token-must-not-appear',
    UNRELATED_PRIVATE_KEY_VALUE: 'fixture-private-key-must-not-appear',
  };
  const serialized = JSON.stringify(contract.createManifest(secretBearingEnv));
  assert(!serialized.includes('fixture-oidc-token'));
  assert(!serialized.includes('fixture-private-key'));
  assert.throws(
    () => contract.createManifest({ ...wifEnv, GOOGLE_PRIVATE_KEY: 'conflicting-fixture-key' }),
    /Conflicting BigQuery authentication/,
  );

  const mutations = [
    null,
    { ...manifest, contractVersion: 2 },
    { ...manifest, configurationHash: '0'.repeat(64) },
    { ...manifest, bigQuery: { ...manifest.bigQuery, projectId: 'mismatch' } },
    { ...manifest, bigQuery: { ...manifest.bigQuery, datasetId: 'mismatch' } },
    { ...manifest, bigQuery: { ...manifest.bigQuery, location: 'us-central1' } },
    { ...manifest, wif: { ...manifest.wif, serviceAccountEmail: 'mismatch@example.com' } },
    { ...manifest, wif: { ...manifest.wif, workloadIdentityPoolId: 'mismatch' } },
    { ...manifest, wif: { ...manifest.wif, workloadIdentityProviderId: 'mismatch' } },
    { ...manifest, approvedObjects: approved.slice(0, 3) },
    { ...manifest, approvedObjects: [...approved, 'extra'] },
    { ...manifest, approvedObjects: ['participants_flat', ...approved.slice(1)] },
    { ...manifest, approvedObjects: ['participants_flat_staging', ...approved.slice(1)] },
  ];
  for (const candidate of mutations) assert.equal(contract.validateManifest(candidate, wifEnv), false);

  const missingPath = path.join(root, '.vercel-runtime', 'missing-readiness.json');
  assert.equal(contract.loadAndValidateManifest(wifEnv, missingPath), false);
  const corruptPath = path.join(root, '.vercel-runtime', 'corrupt-readiness.json');
  fs.mkdirSync(path.dirname(corruptPath), { recursive: true });
  fs.writeFileSync(corruptPath, '{corrupt');
  assert.equal(contract.loadAndValidateManifest(wifEnv, corruptPath), false);
  fs.rmSync(corruptPath, { force: true });

  const generated = generate({ env: wifEnv, root });
  assert.equal(contract.loadAndValidateManifest(wifEnv, generated.outputPath), true);
  const runtimeSource = fs.readFileSync(path.join(root, 'src/lib/server/readiness-manifest-contract.js'), 'utf8');
  assert(!/writeFile|mkdirSync|appendFile/.test(runtimeSource));
  assert(!runtimeSource.includes('/var/'));
  assert(!runtimeSource.includes('/etc/'));

  let constructed = 0;
  class MockBigQuery { constructor() { constructed += 1; } }
  const clientModule = loadTypeScript(path.join(root, 'src/lib/server/bigquery-client.ts'), {
    'server-only': {}, '@google-cloud/bigquery': { BigQuery: MockBigQuery },
    './private-key-file': { readPrivateKeyFile: () => 'fixture' },
    './vercel-gcp-wif': { createVercelWifAuthClient: () => ({}) },
    './readiness-manifest-contract': { loadAndValidateManifest: () => false },
  });
  const validClientModule = loadTypeScript(path.join(root, 'src/lib/server/bigquery-client.ts'), {
    'server-only': {}, '@google-cloud/bigquery': { BigQuery: MockBigQuery },
    './private-key-file': { readPrivateKeyFile: () => 'fixture' },
    './vercel-gcp-wif': { createVercelWifAuthClient: () => ({}) },
    './readiness-manifest-contract': { loadAndValidateManifest: () => true },
  });
  const previous = { ...process.env };
  Object.assign(process.env, wifEnv);
  try {
    assert.equal(clientModule.getBigQueryConfigStatus().configured, false);
    assert.throws(() => clientModule.getBigQueryClient(), /readiness manifest/);
    assert.equal(constructed, 0);
    assert.equal(validClientModule.getBigQueryConfigStatus().configured, true);
  } finally {
    for (const name of Object.keys(process.env)) if (!(name in previous)) delete process.env[name];
    Object.assign(process.env, previous);
  }

  const clientSource = fs.readFileSync(path.join(root, 'src/lib/server/bigquery-client.ts'), 'utf8');
  assert(clientSource.includes("authentication.mode === 'vercel-wif'"));
  assert(clientSource.includes('getEvidenceFilePath()'));
  assert(clientSource.includes('/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json'));
  assert(!fs.existsSync(path.join(root, 'public', 'bigquery-readiness-manifest.json')));
  console.log('Vercel readiness manifest build/runtime tests passed.');
}

try { main(); } catch (error) { console.error(error.stack || error.message); process.exitCode = 1; }
