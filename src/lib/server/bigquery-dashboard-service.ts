import 'server-only';

import { aiInsights } from '@/data/mock/ai-insights';
import { combinedSummary } from '@/data/mock/combined-summary';
import { mainData } from '@/data/mock/main-data';
import {
  buildDashboardFilterOptions,
  filterActivities,
  parseDashboardFilters,
  summarizeActivities,
} from '@/lib/dashboard-filters';
import type { ExecutiveOverviewData, ExecutiveOverviewFilters } from '@/lib/types';
import {
  getBigQueryDatasetId,
  getBigQueryProjectId,
  runSafeBigQuery,
} from './bigquery-client';
import {
  suppressCount,
  suppressPercentage,
  type SuppressionResult,
} from './suppression';

type ExecutiveOverviewRow = {
  total_events: number | string | null;
  reportable_participants: number | string | null;
  female_participants: number | string | null;
  male_participants: number | string | null;
  other_participants: number | string | null;
  beneficiaries: number | string | null;
  guests: number | string | null;
  non_reportable_participants: number | string | null;
  districts_covered: number | string | null;
  ips_reporting: number | string | null;
  data_quality_score: number | string | null;
  last_refreshed: { value?: string } | string | null;
};

type SuppressionFieldMetadata = {
  displayValue: string;
  suppressed: boolean;
  suppression_reason?: SuppressionResult['suppression_reason'];
};

type SuppressionPayloadMetadata = {
  note: string;
  fields: Record<string, SuppressionFieldMetadata>;
  percentages: Record<string, SuppressionFieldMetadata>;
};

type ExecutiveOverviewDataWithSuppression = ExecutiveOverviewData & {
  metadata: ExecutiveOverviewData['metadata'] & {
    suppression?: SuppressionPayloadMetadata;
  };
};

const cache = new Map<string, { expiresAt: number; data: ExecutiveOverviewData }>();

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

const filterOptions = buildDashboardFilterOptions(mainData);

function mockOverview(
  sourceLabel = 'Mock',
  filters: ExecutiveOverviewFilters = {},
): ExecutiveOverviewData {
  const validated = parseDashboardFilters(
    filters as Record<string, string | string[] | undefined>,
    filterOptions,
  );
  const rows = filterActivities(mainData, validated);
  const active = Object.values(validated).some(Boolean);
  const activitySummary = summarizeActivities(rows);
  const summary = active
    ? {
        ...combinedSummary,
        totalEvents: activitySummary.totalActivities,
        reportableParticipants: activitySummary.totalParticipants,
        femaleParticipants: activitySummary.femaleParticipants,
        maleParticipants: activitySummary.maleParticipants,
        otherParticipants: activitySummary.otherParticipants,
        beneficiaries: activitySummary.beneficiaries,
        guests: rows.reduce((sum, row) => sum + row.guests, 0),
        nonReportableParticipants: rows.reduce((sum, row) => sum + row.guests, 0),
        districtsCovered: activitySummary.districts,
        ipsReporting: activitySummary.partners,
        missingEvidence: activitySummary.missingEvidence,
        pendingValidation: activitySummary.pendingValidation,
        approvedSubmissions: rows.filter(
          (row) => row.validationStatus === 'Validated',
        ).length,
        lateSubmissions: rows.filter((row) => row.evidenceStatus === 'Pending').length,
        dataQualityScore:
          rows.length > 0
            ? Math.round(
                (rows.filter((row) => row.evidenceStatus !== 'Missing').length /
                  rows.length) *
                  1000,
              ) / 10
            : 0,
      }
    : combinedSummary;
  return {
    summary,
    participantSex: [
      { name: 'Female', value: summary.femaleParticipants, color: '#004B87' },
      { name: 'Male', value: summary.maleParticipants, color: '#FF6600' },
      { name: 'Other', value: summary.otherParticipants, color: '#9CA3AF' },
    ],
    insights: aiInsights.slice(0, 3),
    metadata: {
      dataSource: 'mock',
      sourceLabel,
      lastRefreshed: null,
      note: active
        ? `Filtered synthetic mock rows: ${rows.length}. Target/status charts and AI insights remain unfiltered prototype content and are hidden in the filtered route view.`
        : 'Target/status charts and AI insights remain mock. Evidence, validation, and late-report metrics are also prototype-only pending approved reporting views.',
    },
  };
}

