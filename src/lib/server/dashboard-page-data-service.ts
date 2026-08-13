import 'server-only';

import {
  getBigQueryConfigStatus,
  getBigQueryDatasetId,
  getBigQueryProjectId,
  runSafeBigQuery,
} from './bigquery-client';
import { suppressCount } from './suppression';
import { mainData } from '@/data/mock/main-data';
import {
  buildDashboardFilterOptions,
  filterActivities,
  parseDashboardFilters,
  summarizeActivities,
} from '@/lib/dashboard-filters';
import type { ExecutiveOverviewFilters } from '@/lib/types';

export type DashboardRouteKey =
  | 'activity-progress'
  | 'activity-detail'
  | 'participant-reach'
  | 'geographic-coverage'
  | 'data-quality'
  | 'ip-performance'
  | 'indicator-progress'
  | 'management-decision-centre'
  | 'gbv-ocmc';

export type DashboardPageMetric = {
  label: string;
  value: string;
  note?: string;
};

export type DashboardPageMetadata = {
  dataSource: 'bigquery' | 'mock';
  freshnessTimestamp: string | null;
  suppressionApplied: boolean;
  validationStatus:
    | 'actual_bigquery_backed_dashboard_ready_for_preview_qa'
    | 'bigquery_env_missing_needs_vercel_configuration'
    | 'blocked_privacy_suppression_not_verified'
    | 'mock_fallback_explicit';
  fallbackReason?: string;
};

export type DashboardPageData = {
  route: DashboardRouteKey;
  pageName: string;
  metrics: DashboardPageMetric[];
  metadata: DashboardPageMetadata;
};

type CountRow = Record<string, number | string | { value?: string } | null>;

const pageNames: Record<DashboardRouteKey, string> = {
  'activity-progress': 'Activity Progress',
  'activity-detail': 'Activity Detail',
  'participant-reach': 'Participant Reach',
  'geographic-coverage': 'Geographic Coverage',
  'data-quality': 'Data Quality',
  'ip-performance': 'IP Performance',
  'indicator-progress': 'Indicator Progress',
  'management-decision-centre': 'Management Decision Centre',
  'gbv-ocmc': 'GBV/OCMC',
};

function asNumber(value: CountRow[string]): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asTimestamp(value: CountRow[string]): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'value' in value) return value.value ?? null;
  return null;
}

function metric(label: string, value: number | string, note?: string): DashboardPageMetric {
  return { label, value: typeof value === 'number' ? suppressCount(value).displayValue : value, note };
}

function fallbackData(
  route: DashboardRouteKey,
  fallbackReason: string,
  validationStatus: DashboardPageMetadata['validationStatus'] = 'mock_fallback_explicit',
): DashboardPageData {
  return {
    route,
    pageName: pageNames[route],
    metrics: [
      metric('Data mode', 'Mock/prototype'),
      metric('BigQuery status', fallbackReason),
    ],
    metadata: {
      dataSource: 'mock',
      freshnessTimestamp: null,
      suppressionApplied: true,
      validationStatus,
      fallbackReason,
    },
  };
}

const filterOptions = buildDashboardFilterOptions(mainData);

function mockFilteredData(
  route: DashboardRouteKey,
  filters: ExecutiveOverviewFilters,
): DashboardPageData {
  const validated = parseDashboardFilters(
    filters as Record<string, string | string[] | undefined>,
    filterOptions,
  );
  const rows = filterActivities(mainData, validated);
  const summary = summarizeActivities(rows);
  const common = [
    metric('Filtered activities', summary.totalActivities),
    metric('Filtered participants', summary.totalParticipants),
    metric('Districts', summary.districts),
    metric('Partners', summary.partners),
  ];
  const routeMetrics: Partial<Record<DashboardRouteKey, DashboardPageMetric[]>> = {
    'participant-reach': [
      metric('Filtered participants', summary.totalParticipants),
      metric('Female participants', summary.femaleParticipants),
      metric('Male participants', summary.maleParticipants),
      metric(
        'Female share',
        summary.femaleShare === null ? 'N/A' : `${summary.femaleShare.toFixed(1)}%`,
      ),
    ],
    'data-quality': [
      metric('Filtered rows checked', summary.totalActivities),
      metric('Missing evidence', summary.missingEvidence),
      metric('Pending validation', summary.pendingValidation),
    ],
    'ip-performance': [
      metric('Partners', summary.partners),
      metric('Filtered activities', summary.totalActivities),
      metric('Filtered participants', summary.totalParticipants),
    ],
    'geographic-coverage': [
      metric('Provinces', new Set(rows.map((row) => row.province)).size),
      metric('Districts', summary.districts),
      metric('Filtered activities', summary.totalActivities),
    ],
  };

  return {
    route,
    pageName: pageNames[route],
    metrics: routeMetrics[route] ?? common,
    metadata: {
      dataSource: 'mock',
      freshnessTimestamp: null,
      suppressionApplied: route === 'gbv-ocmc',
      validationStatus: 'mock_fallback_explicit',
      fallbackReason:
        'Validated synthetic mock rows only. Live programme data is not enabled.',
    },
  };
}

