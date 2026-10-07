const assert = require('node:assert/strict');
const { loader } = require('./activity-test-loader.cjs');
const base = loader();
const { parseAnalyticalFilters } = base('src/lib/analytical-filters.ts');
const { combinedScope, globalColumns } = base('src/lib/server/analytical-scope.ts');
const { repeatScope, profileLabels } = base('src/lib/server/participant-analysis.ts');
const guard = base('src/lib/server/bigquery-client.ts').validateQuerySafety;
const blank = Object.fromEntries(Object.keys(globalColumns).map(key => [key, '']));
const empty = parseAnalyticalFilters({}, 'participant-reach');
for (const key of Object.keys(globalColumns)) {
  const filters = { ...blank, [key]: "scope' OR TRUE --" };
  for (const scope of [combinedScope(filters), repeatScope(filters, empty)]) {
    assert.match(scope.where, new RegExp(`= @${key}`));
    assert.equal(scope.params[key], filters[key]);
    assert.ok(!scope.where.includes(filters[key]));
  }
}
assert.throws(() => parseAnalyticalFilters({ outcome: ['a', 'b'] }, 'activity-progress'));
assert.throws(() => parseAnalyticalFilters({ classification: 'reportable' }, 'executive-overview'));
assert.throws(() => parseAnalyticalFilters({ eventtype: 'x'.repeat(1001) }, 'participant-reach'));

async function main() {
  const calls = [];
  const load = loader({ './bigquery-client': { runSafeBigQuery: async (query, params = {}) => {
    guard(query); calls.push({ query, params });
    const repeat = query.includes('.repeatdata`');
    let total = repeat ? query.includes('NOT (LOWER(TRIM(report_eligible))') ? 3 : query.includes("WHERE LOWER(TRIM(report_eligible))") ? 17 : 20 : 100;
    if (params.project) total = repeat ? 7 : 40;
    if (params.participantType) total = 10;
    return [{ totalParticipants: total, reportableParticipants: repeat ? Math.min(17, total) : total, ...Object.fromEntries(Object.keys(profileLabels).map(key => [key, key === 'female' ? total : 0])) }];
  } } });
  const { participantAnalysis } = load('src/lib/server/participant-analysis.ts');
  for (const [input, expected, queries] of [[{}, '120', 2], [{ classification: 'reportable' }, '117', 2], [{ classification: 'non-reportable' }, '<5', 1], [{ entry_mode: 'summary' }, '100', 1], [{ entry_mode: 'name_list' }, '20', 1], [{ participantType: 'beneficiary' }, '10', 1], [{ participantType: 'guest', entry_mode: 'summary' }, '0', 0]]) {
    calls.length = 0;
    const result = await participantAnalysis(blank, parseAnalyticalFilters(input, 'participant-reach'));
    assert.equal(result.metrics.find(metric => metric.key === 'totalParticipants').displayValue, expected);
    assert.equal(result.demographics[0].metrics.find(metric => metric.key === 'female').displayValue, expected);
    assert.equal(calls.length, queries);
    assert.ok(result.demographics[0].metrics.every(metric => metric.displayValue !== '<5' || metric.value === null));
  }
  for (const key of Object.keys(globalColumns)) {
    calls.length = 0;
    const selected = { ...blank, [key]: 'Selected' };
    await participantAnalysis(selected, empty);
    assert.equal(calls.length, 2);
    for (const call of calls) assert.equal(call.params[key], 'Selected');
  }
  const changed = await participantAnalysis({ ...blank, project: 'Selected' }, empty);
  assert.equal(changed.metrics[0].displayValue, '47');
  console.log('PASS analytical parameterization, route validation, all seven participant predicates, classification denominators, type/mode exclusions, consistent profiles and suppression.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
