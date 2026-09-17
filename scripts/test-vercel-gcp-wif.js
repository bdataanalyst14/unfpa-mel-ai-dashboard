const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function loadTypeScript(file, mocks) {
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (id) => {
    if (Object.prototype.hasOwnProperty.call(mocks, id)) return mocks[id];
    if (id === '@/lib/dashboard-mode') return loadTypeScript(path.join(root, 'src/lib/dashboard-mode.ts'), {});
    return require(id);
  };
  Function('require', 'module', 'exports', '__filename', '__dirname', output)(
    localRequire, loadedModule, loadedModule.exports, file, path.dirname(file),
  );
  return loadedModule.exports;
}

function withEnv(values, fn) {
  const names = [
    'GCP_PROJECT_NUMBER', 'GCP_SERVICE_ACCOUNT_EMAIL',
    'GCP_WORKLOAD_IDENTITY_POOL_ID', 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
    'GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY_FILE', 'GOOGLE_PRIVATE_KEY_BASE64', 'GOOGLE_PRIVATE_KEY',
    'BIGQUERY_PROJECT_ID', 'BIGQUERY_DATASET_ID', 'BIGQUERY_DATASET', 'BIGQUERY_LOCATION',
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  names.forEach((name) => delete process.env[name]);
  Object.assign(process.env, values);
  try { return fn(); } finally {
    names.forEach((name) => delete process.env[name]);
    Object.entries(previous).forEach(([name, value]) => {
      if (value !== undefined) process.env[name] = value;
    });
  }
}

async function main() {
  let oidcCalls = 0;
  let capturedOptions;
  class MockIdentityPoolClient {
    constructor(options) { capturedOptions = options; }
  }
  const wif = loadTypeScript(path.join(root, 'src/lib/server/vercel-gcp-wif.ts'), {
    'server-only': {},
    '@vercel/oidc': { getVercelOidcToken: async () => { oidcCalls += 1; return `request-${oidcCalls}`; } },
    'google-auth-library': { IdentityPoolClient: MockIdentityPoolClient },
  });
  assert.equal(oidcCalls, 0, 'OIDC must not be fetched at module initialization');
  const config = {
    projectNumber: '123456789', serviceAccountEmail: 'dashboard@example.iam.gserviceaccount.com',
    poolId: 'vercel', providerId: 'preview',
  };
  const authClient = wif.createVercelWifAuthClient(config);
  assert(authClient instanceof MockIdentityPoolClient);
  assert.equal(capturedOptions.audience, '//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/vercel/providers/preview');
  assert.equal(capturedOptions.subject_token_type, 'urn:ietf:params:oauth:token-type:jwt');
  assert.equal(capturedOptions.token_url, 'https://sts.googleapis.com/v1/token');
  assert.equal(capturedOptions.service_account_impersonation_url, 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/dashboard%40example.iam.gserviceaccount.com:generateAccessToken');
  assert.equal(await capturedOptions.subject_token_supplier.getSubjectToken(), 'request-1');
  assert.equal(await capturedOptions.subject_token_supplier.getSubjectToken(), 'request-2');
  assert.equal(oidcCalls, 2, 'each required refresh resolves the current request token');

  let bigQueryOptions;
  const jobs = [];
  class MockBigQuery {
    constructor(options) { bigQueryOptions = options; }
    async query(options) { jobs.push(options); return [[{ total: 17 }]]; }
  }
  const privateKeyMock = { readPrivateKeyFile: () => 'fixture-private-key' };
  const wifAuthMock = {
    createVercelWifAuthClient: (value) => ({ kind: 'external-auth-client', value }),
  };
  const clientModule = loadTypeScript(path.join(root, 'src/lib/server/bigquery-client.ts'), {
    'server-only': {}, '@google-cloud/bigquery': { BigQuery: MockBigQuery },
    './private-key-file': privateKeyMock, './vercel-gcp-wif': wifAuthMock,
    './readiness-manifest-contract': { ...require('../src/lib/server/readiness-manifest-contract'), loadAndValidateManifest: () => true },
  });
  const completeWif = {
    GCP_PROJECT_NUMBER: '123456789', GCP_SERVICE_ACCOUNT_EMAIL: 'dashboard@example.iam.gserviceaccount.com',
    GCP_WORKLOAD_IDENTITY_POOL_ID: 'vercel', GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: 'preview',
    BIGQUERY_PROJECT_ID: 'unfpadatabase', BIGQUERY_DATASET_ID: 'unfpadatabase', BIGQUERY_LOCATION: 'asia-south1',
  };
  withEnv(completeWif, () => {
    assert.equal(clientModule.getBigQueryAuthentication().mode, 'vercel-wif');
    clientModule.getBigQueryClient();
    assert.equal(bigQueryOptions.projectId, 'unfpadatabase');
    assert.equal(bigQueryOptions.authClient.kind, 'external-auth-client');
    assert.equal(bigQueryOptions.keyFilename, undefined);
    assert.equal(bigQueryOptions.credentials, undefined);
  });
  for (const missing of ['GCP_PROJECT_NUMBER', 'GCP_SERVICE_ACCOUNT_EMAIL', 'GCP_WORKLOAD_IDENTITY_POOL_ID', 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID']) {
    const values = { ...completeWif }; delete values[missing];
    withEnv(values, () => assert.throws(() => clientModule.getBigQueryAuthentication(), /Incomplete Vercel WIF/));
  }
  withEnv({ ...completeWif, GOOGLE_APPLICATION_CREDENTIALS: 'outside.json' }, () =>
    assert.throws(() => clientModule.getBigQueryAuthentication(), /Conflicting/));
  withEnv({ ...completeWif, GOOGLE_CLIENT_EMAIL: 'conflict@example.com' }, () =>
    assert.throws(() => clientModule.getBigQueryAuthentication(), /Conflicting/));
  withEnv({ GOOGLE_APPLICATION_CREDENTIALS: 'outside.json', GOOGLE_CLIENT_EMAIL: 'conflict@example.com' }, () =>
    assert.throws(() => clientModule.getBigQueryAuthentication(), /Conflicting/));
  withEnv({ GOOGLE_CLIENT_EMAIL: 'pem@example.com', GOOGLE_PRIVATE_KEY_FILE: 'fixture.pem' }, () =>
    assert.equal(clientModule.getBigQueryAuthentication().mode, 'pem'));
  withEnv({ GOOGLE_CLIENT_EMAIL: 'pem@example.com' }, () =>
    assert.throws(() => clientModule.getBigQueryAuthentication(), /Incomplete BigQuery/));

  assert.deepEqual(clientModule.APPROVED_OBJECTS, [
    'repeatdata', 'activity_summary', 'combined_activity_summary', 'indicator_progress_summary', 'data_quality_summary', 'ip_submission_status',
  ]);
  for (const query of [
    'SELECT * FROM participants_flat', 'SELECT * FROM participants_flat_staging',
    'DELETE FROM combined_activity_summary', 'CREATE TABLE x AS SELECT * FROM combined_activity_summary',
  ]) assert.throws(() => clientModule.validateQuerySafety(query), /prohibited/);

  withEnv(completeWif, () => {
    for (const view of clientModule.APPROVED_OBJECTS) {
      clientModule.validateQuerySafety(`SELECT COUNT(*) FROM \`unfpadatabase.unfpadatabase.${view}\``);
    }
    for (const source of ['activity_summary_flat', 'activity_summary_staging', '__gen_activity', 'unfpa_mel_internal.activity_summary', 'other.unfpadatabase.activity_summary', 'unfpadatabase.other.activity_summary']) {
      assert.throws(() => clientModule.validateQuerySafety(`SELECT COUNT(*) FROM ${source}`));
    }
    for (const query of [
      'SELECT * FROM repeatdata',
      'SELECT sex_name FROM repeatdata LIMIT 1',
      'SELECT COUNT(*) FROM combined_activity_summary; DELETE FROM combined_activity_summary',
      "SELECT * FROM EXTERNAL_QUERY('connection', 'SELECT 1')",
    ]) assert.throws(() => clientModule.validateQuerySafety(query));
  });
  const saved = { ...process.env };
  try {
    Object.assign(process.env, completeWif);
    process.env.BIGQUERY_MAX_BYTES_BILLED = '1000000000';
    const sql = 'SELECT COUNT(*) AS total FROM `unfpadatabase.unfpadatabase.activity_summary` WHERE project1 = @project';
    assert.deepEqual(await clientModule.runSafeBigQuery(sql, { project: "quote' OR TRUE" }), [{ total: 17 }]);
    assert.equal(jobs.at(-1).maximumBytesBilled, '1000000000');
    assert.equal(jobs.at(-1).location, 'asia-south1');
    assert.deepEqual(jobs.at(-1).params, { project: "quote' OR TRUE" });
    for (const cap of ['0', '-1', '1000000001', 'NaN', '1e9']) {
      process.env.BIGQUERY_MAX_BYTES_BILLED = cap;
      const before = jobs.length;
      await assert.rejects(clientModule.runSafeBigQuery(sql));
      assert.equal(jobs.length, before);
    }
  } finally {
    for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name];
    Object.assign(process.env, saved);
  }

  const combinedSource = [
    fs.readFileSync(path.join(root, 'src/lib/server/vercel-gcp-wif.ts'), 'utf8'),
    fs.readFileSync(path.join(root, 'src/lib/server/bigquery-client.ts'), 'utf8'),
  ].join('\n');
  assert(!combinedSource.includes('NEXT_PUBLIC_'));
  assert(!combinedSource.includes('VERCEL_OIDC_TOKEN'));
  assert(!/console\.(log|info|warn|error)/.test(combinedSource));
  assert(!combinedSource.includes('request-1'));
  function clientFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? clientFiles(file) : /\.[jt]sx?$/.test(file) ? [file] : [];
    });
  }
  for (const file of clientFiles(path.join(root, 'src'))) {
    const source = fs.readFileSync(file, 'utf8');
    if (/^['"]use client['"]/m.test(source)) {
      assert.doesNotMatch(source, /from\s+['"][^'"]*(?:lib\/server|@google-cloud\/bigquery)/, file);
      assert.doesNotMatch(source, /process\.env\.(?:GOOGLE_PRIVATE_KEY|GOOGLE_APPLICATION_CREDENTIALS|GOOGLE_CLIENT_SECRET|GCP_SERVICE_ACCOUNT_EMAIL)/, file);
    }
    assert.doesNotMatch(source, /NEXT_PUBLIC_(?:GOOGLE_PRIVATE_KEY|GOOGLE_CLIENT_SECRET|GCP_SERVICE_ACCOUNT|BIGQUERY_CREDENTIAL)/, file);
  }
  console.log('Vercel GCP WIF offline tests passed.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
