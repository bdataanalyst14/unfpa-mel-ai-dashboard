const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loader } = require('./activity-test-loader.cjs');
const load = loader();
const privacy = load('src/lib/server/suppression.ts');
const { safeActivityRow } = load('src/lib/server/activity-detail-service.ts');
const { activityFields, allActivityColumns } = load('src/lib/aggregate-contract.ts');
const { activityOrder, parseActivityRequest } = load('src/lib/server/activity-detail-query.ts');
const { createCsv } = load('src/lib/csv-export.ts');
const { profileLabels } = load('src/lib/server/participant-analysis.ts');

function vectors(length, total) {
  if (length === 1) return [[total]];
  return Array.from({ length: total + 1 }, (_, head) => vectors(length - 1, total - head).map(tail => [head, ...tail])).flat();
}
let witnesses = 0;
for (const actual of [[8, 1, 1], [5, 1], [0, 1, 1], [8, 4, 4], [8, 1, 0, 1]]) {
  const total = actual.reduce((a, b) => a + b, 0);
  const publish = counts => JSON.stringify(privacy.applyComplementarySuppression(counts.map(value => privacy.suppressCount(value)), total));
  const visible = publish(actual);
  const compatible = vectors(actual.length, total).filter(candidate => publish(candidate) === visible);
  actual.forEach((value, index) => {
    if (value >= 1 && value <= 4) {
      assert.ok(new Set(compatible.map(candidate => candidate[index])).size > 1, `Unique reconstruction: ${actual}, index ${index}`);
      witnesses++;
    }
  });
}
assert.throws(() => privacy.applyComplementarySuppression([privacy.suppressCount(1)], 1));
for (const value of [1, 2, 3, 4]) assert.equal(privacy.suppressCount(value).displayValue, '<5');
assert.equal(privacy.suppressCount(0).value, 0);
assert.equal(privacy.suppressCount(5).value, 5);
function gridTranscript(cells) {
  const sums = [cells[0] + cells[1], cells[2] + cells[3], cells[0] + cells[2], cells[1] + cells[3], cells.reduce((a, b) => a + b, 0)];
  return JSON.stringify({
    cells: cells.map(value => privacy.suppressPublishedCount(value)),
    rowColumnGrandMargins: sums.map(value => privacy.suppressPublishedCount(value)),
    partialPartition: privacy.suppressPublishedCategoryGroup({ observed: cells[0], overlappingAgeBand: cells[0] + cells[2] }, sums[4]),
    percentage: privacy.suppressPublishedPercentage(cells[0], sums[4]),
    publishedSubtotal: privacy.suppressPublishedCount(cells[0] + cells[3]),
  });
}
const grid = [8, 1, 1, 8];
const gridCompatible = vectors(4, 18).filter(candidate => gridTranscript(candidate) === gridTranscript(grid));
for (const index of [1, 2]) assert.ok(new Set(gridCompatible.map(candidate => candidate[index])).size > 1);

function row(value) {
  return Object.fromEntries(activityFields.map(field => [field.key, field.kind === 'measure' ? ['events', 'submission_count'].includes(field.key) ? 7 : value : field.key.endsWith('_check') ? `private-${value}` : 'Fixed dimension']));
}
function transcript(value) {
  const raw = row(value);
  const safe = safeActivityRow(raw);
  for (const field of activityFields) {
    if ((field.kind === 'measure' && !['events', 'submission_count'].includes(field.key)) || field.key.endsWith('_check')) assert.equal(safe[field.key], 'Suppressed');
  }
  assert.equal(safe.events, '7');
  const columns = allActivityColumns;
  const visible = columns.filter(([key]) => ['activity', 'events', 'participants', 'female', 'gender_total'].includes(key));
  return JSON.stringify({ safe, fullCsv: createCsv(columns.map(([, label]) => label), [columns.map(([key]) => safe[key])]), visibleCsv: createCsv(visible.map(([, label]) => label), [visible.map(([key]) => safe[key])]) });
}
for (const value of [0, 1, 2, 3, 4, 5, 938271, null, -1]) assert.equal(transcript(value), transcript(1));
for (const field of activityFields.filter(field => (field.kind === 'measure' && !['events', 'submission_count'].includes(field.key)) || field.key.endsWith('_check'))) {
  const order = activityOrder(parseActivityRequest({ sort: field.key }));
  assert.ok(order.startsWith('NULL ASC NULLS LAST'));
  assert.ok(!order.includes('`' + field.key + '`'));
}

