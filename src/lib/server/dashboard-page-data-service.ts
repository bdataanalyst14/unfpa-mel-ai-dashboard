import 'server-only';
import type { AggregateSection, AggregateRow, ActivityPage } from '@/lib/aggregate-contract';
import { queryActivityDetail } from './activity-detail-service';
import { parseActivityRequest } from './activity-detail-query';
import { parseAnalyticalFilters, type AnalyticalControls, type AnalyticalFilters } from '@/lib/analytical-filters';
import { combinedScope, implementationOptions } from './analytical-scope';
import { participantAnalysis, participantAnalysisOptions, participantBreakdowns } from './participant-analysis';
import { getParticipantMetrics } from './participant-metrics';
import type { ParticipantData } from '@/lib/participant-contract';

import {
  getBigQueryConfigStatus,
  getBigQueryDatasetId,
  getBigQueryProjectId,
  getDashboardDataMode,
  runSafeBigQuery,
} from './bigquery-client';
import { suppressCount } from './suppression';
import { mainData } from '@/data/mock/main-data';
import {
  buildDashboardFilterOptions,
  filterActivities,
  summarizeActivities,
  type DashboardFilterKey,
  type DashboardFilterState,
} from '@/lib/dashboard-filters';
import type { DashboardPageMetric, ExecutiveOverviewFilters } from '@/lib/types';
export type { DashboardPageMetric } from '@/lib/types';

export type DashboardRouteKey =
  | 'executive-overview'
  | 'activity-progress'
  | 'activity-detail'
  | 'participant-reach'
  | 'geographic-coverage'
  | 'data-quality'
  | 'ip-performance'
  | 'indicator-progress'
  | 'management-decision-centre'
  | 'gbv-ocmc';

export type DashboardComponentState =
  | 'live_bigquery'
  | 'mock_demo'
  | 'no_data'
  | 'disabled_pending_validation'
  | 'unavailable';

export type DashboardPageMetadata = {
  dataSource: 'bigquery' | 'mock';
  freshnessTimestamp: string | null;
  latestActivityDate?: string | null;
  suppressionApplied: boolean;
  componentState: DashboardComponentState;
  validationStatus: string;
  message: string;
  responseStatus: 200 | 409 | 422 | 503;
  filtersApplied: DashboardFilterState;
};

export type DashboardPageData = {
  route: DashboardRouteKey;
  pageName: string;
  metrics: DashboardPageMetric[];
  metadata: DashboardPageMetadata;
  sections?: AggregateSection[];
  activityRows?: AggregateRow[];
  activityPage?: ActivityPage;
  analyticalControls?: AnalyticalControls;
  participants?: ParticipantData;
  reliability?: { rows: number; missingGeography: number; missingProject: number; missingPartner: number };
};

import type { DashboardFilterOptions } from '@/lib/dashboard-filters';
export type { DashboardFilterOptions } from '@/lib/dashboard-filters';

type CountRow = Record<string, number | string | { value?: string } | null>;
type QueryFilters = Record<string, string | string[] | undefined>;

const pageNames: Record<DashboardRouteKey, string> = {
  'executive-overview': 'Executive Overview',
  'activity-progress': 'Activity Progress',
  'activity-detail': 'Activity Detail',
  'participant-reach': 'Participant & Reach',
  'geographic-coverage': 'Geographic Coverage',
  'data-quality': 'Data Quality & Evidence',
  'ip-performance': 'IP / Partner Performance',
  'indicator-progress': 'Indicator Progress',
  'management-decision-centre': 'Management Decision Centre',
  'gbv-ocmc': 'GBV / OCMC Service Summary',
};

const emptyFilters: DashboardFilterState = {
  year: '',
  quarter: '',
  project: '',
  implementingPartner: '',
  province: '',
  district: '',
  municipality: '',
};

const mockFilterOptions = buildDashboardFilterOptions(mainData);

function asNumber(value: CountRow[string]): number {
  if (value === null || value === undefined || value === '') throw new Error('Missing aggregate count.');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error('Invalid aggregate count.');
  return parsed;
}

function asTimestamp(value: CountRow[string]): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'value' in value) return value.value ?? null;
  return null;
}

function isOperational(key: string): boolean {
  return /activities|districts|partners|projects|provinces|palikas|submissions|rows|gaps|events/i.test(key);
}

