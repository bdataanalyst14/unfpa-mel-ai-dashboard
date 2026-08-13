const { paths, runPreflight } = require('./bigquery-readonly');

const testRoot = process.env.DASHBOARD_BIGQUERY_TEST_ROOT || '';
runPreflight({ targetPaths: paths(testRoot) }).then((result) => {
  console.log(JSON.stringify(result.output, null, 2));
  process.exitCode = result.exitCode;
});
