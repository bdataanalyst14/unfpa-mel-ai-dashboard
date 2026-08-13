const { paths, runPreflight } = require('./bigquery-readonly');

runPreflight({ targetPaths: paths(process.env.DASHBOARD_BIGQUERY_TEST_ROOT || '') }).then((result) => {
  console.log(JSON.stringify(result.output, null, 2));
  process.exitCode = result.exitCode;
});