function normalizeFilters(filters: ExecutiveOverviewFilters): ExecutiveOverviewFilters {
  const validated = parseDashboardFilters(
    filters as Record<string, string | string[] | undefined>,
    filterOptions,
  );
  return Object.fromEntries(
    Object.entries(validated).filter(([, value]) => Boolean(value)),
  );
}

function lastRefreshedValue(value: ExecutiveOverviewRow['last_refreshed']): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.value ?? null;
}

function fieldMetadata(result: SuppressionResult): SuppressionFieldMetadata {
  return {
    displayValue: result.displayValue,
    suppressed: result.suppressed,
    ...(result.suppression_reason
      ? { suppression_reason: result.suppression_reason }
      : {}),
  };
}

function safeCountValue(result: SuppressionResult): number {
  return result.value ?? 0;
}

function buildSuppressionMetadata(
  counts: Record<string, number>,
  percentages: Record<string, [number, number]>,
): SuppressionPayloadMetadata {
  const fieldEntries = Object.entries(counts).map(([field, value]) => [
    field,
    fieldMetadata(suppressCount(value)),
  ]);
  const percentageEntries = Object.entries(percentages).map(
    ([field, [numerator, denominator]]) => [
      field,
      fieldMetadata(suppressPercentage(numerator, denominator)),
    ],
  );

  return {
    note: 'Non-zero count values below 5 are suppressed server-side before API response serialization. Numeric compatibility fields use 0 when a value is suppressed; use displayValue metadata for presentation.',
    fields: Object.fromEntries(fieldEntries),
    percentages: Object.fromEntries(percentageEntries),
  };
}

