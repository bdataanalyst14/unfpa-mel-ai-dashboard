const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loader } = require('./activity-test-loader.cjs');
const load = loader();
const { ratio, concentration } = load('src/lib/management-analysis.ts');
assert.equal(concentration([{events:'10'},{events:'50'},{events:'30'},{events:'10'}],3),'90.0%');
assert.equal(concentration([{events:'<5'},{events:'50'}],3),'Not available');
assert.equal(concentration([{events:'0'}],1),'Not available');
assert.equal(ratio('25','100'),'25.0%');
assert.equal(ratio('100','25',false),'4.0');
assert.equal(ratio('<5','100'),'Not available');
assert.equal(ratio('20','0'),'Not available');
const { activityFields, activityPresets } = load('src/lib/aggregate-contract.ts');
const { activityGroupedSql } = load('src/lib/server/activity-detail-query.ts');
assert.doesNotMatch(activityGroupedSql(''),/GROUP BY|SUM\(/);
for (const keys of Object.values(activityPresets)) {
  assert.ok(keys.length);
  assert.ok(keys.every(key => activityFields.some(field => field.key === key)));
}
const schemaPath = 'test-results/analytical-pass/schema.json';
if (fs.existsSync(schemaPath)) {
  const fields = JSON.parse(fs.readFileSync(schemaPath)).objects.find(object => object.name === 'combined_activity_summary').schema.fields;
  const excluded = ['event_row_key','repeat_index','actdetails1','indicator1'];
  assert.deepEqual(fields.map(field => field.name).filter(name => !excluded.includes(name)).sort(),activityFields.map(field => field.source).sort());
}
console.log('PASS concentration, ratios, suppressed-input refusal, zero denominators, native grain, presets and live schema coverage.');
