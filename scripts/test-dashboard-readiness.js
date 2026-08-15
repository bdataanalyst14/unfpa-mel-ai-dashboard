const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function load(relativePath, overrides = {}) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (request) =>
    Object.prototype.hasOwnProperty.call(overrides, request)
      ? overrides[request]
      : require(request);
  Function('require', 'module', 'exports', output)(
    localRequire,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

async function main() {
  const data = load('src/data/mock/main-data.ts');
  const filters = load('src/lib/dashboard-filters.ts');
  const csv = load('src/lib/csv-export.ts');
  const options = filters.buildDashboardFilterOptions(data.mainData);

  const independent = {
    year: '2025',
    quarter: 'Q2',
    project: 'CP9 GEWE',
    implementingPartner: 'WOREC',
    province: 'Karnali',
  };
  for (const [key, value] of Object.entries(independent)) {
    const parsed = filters.parseDashboardFilters(
      new URLSearchParams({ [key]: value }),
      options,
    );
    const rows = filters.filterActivities(data.mainData, parsed);
    assert.ok(rows.length > 0, `${key} should match mock rows`);
    assert.ok(
      rows.every((row) =>
        key === 'implementingPartner'
          ? row.ip === value
          : String(row[key]) === value,
      ),
    );
  }

  const combinedSource = data.mainData[0];
  const combined = filters.parseDashboardFilters(
    new URLSearchParams({
      year: String(combinedSource.year),
      quarter: combinedSource.quarter,
      project: combinedSource.project,
      implementingPartner: combinedSource.ip,
      province: combinedSource.province,
    }),
    options,
  );
  const combinedRows = filters.filterActivities(data.mainData, combined);
  assert.ok(combinedRows.length > 0);
  assert.ok(
    combinedRows.every(
      (row) =>
        row.year === combinedSource.year &&
        row.quarter === combinedSource.quarter &&
        row.project === combinedSource.project &&
        row.ip === combinedSource.ip &&
        row.province === combinedSource.province,
    ),
  );

  let emptyCombination;
  for (const project of options.project) {
    for (const implementingPartner of options.implementingPartner) {
      for (const province of options.province) {
        const candidate = filters.parseDashboardFilters(
          new URLSearchParams({ project, implementingPartner, province }),
          options,
        );
        if (filters.filterActivities(data.mainData, candidate).length === 0) {
          emptyCombination = candidate;
          break;
        }
      }
      if (emptyCombination) break;
    }
    if (emptyCombination) break;
  }
  assert.ok(emptyCombination, 'mock rows should include a valid empty filter combination');
  const emptyRows = filters.filterActivities(data.mainData, emptyCombination);
  assert.equal(emptyRows.length, 0);
  assert.deepEqual(filters.summarizeActivities(emptyRows), {
    totalActivities: 0,
    totalParticipants: 0,
    femaleParticipants: 0,
    maleParticipants: 0,
    otherParticipants: 0,
    beneficiaries: 0,
    districts: 0,
    partners: 0,
    missingEvidence: 0,
    pendingValidation: 0,
    femaleShare: null,
  });

  const unsupported = filters.parseDashboardFilters(
    new URLSearchParams({
      year: '2039',
      quarter: 'Q9',
      project: 'Invented project',
      implementingPartner: 'Unknown partner',
      province: 'Unknown province',
    }),
    options,
  );
  assert.equal(filters.hasActiveDashboardFilters(unsupported), false);

  const serialized = filters.serializeDashboardFilters(combined);
  assert.deepEqual(
    filters.parseDashboardFilters(serialized, options),
    combined,
  );
  const preserved = filters.serializeDashboardFilters(
    combined,
    new URLSearchParams({ route: 'activity-progress', view: 'table' }),
  );
  assert.equal(preserved.get('route'), 'activity-progress');
  assert.equal(preserved.get('view'), 'table');
  assert.equal(preserved.get('quarter'), combinedSource.quarter);

  const exported = csv.createCsv(
    ['Activity ID', 'Project', 'Province'],
    combinedRows.map((row) => [row.id, row.project, row.province]),
  );
  assert.equal(exported.split('\r\n').length, combinedRows.length + 1);
  assert.ok(combinedRows.every((row) => exported.includes(`"${row.id}"`)));
  assert.equal(
    csv.createCsv(['Activity'], [['=HYPERLINK("https://invalid.example")']]),
    '"Activity"\r\n"\'=HYPERLINK(""https://invalid.example"")"',
  );
  assert.equal(csv.createCsv(['Activity'], []), '"Activity"');

  let capturedFilters;
  const pageApi = load('src/app/api/dashboard/page-data/route.ts', {
    '@/lib/server/auth-guard': {
      requireDashboardApiAccess: async () => ({ allowed: true, status: 401 }),
    },
    '@/lib/server/dashboard-page-data-service': {
      getDashboardPageData: async (route, input) => {
        capturedFilters = input;
        const parsed = filters.parseDashboardFilters(
          input,
          options,
        );
        return {
          route,
          count: filters.filterActivities(data.mainData, parsed).length,
        };
      },
    },
  });
  const apiResponse = await pageApi.GET({
    nextUrl: {
      searchParams: new URLSearchParams({
        route: 'activity-detail',
        project: 'CP9 GEWE',
        province: 'Karnali',
      }),
    },
  });
  assert.equal(apiResponse.status, 200);
  assert.equal(apiResponse.headers.get('cache-control'), 'private, no-store');
  assert.equal(capturedFilters.project, 'CP9 GEWE');
  assert.equal(capturedFilters.province, 'Karnali');
  const apiBody = await apiResponse.json();
  assert.equal(
    apiBody.count,
    data.mainData.filter(
      (row) => row.project === 'CP9 GEWE' && row.province === 'Karnali',
    ).length,
  );

  const suppression = load('src/lib/server/suppression.ts', {
    'server-only': {},
  });
  const gbvRows = load('src/data/mock/gbv-services.ts', {
    'server-only': {},
  });
  const gbvService = load('src/lib/server/gbv-mock-dashboard-service.ts', {
    'server-only': {},
    '@/data/mock/gbv-services': gbvRows,
    './suppression': suppression,
  });
  const karnali = gbvRows.gbvServiceData.filter(
    (row) => row.province === 'Karnali',
  );
  const safeGbv = gbvService.buildSafeGbvDashboardData(karnali);
  const serializedGbv = JSON.stringify(safeGbv);
  assert.equal(serializedGbv.includes('"value":'), false);
  assert.doesNotMatch(serializedGbv, /"chartValue":[1-4](?:[,}])/);
  assert.match(serializedGbv, /<5/);

  const emptyState = fs.readFileSync(
    path.join(root, 'src/components/dashboard/empty-state.tsx'),
    'utf8',
  );
  const filteredScope = fs.readFileSync(
    path.join(root, 'src/components/dashboard/filtered-dashboard-scope.tsx'),
    'utf8',
  );
  const coverageMap = fs.readFileSync(
    path.join(root, 'src/components/GeographicCoverageMap.tsx'),
    'utf8',
  );
  const errorState = fs.readFileSync(
    path.join(root, 'src/app/dashboard/error.tsx'),
    'utf8',
  );
  const notFoundState = fs.readFileSync(
    path.join(root, 'src/app/not-found.tsx'),
    'utf8',
  );
  assert.match(emptyState, /No data available for the selected filters/);
  for (const kind of ['csv', 'kpi', 'chart', 'map', 'table']) {
    assert.match(filteredScope, new RegExp(`data-empty-kind="${kind}"`));
  }
  assert.match(filteredScope, /No chart data for the selected filters/);
  assert.match(filteredScope, /No table rows for the selected filters/);
  assert.match(coverageMap, /No map data for the selected filters/);
  assert.match(errorState, /reset/);
  assert.match(notFoundState, /Page not found/);

  const routeModeMatrix = fs.readFileSync(
    path.join(root, 'docs/agentic_workflow/UNFPA_ROUTE_DATA_MODE_MATRIX.md'),
    'utf8',
  );
  assert.match(routeModeMatrix, /Live GBV remains disabled/);
  for (const route of [
    'executive-overview',
    'activity-progress',
    'participant-reach',
    'indicator-progress',
    'ip-performance',
    'geographic-coverage',
    'gbv-ocmc-summary',
    'data-quality',
    'management-decision-centre',
    'activity-detail',
  ]) {
    assert.match(routeModeMatrix, new RegExp(`/${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }

  console.log('Dashboard readiness tests passed.');
  console.log('Checks: filter, URL, API, CSV, widget empty-state, route-mode, and GBV safety assertions passed.');
}

main().catch((error) => {
  console.error('Dashboard readiness tests failed.');
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