export async function getExecutiveOverviewData(
  filters: ExecutiveOverviewFilters = {},
): Promise<ExecutiveOverviewData> {
  const mode = (process.env.DASHBOARD_DATA_MODE || process.env.DATA_MODE || 'mock').trim().toLowerCase();
  if (mode !== 'bigquery') return mockOverview('Mock', filters);

  const normalized = normalizeFilters(filters);
  const cacheKey = JSON.stringify(normalized);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const projectId = getBigQueryProjectId();
    const datasetId = getBigQueryDatasetId();
    const clauses: string[] = [];
    const params: Record<string, string> = {};

    const filterColumns: Array<[keyof ExecutiveOverviewFilters, string, string]> = [
      ['year', 'reporting_year1', 'year'],
      ['quarter', 'report_quarter1', 'quarter'],
      ['project', 'project1', 'project'],
      ['province', 'province1', 'province'],
      ['district', 'district1', 'district'],
      ['implementingPartner', 'ip_name', 'implementingPartner'],
    ];

    for (const [filterKey, column, paramName] of filterColumns) {
      const value = normalized[filterKey];
      if (value) {
        clauses.push(`${column} = @${paramName}`);
        params[paramName] = value;
      }
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const query = `
      WITH filtered AS (
        SELECT
          event_count,
          total_reportable_participants,
          female,
          male,
          other,
          repeat_beneficiary_total,
          repeat_guest_total,
          repeat_nonreportable_total,
          district1,
          ip_name
        FROM \`${projectId}.${datasetId}.combined_activity_summary\`
        ${where}
      ),
      quality AS (
        SELECT
          SAFE_MULTIPLY(
            100,
            SAFE_DIVIDE(SUM(total_rows - records_with_quality_issue), NULLIF(SUM(total_rows), 0))
          ) AS score
        FROM \`${projectId}.${datasetId}.data_quality_summary\`
      ),
      freshness AS (
        SELECT MAX(latest_sync_time) AS refreshed_at
        FROM \`${projectId}.${datasetId}.ip_submission_status\`
      )
      SELECT
        COALESCE(SUM(event_count), 0) AS total_events,
        COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants,
        COALESCE(SUM(female), 0) AS female_participants,
        COALESCE(SUM(male), 0) AS male_participants,
        COALESCE(SUM(other), 0) AS other_participants,
        COALESCE(SUM(repeat_beneficiary_total), 0) AS beneficiaries,
        COALESCE(SUM(repeat_guest_total), 0) AS guests,
        COALESCE(SUM(repeat_nonreportable_total), 0) AS non_reportable_participants,
        COUNT(DISTINCT NULLIF(district1, '')) AS districts_covered,
        COUNT(DISTINCT NULLIF(ip_name, '')) AS ips_reporting,
        COALESCE((SELECT score FROM quality), 0) AS data_quality_score,
        (SELECT refreshed_at FROM freshness) AS last_refreshed
      FROM filtered
    `;

    const [row] = await runSafeBigQuery<ExecutiveOverviewRow>(query, params);
    if (!row) throw new Error('No aggregate row returned.');

    const rawCounts = {
      totalEvents: toNumber(row.total_events),
      reportableParticipants: toNumber(row.reportable_participants),
      femaleParticipants: toNumber(row.female_participants),
      maleParticipants: toNumber(row.male_participants),
      otherParticipants: toNumber(row.other_participants),
      beneficiaries: toNumber(row.beneficiaries),
      guests: toNumber(row.guests),
      nonReportableParticipants: toNumber(row.non_reportable_participants),
      districtsCovered: toNumber(row.districts_covered),
      ipsReporting: toNumber(row.ips_reporting),
      indicatorsOnTrack: 0,
      indicatorsWatch: 0,
      indicatorsOffTrack: 0,
      missingEvidence: 0,
      pendingValidation: 0,
      approvedSubmissions: 0,
      lateSubmissions: 0,
    };
    const suppression = buildSuppressionMetadata(rawCounts, {
      femaleParticipantShare: [
        rawCounts.femaleParticipants,
        rawCounts.reportableParticipants,
      ],
      maleParticipantShare: [
        rawCounts.maleParticipants,
        rawCounts.reportableParticipants,
      ],
      otherParticipantShare: [
        rawCounts.otherParticipants,
        rawCounts.reportableParticipants,
      ],
    });

    const summary = {
      totalEvents: safeCountValue(suppressCount(rawCounts.totalEvents)),
      reportableParticipants: safeCountValue(
        suppressCount(rawCounts.reportableParticipants),
      ),
      femaleParticipants: safeCountValue(
        suppressCount(rawCounts.femaleParticipants),
      ),
      maleParticipants: safeCountValue(suppressCount(rawCounts.maleParticipants)),
      otherParticipants: safeCountValue(
        suppressCount(rawCounts.otherParticipants),
      ),
      beneficiaries: safeCountValue(suppressCount(rawCounts.beneficiaries)),
      guests: safeCountValue(suppressCount(rawCounts.guests)),
      nonReportableParticipants: safeCountValue(
        suppressCount(rawCounts.nonReportableParticipants),
      ),
      districtsCovered: safeCountValue(suppressCount(rawCounts.districtsCovered)),
      ipsReporting: safeCountValue(suppressCount(rawCounts.ipsReporting)),
      indicatorsOnTrack: safeCountValue(suppressCount(rawCounts.indicatorsOnTrack)),
      indicatorsWatch: safeCountValue(suppressCount(rawCounts.indicatorsWatch)),
      indicatorsOffTrack: safeCountValue(suppressCount(rawCounts.indicatorsOffTrack)),
      missingEvidence: safeCountValue(suppressCount(rawCounts.missingEvidence)),
      dataQualityScore: Math.round(toNumber(row.data_quality_score) * 10) / 10,
      pendingValidation: safeCountValue(suppressCount(rawCounts.pendingValidation)),
      approvedSubmissions: safeCountValue(
        suppressCount(rawCounts.approvedSubmissions),
      ),
      lateSubmissions: safeCountValue(suppressCount(rawCounts.lateSubmissions)),
    };

    const data: ExecutiveOverviewDataWithSuppression = {
      summary,
      participantSex: [
        { name: 'Female', value: summary.femaleParticipants, color: '#004B87' },
        { name: 'Male', value: summary.maleParticipants, color: '#FF6600' },
        { name: 'Other', value: summary.otherParticipants, color: '#9CA3AF' },
      ],
      insights: aiInsights.slice(0, 3),
      metadata: {
        dataSource: 'bigquery',
        sourceLabel: 'BigQuery',
        lastRefreshed: lastRefreshedValue(row.last_refreshed),
        note: 'Aggregate operational KPIs are BigQuery-backed for this request with server-side small-cell suppression metadata. Target/status charts and AI insights remain prototype data pending approved reporting views.',
        suppression,
      },
    };

    const ttlSeconds = Math.max(0, Number(process.env.BIGQUERY_CACHE_TTL_SECONDS || 300));
    cache.set(cacheKey, { expiresAt: Date.now() + ttlSeconds * 1000, data });
    return data;
  } catch {
    return mockOverview('Mock fallback', filters);
  }
}
