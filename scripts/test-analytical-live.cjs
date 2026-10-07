const fs = require('node:fs');
const assert = require('node:assert/strict');
const { BigQuery } = require('@google-cloud/bigquery');
const { loader } = require('./activity-test-loader.cjs');

async function main() {
  const client = new BigQuery({ projectId: 'unfpadatabase' });
  const base = loader();
  const guard = base('src/lib/server/bigquery-client.ts').validateQuerySafety;
  const suppress = value => base('src/lib/server/suppression.ts').suppressCount(Number(value)).displayValue;
  const calls = [];
  const run = async (query, params = {}) => {
    try { guard(query); } catch (error) { console.error('Query guard rejected:', error.message); throw error; } calls.push({ query, params });
    try { return (await client.query({ query, params, location: 'asia-south1', maximumBytesBilled: '1000000000', useLegacySql: false }))[0]; } catch (error) { console.error('Read-only query failed:', error.message); throw error; }
  };
  const load = loader({ './bigquery-client': { runSafeBigQuery: run, getDashboardDataMode: () => 'bigquery', getBigQueryConfigStatus: () => ({ configured: true, dataModeConfigurationValid: true }), getBigQueryProjectId: () => 'unfpadatabase', getBigQueryDatasetId: () => 'unfpadatabase' } });
  const service = load('src/lib/server/dashboard-page-data-service.ts');
  const scope = load('src/lib/server/analytical-scope.ts');
  const blank = { year: '', quarter: '', project: '', implementingPartner: '', province: '', district: '', municipality: '' };
  const evidence = [];
  const [sample] = await run(`SELECT reporting_year1, report_quarter1, project1, ip_name, province1, district1, palika1, outcome1, output1, activity1, eventtype1, SUM(event_count) AS events FROM ${scope.combinedSource} GROUP BY reporting_year1, report_quarter1, project1, ip_name, province1, district1, palika1, outcome1, output1, activity1, eventtype1 ORDER BY events DESC LIMIT 1`);
  let baseline;
  for (const [key, filters] of [['all', blank], ...Object.entries(scope.globalColumns).map(([key, column]) => [key, { ...blank, [key]: sample[column] }])]) {
    const data = await service.getDashboardPageData('executive-overview', filters);
    assert.equal(data.metadata.componentState, 'live_bigquery', JSON.stringify(data.metadata));
    const { where, params } = scope.combinedScope(filters);
    const [expected] = await run(`SELECT SUM(event_count) AS events, SUM(total_participants) AS participants FROM ${scope.combinedSource} ${where}`, params);
    const districts = await run(`SELECT COALESCE(NULLIF(district1, ''), 'Unspecified') AS label, SUM(event_count) AS events FROM ${scope.combinedSource} ${where} GROUP BY district1 ORDER BY events DESC, label`, params);
    assert.equal(data.metrics.find(metric => metric.label === 'Reported activities').value, String(expected.events));
    assert.equal(data.metrics.find(metric => metric.label === 'Total participants').value, suppress(expected.participants));
    assert.deepEqual(data.sections.find(section => section.key === 'district').rows.map(row => ({ label: row.label, events: row.events })), districts.map(row => ({ label: row.label, events: String(row.events) })));
    assert.equal(data.participants.metadata.dataSource, 'bigquery');
    if (key === 'all') baseline = data;
    else {
      assert.notEqual(expected.events, Number(baseline.metrics[0].value), `${key} must change result`);
      assert.notDeepEqual(data.sections.find(section => section.key === 'district').rows, baseline.sections.find(section => section.key === 'district').rows, `${key} must change map`);
    }
    evidence.push({ scenario: key, metrics: data.metrics, map: data.sections.find(section => section.key === 'district'), status: 'PASS' });
    console.log('PASS live global scope and map:', key);
  }
  for (const route of ['activity-progress', 'geographic-coverage', 'management-decision-centre']) {
    const data = await service.getDashboardPageData(route, Object.fromEntries(Object.entries(scope.globalColumns).map(([key, column]) => [key, sample[column]])));
    assert.equal(data.metadata.componentState, 'live_bigquery');
    evidence.push({ scenario: route, metrics: data.metrics, status: 'PASS' });
  }
  const hierarchy = { project: sample.project1, outcome: sample.outcome1, output: sample.output1, activity: sample.activity1, eventtype: sample.eventtype1 };
  const progress = await service.getDashboardPageData('activity-progress', hierarchy);
  assert.equal(progress.metadata.componentState, 'live_bigquery');
  assert.ok(progress.analyticalControls.options.activity.includes(sample.activity1));
  assert.ok(progress.sections.find(section => section.key === 'activity').rows.every(row => row.label === sample.activity1));
  evidence.push({ scenario: 'hierarchy', metrics: progress.metrics, status: 'PASS' });
  for (const input of [{}, { classification: 'reportable' }, { classification: 'non-reportable' }, { participantType: 'beneficiary' }, { participantType: 'guest' }, { participantType: 'beneficiary', classification: 'non-reportable' }, { entry_mode: 'summary' }, { entry_mode: 'name_list' }, { eventtype: sample.eventtype1 }, { project: sample.project1, classification: 'reportable' }]) {
    const data = await service.getDashboardPageData('participant-reach', input);
    assert.equal(data.metadata.componentState, 'live_bigquery', JSON.stringify(data.metadata));
    const clauses = [];
    const params = {};
    if (input.classification) { clauses.push('report_eligible = @classification'); params.classification = input.classification; }
    if (input.participantType) { clauses.push('participant_type_name = @participantType'); params.participantType = input.participantType; }
    if (input.eventtype) { clauses.push('event_type = @eventtype'); params.eventtype = input.eventtype; }
    if (input.project) { clauses.push('project = @project'); params.project = input.project; }
    const [repeat] = await run(`SELECT COUNT(*) AS participants, COUNTIF(sex_name = 'female') AS female FROM \`unfpadatabase.unfpadatabase.repeatdata\` ${clauses.length ? 'WHERE '+clauses.join(' AND ') : ''}`, params);
    const summaryClauses = ["participant_entry_mode = 'summary'"];
    const summaryParams = {};
    if (input.eventtype) { summaryClauses.push('eventtype1 = @eventtype'); summaryParams.eventtype = input.eventtype; }
    if (input.project) { summaryClauses.push('project1 = @project'); summaryParams.project = input.project; }
    const [summary] = await run(`SELECT COALESCE(SUM(total_participants), 0) AS participants, COALESCE(SUM(female), 0) AS female FROM ${scope.combinedSource} WHERE ${summaryClauses.join(' AND ')}`, summaryParams);
    const includeSummary = input.entry_mode !== 'name_list' && input.classification !== 'non-reportable' && !input.participantType;
    const includeRepeat = input.entry_mode !== 'summary';
    for (const [key, label] of [['participants', 'Total participants'], ['female', 'Female participants']]) {
      const expected = (includeSummary ? Number(summary[key]) : 0) + (includeRepeat ? Number(repeat[key]) : 0);
      assert.equal(data.metrics.find(metric => metric.label === label).value, suppress(expected));
    }
    assert.equal(data.participants.demographics[0].metrics.find(metric => metric.key === 'female').displayValue, data.metrics.find(metric => metric.label === 'Female participants').value);
    evidence.push({ scenario: 'participants', input, metrics: data.metrics, status: 'PASS' });
    console.log('PASS live participant population:', JSON.stringify(input));
  }
  assert.equal((await service.getDashboardPageData('executive-overview', { classification: 'reportable' })).metadata.responseStatus, 422);
  fs.mkdirSync('test-results/analytical-pass', { recursive: true });
  fs.writeFileSync('test-results/analytical-pass/reconciliation.json', JSON.stringify({ capturedAt: new Date().toISOString(), evidence, queries: calls.length }, null, 2));
  console.log('PASS analytical live reconciliation; read-only queries:', calls.length);
}
main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : `Live reconciliation failed: ${error.code || error.message}`); process.exitCode = 1; });
