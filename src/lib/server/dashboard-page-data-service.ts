import 'server-only';

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
import type { ExecutiveOverviewFilters } from '@/lib/types';

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

export type DashboardPageMetric = {
  label: string;
  value: string;
  note?: string;
};

export type DashboardPageMetadata = {
  dataSource: 'bigquery' | 'mock';
  freshnessTimestamp: string | null;
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
};

export type DashboardFilterOptions = Record<DashboardFilterKey, string[]>;

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

function countMetric(label: string, value: number, note?: string): DashboardPageMetric {
  return { label, value: suppressCount(value).displayValue, note };
}

function textMetric(label: string, value: string, note?: string): DashboardPageMetric {
  return { label, value, note };
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
      countMetric('Total events', summary.totalActivities),
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
  if (route === 'data-quality') return Object.values(filters).some(Boolean);
  if (route === 'ip-performance') {
    return Boolean(filters.year || filters.quarter || filters.project || filters.province);
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
  }>(`
    SELECT DISTINCT
      reporting_year1,
      report_quarter1,
      project1,
      ip_name,
      province1
    FROM ${combined}
  `);
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
    district: [],
    municipality: [],
  };
}

async function queryCombinedRoute(
  route: Extract<
    DashboardRouteKey,
    'executive-overview' | 'activity-progress' | 'participant-reach' | 'geographic-coverage'
  >,
  filters: DashboardFilterState,
): Promise<DashboardPageData> {
  const { combined, ipStatus } = projectAndDataset();
  const { where, params } = buildCombinedWhere(filters);
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
    countMetric('Total events', asNumber(row.total_events)),
    countMetric('Total participants', asNumber(row.total_participants), 'SUM(combined_activity_summary.total_participants); not unique people.'),
      countMetric('Reportable participants', asNumber(row.reportable_participants)),
    countMetric('Projects', asNumber(row.projects)),
    countMetric('Implementing partners', asNumber(row.partners)),
  ];
  if (route === 'executive-overview') {
    return liveData(route, [
      countMetric('Total events', asNumber(row.total_events)),
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
      countMetric('Total events', asNumber(row.total_events)),
    ], filters, freshness, 'Live aggregate coverage counts are shown. The prototype map and coverage gap claims are disabled pending geographic validation.');
  }
  return liveData(route, common, filters, freshness, 'Live aggregate activity volume is shown. Planned-versus-completed progress, trends, evidence, and delayed-report components are disabled pending approved contracts.');
}

async function queryDataQuality(): Promise<DashboardPageData> {
  const { quality } = projectAndDataset();
  const [row] = await runSafeBigQuery<CountRow>(`
    SELECT
      COUNT(1) AS matched_rows,
      COALESCE(SUM(total_rows), 0) AS total_rows,
      COALESCE(SUM(records_with_quality_issue), 0) AS records_with_quality_issue,
      MAX(run_timestamp) AS freshness_timestamp
    FROM ${quality}
  `);
  const freshness = row ? asTimestamp(row.freshness_timestamp) : null;
  if (!row || asNumber(row.matched_rows) === 0) return noData('data-quality', emptyFilterState(), freshness);
  const totalRows = asNumber(row.total_rows);
  const issueRows = asNumber(row.records_with_quality_issue);
  const score = totalRows > 0 ? `${Math.max(0, ((totalRows - issueRows) / totalRows) * 100).toFixed(1)}%` : 'N/A';
  return liveData('data-quality', [
    countMetric('Rows checked', totalRows),
    countMetric('Rows with quality issue', issueRows),
    textMetric('Data quality score', score, 'Derived as (rows checked - rows with quality issue) / rows checked.'),
  ], emptyFilterState(), freshness, 'Live aggregate data quality metrics are shown. Evidence, validation, and per-partner prototype components are disabled.');
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
    countMetric('Total events', asNumber(row.total_events)),
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
): Promise<DashboardPageData> {
  const route = normalizeDashboardRoute(routeInput);
  if (getDashboardDataMode() !== 'bigquery') return mockData(route, filters as QueryFilters);
  if (route === 'gbv-ocmc') {
    return disabledData(route, 'GBV / OCMC is disabled in BigQuery mode pending explicit privacy, reporting, and suppression approval.');
  }
  if (route === 'indicator-progress') {
    return disabledData(route, 'Indicator Performance Status is disabled pending an approved target registry, indicator crosswalk, and status-rule validation.');
  }
  if (route === 'management-decision-centre') {
    return disabledData(route, 'Management Decision Centre is disabled in BigQuery mode. Prototype and AI-generated insights are not approved for Production V1.');
  }
  if (route === 'activity-detail') {
    return disabledData(route, 'Activity Detail and exports are disabled in BigQuery mode pending an approved safe aggregate-detail contract.');
  }

  const config = getBigQueryConfigStatus();
  if (!config.dataModeConfigurationValid || !config.configured) {
    return unavailableData(route, 'BigQuery is unavailable or its production-readiness configuration is invalid. No demo or mock data is shown.');
  }

  try {
    const options = await getLiveDashboardFilterOptions();
    const validated = validateFilters(filters as QueryFilters, options);
    if (validated.unsupportedKeys.length > 0) {
      return disabledData(route, `The selected filter is not available from the approved live aggregate contract: ${validated.unsupportedKeys.join(', ')}.`, 422);
    }
    if (hasUnsupportedRouteFilter(route, validated.filters)) {
      return disabledData(route, 'The selected filter cannot be applied to this route from its approved BigQuery view. No unfiltered substitute is shown.', 422);
    }
    switch (route) {
      case 'executive-overview':
      case 'activity-progress':
      case 'participant-reach':
      case 'geographic-coverage':
        return await queryCombinedRoute(route, validated.filters);
      case 'data-quality':
        return await queryDataQuality();
      case 'ip-performance':
        return await queryIpPerformance(validated.filters);
      default:
        return disabledData(route, 'This route is not approved for BigQuery activation.');
    }
  } catch {
    return unavailableData(route, 'BigQuery is temporarily unavailable or access to an approved aggregate view was denied. No demo or mock data is shown.');
  }
}
