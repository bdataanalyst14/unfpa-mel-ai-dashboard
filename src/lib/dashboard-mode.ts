export type DashboardDataMode = 'bigquery' | 'mock';

export type DashboardDataModeResolution = {
  mode: DashboardDataMode;
  valid: boolean;
};

type DashboardEnvironment = Record<string, string | undefined>;

function normalize(value: string | undefined): DashboardDataMode | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bigquery' || normalized === 'mock') return normalized;
  return undefined;
}

export function resolveDashboardDataMode(
  environment: DashboardEnvironment = process.env,
): DashboardDataModeResolution {
  const dashboardMode = normalize(environment.DASHBOARD_DATA_MODE);
  const dataMode = normalize(environment.DATA_MODE);
  const dashboardModeProvided = Boolean(environment.DASHBOARD_DATA_MODE?.trim());
  const dataModeProvided = Boolean(environment.DATA_MODE?.trim());
  const validValues =
    (!dashboardModeProvided || Boolean(dashboardMode)) &&
    (!dataModeProvided || Boolean(dataMode));
  const aligned = !dashboardMode || !dataMode || dashboardMode === dataMode;

  if (!validValues || !aligned) return { mode: 'bigquery', valid: false };
  return { mode: dashboardMode ?? dataMode ?? 'mock', valid: true };
}

export function dashboardAuthenticationRequired(
  environment: DashboardEnvironment = process.env,
): boolean {
  const resolution = resolveDashboardDataMode(environment);
  return resolution.mode === 'bigquery' || !resolution.valid
    || environment.DASHBOARD_AUTH_REQUIRED?.trim().toLowerCase() !== 'false';
}