function fromRow(
  route: DashboardRouteKey,
  row: CountRow,
  metrics: DashboardPageMetric[],
): DashboardPageData {
  return {
    route,
    pageName: pageNames[route],
    metrics,
    metadata: {
      dataSource: 'bigquery',
      freshnessTimestamp: asTimestamp(row.freshness_timestamp),
      suppressionApplied: true,
      validationStatus: 'actual_bigquery_backed_dashboard_ready_for_preview_qa',
    },
  };
}

async function queryOne(route: DashboardRouteKey, sql: string): Promise<DashboardPageData> {
  const [row] = await runSafeBigQuery<CountRow>(sql);
  if (!row) throw new Error('No aggregate row returned.');

  switch (route) {
    case 'activity-progress':
      return fromRow(route, row, [
        metric('Total activities', asNumber(row.total_activities)),
        metric('Reportable participants', asNumber(row.reportable_participants)),
        metric('Projects', asNumber(row.projects)),
        metric('Districts', asNumber(row.districts)),
      ]);
    case 'participant-reach':
      return fromRow(route, row, [
        metric('Reportable participants', asNumber(row.reportable_participants)),
        metric('Female participants', asNumber(row.female_participants)),
        metric('Male participants', asNumber(row.male_participants)),
        metric('Participants with disability', asNumber(row.participants_with_disability)),
      ]);
    case 'geographic-coverage':
      return fromRow(route, row, [
        metric('Provinces covered', asNumber(row.provinces)),
        metric('Districts covered', asNumber(row.districts)),
        metric('Palikas covered', asNumber(row.palikas)),
        metric('Activities', asNumber(row.total_activities)),
      ]);
    case 'data-quality':
      return fromRow(route, row, [
        metric('Total rows checked', asNumber(row.total_rows)),
        metric('Rows with quality issue', asNumber(row.records_with_quality_issue)),
        metric('Data quality score', `${asNumber(row.quality_score).toFixed(1)}%`),
      ]);
    case 'ip-performance':
      return fromRow(route, row, [
        metric('Reporting partners', asNumber(row.reporting_partners)),
        metric('Total submissions', asNumber(row.total_submissions)),
        metric('Total events', asNumber(row.total_events)),
      ]);
    case 'indicator-progress':
      return fromRow(route, row, [
        metric('Indicator rows', asNumber(row.indicator_rows)),
        metric('Indicators', asNumber(row.indicators)),
        metric('Activities contributing', asNumber(row.activities)),
      ]);
    case 'management-decision-centre':
      return fromRow(route, row, [
        metric('Quality issue rows', asNumber(row.records_with_quality_issue)),
        metric('Reporting partners', asNumber(row.reporting_partners)),
        metric('Latest synced partners', asNumber(row.reporting_partners)),
      ]);
    case 'activity-detail':
      return fromRow(route, row, [
        metric('Activity rows available', asNumber(row.activity_rows)),
        metric('Partners', asNumber(row.partners)),
        metric('Districts', asNumber(row.districts)),
      ]);
    default:
      return fallbackData(route, 'No BigQuery aggregate contract is enabled for this route.');
  }
}

