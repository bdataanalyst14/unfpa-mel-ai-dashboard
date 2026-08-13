const { activationPlan, paths } = require('./bigquery-readonly');

try {
  const apply = process.argv.slice(2).includes('--apply');
  const uid = typeof process.getuid === 'function' ? process.getuid() : 1;
  const result = activationPlan({
    targetPaths: paths(process.env.DASHBOARD_BIGQUERY_TEST_ROOT || ''),
    apply,
    uid,
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'aborted', reason: error.message }));
  process.exitCode = 1;
}
