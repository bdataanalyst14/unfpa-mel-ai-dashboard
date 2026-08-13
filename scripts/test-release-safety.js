const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ReactDOMServer = require('react-dom/server');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');

function loadTypeScriptModule(relativePath, dependencyOverrides = {}) {
  const filename = path.join(repoRoot, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (request) => {
    if (Object.prototype.hasOwnProperty.call(dependencyOverrides, request)) {
      return dependencyOverrides[request];
    }
    return require(request);
  };
  Function('require', 'module', 'exports', output)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

function findElement(value, predicate) {
  if (!value || typeof value !== 'object') return undefined;
  if (predicate(value)) return value;
  const children = value.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return undefined;
  }
  return findElement(children, predicate);
}

function makeRecord(overrides) {
  return {
    province: 'Province',
    district: 'District',
    totalSurvivors: 10,
    femaleSurvivors: 5,
    maleSurvivors: 5,
    under15: 5,
    aged15to49: 5,
    above49: 0,
    withDisability: 0,
    referralCount: 5,
    followUpCount: 5,
    byPregnancyStatus: { pregnant: 0, notPregnant: 10, unknown: 0 },
    byMaritalStatus: {
      married: 5,
      unmarried: 5,
      divorced: 0,
      widowed: 0,
      other: 0,
    },
    byPlaceOfResidence: { urban: 5, rural: 5 },
    byCasteEthnicity: { Alpha: 10 },
    ocmcServicesProvided: 10,
    ocmcReferralsMade: 5,
    ...overrides,
  };
}

function collectNumericValues(value, output = []) {
  if (typeof value === 'number') output.push(value);
  if (Array.isArray(value)) {
    for (const item of value) collectNumericValues(item, output);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectNumericValues(item, output);
  }
  return output;
}

async function captureConsole(run) {
  const output = [];
  const original = {
    error: console.error,
    log: console.log,
    warn: console.warn,
  };
  console.error = (...values) => output.push(values.map(String).join(' '));
  console.log = (...values) => output.push(values.map(String).join(' '));
  console.warn = (...values) => output.push(values.map(String).join(' '));
  try {
    const value = await run();
    return { output: output.join('\n'), value };
  } finally {
    console.error = original.error;
    console.log = original.log;
    console.warn = original.warn;
  }
}

function headerText(response) {
  const values = [];
  response.headers.forEach((value, name) => values.push(`${name}: ${value}`));
  return values.join('\n');
}

async function main() {
  const suppression = loadTypeScriptModule('src/lib/server/suppression.ts', {
    'server-only': {},
  });
  const safeTypes = loadTypeScriptModule('src/lib/gbv-safe-types.ts');
  const rawMockData = loadTypeScriptModule('src/data/mock/gbv-services.ts', {
    'server-only': {},
  });
  const service = loadTypeScriptModule(
    'src/lib/server/gbv-mock-dashboard-service.ts',
    {
      'server-only': {},
      '@/data/mock/gbv-services': { gbvServiceData: [] },
      './suppression': suppression,
    },
  );
  const chart = loadTypeScriptModule(
    'src/components/charts/gbv-summary-chart.tsx',
    {
      '@/lib/gbv-safe-types': safeTypes,
    },
  );
  const csv = loadTypeScriptModule('src/lib/csv-export.ts');
  const privateKeyFile = loadTypeScriptModule(
    'src/lib/server/private-key-file.ts',
    {
      'server-only': {},
    },
  );

  assert.equal(suppression.suppressCount(4).displayValue, '<5');
  assert.equal(suppression.suppressCount(4).value, null);
  assert.equal(suppression.suppressCount(5).displayValue, '5');
  assert.equal(suppression.suppressCount(6).displayValue, '6');
  assert.equal(suppression.suppressPercentage(4, 20).displayValue, '<5');
  assert.equal(suppression.suppressPercentage(20, 4).displayValue, '<5');
  assert.equal(suppression.suppressPercentage(5, 0).displayValue, 'N/A');

  const actualViewModel = service.buildSafeGbvDashboardData(
    rawMockData.gbvServiceData,
  );
  const expectedProgrammeTotal = rawMockData.gbvServiceData.reduce(
    (sum, row) => sum + row.totalSurvivors,
    0,
  );
  const expectedFemaleTotal = rawMockData.gbvServiceData.reduce(
    (sum, row) => sum + row.femaleSurvivors,
    0,
  );
  const expectedReferralTotal = rawMockData.gbvServiceData.reduce(
    (sum, row) => sum + row.referralCount,
    0,
  );
  const expectedFollowUpTotal = rawMockData.gbvServiceData.reduce(
    (sum, row) => sum + row.followUpCount,
    0,
  );
  assert.equal(actualViewModel.kpis.total.chartValue, expectedProgrammeTotal);
  assert.equal(actualViewModel.kpis.female.chartValue, expectedFemaleTotal);
  assert.equal(actualViewModel.kpis.referrals.chartValue, expectedReferralTotal);
  assert.equal(actualViewModel.kpis.followUps.chartValue, expectedFollowUpTotal);

  const records = [
    makeRecord({
      province: 'Province A',
      district: 'District A',
      totalSurvivors: 20,
      femaleSurvivors: 17,
      maleSurvivors: 3,
      under15: 4,
      referralCount: 3,
      byCasteEthnicity: { Alpha: 16, Small: 4 },
    }),
    makeRecord({
      province: 'Province B',
      district: 'District B',
      byCasteEthnicity: { Alpha: 5, Beta: 5 },
    }),
    makeRecord({
      province: 'Province C',
      district: 'District C',
      totalSurvivors: 3,
      femaleSurvivors: 3,
      maleSurvivors: 0,
      under15: 0,
      aged15to49: 3,
      referralCount: 0,
      followUpCount: 0,
      byPregnancyStatus: { pregnant: 0, notPregnant: 3, unknown: 0 },
      byMaritalStatus: {
        married: 0,
        unmarried: 3,
        divorced: 0,
        widowed: 0,
        other: 0,
      },
      byPlaceOfResidence: { urban: 0, rural: 3 },
      byCasteEthnicity: { Alpha: 3 },
      ocmcServicesProvided: 3,
      ocmcReferralsMade: 0,
    }),
  ];
  const viewModel = service.buildSafeGbvDashboardData(records);
  const provinceByName = Object.fromEntries(
    viewModel.provinceChart.map((item) => [item.name, item]),
  );
  const casteByName = Object.fromEntries(
    viewModel.casteChart.map((item) => [item.name, item]),
  );
  const rowByDistrict = Object.fromEntries(
    viewModel.rows.map((item) => [item.district, item]),
  );

  assert.equal(provinceByName['Province C'].displayValue, '<5');
  assert.equal(provinceByName['Province C'].chartValue, 0);
  assert.equal(provinceByName['Province B'].displayValue, 'Suppressed');
  assert.equal(provinceByName['Province B'].chartValue, 0);
  assert.equal(casteByName.Small.displayValue, '<5');
  assert.equal(casteByName.Small.chartValue, 0);
  assert.equal(casteByName.Beta.displayValue, 'Suppressed');
  assert.equal(casteByName.Beta.chartValue, 0);
  assert.equal(rowByDistrict['District A'].total.displayValue, '20');
  assert.equal(rowByDistrict['District A'].female.displayValue, 'Suppressed');
  assert.equal(rowByDistrict['District A'].male.displayValue, '<5');
  assert.equal(rowByDistrict['District A'].under15Share.displayValue, '<5');
  assert.equal(rowByDistrict['District A'].referralRate.displayValue, '<5');
  assert.equal(rowByDistrict['District B'].total.displayValue, 'Suppressed');
  assert.equal(rowByDistrict['District B'].female.displayValue, 'Suppressed');
  assert.equal(rowByDistrict['District B'].under15Share.displayValue, 'Suppressed');
  assert.equal(rowByDistrict['District C'].total.displayValue, '<5');
  assert.equal(
    safeTypes.formatSafeGbvTooltipValue(provinceByName['Province C']),
    '<5',
  );
  assert.equal(safeTypes.formatSafeGbvTooltipValue(undefined), 'N/A');

  const chartElement = chart.default({
    data: [provinceByName['Province C']],
    valueLabel: 'Survivors reached',
  });
  const tooltipElement = findElement(
    chartElement,
    (element) => typeof element.props?.formatter === 'function',
  );
  assert.ok(tooltipElement);
  assert.deepEqual(
    tooltipElement.props.formatter(3, 'chartValue', {
      payload: provinceByName['Province C'],
    }),
    ['<5', 'Survivors reached'],
  );
  const chartMarkup = ReactDOMServer.renderToStaticMarkup(chartElement);
  assert.match(chartMarkup, /Province C: &lt;5 Survivors reached/);
  assert.doesNotMatch(chartMarkup, /Province C: 3 Survivors reached/);

  const clientPayload = JSON.parse(JSON.stringify(viewModel));
  assert.equal(JSON.stringify(clientPayload).includes('"value":'), false);
  assert.deepEqual(
    collectNumericValues(clientPayload).filter((value) => value >= 1 && value < 5),
    [],
  );
  const safeExport = csv.createCsv(
    ['Province', 'Displayed survivors'],
    viewModel.provinceChart.map((item) => [item.name, item.displayValue]),
  );
  assert.match(safeExport, /"Province C","<5"/);
  assert.doesNotMatch(safeExport, /"Province C","3"/);

  const privateKeyTestRoot = fs.mkdtempSync(
    path.join(repoRoot, '.release-safety-private-key-'),
  );
  const secretsDirectory = path.join(privateKeyTestRoot, 'secrets');
  const outsideDirectory = path.join(privateKeyTestRoot, 'outside');
  const validPrivateKeyPath = path.join(secretsDirectory, 'service-account.pem');
  const outsidePrivateKeyPath = path.join(outsideDirectory, 'outside.pem');
  const syntheticPrivateKey = 'SYNTHETIC_PRIVATE_KEY\\nLITERAL_ESCAPE';
  fs.mkdirSync(secretsDirectory);
  fs.mkdirSync(outsideDirectory);
  fs.writeFileSync(validPrivateKeyPath, ` \n${syntheticPrivateKey}\n `, 'utf8');
  fs.writeFileSync(outsidePrivateKeyPath, 'OUTSIDE_SECRET_MARKER', 'utf8');

  try {
    assert.throws(
      () =>
        privateKeyFile.readPrivateKeyFile(
          path.join('relative', 'service-account.pem'),
          secretsDirectory,
        ),
      { message: 'Invalid private-key file configuration.' },
    );
    assert.throws(
      () =>
        privateKeyFile.readPrivateKeyFile(
          outsidePrivateKeyPath,
          secretsDirectory,
        ),
      { message: 'Invalid private-key file configuration.' },
    );
    assert.throws(
      () =>
        privateKeyFile.readPrivateKeyFile(
          secretsDirectory,
          secretsDirectory,
        ),
      { message: 'Invalid private-key file configuration.' },
    );
    assert.throws(
      () =>
        privateKeyFile.readPrivateKeyFile(
          path.join(secretsDirectory, '..', 'outside', 'outside.pem'),
          secretsDirectory,
        ),
      { message: 'Invalid private-key file configuration.' },
    );

    const linkedDirectory = path.join(secretsDirectory, 'linked');
    fs.symlinkSync(
      outsideDirectory,
      linkedDirectory,
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    assert.throws(
      () =>
        privateKeyFile.readPrivateKeyFile(
          path.join(linkedDirectory, 'outside.pem'),
          secretsDirectory,
        ),
      { message: 'Invalid private-key file configuration.' },
    );

    const privateKeyRead = await captureConsole(() =>
      privateKeyFile.readPrivateKeyFile(validPrivateKeyPath, secretsDirectory),
    );
    assert.equal(privateKeyRead.value, syntheticPrivateKey);
    assert.equal(privateKeyRead.output, '');
    assert.doesNotMatch(privateKeyRead.output, /SYNTHETIC_PRIVATE_KEY/);
  } finally {
    fs.rmSync(privateKeyTestRoot, { force: true, recursive: true });
  }

  const health = loadTypeScriptModule('src/app/api/health/route.ts', {
    '../../../../package.json': require(path.join(repoRoot, 'package.json')),
  });
  const executiveApi = loadTypeScriptModule(
    'src/app/api/dashboard/executive-overview/route.ts',
    {
      '@/lib/server/bigquery-dashboard-service': {
        getExecutiveOverviewData: async () => {
          throw new Error(
            'PRIVATE_KEY_SHOULD_NOT_LEAK project=secret-project dataset=secret_dataset path=/etc/unfpa-mel/secrets/key.pem -----BEGIN PRIVATE KEY-----',
          );
        },
      },
    },
  );
  const pageDataApi = loadTypeScriptModule(
    'src/app/api/dashboard/page-data/route.ts',
    {
      '@/lib/server/dashboard-page-data-service': {
        getDashboardPageData: async () => {
          throw new Error(
            'CREDENTIAL_SHOULD_NOT_LEAK project=secret-project dataset=secret_dataset path=/etc/unfpa-mel/secrets/key.pem -----BEGIN PRIVATE KEY-----',
          );
        },
      },
    },
  );
  const response = health.GET();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(Object.keys(body).sort(), ['application', 'status', 'version']);
  assert.equal(body.status, 'ok');
  assert.equal(body.application, 'unfpa-mel-dashboard');
  assert.equal(body.version, require(path.join(repoRoot, 'package.json')).version);

  const apiCalls = await captureConsole(async () => {
    const executiveErrorResponse = await executiveApi.GET({
      nextUrl: { searchParams: new URLSearchParams() },
    });
    const pageDataErrorResponse = await pageDataApi.GET({
      nextUrl: { searchParams: new URLSearchParams() },
    });
    return { executiveErrorResponse, pageDataErrorResponse };
  });
  const { executiveErrorResponse, pageDataErrorResponse } = apiCalls.value;
  const executiveErrorBody = await executiveErrorResponse.json();
  assert.equal(executiveErrorResponse.status, 500);
  assert.equal(
    executiveErrorResponse.headers.get('cache-control'),
    'private, no-store',
  );
  assert.deepEqual(executiveErrorBody, {
    error: 'Executive Overview data is temporarily unavailable.',
  });
  assert.doesNotMatch(
    `${JSON.stringify(executiveErrorBody)}\n${headerText(executiveErrorResponse)}`,
    /PRIVATE_KEY|secret-project|secret_dataset|\/etc\/unfpa-mel\/secrets|BEGIN PRIVATE KEY/,
  );

  const pageDataErrorBody = await pageDataErrorResponse.json();
  assert.equal(pageDataErrorResponse.status, 500);
  assert.equal(
    pageDataErrorResponse.headers.get('cache-control'),
    'private, no-store',
  );
  assert.deepEqual(pageDataErrorBody, {
    error: 'Dashboard data is temporarily unavailable.',
  });
  assert.doesNotMatch(
    `${JSON.stringify(pageDataErrorBody)}\n${headerText(pageDataErrorResponse)}`,
    /CREDENTIAL|secret-project|secret_dataset|\/etc\/unfpa-mel\/secrets|BEGIN PRIVATE KEY/,
  );
  assert.equal(apiCalls.output, '');

  console.log('Release-safety behavioral tests passed.');
  console.log(
    'Checks: privacy/presentation, private-key file validation, API sanitization, and health safety assertions.',
  );
  console.log('No live data, credentials, network calls, or environment reads.');
}

main().catch((error) => {
  console.error('Release-safety behavioral tests failed.');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
