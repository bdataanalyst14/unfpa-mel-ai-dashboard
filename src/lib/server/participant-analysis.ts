import 'server-only';
import type { AnalyticalFilters } from '@/lib/analytical-filters';
import type { DashboardFilterState } from '@/lib/dashboard-filters';
import type { ParticipantData } from '@/lib/participant-contract';
import { runSafeBigQuery } from './bigquery-client';
import { combinedScope, combinedSource, globalColumns } from './analytical-scope';
import { suppressCount } from './suppression';

export const profileLabels: Record<string, string> = {
  female: 'Female', male: 'Male', other: 'Other sex', below_15: 'Below 15 (source 0–15)',
  age_15_19: '15–19', age_16_24: '16–24', age_20_24: '20–24', age_25_49: '25–49', age_25_54: '25–54', age_50_and_above: '50+', age_55_and_above: '55+',
  hilldalit: 'Hill Dalit', teraidalit: 'Terai Dalit', hilljanajati: 'Hill Janajati', teraijanajati: 'Terai Janajati', madhesi: 'Madhesi', muslim: 'Muslim', bc: 'Brahmin/Chhetri', other_cast: 'Other caste', withdisability: 'With disability', nodisability: 'No disability',
};
const repeatSource = '`unfpadatabase.unfpadatabase.repeatdata`';
const eligible = "LOWER(TRIM(report_eligible)) IN ('reportable', 'yes', 'y', 'true', '1', 'eligible')";
const normalizedAge = "REGEXP_REPLACE(LOWER(TRIM(age_group_name)), r'[_-]+', ' ')";
const normalizedCaste = "REGEXP_REPLACE(LOWER(TRIM(caste_ethnicity_name)), r'[\\s_/-]+', '')";
const noDisability = "LOWER(TRIM(disability_name)) IN ('', 'nodisability', 'no_disability', 'no disability', 'no', 'none')";
const expressions: Record<string, string> = {
  female: "LOWER(TRIM(sex_name)) IN ('female', 'f')", male: "LOWER(TRIM(sex_name)) IN ('male', 'm')",
  other: "COALESCE(LOWER(TRIM(sex_name)), '') NOT IN ('female', 'f', 'male', 'm')",
  below_15: `${normalizedAge} IN ('below 15', 'under 15', '0 15', '0 to 15')`,
  ...Object.fromEntries(['15_19', '16_24', '20_24', '25_49', '25_54'].map(band => [`age_${band}`, `${normalizedAge} IN ('${band.replace('_', ' ')}', '${band.replace('_', ' to ')}')`])),
  age_50_and_above: `${normalizedAge} IN ('50 and above', '50 above', '50 plus')`,
  age_55_and_above: `${normalizedAge} IN ('55 and above', '55 above', '55 plus')`,
  ...Object.fromEntries(['hilldalit', 'hilljanajati', 'madhesi', 'muslim'].map(key => [key, `${normalizedCaste} = '${key}'`])),
  teraidalit: `${normalizedCaste} IN ('teraidalit', 'madhesidalit')`, teraijanajati: `${normalizedCaste} IN ('teraijanajati', 'madhesijanajati')`,
  bc: `${normalizedCaste} IN ('bc', 'brahminchhetri', 'bhraminchhetri', 'brahminchhetrithakuri', 'bhraminchhetrithakuri', 'brahmin', 'bhramin', 'chhetri', 'bahun', 'bahunchhetri', 'brahmanchhetri')`,
  withdisability: `NOT (${noDisability})`, nodisability: noDisability,
};
expressions.other_cast = `NOT (${['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc'].map(key => `(${expressions[key]})`).join(' OR ')}) OR caste_ethnicity_name IS NULL`;