function countMetric(label: string, value: number, note?: string): DashboardPageMetric {
  return { label, value: suppressCount(value, isOperational(label)).displayValue, note };
}

function response(
  route: DashboardRouteKey,
  metrics: DashboardPageMetric[],
  metadata: DashboardPageMetadata,
): DashboardPageData {
  return { route, pageName: pageNames[route], metrics, metadata };
}

function emptyFilterState(): DashboardFilterState {
  return { ...emptyFilters };
}

function disabledData(
  route: DashboardRouteKey,
  message: string,
  responseStatus: 409 | 422 = 409,
): DashboardPageData {
  return response(route, [], {
    dataSource: 'bigquery',
    freshnessTimestamp: null,
    suppressionApplied: true,
    componentState: 'disabled_pending_validation',
    validationStatus: responseStatus === 422 ? 'unsupported_filter' : 'disabled_pending_validation',
    message,
    responseStatus,
    filtersApplied: emptyFilterState(),
  });
}

function unavailableData(route: DashboardRouteKey, message: string): DashboardPageData {
  return response(route, [], {
    dataSource: 'bigquery',
    freshnessTimestamp: null,
    suppressionApplied: true,
    componentState: 'unavailable',
    validationStatus: 'bigquery_unavailable',
    message,
    responseStatus: 503,
    filtersApplied: emptyFilterState(),
  });
}

function noData(
  route: DashboardRouteKey,
  filtersApplied: DashboardFilterState,
  freshnessTimestamp: string | null,
): DashboardPageData {
  return response(route, [], {
    dataSource: 'bigquery',
    freshnessTimestamp,
    suppressionApplied: true,
    componentState: 'no_data',
    validationStatus: 'no_matching_aggregate_data',
    message: 'No approved aggregate data matches the selected filters. No demo or mock data is shown.',
    responseStatus: 200,
    filtersApplied,
  });
}

function liveData(
  route: DashboardRouteKey,
  metrics: DashboardPageMetric[],
  filtersApplied: DashboardFilterState,
  freshnessTimestamp: string | null,
  message: string,
): DashboardPageData {
  return response(route, metrics, {
    dataSource: 'bigquery',
    freshnessTimestamp,
    suppressionApplied: true,
    componentState: 'live_bigquery',
    validationStatus: 'approved_aggregate_contract',
    message,
    responseStatus: 200,
    filtersApplied,
  });
}

function mockData(route: DashboardRouteKey, filters: QueryFilters): DashboardPageData {
  const validated = validateFilters(filters, mockFilterOptions).filters;
  const rows = filterActivities(mainData, validated);
  const summary = summarizeActivities(rows);
  const common = [
    countMetric('Filtered activities', summary.totalActivities),
    countMetric('Filtered participants', summary.totalParticipants),
    countMetric('Districts', summary.districts),
    countMetric('Implementing partners', summary.partners),
  ];
  const routeMetrics: Partial<Record<DashboardRouteKey, DashboardPageMetric[]>> = {
    'executive-overview': [
      countMetric('Reported activities', summary.totalActivities),
      countMetric('Reportable participants', summary.totalParticipants),
      countMetric('Female participants', summary.femaleParticipants),
      countMetric('Male participants', summary.maleParticipants),
    ],
    'participant-reach': [
      countMetric('Filtered participants', summary.totalParticipants),
      countMetric('Female participants', summary.femaleParticipants),
      countMetric('Male participants', summary.maleParticipants),
      countMetric('Other participants', summary.otherParticipants),
    ],
    'data-quality': [
      countMetric('Filtered rows checked', summary.totalActivities),
      countMetric('Missing evidence', summary.missingEvidence),
      countMetric('Pending validation', summary.pendingValidation),
    ],
    'ip-performance': [
      countMetric('Implementing partners', summary.partners),
      countMetric('Filtered activities', summary.totalActivities),
      countMetric('Filtered participants', summary.totalParticipants),
    ],
    'geographic-coverage': [
      countMetric('Provinces', new Set(rows.map((row) => row.province)).size),
      countMetric('Districts', summary.districts),
      countMetric('Filtered activities', summary.totalActivities),
    ],
  };

  return response(route, routeMetrics[route] ?? common, {
    dataSource: 'mock',
    freshnessTimestamp: null,
    suppressionApplied: route === 'gbv-ocmc',
    componentState: route === 'gbv-ocmc' ? 'disabled_pending_validation' : 'mock_demo',
    validationStatus: route === 'gbv-ocmc' ? 'live_gbv_disabled' : 'demo_mock_data',
    message:
      route === 'gbv-ocmc'
        ? 'Demo / mock data is privacy-sanitized. Live GBV / OCMC activation is disabled pending explicit approval.'
        : 'Demo / mock data is shown for development and demonstration only. No live programme data is enabled.',
    responseStatus: route === 'gbv-ocmc' ? 409 : 200,
    filtersApplied: validated,
  });
}

