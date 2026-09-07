const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

async function main() {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/server/pre-uat-validation.ts'), 'utf8');
  assert.match(source, /import 'server-only'/);
  assert.doesNotMatch(source, /console\.|JSON\.stringify|writeFile|process\.env\.[A-Z_]+\s*=/);
  const loaded = { exports: {} };
  const calls = [];
  let allowed = true;
  let role = 'ADMIN';
  let mode = 'bigquery';
  let configured = true;
  let authMode = 'vercel-wif';
  let available = true;
  let failureAt = -1;
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mocks = {
    'server-only': {},
    './auth-guard': { getDashboardAuthorization: async () => ({ allowed, role }) },
    './bigquery-client': {
      getDashboardDataMode: () => mode,
      getBigQueryConfigStatus: () => ({ configured, dataModeConfigurationValid: configured, authMode }),
      getBigQueryProjectId: () => 'DO_NOT_DISCLOSE_PROJECT',
      getBigQueryDatasetId: () => 'DO_NOT_DISCLOSE_DATASET',
      runSafeBigQuery: async (sql) => {
        calls.push(sql);
        assert.doesNotMatch(sql, /participants_flat|staging|\bJOIN\b|\bUNION\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/i);
        const refs = [...sql.matchAll(/`DO_NOT_DISCLOSE_PROJECT\.DO_NOT_DISCLOSE_DATASET\.([^`]+)`/g)];
        assert.equal(refs.length, 1);
        assert.ok(['combined_activity_summary', 'indicator_progress_summary', 'data_quality_summary', 'ip_submission_status'].includes(refs[0][1]));
        if (calls.length === failureAt) throw new Error('DO_NOT_DISCLOSE_TOKEN DO_NOT_DISCLOSE_PARTICIPANT DO_NOT_DISCLOSE_PROJECT');
        return sql.includes('WHERE FALSE LIMIT 0') ? [] : [{ available }];
      },
    },
  };
  Function('require', 'module', 'exports', output)((id) => mocks[id], loaded, loaded.exports);
  const originalLimit = process.env.BIGQUERY_MAX_BYTES_BILLED;
  const run = async (expected, reads) => {
    calls.length = 0;
    const result = await loaded.exports.validatePreUatReadAccess();
    assert.equal(result.code, expected);
    assert.equal(calls.length, reads);
    assert.deepEqual(Object.keys(result).sort(), ['code', 'completedViews', 'lineageVerified', 'uatApproved'].sort());
    assert.equal(result.lineageVerified, false);
    assert.equal(result.uatApproved, false);
    assert.doesNotMatch(JSON.stringify(result), /DO_NOT_DISCLOSE|credential|token|project|participant/i);
    return result;
  };
  try {
    process.env.BIGQUERY_MAX_BYTES_BILLED = '10000000';
    allowed = false;
    await run('BLOCKED_AUTHORIZATION', 0);
    allowed = true;
    role = 'AUTHORIZED_USER';
    await run('BLOCKED_AUTHORIZATION', 0);
    role = 'ADMIN';
    mode = 'mock';
    await run('BLOCKED_CONFIGURATION', 0);
    mode = 'bigquery';
    configured = false;
    await run('BLOCKED_CONFIGURATION', 0);
    configured = true;
    authMode = 'pem';
    await run('BLOCKED_CONFIGURATION', 0);
    authMode = 'vercel-wif';
    for (const limit of ['', '0', '-1', '100000001', '1e7', 'not-a-number']) {
      process.env.BIGQUERY_MAX_BYTES_BILLED = limit;
      await run('BLOCKED_COST_LIMIT', 0);
    }
    process.env.BIGQUERY_MAX_BYTES_BILLED = '10000000';
    assert.equal((await run('PASSED_READ_AND_SCHEMA', 8)).completedViews, 4);
    available = false;
    await run('BLOCKED_EMPTY_VIEW', 2);
    available = true;
    for (failureAt = 1; failureAt <= 8; failureAt++) await run('FAILED_READ_OR_SCHEMA', failureAt);
  } finally {
    if (originalLimit === undefined) delete process.env.BIGQUERY_MAX_BYTES_BILLED;
    else process.env.BIGQUERY_MAX_BYTES_BILLED = originalLimit;
  }
  console.log('Offline pre-UAT validator checks passed: authorization/configuration/cost gates, four-view schema/read probes, empty/error redaction. No live requests.');
}
main().catch(() => { console.error('Offline pre-UAT validator checks failed.'); process.exitCode = 1; });
