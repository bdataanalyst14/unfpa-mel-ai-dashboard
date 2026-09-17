import type { ExecutiveOverviewFilters } from './types';

export const participantFilterColumns = {
  year: 'reporting_year1', quarter: 'report_quarter1', project: 'project1',
  province: 'province1', district: 'district1', municipality: 'palika1', implementingPartner: 'ip_name',
} as const;

export function participantFilters(input: ExecutiveOverviewFilters): ExecutiveOverviewFilters {
  const filters: ExecutiveOverviewFilters = {};
  for (const key of Object.keys(participantFilterColumns) as Array<keyof ExecutiveOverviewFilters>) {
    const value = input[key];
    if (typeof value !== 'string') continue;
    const cleaned = value.trim();
    if (cleaned && cleaned.toLowerCase() !== 'all') filters[key] = cleaned;
  }
  return filters;
}

export function filtersFromParams(params: URLSearchParams): ExecutiveOverviewFilters {
  return participantFilters(Object.fromEntries(Object.keys(participantFilterColumns).map(key => [
    key, params.get(key) ?? (key === 'implementingPartner' ? params.get('ip') : null) ?? undefined,
  ])));
}

export type ParticipantCount = { value: number | null; displayValue: string; suppressed: boolean };
export type ParticipantMetric = ParticipantCount & { key: string; label: string };
export type ParticipantGroup = { name: string; metrics: ParticipantMetric[] };
export type ParticipantData = {
  metrics: ParticipantMetric[];
  demographics: ParticipantGroup[];
  districts: ParticipantGroup[];
  monthly: ParticipantGroup[];
  activities: ParticipantGroup[];
  filters: ExecutiveOverviewFilters;
  metadata: { dataSource: 'bigquery' | 'unavailable'; note: string };
};
