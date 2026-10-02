const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ts = require('typescript');

const root = path.join(__dirname, '..');
function load(file, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  Function('require', 'module', 'exports', output)(
    (id) => Object.hasOwn(mocks, id) ? mocks[id] : mocks.fallback ? mocks.fallback(id) : require(id), loaded, loaded.exports,
  );
  return loaded.exports;
}

async function main() {
  
  const snapshots = [
    { total_rows: 50, records_with_quality_issue: 50, run_timestamp: '2026-09-01T00:00:00Z' },
    { total_rows: 100, records_with_quality_issue: 10, run_timestamp: '2026-09-02T00:00:00Z' },
  ];

  let executedSql = '';

  const service = load('src/lib/server/dashboard-page-data-service.ts', {
    'server-only': {},
    '@/data/mock/main-data': { mainData: [] },
    '@/lib/dashboard-filters': load('src/lib/dashboard-filters.ts'),
    './suppression': load('src/lib/server/suppression.ts', { 'server-only': {} }),
    './bigquery-client': {
      getDashboardDataMode: () => 'bigquery',
      getBigQueryConfigStatus: () => ({ configured: true, dataModeConfigurationValid: true }),
      getBigQueryProjectId: () => 'fixture', getBigQueryDatasetId: () => 'reporting',
      runSafeBigQuery: async (sql, params = {}) => {
        executedSql = sql;
        if (sql.includes('data_quality_summary')) {
          // Verify that the query isolates the latest timestamp via subquery or similar
          assert.ok(sql.includes('WHERE run_timestamp = (SELECT MAX(run_timestamp)'), 'Query must isolate latest snapshot');
          // Mock BigQuery aggregation execution
          const latest = snapshots.reduce((a, b) => new Date(a.run_timestamp) > new Date(b.run_timestamp) ? a : b);
          return [{ total_rows: latest.total_rows, issues: latest.records_with_quality_issue, ts: latest.run_timestamp }];
        }
        return [{ matched_rows: 50, missing_geo: 0, missing_project: 0, missing_partner: 0 }];
      },
    },
  });

  const result = await service.getDashboardPageData('data-quality', {});
  const validatedMetric = result.metrics.find(m => m.label === 'Validated rows');
  
  // Latest snapshot: 10 issues / 100 total = 90.0% valid.
  // If it summed both, it would be 15 issues / 150 total = 90.0%... wait. 
  // Let me make the older snapshot have a DIFFERENT percentage!
  assert.equal(validatedMetric.value, '90.0%');
  console.log('PASS: Data Quality Latest-Snapshot Regression');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
