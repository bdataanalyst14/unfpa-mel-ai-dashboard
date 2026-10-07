const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  Function('require', 'module', 'exports', output)(
    (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (mocks.fallback) return mocks.fallback(id);
      const target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id.startsWith('.') ? path.resolve(root, path.dirname(file), id) : null;
      if (target && fs.existsSync(target + '.ts')) return load(path.relative(root, target + '.ts'), mocks);
      return require(id);
    }, loaded, loaded.exports,
  );
  return loaded.exports;
}

async function main() {
  const mode = load('src/lib/dashboard-mode.ts');
  for (const env of [{ DATA_MODE: 'bigquery' }, { DATA_MODE: 'invalid' }, { DATA_MODE: 'mock', DASHBOARD_DATA_MODE: 'bigquery' }]) {
    assert.equal(mode.resolveDashboardDataMode(env).mode, 'bigquery');
    assert.equal(mode.dashboardAuthenticationRequired({ ...env, DASHBOARD_AUTH_REQUIRED: 'false' }), true);
  }
  const filterModule = load('src/lib/dashboard-filters.ts');
  const original = { year: '2029', project: 'Live only project', ip: 'Live partner', district: 'unsupported' };
  assert.deepEqual(Object.fromEntries(filterModule.preserveDashboardFilterParams(original)), original);
  const calls = [];
  let configured = true;
  let fail = false;
  let empty = false;
  let invalid = false;
  let small = false;
  let oversized = false;
  const dimensions = { reporting_year1: '2029', report_quarter1: 'Q4', project1: 'Live only project', ip_name: 'Live partner', province1: 'Live province', district1: 'Live district', palika1: 'Live palika' };
  const totals = { activity: 'Approved activity', indicators: 5, matched_rows: 2, total_participants: 137, reportable_participants: 111, total_events: 9, female_participants: 70, male_participants: 63, other_participants: 4, participants_with_disability: 8, projects: 6, partners: 7, provinces: 5, districts: 8, palikas: 12, freshness_timestamp: '2026-09-07T00:00:00Z', total_rows: 200, records_with_quality_issue: 20, reporting_partners: 7, total_submissions: 10 };
  const service = load('src/lib/server/dashboard-page-data-service.ts', {
    'server-only': {},
    '@/data/mock/main-data': { mainData: [] },
    '@/lib/dashboard-filters': filterModule,
    './suppression': load('src/lib/server/suppression.ts', { 'server-only': {} }),
    './bigquery-client': {
      getDashboardDataMode: () => 'bigquery',
      getBigQueryConfigStatus: () => ({ configured, dataModeConfigurationValid: configured }),
      getBigQueryProjectId: () => 'fixture', getBigQueryDatasetId: () => 'reporting',
      runSafeBigQuery: async (sql, params = {}) => {
        calls.push({ sql, params });
        assert.doesNotMatch(sql, /participants_flat|staging|\bJOIN\b|\bUNION\b|\bROW_NUMBER\b/i);
        for (const match of sql.matchAll(/`fixture\.reporting\.([^`]+)`/g)) {
          assert.ok(['combined_activity_summary', 'ip_submission_status', 'data_quality_summary', 'indicator_progress_summary'].includes(match[1]));
        }
        if (fail && !sql.includes('SELECT DISTINCT')) throw new Error('private failure');
        if (sql.includes('SELECT DISTINCT')) return [dimensions];
        if (sql.includes('AS reviewed_rows')) return [{ reviewed_rows: 100, missingGeography: 0, missingProject: 0, missingPartner: 0, latestActivityDate: '2026-08-23' }];
        if (sql.includes('data_quality_summary')) return [{total_rows:100, issues:10, ts:'2026-08-13'}];
        if (/ AS participants\b/.test(sql) && !sql.includes(' AS events') && !sql.startsWith('WITH grouped')) return [{label:'beneficiary',participants:100}];
        if (sql.includes('participant_type_name AS value')) return [{ value: 'beneficiary', records: 100 }];
        if (sql.includes(' AS totalParticipants')) {
          const labels = require('./activity-test-loader.cjs').loader()('src/lib/server/participant-analysis.ts').profileLabels;
          return [{ totalParticipants: 100, reportableParticipants: 100, ...Object.fromEntries(Object.keys(labels).map(key => [key, 10])) }];
        }
        if (sql.startsWith('WITH grouped')) return [{ row_count: oversized ? 10001 : 1, events: 17, participants: 137, reportable: 111, partners: 7 }];
        if (sql.includes('ARRAY_AGG')) return [{}];
        if (sql.includes(' AS `events`')) return [{ activity: 'Approved activity', events: small ? 3 : 17, participants: small ? 4 : 137, reportable: small ? 2 : 111 }];
        if (sql.includes(' AS events')) return Array.from({length: oversized ? 10001 : 1}, () => ({ label: 'Approved activity', activity: 'Approved activity', events: small ? 3 : 17, participants: small ? 4 : 137, reportable: small ? 2 : 111, districts: 5, projects: 6 }));
        return [{ ...totals, matched_rows: empty ? 0 : 2, total_participants: invalid ? null : 137 }];
      },
    },
  });
  const options = await service.getLiveDashboardFilterOptions();
  assert.deepEqual(options.year, ['2029']);
  assert.deepEqual(options.district, ['Live district']);
  assert.deepEqual(options.municipality, ['Live palika']);
  const selected = { year: '2029', quarter: 'Q4', project: 'Live only project', implementingPartner: 'Live partner', province: 'Live province', district: 'Live district', municipality: 'Live palika' };
  const columns = { year: 'reporting_year1', quarter: 'report_quarter1', project: 'project1', implementingPartner: 'ip_name', province: 'province1', district: 'district1', municipality: 'palika1' };
  for (const filters of [...Object.entries(selected).map(([key, value]) => ({ [key]: value })), selected, { ip: 'Live partner' }]) {
    const result = await service.getDashboardPageData('executive-overview', filters);
    assert.equal(result.metadata.componentState, 'live_bigquery');
    const expected = filters.ip ? { implementingPartner: filters.ip } : filters;
    assert.deepEqual(calls.at(-1).params, expected);
    for (const key of Object.keys(expected)) assert.ok(calls.at(-1).sql.includes(`${columns[key]} = @${key}`));
    const metrics = Object.fromEntries(result.metrics.map((m) => [m.label, m.value]));
    assert.equal(metrics['Total participants'], '137');
    assert.equal(metrics['Reportable participants'], '111');
    assert.equal(metrics['Other participants'], '<5');
    assert.match(calls.findLast(call => call.sql.includes(' AS events')).sql, /SUM\(total_participants\)/);
    assert.match(calls.findLast(call => call.sql.includes(' AS events')).sql, /SUM\(total_reportable_participants\)/);
  }
  for (const route of ['activity-progress', 'activity-detail', 'indicator-progress', 'participant-reach', 'geographic-coverage', 'ip-performance']) {
    assert.equal((await service.getDashboardPageData(route)).metadata.componentState, 'live_bigquery');
    fail = true;
    const failed = await service.getDashboardPageData(route);
    assert.equal(failed.metadata.responseStatus, 503);
    assert.deepEqual(failed.metrics, []);
    fail = false;
  }
  small = true;
  const detail = await service.getDashboardPageData('activity-detail', selected);
  assert.equal(detail.activityRows[0].events, '3');
  assert.equal(detail.activityRows[0].participants, '<5');
  assert.equal(detail.activityRows[0].reportable, '<5');
  assert.deepEqual(calls.at(-2).params, selected);
  assert.doesNotMatch(calls.at(-2).sql, /name_list|survivor|actdetails1|event_row_key|SELECT \*/i);
  const grouped = await service.getDashboardPageData('activity-progress', selected);
  assert.equal(grouped.sections.length, 8);
  assert.ok(grouped.sections.every(section => section.rows[0].events === '3' && section.rows[0].participants === '<5'));
  small = false;
  oversized = true;
  const blockedExport = await service.getDashboardPageData('activity-detail');
  assert.equal(blockedExport.metadata.responseStatus, 200);
  assert.equal(blockedExport.activityPage.totalRows, 10001);
  assert.equal(blockedExport.activityPage.request.pageSize, 25);
  assert.ok(blockedExport.activityRows.length <= 25);
  oversized = false;
  const management = await service.getDashboardPageData('management-decision-centre', selected);
  assert.equal(management.metadata.componentState, 'live_bigquery');
  assert.equal(management.sections.length, 5);
  const csv = load('src/lib/csv-export.ts').createCsv(['Activity'], [['=SUM(A1)'], [' \t@SUM(A1)'], ['A,"B"']]);
  assert.ok(csv.includes("'=SUM"));
  assert.ok(csv.includes("' \t@SUM"));
  assert.ok(csv.includes('A,""B""'));
  for (const filters of [{ project: 'Unknown' }, { district: 'Any' }, { municipality: 'Any' }, { year: ['2029', '2028'] }]) {
    const count = calls.length;
    assert.equal((await service.getDashboardPageData('executive-overview', filters)).metadata.responseStatus, 422);
    assert.equal(calls.length, count + 1);
  }
  for (const route of ['data-quality', 'ip-performance']) {
    assert.equal((await service.getDashboardPageData(route, selected)).metadata.responseStatus, 422);
  }
  for (const route of ['gbv-ocmc']) {
    const count = calls.length;
    assert.equal((await service.getDashboardPageData(route)).metadata.responseStatus, 409);
    assert.equal(calls.length, count);
  }
  const qualityCalls = calls.length;
  const quality = await service.getDashboardPageData('data-quality');
  assert.equal(quality.metadata.responseStatus, 200);
  assert.ok(quality.metrics.length > 0);
  assert.equal((await service.getDashboardPageData('indicator-progress', { implementingPartner: 'Live partner' })).metadata.responseStatus, 422);
  assert.equal((await service.getDashboardPageData('ip-performance', { implementingPartner: 'Live partner' })).metadata.responseStatus, 200);
  empty = true;
  assert.equal((await service.getDashboardPageData('executive-overview', selected)).metadata.componentState, 'no_data');
  empty = false;
  invalid = true;
  assert.equal((await service.getDashboardPageData('executive-overview')).metadata.responseStatus, 503);
  invalid = false;
  configured = false;
  const count = calls.length;
  assert.equal((await service.getDashboardPageData('executive-overview')).metadata.responseStatus, 503);
  assert.equal(calls.length, count);

  for (const route of ['executive-overview', 'activity-progress', 'activity-detail', 'participant-reach', 'geographic-coverage', 'data-quality', 'ip-performance', 'indicator-progress', 'management-decision-centre', 'gbv-ocmc-summary']) {
    const source = fs.readFileSync(path.join(root, `src/app/dashboard/${route}/page.tsx`), 'utf8');
    assert.doesNotMatch(source, /^'use client'/);
    if (route !== 'activity-detail') assert.match(source, /getDashboardDataMode/);
    assert.match(source, /BigQueryRouteView/);

  }
  for (const state of ['live_bigquery', 'no_data', 'unavailable', 'disabled_pending_validation']) {
    const sequence = [];
    const data = { metadata: { componentState: state, filtersApplied: selected } };
    const marker = () => null;
    const view = load('src/components/dashboard/bigquery-route-view.tsx', {
      '@/lib/server/auth-guard': { requireDashboardPageAccess: async route => sequence.push(['auth', route]) },
      '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async (route, filters) => { sequence.push(['data', route, filters]); return data; } },
      '@/lib/server/participant-metrics': { getParticipantMetrics: async filters => { sequence.push(['participants', filters]); return { metadata: { dataSource: 'bigquery' } }; } },
      './production-dashboard-view': { default: marker, __esModule: true },
    });
    const rendered = await view.default({ route: 'participant-reach', searchParams: selected });
    assert.equal(rendered.type, marker);
    assert.deepEqual(sequence[0], ['auth', '/dashboard/participant-reach']);
    assert.deepEqual(sequence[1], ['data', 'participant-reach', selected]);
    assert.equal(sequence.length, 2);
    sequence.length = 0;
    await view.default({ route: 'management-decision-centre', searchParams: selected });
    assert.deepEqual(sequence, [['auth', '/dashboard/management-decision-centre'], ['data', 'management-decision-centre', selected]]);
  }
  const deniedView = load('src/components/dashboard/bigquery-route-view.tsx', {
    '@/lib/server/auth-guard': { requireDashboardPageAccess: async () => { throw new Error('Access denied'); } },
    '@/lib/server/dashboard-page-data-service': { getDashboardPageData: () => assert.fail('Read before authorization') },
    '@/lib/server/participant-metrics': { getParticipantMetrics: () => assert.fail('Participant read before authorization') },
    './production-dashboard-view': { default: () => null, __esModule: true },
  });
  await assert.rejects(deniedView.default({ route: 'participant-reach' }), /Access denied/);
  let reads = 0;
  for (const route of ['page-data', 'executive-overview']) {
    for (const status of [401, 403, 409, 422, 503, 200]) {
      const allowed = status !== 401 && status !== 403;
      const api = load(`src/app/api/dashboard/${route}/route.ts`, {
        'next/server': { NextResponse: { json: (body, init) => ({ body, ...init }) } },
        '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed, status }) },
        '@/lib/server/bigquery-client': { getDashboardDataMode: () => 'bigquery' },
        '@/lib/server/bigquery-dashboard-service': { getExecutiveOverviewData: () => assert.fail('legacy data requested') },
        '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async () => { reads++; return { metadata: { responseStatus: status } }; } },
      });
      const before = reads;
      const result = await api.GET({ nextUrl: { searchParams: new URLSearchParams() } });
      assert.equal(result.status, status);
      assert.equal(reads - before, allowed ? 1 : 0);
    }
  }
  for (const status of [401, 403]) {
    for (const params of ['', 'options=1']) {
      const api = load('src/app/api/dashboard/participants/route.ts', {
        'next/server': { NextResponse: { json: (body, init) => ({ body, ...init }) } },
        '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: false, status }) },
        '@/lib/participant-contract': { filtersFromParams: () => assert.fail('Unauthorized filter access') },
        '@/lib/server/participant-metrics': {
          getParticipantMetrics: () => assert.fail('Unauthorized participant query'),
          getParticipantFilterOptions: () => assert.fail('Unauthorized option query'),
        },
      });
      const result = await api.GET({ nextUrl: { searchParams: new URLSearchParams(params) } });
      assert.equal(result.status, status);
      assert.equal(result.headers['Cache-Control'], 'private, no-store');
    }
  }
  const participantContract = load('src/lib/participant-contract.ts');
  let participantInput;
  const participantApi = load('src/app/api/dashboard/participants/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, ...init }) } },
    '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: true, status: 401 }) },
    '@/lib/participant-contract': participantContract,
    '@/lib/server/participant-metrics': {
      getParticipantMetrics: async input => { participantInput = input; return { metadata: { dataSource: 'bigquery' } }; },
      getParticipantFilterOptions: async () => ({}),
    },
  });
  const filteredParticipants = await participantApi.GET({ nextUrl: { searchParams: new URLSearchParams({ municipality: 'Live palika' }) } });
  assert.equal(filteredParticipants.status, 200);
  assert.deepEqual(participantInput, { municipality: 'Live palika' });
  assert.equal(participantContract.participantFilterColumns.municipality, 'palika1');
  for (const input of ['year=2025&year=2026', 'municipality=A&municipality=B', 'ip=A&implementingPartner=B']) {
    participantInput = null;
    const result = await participantApi.GET({ nextUrl: { searchParams: new URLSearchParams(input) } });
    assert.equal(result.status, 422);
    assert.equal(participantInput, null);
  }
  console.log('Production V1 regression checks passed: participant sums, seven live filters, route guards, disabled contracts, no-data/failure states, API statuses and unauthorized reads. Offline fixtures only.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
