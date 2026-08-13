const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const suppressionPath = path.join(repoRoot, 'src', 'lib', 'server', 'suppression.ts');
const servicePath = path.join(
  repoRoot,
  'src',
  'lib',
  'server',
  'bigquery-dashboard-service.ts',
);
const gbvMockDataPath = path.join(repoRoot, 'src', 'data', 'mock', 'gbv-services.ts');
const gbvSafeServicePath = path.join(
  repoRoot,
  'src',
  'lib',
  'server',
  'gbv-mock-dashboard-service.ts',
);
const gbvPagePath = path.join(
  repoRoot,
  'src',
  'app',
  'dashboard',
  'gbv-ocmc-summary',
  'page.tsx',
);
const gbvChartPath = path.join(
  repoRoot,
  'src',
  'components',
  'charts',
  'gbv-summary-chart.tsx',
);
const chartCardPath = path.join(
  repoRoot,
  'src',
  'components',
  'dashboard',
  'chart-card.tsx',
);
const healthPath = path.join(repoRoot, 'src', 'app', 'api', 'health', 'route.ts');
const activityDetailPath = path.join(
  repoRoot,
  'src',
  'app',
  'dashboard',
  'activity-detail',
  'page.tsx',
);
const csvExportPath = path.join(repoRoot, 'src', 'lib', 'csv-export.ts');

const checks = [];

function check(name, fn) {
  checks.push({ name, fn });
}

