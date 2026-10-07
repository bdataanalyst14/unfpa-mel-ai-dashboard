const assert = require('assert');
const { loader } = require('./activity-test-loader.cjs');
const load = (file, mocks = {}) => loader(mocks)(file);

async function main() {
  
  const snapshots = [
    { total_rows: 50, records_with_quality_issue: 50, run_timestamp: '2026-09-01T00:00:00Z' },
    { total_rows: 100, records_with_quality_issue: 10, run_timestamp: '2026-09-02T00:00:00Z' },
  ];



  const service = load('src/lib/server/dashboard-page-data-service.ts', {
    'server-only': {},
    '@/data/mock/main-data': { mainData: [] },
    '@/lib/dashboard-filters': load('src/lib/dashboard-filters.ts'),
    './suppression': load('src/lib/server/suppression.ts', { 'server-only': {} }),
    './bigquery-client': {
      getDashboardDataMode: () => 'bigquery',
      getBigQueryConfigStatus: () => ({ configured: true, dataModeConfigurationValid: true }),
      getBigQueryProjectId: () => 'fixture', getBigQueryDatasetId: () => 'reporting',
      runSafeBigQuery: async (sql) => {

        if (sql.includes('data_quality_summary')) {
          assert.ok(sql.includes('WHERE run_timestamp = (SELECT MAX(run_timestamp)'), 'Query must isolate latest snapshot');
          const latest = snapshots.reduce((a, b) => new Date(a.run_timestamp) > new Date(b.run_timestamp) ? a : b);
          return [{ total_rows: latest.total_rows, issues: latest.records_with_quality_issue, ts: latest.run_timestamp }];
        }
        return [{ matched_rows: 50, missing_geo: 0, missing_project: 0, missing_partner: 0 }];
      },
    },
  });

  const result = await service.getDashboardPageData('data-quality', {});
  const validatedMetric = result.metrics.find(m => m.label === 'Validated rows');
  
  assert.equal(validatedMetric.value, '100');
  console.log('PASS: Data Quality Latest-Snapshot Regression');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
