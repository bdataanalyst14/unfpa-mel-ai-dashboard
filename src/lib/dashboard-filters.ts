import type { Activity, ExecutiveOverviewFilters } from '@/lib/types';

export const DASHBOARD_FILTER_KEYS = [
  'year',
  'quarter',
  'project',
  'implementingPartner',
  'province',
] as const;

export type DashboardFilterKey = (typeof DASHBOARD_FILTER_KEYS)[number];
export type DashboardFilterState = Record<DashboardFilterKey, string>;

const emptyFilters: DashboardFilterState = {
  year: '',
  quarter: '',
  project: '',
  implementingPartner: '',
  province: '',
};

function unique(values: Array<string | number>): string[] {
  return Array.from(new Set(values.map(String))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

export function buildDashboardFilterOptions(
  activities: Activity[],
): Record<DashboardFilterKey, string[]> {
  return {
    year: unique(activities.map((row) => row.year)),
    quarter: unique(activities.map((row) => row.quarter)),
    project: unique(activities.map((row) => row.project)),
    implementingPartner: unique(activities.map((row) => row.ip)),
    province: unique(activities.map((row) => row.province)),
  };
}

function readParam(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
  key: DashboardFilterKey,
): string | undefined {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? (key === 'implementingPartner' ? input.get('ip') : null) ?? undefined;
  }
  const raw = input[key] ?? (key === 'implementingPartner' ? input.ip : undefined);
  return Array.isArray(raw) ? raw[0] : raw;
}

export function parseDashboardFilters(
  input: URLSearchParams | Record<string, string | string[] | undefined> | undefined,
  options: Record<DashboardFilterKey, string[]>,
): DashboardFilterState {
  if (!input) return { ...emptyFilters };
  const parsed = { ...emptyFilters };
  for (const key of DASHBOARD_FILTER_KEYS) {
    const value = readParam(input, key)?.trim() ?? '';
    if (options[key].includes(value)) parsed[key] = value;
  }
  return parsed;
}

export function serializeDashboardFilters(
  filters: DashboardFilterState,
  existing?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(existing);
  params.delete('ip');
  for (const key of DASHBOARD_FILTER_KEYS) {
    if (filters[key]) params.set(key, filters[key]);
    else params.delete(key);
  }
  return params;
}

export function filterActivities(
  activities: Activity[],
  filters: DashboardFilterState,
): Activity[] {
  return activities.filter(
    (row) =>
      (!filters.year || String(row.year) === filters.year) &&
      (!filters.quarter || row.quarter === filters.quarter) &&
      (!filters.project || row.project === filters.project) &&
      (!filters.implementingPartner || row.ip === filters.implementingPartner) &&
      (!filters.province || row.province === filters.province),
  );
}

export function hasActiveDashboardFilters(filters: DashboardFilterState): boolean {
  return DASHBOARD_FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function toExecutiveOverviewFilters(
  filters: DashboardFilterState,
): ExecutiveOverviewFilters {
  return Object.fromEntries(
    DASHBOARD_FILTER_KEYS.flatMap((key) =>
      filters[key] ? [[key, filters[key]]] : [],
    ),
  );
}

export function summarizeActivities(activities: Activity[]) {
  const totalParticipants = activities.reduce(
    (sum, row) => sum + row.totalParticipants,
    0,
  );
  const femaleParticipants = activities.reduce(
    (sum, row) => sum + row.femaleParticipants,
    0,
  );
  return {
    totalActivities: activities.length,
    totalParticipants,
    femaleParticipants,
    maleParticipants: activities.reduce(
      (sum, row) => sum + row.maleParticipants,
      0,
    ),
    otherParticipants: activities.reduce(
      (sum, row) => sum + row.otherParticipants,
      0,
    ),
    beneficiaries: activities.reduce((sum, row) => sum + row.beneficiaries, 0),
    districts: new Set(activities.map((row) => row.district)).size,
    partners: new Set(activities.map((row) => row.ip)).size,
    missingEvidence: activities.filter((row) => row.evidenceStatus === 'Missing').length,
    pendingValidation: activities.filter((row) => row.validationStatus === 'Pending').length,
    femaleShare:
      totalParticipants > 0 ? (femaleParticipants / totalParticipants) * 100 : null,
  };
}