function rawFilterValue(input: QueryFilters, key: DashboardFilterKey): string {
  const raw = input[key] ?? (key === 'implementingPartner' ? input.ip : undefined);
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ?? '';
}

function validateFilters(
  input: QueryFilters,
  options: DashboardFilterOptions,
): { filters: DashboardFilterState; unsupportedKeys: DashboardFilterKey[] } {
  const filters = emptyFilterState();
  const unsupportedKeys: DashboardFilterKey[] = [];
  const keys: DashboardFilterKey[] = [
    'year',
    'quarter',
    'project',
    'implementingPartner',
    'province',
    'district',
    'municipality',
  ];
  for (const key of keys) {
    const value = rawFilterValue(input, key);
    const raw = input[key] ?? (key === 'implementingPartner' ? input.ip : undefined);
    if (Array.isArray(raw) && raw.length > 1) {
      unsupportedKeys.push(key);
      continue;
    }
    if (!value) continue;
    if (!options[key].includes(value)) {
      unsupportedKeys.push(key);
      continue;
    }
    filters[key] = value;
  }
  return { filters, unsupportedKeys };
}

function hasUnsupportedRouteFilter(
  route: DashboardRouteKey,
  filters: DashboardFilterState,
): boolean {
  if (route === 'indicator-progress') return Boolean(filters.implementingPartner);
  if (route === 'data-quality') return Object.values(filters).some(Boolean);
  if (route === 'ip-performance') {
    return Boolean(filters.year || filters.quarter || filters.project || filters.province || filters.district || filters.municipality);
  }
  return false;
}