export function normalizeDashboardRoute(route: string | null): DashboardRouteKey {
  const cleaned = (route ?? '').replace(/^\/?dashboard\//, '').replace(/^\/+/, '');
  if (cleaned === 'gbv-ocmc-summary') return 'gbv-ocmc';
  if (
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
  return 'activity-progress';
}

export async function getDashboardPageData(
  routeInput: string | null,
  filters: ExecutiveOverviewFilters = {},
): Promise<DashboardPageData> {
  const route = normalizeDashboardRoute(routeInput);
  if (route === 'gbv-ocmc') {
    return fallbackData(
      route,
      'GBV/OCMC remains blocked for live activation pending privacy sign-off and final suppression QA.',
      'blocked_privacy_suppression_not_verified',
    );
  }

  const mode = (
    process.env.DASHBOARD_DATA_MODE ||
    process.env.DATA_MODE ||
    'mock'
  ).trim().toLowerCase();
  if (mode !== 'bigquery') return mockFilteredData(route, filters);

  const config = getBigQueryConfigStatus();
  if (!config.configured) {
    return fallbackData(
      route,
      'BigQuery environment is not configured. Set DASHBOARD_DATA_MODE=bigquery plus project, dataset, and service account settings.',
      'bigquery_env_missing_needs_vercel_configuration',
    );
  }

  const projectId = getBigQueryProjectId();
  const datasetId = getBigQueryDatasetId();
  const combined = `\`${projectId}.${datasetId}.combined_activity_summary\``;
  const quality = `\`${projectId}.${datasetId}.data_quality_summary\``;
  const ipStatus = `\`${projectId}.${datasetId}.ip_submission_status\``;
  const indicators = `\`${projectId}.${datasetId}.indicator_progress_summary\``;
  const freshness = `(SELECT MAX(latest_sync_time) FROM ${ipStatus}) AS freshness_timestamp`;

  try {
    switch (route) {
      case 'activity-progress':
        return await queryOne(route, `
          SELECT
            COALESCE(SUM(event_count), 0) AS total_activities,
            COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants,
            COUNT(DISTINCT NULLIF(project1, '')) AS projects,
            COUNT(DISTINCT NULLIF(district1, '')) AS districts,
            ${freshness}
          FROM ${combined}
        `);
      case 'activity-detail':
        return await queryOne(route, `
          SELECT
            COUNT(1) AS activity_rows,
            COUNT(DISTINCT NULLIF(ip_name, '')) AS partners,
            COUNT(DISTINCT NULLIF(district1, '')) AS districts,
            ${freshness}
          FROM ${combined}
        `);
      case 'participant-reach':
        return await queryOne(route, `
          SELECT
            COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants,
            COALESCE(SUM(female), 0) AS female_participants,
            COALESCE(SUM(male), 0) AS male_participants,
            COALESCE(SUM(withdisability), 0) AS participants_with_disability,
            ${freshness}
          FROM ${combined}
        `);
      case 'geographic-coverage':
        return await queryOne(route, `
          SELECT
            COUNT(DISTINCT NULLIF(province1, '')) AS provinces,
            COUNT(DISTINCT NULLIF(district1, '')) AS districts,
            COUNT(DISTINCT NULLIF(palika1, '')) AS palikas,
            COALESCE(SUM(event_count), 0) AS total_activities,
            ${freshness}
          FROM ${combined}
        `);
      case 'data-quality':
        return await queryOne(route, `
          SELECT
            COALESCE(SUM(total_rows), 0) AS total_rows,
            COALESCE(SUM(records_with_quality_issue), 0) AS records_with_quality_issue,
            SAFE_MULTIPLY(
              100,
              SAFE_DIVIDE(SUM(total_rows - records_with_quality_issue), NULLIF(SUM(total_rows), 0))
            ) AS quality_score,
            MAX(run_timestamp) AS freshness_timestamp
          FROM ${quality}
        `);
      case 'ip-performance':
        return await queryOne(route, `
          SELECT
            COUNT(DISTINCT NULLIF(ip_name, '')) AS reporting_partners,
            COALESCE(SUM(total_submissions), 0) AS total_submissions,
            COALESCE(SUM(total_events), 0) AS total_events,
            MAX(latest_sync_time) AS freshness_timestamp
          FROM ${ipStatus}
        `);
      case 'indicator-progress':
        return await queryOne(route, `
          SELECT
            COUNT(1) AS indicator_rows,
            COUNT(DISTINCT NULLIF(indicator1, '')) AS indicators,
            COUNT(DISTINCT NULLIF(activity1, '')) AS activities,
            ${freshness}
          FROM ${indicators}
        `);
      case 'management-decision-centre':
        return queryOne(route, `
          SELECT
            COALESCE((SELECT SUM(records_with_quality_issue) FROM ${quality}), 0) AS records_with_quality_issue,
            COUNT(DISTINCT NULLIF(ip_name, '')) AS reporting_partners,
            MAX(latest_sync_time) AS freshness_timestamp
          FROM ${ipStatus}
        `);
      default:
        return fallbackData(route, 'No BigQuery route contract configured.');
    }
  } catch {
    return fallbackData(
      route,
      'BigQuery unavailable or schema mismatch. Explicit mock fallback is active.',
      'mock_fallback_explicit',
    );
  }
}
