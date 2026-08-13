export type SafeGbvValue = {
  displayValue: string;
  chartValue: number;
  suppressed: boolean;
};

export type SafeGbvChartDatum = SafeGbvValue & {
  name: string;
  color?: string;
};

export type SafeGbvTableRow = {
  province: string;
  district: string;
  total: SafeGbvValue;
  female: SafeGbvValue;
  male: SafeGbvValue;
  under15Share: SafeGbvValue;
  referralRate: SafeGbvValue;
};

export type SafeGbvDashboardData = {
  kpis: {
    total: SafeGbvValue;
    female: SafeGbvValue;
    femaleShare: SafeGbvValue;
    referrals: SafeGbvValue;
    followUps: SafeGbvValue;
  };
  provinceChart: SafeGbvChartDatum[];
  casteChart: SafeGbvChartDatum[];
  rows: SafeGbvTableRow[];
};

export function formatSafeGbvTooltipValue(
  datum: SafeGbvChartDatum | undefined,
): string {
  return datum?.displayValue ?? 'N/A';
}