function loadSuppressionModule() {
  const source = fs.readFileSync(suppressionPath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: suppressionPath,
  }).outputText;
  const loadedModule = { exports: {} };
  Function('require', 'module', 'exports', output)(
    (request) => (request === 'server-only' ? {} : require(request)),
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

function assertSuppressedSmallCell(result) {
  assert.equal(result.displayValue, '<5');
  assert.equal(result.value, null);
  assert.equal(result.suppressed, true);
  assert.equal(result.suppression_reason, 'small_cell');
}

function assertInvalidCount(result) {
  assert.equal(result.displayValue, 'N/A');
  assert.equal(result.value, null);
  assert.equal(result.suppressed, true);
  assert.equal(result.suppression_reason, 'invalid_count');
}

function main() {
  const { suppressCount, suppressPercentage, suppressRecord } =
    loadSuppressionModule();

  check('suppressCount(0) remains unsuppressed', () => {
    assert.deepEqual(suppressCount(0), {
      displayValue: '0',
      value: 0,
      suppressed: false,
    });
  });

  for (const count of [1, 2, 3, 4]) {
    check(`suppressCount(${count}) returns <5 and suppressed`, () => {
      const result = suppressCount(count);
      assertSuppressedSmallCell(result);
      assert.notEqual(result.displayValue, String(count));
    });
  }

  check('suppressCount(5) remains visible', () => {
    assert.deepEqual(suppressCount(5), {
      displayValue: '5',
      value: 5,
      suppressed: false,
    });
  });

  check('null is handled safely', () => assertInvalidCount(suppressCount(null)));
  check('undefined is handled safely', () =>
    assertInvalidCount(suppressCount(undefined)));
  check('NaN is handled safely', () =>
    assertInvalidCount(suppressCount(Number.NaN)));
  check('non-numeric string is handled safely', () =>
    assertInvalidCount(suppressCount('3')));
  check('negative values are not valid reportable counts', () =>
    assertInvalidCount(suppressCount(-1)));

  check('suppressPercentage suppresses unsafe numerator', () => {
    assertSuppressedSmallCell(suppressPercentage(4, 20));
  });

  check('suppressPercentage suppresses unsafe denominator', () => {
    assertSuppressedSmallCell(suppressPercentage(20, 4));
  });

  check('suppressPercentage suppresses invalid denominator', () => {
    const result = suppressPercentage(20, 0);
    assert.equal(result.displayValue, 'N/A');
    assert.equal(result.value, null);
    assert.equal(result.suppressed, true);
    assert.equal(result.suppression_reason, 'invalid_denominator');
  });

  check('suppressPercentage allows safe numerator and denominator', () => {
    assert.deepEqual(suppressPercentage(10, 20), {
      displayValue: '50.0%',
      value: 50,
      suppressed: false,
    });
  });

  check('no raw 1, 2, 3, or 4 appears in suppressed displayValue', () => {
    for (const count of [1, 2, 3, 4]) {
      const result = suppressCount(count);
      assert.equal(result.suppressed, true);
      assert.equal(result.displayValue, '<5');
      assert(!['1', '2', '3', '4'].includes(result.displayValue));
    }
  });

  check('suppressRecord handles nested payloads safely', () => {
    const output = suppressRecord({
      district: 'Example',
      total: 5,
      female: 4,
      nested: {
        male: 1,
        other: 0,
      },
    });

    assert.deepEqual(output.total, {
      displayValue: '5',
      value: 5,
      suppressed: false,
    });
    assertSuppressedSmallCell(output.female);
    assertSuppressedSmallCell(output.nested.male);
    assert.deepEqual(output.nested.other, {
      displayValue: '0',
      value: 0,
      suppressed: false,
    });
  });

  check('top-level numeric payloads are handled safely', () => {
    assertSuppressedSmallCell(suppressRecord(2));
  });

  check('bigquery-dashboard-service imports and uses suppression utilities', () => {
    const serviceSource = fs.readFileSync(servicePath, 'utf8');
    assert.match(serviceSource, /from ['"]\.\/suppression['"]/);
    assert.match(serviceSource, /\bsuppressCount\b/);
    assert.match(serviceSource, /\bsuppressPercentage\b/);
    assert.match(serviceSource, /metadata:\s*\{[\s\S]*suppression/m);
    assert.match(serviceSource, /Numeric compatibility fields use 0/);
  });

  check('GBV mock records are restricted to server-only imports', () => {
    const source = fs.readFileSync(gbvMockDataPath, 'utf8');
    assert.match(source, /import ['"]server-only['"]/);
  });

  check('GBV page does not import raw mock records into a client component', () => {
    const source = fs.readFileSync(gbvPagePath, 'utf8');
    assert.doesNotMatch(source, /^['"]use client['"]/);
    assert.doesNotMatch(source, /\bgbvServiceData\b/);
    assert.match(source, /\bgetSafeGbvMockDashboardData\b/);
  });

  check('GBV safe transport applies count suppression before chart serialization', () => {
    const source = fs.readFileSync(gbvSafeServicePath, 'utf8');
    assert.match(source, /safeCountSeries\(provinceCategories,\s*totalResult\)/);
    assert.match(source, /applyComplementarySuppression/);
    assert.match(source, /chartValue:\s*result\.value\s*\?\?\s*0/);
  });

  check('GBV derived under-15 share and referral rate use percentage suppression', () => {
    const source = fs.readFileSync(gbvSafeServicePath, 'utf8');
    assert.match(
      source,
      /under15Share:[\s\S]*suppressPercentage\(row\.under15,\s*row\.totalSurvivors\)/,
    );
    assert.match(
      source,
      /referralRate:[\s\S]*suppressPercentage\(row\.referralCount,\s*row\.totalSurvivors\)/,
    );
  });

  check('GBV chart tooltip and accessibility text use safe display values', () => {
    const source = fs.readFileSync(gbvChartPath, 'utf8');
    assert.match(source, /formatSafeGbvTooltipValue\(item\.payload\)/);
    assert.match(source, /entry\.displayValue/);
    assert.match(source, /dataKey="chartValue"/);
    assert.doesNotMatch(source, /suppressSmallCount/);
  });

  check('GBV dashboard has no export control before privacy-safe export is designed', () => {
    const pageSource = fs.readFileSync(gbvPagePath, 'utf8');
    const chartCardSource = fs.readFileSync(chartCardPath, 'utf8');
    assert.doesNotMatch(pageSource, /Export|Download/);
    assert.doesNotMatch(chartCardSource, /aria-label="Export chart"/);
  });

  check('health endpoint exposes only safe static response fields', () => {
    const source = fs.readFileSync(healthPath, 'utf8');
    assert.match(source, /status:\s*['"]ok['"]/);
    assert.match(source, /application:\s*['"]unfpa-mel-dashboard['"]/);
    assert.match(source, /version:\s*packageJson\.version/);
    assert.match(source, /Cache-Control['"]:\s*['"]private, no-store['"]/);
    assert.doesNotMatch(source, /process\.env|BIGQUERY|GOOGLE_|hostname|filesystem/);
  });

  check('activity CSV export is wired and protects spreadsheet formula cells', () => {
    const pageSource = fs.readFileSync(activityDetailPath, 'utf8');
    const csvSource = fs.readFileSync(csvExportPath, 'utf8');
    assert.match(pageSource, /onClick=\{exportFilteredRows\}/);
    assert.match(pageSource, /\bcreateCsv\b/);
    assert.match(csvSource, /\^\[=\+\\-@\]/);
    assert.match(csvSource, /replace\(\/"\/g,\s*'""'\)/);
  });

  const failures = [];
  for (const item of checks) {
    try {
      item.fn();
    } catch (error) {
      failures.push({ name: item.name, error });
    }
  }

  if (failures.length > 0) {
    console.error('Verification failed.');
    for (const failure of failures) {
      console.error(`- ${failure.name}: ${failure.error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Verification passed.');
  console.log(`Checks passed: ${checks.length}`);
  console.log('Scope: local suppression, GBV client-boundary, health-route, and CSV wiring checks.');
  console.log('No BigQuery calls, live routes, refresh scripts, credentials, or .env reads.');

  // Run new production readiness smoke tests
  require('./test-production-smoke.js');
}

main();
