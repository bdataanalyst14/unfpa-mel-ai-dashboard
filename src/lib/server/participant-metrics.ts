import 'server-only';

import type { ExecutiveOverviewFilters } from '@/lib/types';
import { participantFilterColumns, participantFilters, type ParticipantData, type ParticipantMetric } from '@/lib/participant-contract';
import { getBigQueryConfigStatus, getBigQueryDatasetId, getBigQueryProjectId, runSafeBigQuery } from './bigquery-client';
import { suppressCount } from './suppression';

export const participantKpis = {
  totalParticipants: 'Total Participants',
  reportableParticipants: 'Reportable Participants',
  individualParticipantRecords: 'Individual Participant Records',
  summaryModeParticipants: 'Summary-mode Participants',
};

const demographicColumns = {
  female: 'Female', male: 'Male', other: 'Other', below_15: 'Below 15',
  age_15_19: '15–19', age_16_24: '16–24', age_20_24: '20–24',
  age_25_49: '25–49', age_25_54: '25–54', age_50_and_above: '50 and above', age_55_and_above: '55 and above',
  hilldalit: 'Hill Dalit', teraidalit: 'Terai Dalit', hilljanajati: 'Hill Janajati',
  teraijanajati: 'Terai Janajati', madhesi: 'Madhesi', muslim: 'Muslim', bc: 'Brahmin/Chhetri', other_cast: 'Other caste',
  withdisability: 'With disability', nodisability: 'No disability',
  repeat_beneficiary_total: 'Individual beneficiary records', repeat_guest_total: 'Individual guest records',
  repeat_nonreportable_total: 'Individual non-reportable records',
};

export function participantWhere(input: ExecutiveOverviewFilters) {
  const params = { ...participantFilters(input) };
  const clauses = Object.keys(params).map(key => `${participantFilterColumns[key as keyof ExecutiveOverviewFilters]} = @${key}`);
  return { params, where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '' };
}

export function participantAggregateSql() {
  return `COALESCE(SUM(total_participants), 0) AS totalParticipants,
    COALESCE(SUM(total_reportable_participants), 0) AS reportableParticipants,
    COALESCE(SUM(IF(participant_entry_mode = 'name_list', total_participants, 0)), 0) AS individualParticipantRecords,
    COALESCE(SUM(IF(participant_entry_mode = 'summary', total_participants, 0)), 0) AS summaryModeParticipants`;
}

function metrics(row: Record<string, unknown>, labels: Record<string, string>): ParticipantMetric[] {
  return Object.entries(labels).map(([key, label]) => {
    const raw = row[key];
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : null;
    return { key, label, ...suppressCount(value) };
  });
}

export async function getParticipantMetrics(input: ExecutiveOverviewFilters = {}): Promise<ParticipantData> {
  const { params, where } = participantWhere(input);
  const empty: ParticipantData = {
    metrics: metrics({}, participantKpis), demographics: [], districts: [], monthly: [], activities: [], filters: params,
    metadata: { dataSource: 'unavailable', note: 'Live participant data is unavailable. No synthetic participant counts are displayed.' },
  };
  if (!getBigQueryConfigStatus().configured) return empty;
  try {
    const view = `\`${getBigQueryProjectId()}.${getBigQueryDatasetId()}.combined_activity_summary\``;
    const demographicSql = Object.keys(demographicColumns).map(column => `COALESCE(SUM(${column}), 0) AS ${column}`).join(', ');
    const rows = await runSafeBigQuery<Record<string, unknown>>(`
      WITH filtered AS (SELECT * FROM ${view} ${where})
      SELECT 'total' AS kind, '' AS name, ${participantAggregateSql()}, ${demographicSql} FROM filtered
      UNION ALL
      SELECT 'district', COALESCE(NULLIF(district1, ''), 'Unspecified'), ${participantAggregateSql()}, ${demographicSql}
      FROM filtered GROUP BY district1
      UNION ALL
      SELECT 'month', COALESCE(FORMAT_DATE('%Y-%m', start_date1), 'Unspecified'), ${participantAggregateSql()}, ${demographicSql}
      FROM filtered GROUP BY 2
      UNION ALL
      SELECT 'activity', COALESCE(NULLIF(activity1, ''), 'Unspecified'), ${participantAggregateSql()}, ${demographicSql}
      FROM filtered GROUP BY activity1
    `, params);
    const total = rows.find(row => row.kind === 'total');
    if (!total) throw new Error('Missing participant aggregate');
    for (const row of rows) {
      const counts = Object.keys(participantKpis).map(key => Number(row[key]));
      if (counts.some(value => !Number.isSafeInteger(value) || value < 0) || counts[0] !== counts[2] + counts[3] || counts[1] > counts[0]) {
        throw new Error('Participant aggregate failed reconciliation');
      }
    }
    const groups = (kind: string) => rows.filter(row => row.kind === kind).map(row => ({
      name: String(row.name), metrics: metrics(row, participantKpis),
    })).sort((a, b) => a.name.localeCompare(b.name));
    return {
      metrics: metrics(total, participantKpis),
      demographics: [{ name: 'Canonical demographic categories', metrics: metrics(total, demographicColumns) }],
      districts: groups('district'), monthly: groups('month'), activities: groups('activity'), filters: params,
      metadata: { dataSource: 'bigquery', note: 'Locked combined_activity_summary view. Participant counts are attendance records, not unique people. Age bands remain as supplied and can overlap; do not add them together. Counts below five are suppressed.' },
    };
  } catch {
    return empty;
  }
}

export async function getParticipantFilterOptions() {
  if (!getBigQueryConfigStatus().configured) throw new Error('BigQuery unavailable');
  const view = `\`${getBigQueryProjectId()}.${getBigQueryDatasetId()}.combined_activity_summary\``;
  const rows = await runSafeBigQuery<{ key: string; value: string }>(Object.entries(participantFilterColumns).map(([key, column]) =>
    `SELECT DISTINCT '${key}' AS key, ${column} AS value FROM ${view} WHERE ${column} IS NOT NULL AND TRIM(${column}) != ''`
  ).join(' UNION ALL '));
  return Object.fromEntries(Object.keys(participantFilterColumns).map(key => [key, rows.filter(row => row.key === key).map(row => row.value).sort()]));
}