export function repeatScope(filters: DashboardFilterState, values: AnalyticalFilters) {
  const params: Record<string, string> = {};
  const clauses: string[] = [];
  const columns: Record<string, string> = { ...Object.fromEntries(Object.entries(globalColumns).map(([key, column]) => [key, column === 'ip_name' ? column : column.replace(/1$/, '')])), municipality: 'palika', year: 'reporting_year', quarter: 'report_quarter' };
  for (const [key, column] of Object.entries(columns)) {
    const value = filters[key as keyof DashboardFilterState];
    if (value) { clauses.push(`${column} = @${key}`); params[key] = value; }
  }
  if (values.eventtype) { clauses.push('event_type = @eventtype'); params.eventtype = values.eventtype; }
  if (values.classification === 'reportable') clauses.push(eligible);
  if (values.classification === 'non-reportable') clauses.push(`NOT (${eligible})`);
  if (values.participantType) { clauses.push('participant_type_name = @participantType'); params.participantType = values.participantType; }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export async function participantAnalysis(filters: DashboardFilterState, values: AnalyticalFilters): Promise<ParticipantData> {
  if (!['', 'reportable', 'non-reportable'].includes(values.classification) || !['', 'summary', 'name_list'].includes(values.entry_mode)) throw new Error('Invalid participant scope');
  const counts: Record<string, number> = Object.fromEntries(['totalParticipants', 'reportableParticipants', ...Object.keys(profileLabels)].map(key => [key, 0]));
  const includeRepeat = values.entry_mode !== 'summary';
  const includeSummary = values.entry_mode !== 'name_list' && values.classification !== 'non-reportable' && !values.participantType;
  const add = (row: Record<string, unknown> | undefined) => {
    if (!row) throw new Error('Participant aggregate missing');
    for (const key of Object.keys(counts)) {
      const value = Number(row[key]);
      if (row[key] == null || !Number.isSafeInteger(value) || value < 0) throw new Error('Invalid participant aggregate');
      counts[key] += value;
    }
  };
  if (includeRepeat) {
    const { where, params } = repeatScope(filters, values);
    const [row] = await runSafeBigQuery<Record<string, unknown>>(`SELECT COUNT(*) AS totalParticipants, COUNTIF(${eligible}) AS reportableParticipants, ${Object.entries(expressions).map(([key, expression]) => `COUNTIF(${expression}) AS ${key}`).join(', ')} FROM ${repeatSource} ${where}`, params);
    add(row);
  }
  if (includeSummary) {
    const { where, params } = combinedScope(filters, { eventtype: values.eventtype, entry_mode: 'summary' });
    const [row] = await runSafeBigQuery<Record<string, unknown>>(`SELECT COALESCE(SUM(total_participants), 0) AS totalParticipants, COALESCE(SUM(total_reportable_participants), 0) AS reportableParticipants, ${Object.keys(profileLabels).map(key => `COALESCE(SUM(${key}), 0) AS ${key}`).join(', ')} FROM ${combinedSource} ${where}`, params);
    add(row);
  }
  counts.nonReportableParticipants = counts.totalParticipants - counts.reportableParticipants;
  const metrics = (labels: Record<string, string>) => Object.entries(labels).map(([key, label]) => ({ key, label, ...suppressCount(counts[key]) }));
  return { metrics: metrics({ totalParticipants: 'Total participants', reportableParticipants: 'Reportable participants', nonReportableParticipants: 'Non-reportable participants', withdisability: 'Participants with disability', female: 'Female participants', male: 'Male participants', other: 'Other participants' }),
    demographics: [{ name: 'Selected attendance population', metrics: metrics(profileLabels) }], districts: [], monthly: [], activities: [], filters,
    metadata: { dataSource: 'bigquery', note: `All participant KPIs and profiles use the same selected attendance population. ${includeSummary ? 'Includes summary-mode attendance, classified as reportable by the published contract.' : 'Summary-mode attendance excluded; participant type is not available for summary records.'} ${includeRepeat ? 'Includes matching name-list attendance.' : 'Name-list attendance excluded.'} Counts are not unique people. Source age bands overlap; do not add them.` } };
}

export async function participantAnalysisOptions(filters: DashboardFilterState) {
  const { where, params } = combinedScope(filters);
  const types = await runSafeBigQuery<{ value: string; records: number }>(`SELECT participant_type_name AS value, COUNT(*) AS records FROM ${repeatSource} GROUP BY participant_type_name ORDER BY value`);
  const events = await runSafeBigQuery<{ value: string }>(`SELECT DISTINCT eventtype1 AS value FROM ${combinedSource} ${where} ORDER BY value`, params);
  return { classification: ['reportable', 'non-reportable'], participantType: types.map(row => row.value).filter(Boolean), entry_mode: ['name_list', 'summary'], eventtype: events.map(row => row.value).filter(Boolean) };
}

export async function participantBreakdowns(filters: DashboardFilterState, values: AnalyticalFilters) {
  const sections = [];
  for (const [key, repeatColumn, summaryColumn, title] of [
    ['eventtype', 'event_type', 'eventtype1', 'Reach by event type'],
    ['project', 'project', 'project1', 'Reach by project'],
    ['participantType', 'participant_type_name', '', 'Participant / beneficiary type'],
  ]) {
    const totals = new Map<string, number>();
    if (values.entry_mode !== 'summary') {
      const { where, params } = repeatScope(filters, values);
      const rows = await runSafeBigQuery<{ label: string; participants: number }>(`SELECT COALESCE(NULLIF(${repeatColumn}, ''), 'Unspecified') AS label, COUNT(*) AS participants FROM ${repeatSource} ${where} GROUP BY ${repeatColumn}`, params);
      for (const row of rows) totals.set(row.label, Number(row.participants));
    }
    if (values.entry_mode !== 'name_list' && values.classification !== 'non-reportable' && !values.participantType) {
      const { where, params } = combinedScope(filters, { eventtype: values.eventtype, entry_mode: 'summary' });
      const rows = await runSafeBigQuery<{ label: string; participants: number }>(`SELECT ${summaryColumn ? `COALESCE(NULLIF(${summaryColumn}, ''), 'Unspecified')` : "'Not collected (summary mode)'"} AS label, COALESCE(SUM(total_participants), 0) AS participants FROM ${combinedSource} ${where}${summaryColumn ? ` GROUP BY ${summaryColumn}` : ''}`, params);
      for (const row of rows) totals.set(row.label, (totals.get(row.label) ?? 0) + Number(row.participants));
    }
    if (Array.from(totals.values()).some(value => !Number.isSafeInteger(value) || value < 0)) throw new Error('Invalid participant breakdown');
    sections.push({ key, title, rows: Array.from(totals).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, participants: suppressCount(count).displayValue })) });
  }
  return sections;
}
