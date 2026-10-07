import { analyticalColumns, type AnalyticalFilters } from '@/lib/analytical-filters';
import type { DashboardFilterState } from '@/lib/dashboard-filters';
import { runSafeBigQuery } from './bigquery-client';

export const combinedSource = '`unfpadatabase.unfpadatabase.combined_activity_summary`';
export const globalColumns = { year: 'reporting_year1', quarter: 'report_quarter1', project: 'project1', implementingPartner: 'ip_name', province: 'province1', district: 'district1', municipality: 'palika1' } as const;
export function combinedScope(filters: DashboardFilterState, analytical: Partial<AnalyticalFilters> = {}) {
  const params: Record<string, string> = {};
  const clauses: string[] = [];
  for (const [key, column] of Object.entries({ ...globalColumns, ...analyticalColumns })) {
    const value = key in globalColumns ? filters[key as keyof DashboardFilterState] : analytical[key as keyof AnalyticalFilters];
    if (value) { clauses.push(`${column} = @${key}`); params[key] = value; }
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}
export async function implementationOptions(filters: DashboardFilterState, values: AnalyticalFilters) {
  const options: Record<string, string[]> = {};
  for (const key of ['outcome', 'output', 'activity', 'subact', 'subactcode', 'eventtype'] as const) {
    const parents = key === 'outcome' || key === 'eventtype' ? {} : key === 'output' ? { outcome: values.outcome } : { outcome: values.outcome, output: values.output, ...(['subact', 'subactcode'].includes(key) ? { activity: values.activity } : {}) };
    const { where, params } = combinedScope(filters, parents);
    const rows = await runSafeBigQuery<{ value: string }>(`SELECT DISTINCT ${analyticalColumns[key]} AS value FROM ${combinedSource} ${where} ORDER BY value LIMIT 10001`, params);
    if (rows.length > 10000) throw new Error('Analytical options exceed bound');
    options[key] = rows.map(row => row.value).filter(Boolean);
  }
  return options;
}
