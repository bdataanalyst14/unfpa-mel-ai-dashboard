const assert = require('node:assert/strict');
const fs = require('node:fs');
const { BigQuery } = require('@google-cloud/bigquery');
const { loader } = require('./activity-test-loader.cjs');

async function main() {
  const client = new BigQuery({ projectId: 'unfpadatabase' });
  const base = loader();
  const guard = base('src/lib/server/bigquery-client.ts').validateQuerySafety;
  let queries = 0;
  const run = async (query, params = {}) => {
    guard(query);
    queries++;
    return (await client.query({ query, params, location: 'asia-south1', maximumBytesBilled: '1000000000', useLegacySql: false }))[0];
  };
  const load = loader({ './bigquery-client': { runSafeBigQuery: run, getDashboardDataMode: () => 'bigquery', getBigQueryConfigStatus: () => ({ configured: true, dataModeConfigurationValid: true }), getBigQueryProjectId: () => 'unfpadatabase', getBigQueryDatasetId: () => 'unfpadatabase' } });
  const { activityFields } = load('src/lib/aggregate-contract.ts');
  const { queryActivityDetail } = load('src/lib/server/activity-detail-service.ts');
  const { getDashboardPageData } = load('src/lib/server/dashboard-page-data-service.ts');
  const source = '`unfpadatabase.unfpadatabase.combined_activity_summary`';
  const [metadata] = await client.dataset('unfpadatabase').table('combined_activity_summary').getMetadata();
  const excluded = ['event_row_key', 'repeat_index', 'actdetails1', 'indicator1'];
  assert.equal(metadata.schema.fields.length, 61);
  assert.equal(activityFields.length, 57);
  assert.deepEqual(metadata.schema.fields.map(field => field.name).filter(name => !excluded.includes(name)).sort(), activityFields.map(field => field.source).sort());
  const blank = { year: '', quarter: '', project: '', implementingPartner: '', province: '', district: '', municipality: '' };
  const [expected] = await run(`SELECT COUNT(*) AS row_count, SUM(event_count) AS events, SUM(total_participants) AS participants, SUM(total_reportable_participants) AS reportable, COUNT(DISTINCT ip_name) AS partners FROM ${source}`);
  const full = await queryActivityDetail(blank, {}, true);
  assert.equal(full.rows.length, Number(expected.row_count));
  for (const key of ['events', 'participants', 'reportable', 'partners']) assert.equal(Number(full.summary[key]), Number(expected[key]));
  assert.ok(full.rows.every(row => Object.keys(row).length === 57));
  assert.ok(full.rows.every(row => activityFields.filter(field => field.kind === 'measure' && !['events', 'submission_count'].includes(field.key)).every(field => !['1', '2', '3', '4'].includes(row[field.key]))));
  const page = await queryActivityDetail(blank, {});
  assert.deepEqual(page.rows, full.rows.slice(0, 25));
  const last = await queryActivityDetail(blank, { page: String(page.page.totalPages) });
  assert.deepEqual(last.rows, full.rows.slice((page.page.totalPages - 1) * 25));
  const geography = await getDashboardPageData('geographic-coverage');
  assert.equal(geography.metadata.componentState, 'live_bigquery');
  for (const key of ['projectGeography', 'partnerGeography']) {
    const rows = geography.sections.find(section => section.key === key).rows;
    assert.equal(rows.reduce((sum, row) => sum + Number(row.events), 0), Number(expected.events));
    assert.ok(rows.every(row => row.province && row.district));
  }
  const partners = await getDashboardPageData('ip-performance');
  assert.equal(partners.metadata.componentState, 'live_bigquery');
  assert.equal(partners.sections[0].rows.length, 15);
  const quality = await getDashboardPageData('data-quality');
  assert.equal(quality.metadata.componentState, 'live_bigquery');
  const [snapshot] = await run('SELECT SUM(total_rows) AS row_count, MAX(run_timestamp) AS timestamp FROM `unfpadatabase.unfpadatabase.data_quality_summary` WHERE run_timestamp = (SELECT MAX(run_timestamp) FROM `unfpadatabase.unfpadatabase.data_quality_summary`)');
  assert.equal(quality.metrics.find(metric => metric.label === 'Validated rows').value, String(snapshot.row_count));
  const evidence = {
    capturedAt: new Date().toISOString(), status: 'PASS', queries,
    sourceFields: 61, approvedFields: 57, excluded,
    nativeRows: full.rows.length, pageRows: page.rows.length, fullExportRows: full.rows.length,
    partners: partners.sections[0].rows.length,
    pipelineSync: geography.metadata.freshnessTimestamp,
    latestActivityDate: geography.metadata.latestActivityDate,
    dqSnapshot: quality.metadata.freshnessTimestamp,
    checks: ['live schema equality', 'native-grain complete export', 'first and last page equal full export slices', 'all participant cells suppress 1-4', 'both geography matrices reconcile to event total', '15 partners', 'latest DQ snapshot only'],
  };
  fs.mkdirSync('test-results/closing-review', { recursive: true });
  fs.writeFileSync('test-results/closing-review/live.json', JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
}
main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : `Read-only closing verification failed: ${error.code || error.name}`); process.exitCode = 1; });