function buildCombinedWhere(filters: DashboardFilterState): {
  where: string;
  params: Record<string, string>;
} {
  const fields: Array<[DashboardFilterKey, string]> = [
    ['year', 'reporting_year1'],
    ['quarter', 'report_quarter1'],
    ['project', 'project1'],
    ['implementingPartner', 'ip_name'],
    ['province', 'province1'],
    ['district', 'district1'],
    ['municipality', 'palika1'],
  ];
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  for (const [key, column] of fields) {
    if (!filters[key]) continue;
    clauses.push(`${column} = @${key}`);
    params[key] = filters[key];
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

function projectAndDataset(): {
  combined: string;
  quality: string;
  ipStatus: string;
  indicators: string;
} {
  const projectId = getBigQueryProjectId();
  const datasetId = getBigQueryDatasetId();
  return {
    combined: `\`${projectId}.${datasetId}.combined_activity_summary\``,
    quality: `\`${projectId}.${datasetId}.data_quality_summary\``,
    ipStatus: `\`${projectId}.${datasetId}.ip_submission_status\``,
    indicators: `\`${projectId}.${datasetId}.indicator_progress_summary\``,
  };
}

export async function getLiveDashboardFilterOptions(): Promise<DashboardFilterOptions> {
  const config = getBigQueryConfigStatus();
  if (!config.dataModeConfigurationValid || !config.configured) {
    throw new Error('BigQuery filter options are unavailable.');
  }
  const { combined } = projectAndDataset();
  const rows = await runSafeBigQuery<{
    reporting_year1: string | null;
    report_quarter1: string | null;
    project1: string | null;
    ip_name: string | null;
    province1: string | null;
    district1: string | null;
    palika1: string | null;
  }>(`
    SELECT DISTINCT
      reporting_year1,
      report_quarter1,
      project1,
      ip_name,
      province1,
      district1,
      palika1
    FROM ${combined}
    ORDER BY reporting_year1, report_quarter1, project1, ip_name, province1, district1, palika1
    LIMIT 10001
  `);
  if (rows.length > 10000) throw new Error('Filter options exceed response bound');
  const values = (selector: (row: (typeof rows)[number]) => string | null): string[] =>
    Array.from(new Set(rows.map(selector).filter((value): value is string => Boolean(value?.trim())))).sort(
      (left, right) => left.localeCompare(right, undefined, { numeric: true }),
    );
  return {
    year: values((row) => row.reporting_year1),
    quarter: values((row) => row.report_quarter1),
    project: values((row) => row.project1),
    implementingPartner: values((row) => row.ip_name),
    province: values((row) => row.province1),
    district: values((row) => row.district1),
    municipality: values((row) => row.palika1),
    geography: rows.map(row => ({ province: row.province1 ?? '', district: row.district1 ?? '', municipality: row.palika1 ?? '' })),
  };
}

async function queryCombinedRoute(
  route: Extract<
    DashboardRouteKey,
    'executive-overview' | 'activity-progress' | 'activity-detail' | 'participant-reach' | 'geographic-coverage' | 'management-decision-centre'
  >,
  filters: DashboardFilterState,
  analytical?: AnalyticalFilters,
): Promise<DashboardPageData> {
  const { combined, ipStatus } = projectAndDataset();
  const { where, params } = combinedScope(filters, analytical);

  const [row] = await runSafeBigQuery<CountRow>(`
    SELECT
      COUNT(1) AS matched_rows,
      COALESCE(SUM(event_count), 0) AS total_events,
      COALESCE(SUM(total_participants), 0) AS total_participants,
      COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants,
      COALESCE(SUM(female), 0) AS female_participants,
      COALESCE(SUM(male), 0) AS male_participants,
      COALESCE(SUM(other), 0) AS other_participants,
      COALESCE(SUM(withdisability), 0) AS participants_with_disability,
      COUNT(DISTINCT NULLIF(project1, '')) AS projects,
      COUNT(DISTINCT NULLIF(ip_name, '')) AS partners,
      COUNT(DISTINCT NULLIF(province1, '')) AS provinces,
      COUNT(DISTINCT NULLIF(district1, '')) AS districts,
      COUNT(DISTINCT IF(NULLIF(palika1, '') IS NOT NULL, TO_JSON_STRING(STRUCT(province1, district1, palika1)), NULL)) AS palikas,
      (SELECT MAX(latest_sync_time) FROM ${ipStatus}) AS freshness_timestamp
    FROM ${combined}
    ${where}
  `, params);
  const freshness = row ? asTimestamp(row.freshness_timestamp) : null;
  if (!row || asNumber(row.matched_rows) === 0) return noData(route, filters, freshness);

  const common = [
    countMetric('Reported activities', asNumber(row.total_events)),
    countMetric('Total participants', asNumber(row.total_participants), 'SUM(combined_activity_summary.total_participants); not unique people.'),
    countMetric('Reportable participants', asNumber(row.reportable_participants)),
    countMetric('Projects', asNumber(row.projects)),
    countMetric('Implementing partners', asNumber(row.partners)),
    countMetric('Districts covered', asNumber(row.districts)),
  ];
  if (route === 'executive-overview') {
    return liveData(route, [
      countMetric('Reported activities', asNumber(row.total_events)),
      countMetric('Total participants', asNumber(row.total_participants), 'SUM(combined_activity_summary.total_participants); not unique people.'),
      countMetric('Reportable participants', asNumber(row.reportable_participants)),
      countMetric('Districts covered', asNumber(row.districts)),
      countMetric('Implementing partners', asNumber(row.partners)),
      countMetric('Female participants', asNumber(row.female_participants)),
      countMetric('Male participants', asNumber(row.male_participants)),
      countMetric('Other participants', asNumber(row.other_participants)),
    ], filters, freshness, 'Live aggregate operational metrics from approved BigQuery views. Trend, target, AI, and prototype narrative components are disabled.');
  }
  if (route === 'participant-reach') {
    return liveData(route, [
      countMetric('Total participants', asNumber(row.total_participants), 'SUM(combined_activity_summary.total_participants); not unique people.'),
      countMetric('Reportable participants', asNumber(row.reportable_participants)),
      countMetric('Female participants', asNumber(row.female_participants)),
      countMetric('Male participants', asNumber(row.male_participants)),
      countMetric('Other participants', asNumber(row.other_participants)),
      countMetric('Participants with disability', asNumber(row.participants_with_disability)),
    ], filters, freshness, 'Participant Profile by Sex is derived directly from approved aggregate counts with small-cell suppression. Individual Participant Records, Individual Reportable Participants, and Summary-mode Participants are disabled pending verified upstream aggregate formulas. Unsupported disaggregations are disabled.');
  }
  if (route === 'geographic-coverage') {
    return liveData(route, [
      countMetric('Provinces covered', asNumber(row.provinces)),
      countMetric('Districts covered', asNumber(row.districts)),
      countMetric('Palikas covered', asNumber(row.palikas)),
      countMetric('Total participants', asNumber(row.total_participants)),
      countMetric('Reported activities', asNumber(row.total_events)),
    ], filters, freshness, 'Live aggregate coverage counts are shown. The prototype map and coverage gap claims are disabled pending geographic validation.');
  }
  return liveData(route, common, filters, freshness, 'Live aggregate activity volume is shown. Planned-versus-completed progress, trends, evidence, and delayed-report components are disabled pending approved contracts.');
}

async function addAnalysis(data: DashboardPageData, filters: DashboardFilterState, analytical?: AnalyticalFilters): Promise<DashboardPageData> {
  if (data.metadata.componentState !== 'live_bigquery' || data.route === 'participant-reach') return data;
  const { combined } = projectAndDataset();
  const { where, params } = combinedScope(filters, analytical);
  const counts = 'COALESCE(SUM(event_count), 0) AS events, COALESCE(SUM(total_participants), 0) AS participants, COALESCE(SUM(total_reportable_participants), 0) AS reportable';
  const metricKeys = [
    'events', 'participants', 'reportable', 'male', 'female', 'other_sex',
    'below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above',
    'hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast',
    'pwd_total', 'withdisability', 'nodisability',
    'repeat_reportable_total', 'repeat_nonreportable_total', 'repeat_guest_total', 'repeat_beneficiary_total',
    'districts', 'projects', 'provinces', 'palikas', 'partners'
  ];

  const safeRow = (row: CountRow): AggregateRow => Object.fromEntries(Object.entries(row).map(([key, value]) => [key,
    metricKeys.includes(key) ? suppressCount(asNumber(value), isOperational(key)).displayValue : typeof value === 'string' && value.trim() ? value : 'Unspecified',
  ]));

  {
    const dimensions = data.route === 'geographic-coverage'
      ? [['province', 'province1', 'Implementation by province'], ['district', 'district1', 'Implementation by district'], ['project', 'project1', 'Project footprint'], ['partner', 'ip_name', 'Partner footprint']]
      : data.route === 'ip-performance'
        ? [['partner', 'ip_name', 'Partner implementation volume']]
        : [['partner', 'ip_name', 'Implementation by partner'], ['project', 'project1', 'Implementation by project'], ['activity', 'activity1', 'Activity composition'], ['district', 'district1', 'Implementation by event location district'], ['eventtype', 'eventtype1', 'Activity / Event Type'], ...(data.route === 'activity-progress' ? [['outcome', 'outcome1', 'Implementation by outcome'], ['output', 'output1', 'Implementation by output']] : [])];
    data.sections = await Promise.all(dimensions.map(async ([key, column, title]) => {
      const rows = await runSafeBigQuery<CountRow>(`SELECT COALESCE(NULLIF(${column}, ''), 'Unspecified') AS label, ${counts} , COUNT(DISTINCT NULLIF(district1, '')) AS districts, COUNT(DISTINCT NULLIF(project1, '')) AS projects, COUNT(DISTINCT NULLIF(province1, '')) AS provinces, COUNT(DISTINCT NULLIF(ip_name, '')) AS partners, COUNT(DISTINCT IF(NULLIF(palika1, '') IS NOT NULL, TO_JSON_STRING(STRUCT(province1, district1, palika1)), NULL)) AS palikas
        FROM ${combined} ${where} GROUP BY ${column} ORDER BY events DESC, label LIMIT 10001`, params);
      if (rows.length > 10000) throw new Error('Aggregate grouping exceeds response bound');
      return { key, title, rows: rows.map(safeRow) };
    }));
  }
  const [reliability] = await runSafeBigQuery<CountRow>(`SELECT COUNT(*) AS reviewed_rows,
    COUNTIF(NULLIF(TRIM(province1), '') IS NULL OR NULLIF(TRIM(district1), '') IS NULL) AS missingGeography,
    COUNTIF(NULLIF(TRIM(project1), '') IS NULL) AS missingProject,
    COUNTIF(NULLIF(TRIM(ip_name), '') IS NULL) AS missingPartner,
    CAST(MAX(end_date1) AS STRING) AS latestActivityDate FROM ${combined} ${where}`, params);
  if (reliability) {
    data.metadata.latestActivityDate = asTimestamp(reliability.latestActivityDate);
    if (data.route === 'management-decision-centre') data.reliability = {
      rows: asNumber(reliability.reviewed_rows), missingGeography: asNumber(reliability.missingGeography),
      missingProject: asNumber(reliability.missingProject), missingPartner: asNumber(reliability.missingPartner),
    };
  }
  if (data.route === 'activity-progress') {
    const rows = await runSafeBigQuery<CountRow>(`SELECT project1 AS project, outcome1 AS outcome, output1 AS output, activity1 AS activity, subact1 AS subact, ${counts}
      FROM ${combined} ${where} GROUP BY project1, outcome1, output1, activity1, subact1 ORDER BY project1, outcome1, output1, activity1, subact1 LIMIT 10001`, params);
    if (rows.length > 10000) throw new Error('Hierarchy exceeds response bound');
    data.sections.push({ key: 'hierarchy', title: 'Programme hierarchy', rows: rows.map(safeRow) });
  }
  data.metadata.message = 'Approved published aggregate views; active filters apply to all displayed analysis. Participants are attendance records, not unique people. Sensitive participant counts 1 to 4 are withheld. Source freshness is the latest published partner sync, not a guarantee of reporting completeness.';
  return data;
}

async function queryIndicators(filters: DashboardFilterState): Promise<DashboardPageData> {
  const { indicators } = projectAndDataset();
  const { where, params } = buildCombinedWhere(filters);
  const [row] = await runSafeBigQuery<CountRow>(`
    SELECT COUNT(1) AS matched_rows,
      COUNT(DISTINCT NULLIF(indicator1, '')) AS indicators,
      COALESCE(SUM(total_events), 0) AS total_events,
      COALESCE(SUM(total_participants), 0) AS total_participants,
      COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants
    FROM ${indicators} ${where}
  `, params);
  if (!row || asNumber(row.matched_rows) === 0) return noData('indicator-progress', filters, null);
  return liveData('indicator-progress', [
    countMetric('Indicators reported', asNumber(row.indicators)),
    countMetric('Reported activities', asNumber(row.total_events)),
    countMetric('Total participants', asNumber(row.total_participants)),
    countMetric('Reportable participants', asNumber(row.reportable_participants)),
  ], filters, null, 'Published indicator aggregates. Participant counts are attendance records, not unique people. Targets, achievement percentages and performance status are unsupported by the frozen reporting contract.');
}

async function queryDataQuality(filters: DashboardFilterState): Promise<DashboardPageData> {
  const { combined, quality: dataQuality } = projectAndDataset();
  const { where, params } = buildCombinedWhere(filters);
  const [row] = await runSafeBigQuery<CountRow>(`
    SELECT
      COUNT(1) AS matched_rows,
      COUNT(CASE WHEN NULLIF(TRIM(province1), '') IS NULL OR NULLIF(TRIM(district1), '') IS NULL THEN 1 END) AS missing_geo,
      COUNT(CASE WHEN NULLIF(TRIM(project1), '') IS NULL THEN 1 END) AS missing_project,
      COUNT(CASE WHEN NULLIF(TRIM(ip_name), '') IS NULL THEN 1 END) AS missing_partner
    FROM ${combined}
    ${where}
  `, params);
  
  // We only take the latest timestamp from data_quality_summary to avoid summing historical snaps
  const [dqRow] = await runSafeBigQuery<{ total_rows: string, issues: string, ts: string }>(`
    SELECT
      SUM(total_rows) AS total_rows,
      SUM(records_with_quality_issue) AS issues,
      MAX(run_timestamp) AS ts
    FROM ${dataQuality}
    WHERE run_timestamp = (SELECT MAX(run_timestamp) FROM ${dataQuality})
  `);

  const dqFreshness = dqRow && dqRow.ts ? asTimestamp(dqRow.ts) : null;
  if (!row || asNumber(row.matched_rows) === 0) return noData('data-quality', filters, dqFreshness);
  
  const matched = asNumber(row.matched_rows ?? 0);
  const missingGeo = asNumber(row.missing_geo ?? 0);
  const missingProject = asNumber(row.missing_project ?? 0);
  const missingPartner = asNumber(row.missing_partner ?? 0);
  
  return liveData('data-quality', [
    countMetric('Aggregate rows reviewed', matched),
    countMetric('Geographic gaps', missingGeo, 'Aggregate rows missing province or district'),
    countMetric('Project gaps', missingProject, 'Aggregate rows missing project association'),
    countMetric('Partner gaps', missingPartner, 'Aggregate rows missing implementing partner'),
    countMetric('Validated rows', asNumber(dqRow.total_rows), 'Rows checked in latest system-wide DQ snapshot; not a quality score')
  ], filters, dqFreshness, 'Transparent activity completeness metrics derived from live reporting views. A composite Data Quality Score is not used. Validation tracking and evidence linkages are disabled pending an approved integration contract.');
}

async function queryIpPerformance(filters: DashboardFilterState): Promise<DashboardPageData> {
  const { ipStatus } = projectAndDataset();
  const params: Record<string, string> = {};
  const where = filters.implementingPartner
    ? (params.implementingPartner = filters.implementingPartner, 'WHERE ip_name = @implementingPartner')
    : '';
  const [row] = await runSafeBigQuery<CountRow>(`
    SELECT
      COUNT(1) AS matched_rows,
      COUNT(DISTINCT NULLIF(ip_name, '')) AS reporting_partners,
      COALESCE(SUM(total_submissions), 0) AS total_submissions,
      COALESCE(SUM(total_events), 0) AS total_events,
      MAX(latest_sync_time) AS freshness_timestamp
    FROM ${ipStatus}
    ${where}
  `, params);
  const freshness = row ? asTimestamp(row.freshness_timestamp) : null;
  if (!row || asNumber(row.matched_rows) === 0) return noData('ip-performance', filters, freshness);
  return liveData('ip-performance', [
    countMetric('Reporting partners', asNumber(row.reporting_partners)),
    countMetric('Total submissions', asNumber(row.total_submissions)),
    countMetric('Reported activities', asNumber(row.total_events)),
  ], filters, freshness, 'Live partner submission aggregates are shown. Rankings, quality scores, evidence, timeliness, and management actions are disabled pending approved contracts.');
}

export function normalizeDashboardRoute(route: string | null): DashboardRouteKey {
  const cleaned = (route ?? '').replace(/^\/?dashboard\//, '').replace(/^\/+/, '');
  if (cleaned === 'gbv-ocmc-summary') return 'gbv-ocmc';
  if (
    cleaned === 'executive-overview' ||
    cleaned === 'activity-progress' ||
    cleaned === 'activity-detail' ||
    cleaned === 'participant-reach' ||
    cleaned === 'geographic-coverage' ||
    cleaned === 'data-quality' ||
    cleaned === 'ip-performance' ||
    cleaned === 'indicator-progress' ||
    cleaned === 'management-decision-centre' ||
    cleaned === 'gbv-ocmc'
  ) {
    return cleaned;
  }
  return 'executive-overview';
}

export async function getDashboardPageData(
  routeInput: string | null,
  filters: ExecutiveOverviewFilters = {},
  activityInput: Record<string, unknown> = filters as Record<string, unknown>,
  activityExport = false,
): Promise<DashboardPageData> {
  const route = normalizeDashboardRoute(routeInput);
  if (getDashboardDataMode() !== 'bigquery') return route === 'activity-detail' ? unavailableData(route, 'Activity Detail requires approved BigQuery data. No mock data is shown.') : mockData(route, filters as QueryFilters);
  if (route === 'activity-detail') {
    try { parseActivityRequest(activityInput); } catch { return disabledData(route, 'Invalid Activity Detail query controls.', 422); }
  }
  if (route === 'gbv-ocmc') {
    return disabledData(route, 'GBV/OCMC aggregate survivor and service reporting is not yet available from the approved production data contract.');
  }
  const config = getBigQueryConfigStatus();
  if (!config.dataModeConfigurationValid || !config.configured) {
    return unavailableData(route, 'BigQuery is unavailable or its production-readiness configuration is invalid. No demo or mock data is shown.');
  }

  try {
    let analytical: AnalyticalFilters;
    try { analytical = parseAnalyticalFilters(route === 'activity-detail' ? {} : activityInput, route); }
    catch { return disabledData(route, 'Unsupported or invalid analytical filter.', 422); }
    const options = await getLiveDashboardFilterOptions();
    const validated = validateFilters(filters as QueryFilters, options);
    if (validated.unsupportedKeys.length > 0) {
      return disabledData(route, `The selected filter is not available from the approved live aggregate contract: ${validated.unsupportedKeys.join(', ')}.`, 422);
    }
    if (hasUnsupportedRouteFilter(route, validated.filters)) {
      return disabledData(route, 'The selected filter cannot be applied to this route from its approved BigQuery view. No unfiltered substitute is shown.', 422);
    }
    switch (route) {
      case 'activity-detail': {
        const detail = await queryActivityDetail(validated.filters, activityInput, activityExport);
        const [freshness] = await runSafeBigQuery<CountRow>(`SELECT MAX(latest_sync_time) AS freshness_timestamp FROM ${projectAndDataset().ipStatus}`);
        const result = liveData(route, [
          countMetric('Reported activities', Number(detail.summary.events)),
          countMetric('Total participants', Number(detail.summary.participants)),
          countMetric('Reportable participants', Number(detail.summary.reportable)),
          countMetric('Implementing partners', Number(detail.summary.partners)),
        ], validated.filters, asTimestamp(freshness?.freshness_timestamp), 'Approved combined activity aggregates. Search and all filters apply to KPIs, table and CSV. Counts 1 to 4 are withheld. Attendance records are not unique people.');
        result.activityRows = detail.rows;
        result.activityPage = detail.page;
        return result;
      }
      case 'executive-overview':
      case 'activity-progress':
      case 'participant-reach':
      case 'geographic-coverage':
      case 'management-decision-centre': {
        const options = route === 'activity-progress' ? await implementationOptions(validated.filters, analytical)
          : route === 'participant-reach' ? await participantAnalysisOptions(validated.filters) : undefined;
        const controls = options ? { values: analytical, options } : undefined;
        if (options && Object.entries(analytical).some(([key, value]) => value && !(options as Record<string, string[]>)[key]?.includes(value))) {
          const result = disabledData(route, 'This analytical category is unavailable in the selected reporting scope.', 422);
          result.analyticalControls = controls;
          return result;
        }
        let result = await queryCombinedRoute(route, validated.filters, analytical);
        result.analyticalControls = controls;
        if (route === 'participant-reach') {
          const participants = await participantAnalysis(validated.filters, analytical);
          result = liveData(route, participants.metrics.map(metric => ({ label: metric.label, value: metric.displayValue })), validated.filters, result.metadata.freshnessTimestamp, participants.metadata.note);
          result.analyticalControls = controls;
          result.participants = participants;
          result.sections = await participantBreakdowns(validated.filters, analytical);
          return result;
        }
        if (route === 'executive-overview' && result.metadata.componentState === 'live_bigquery') result.participants = await getParticipantMetrics(validated.filters);
        return await addAnalysis(result, validated.filters, analytical);
      }
      case 'indicator-progress':
        return await queryIndicators(validated.filters);
      case 'data-quality':
        return await queryDataQuality(validated.filters);
      case 'ip-performance':
        return await addAnalysis(await queryIpPerformance(validated.filters), validated.filters);
      default:
        return disabledData(route, 'This route is not approved for BigQuery activation.');
    }
  } catch (error) {
    console.error('Dashboard aggregate request failed.');
    if (error instanceof Error && error.message.includes('authorization failure')) {
      const result = unavailableData(route, 'Authorization failure: the approved dashboard identity cannot read the reporting views.');
      result.metadata.validationStatus = 'authorization_failure';
      return result;
    }
    return unavailableData(route, 'BigQuery is temporarily unavailable or access to an approved aggregate view was denied. No demo or mock data is shown.');
  }
}
