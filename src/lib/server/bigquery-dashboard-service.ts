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
import { getDashboardDataMode } from './bigquery-client';

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

export async function getExecutiveOverviewData(
  filters: ExecutiveOverviewFilters = {},
): Promise<ExecutiveOverviewData> {
  if (getDashboardDataMode() === 'bigquery') {
    throw new Error('Legacy overview payload is unavailable in BigQuery mode. Use the aggregate page-data contract.');
  }
  return mockOverview('Demo / mock data', filters);
}