async function analysisTranscript(value) {
  const fake = loader({ './bigquery-client': { runSafeBigQuery: async sql => {
    if (sql.includes(' AS totalParticipants')) return [{ totalParticipants: value + 10, reportableParticipants: 10, ...Object.fromEntries(Object.keys(profileLabels).map(key => [key, value])) }];
    return [{ label: 'A', participants: value }, { label: 'B', participants: 3 }];
  } } });
  const { participantAnalysis, participantBreakdowns } = fake('src/lib/server/participant-analysis.ts');
  const blank = { year: '', quarter: '', district: '', province: '', municipality: '', project: '', implementingPartner: '' };
  const empty = load('src/lib/analytical-filters.ts').parseAnalyticalFilters({}, 'participant-reach');
  const outputs = [];
  for (const filters of [blank, { ...blank, district: 'D' }, { ...blank, implementingPartner: 'IP' }, { ...blank, project: 'P' }, { ...blank, year: '2026', quarter: 'Q4' }, { ...blank, district: 'D', project: 'P', implementingPartner: 'IP', quarter: 'Q4' }]) {
    const data = await participantAnalysis(filters, empty);
    for (const metric of [...data.metrics, ...data.demographics.flatMap(group => group.metrics)]) {
      assert.equal(metric.value, null);
      assert.equal(metric.displayValue, 'Suppressed');
    }
    outputs.push(data, await participantBreakdowns(filters, empty));
  }
  return JSON.stringify(outputs);
}

async function main() {
  const baseline = await analysisTranscript(1);
  for (const value of [2, 3, 4, 938271]) assert.equal(await analysisTranscript(value), baseline);
  const { buildSafeGbvDashboardData } = load('src/lib/server/gbv-mock-dashboard-service.ts');
  const gbv = value => buildSafeGbvDashboardData([{ province: 'P', district: 'D', totalSurvivors: value, femaleSurvivors: value, maleSurvivors: 0, under15: value, referralCount: value, followUpCount: value, byCasteEthnicity: { C: value } }]);
  assert.deepEqual(gbv(1), gbv(938271));
  let personCount = 1;
  const apiLoad = loader({
    './bigquery-client': {
      getDashboardDataMode: () => 'bigquery',
      getBigQueryConfigStatus: () => ({ configured: true, dataModeConfigurationValid: true }),
      getBigQueryProjectId: () => 'fixture', getBigQueryDatasetId: () => 'fixture',
      runSafeBigQuery: async sql => {
        if (sql.includes('SELECT DISTINCT')) return [{ reporting_year1: '2026', report_quarter1: 'Q4', project1: 'P', ip_name: 'IP', province1: 'P', district1: 'D', palika1: 'M' }];
        if (sql.startsWith('WITH grouped')) return [{ row_count: 1, events: 7, partners: 1, participants: personCount, reportable: personCount }];
        if (sql.includes('ARRAY_AGG')) return [{}];
        if (sql.includes(' AS `events`')) return [row(personCount)];
        return [{ freshness_timestamp: '2026-10-29T00:00:00Z' }];
      },
    },
    '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: true }) },
    'next/server': { NextResponse: class extends Response { static json(data, init) { return Response.json(data, init); } } },
  });
  const pageService = apiLoad('src/lib/server/dashboard-page-data-service.ts');
  const exportApi = apiLoad('src/app/api/dashboard/activity-detail/export/route.ts');
  const pageApi = apiLoad('src/app/api/dashboard/page-data/route.ts');
  async function apiTranscript(value) {
    personCount = value;
    const page = await pageService.getDashboardPageData('activity-detail');
    assert.equal(page.metadata.componentState, 'live_bigquery');
    assert.equal(page.metrics.find(metric => metric.label === 'Total participants').value, 'Suppressed');
    const jsonResponse = await pageApi.GET({ nextUrl: new URL('http://fixture/api/dashboard/page-data?route=activity-detail') });
    assert.equal(jsonResponse.status, 200);
    const csv = [];
    for (const query of ['', '?columns=activity,events,participants,female,gender_total']) {
      const response = await exportApi.GET({ nextUrl: new URL('http://fixture/api/dashboard/activity-detail/export' + query) });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/csv/);
      csv.push(await response.text());
    }
    return JSON.stringify({ page, json: await jsonResponse.json(), csv });
  }
  const apiBaseline = await apiTranscript(1);
  for (const value of [2, 3, 4, 938271]) assert.equal(await apiTranscript(value), apiBaseline);
  for (const name of ['activity-detail-service', 'participant-analysis', 'participant-metrics', 'dashboard-page-data-service']) {
    const source = fs.readFileSync(`src/lib/server/${name}.ts`, 'utf8');
    assert.match(source, /suppressPublishedCount as suppressCount/);
    assert.match(source, /suppressPublishedCategoryGroup as suppressCategoryGroup/);
  }
  console.log(`PASS disclosure closure: ${witnesses} partition witnesses plus 2 grid witnesses (${gridCompatible.length} compatible grids with fixed grand total); primary threshold unchanged; all Activity fields, real page-data and both CSV handlers with synthetic warehouse/auth, hidden-measure sort, partial/overlapping profiles, jointly queried district/partner/project/period scopes and GBV JSON invariant under changed person counts.`);
  console.log('ASSUMPTIONS: fixed reporting rows, dimensions and operational measures; nonnegative integer counts; no historical/external person margins. Offline synthetic evidence only.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
