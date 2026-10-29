const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loader } = require('./activity-test-loader.cjs');
const load = loader();
const registry = load('src/lib/aggregate-contract.ts');
const query = load('src/lib/server/activity-detail-query.ts');
const service = load('src/lib/server/activity-detail-service.ts');
const guard = load('src/lib/server/bigquery-client.ts');
const { createCsv } = load('src/lib/csv-export.ts');
const blank = { year: '', quarter: '', project: '', implementingPartner: '', province: '', district: '', municipality: '' };
assert.equal(registry.activityFields.length, 57);
assert.equal(new Set(registry.activityFields.map(f => f.source)).size, 57);
assert.equal(registry.defaultVisibleColumns.length, 14);
assert.doesNotMatch(JSON.stringify(registry.activityFields), /event_row_key|repeat_index|actdetails1|indicator1|phone|email|participant_name/);
const request = query.parseActivityRequest();
assert.equal(request.pageSize, 25);
for (const input of [{sort:'events; DROP'}, {direction:'DROP'}, {page:'0'}, {page:'1.1'}, {pageSize:'100000'}, {search:['a','b']}, {search:'a'.repeat(201)}]) assert.throws(() => query.parseActivityRequest(input));
for (const key of Object.keys(blank)) {
  const where = query.activityWhere({ ...blank, [key]: "x' OR TRUE --" }, request);
  assert.ok(where.where.includes('@' + key));
  assert.equal(where.params[key], "x' OR TRUE --");
  assert.ok(!where.where.includes('OR TRUE'));
}
for (const key of registry.activityExtraFilters) {
  const where = query.activityWhere(blank, {...request, [key]:'chosen'});
  assert.equal(where.params[key], 'chosen');
}
const searched = query.activityWhere(blank, {...request,search:'100%_'});
assert.equal(searched.params.search, '100%_');
assert.match(searched.where, /province1/);
assert.doesNotMatch(searched.where, /LIKE/);
const sql = query.activityGroupedSql('');
guard.validateQuerySafety(sql);
guard.validateQuerySafety(`WITH grouped AS (${sql}) SELECT COUNT(*) AS row_count FROM grouped`);
for (const field of registry.activityFields) guard.validateQuerySafety(`${sql} ORDER BY ${query.activityOrder({...request,sort:field.key})} LIMIT @pageSize OFFSET @offset`);
assert.match(query.activityOrder({...request,sort:'female'}), /^NULL ASC NULLS LAST/);
const safe = service.safeActivityRow({ events:3, submission_count:3, participants:200, reportable:null, female:4, male:0, activity:'=SUM(A1)', event_row_key:'secret', actdetails:'private' });
assert.equal(safe.submission_count, '3');
assert.ok(query.activityOrder({...request,sort:'submission_count'}).startsWith('`submission_count` ASC'));
assert.equal(safe.events,'3'); assert.equal(safe.female,'Suppressed'); assert.equal(safe.male,'Suppressed'); assert.equal(safe.reportable,'Suppressed');
assert.ok(!('event_row_key' in safe)); assert.ok(!('actdetails' in safe));
const csv = createCsv(registry.allActivityColumns.map(([,label])=>label), [registry.allActivityColumns.map(([key])=>safe[key])]);
assert.match(csv, /'<*=?SUM|'<*SUM|=SUM/);
assert.ok(csv.includes("'=SUM(A1)")); assert.match(csv, /Suppressed/); assert.doesNotMatch(csv,/secret|private/);
for (const value of ['=1','+1','-1','@SUM(A1)',' \t=1','\r@1']) assert.ok(createCsv(['A'],[[value]]).includes("'" + value));
assert.equal(query.activityGroupedSql(''), query.activityGroupedSql('', ['female']));
const route = fs.readFileSync('src/app/api/dashboard/activity-detail/export/route.ts','utf8');
assert.ok(route.indexOf('await requireDashboardApiAccess()') < route.indexOf('await getDashboardPageData'));
assert.match(route,/getDashboardPageData\('activity-detail', input, input, true\)/);
assert.doesNotMatch(sql,/JOIN|SELECT \*|LIMIT/i);

const rowWithSmallCell = service.safeActivityRow({
  events: 1, submission_count: 1, participants: 24, gender_total: 24, gender_disagg_sum: 24,
  female: 20, male: 4, other_sex: 0,
  pwd_total: 24, withdisability: 2, nodisability: 22,
  caste_total: 24, caste_disagg_sum: 24,
  hilldalit: 10, teraidalit: 2, hilljanajati: 12, teraijanajati: 0, madhesi: 0, muslim: 0, bc: 0, other_cast: 0
});
assert.equal(rowWithSmallCell.male, 'Suppressed');
assert.equal(rowWithSmallCell.female, 'Suppressed');
assert.equal(rowWithSmallCell.other_sex, 'Suppressed');
assert.equal(rowWithSmallCell.gender_disagg_sum, 'Suppressed');
assert.equal(rowWithSmallCell.withdisability, 'Suppressed');
assert.equal(rowWithSmallCell.nodisability, 'Suppressed');
assert.equal(rowWithSmallCell.teraidalit, 'Suppressed');
assert.equal(rowWithSmallCell.hilldalit, 'Suppressed');
assert.equal(rowWithSmallCell.caste_disagg_sum, 'Suppressed');
const protectedCsv = createCsv(registry.allActivityColumns.map(([,label])=>label), [registry.allActivityColumns.map(([key])=>rowWithSmallCell[key])]);
assert.ok(protectedCsv.includes('Suppressed'));
assert.ok(!protectedCsv.includes('<5'));

console.log('PASS Activity Detail registry, privacy, parameterization, all filters, search, sort allowlist, pagination bounds, stable grain, suppression and CSV formula protection.');
