import 'server-only';
import { activityFields, activityExtraFilters, type AggregateRow } from '@/lib/aggregate-contract';
import { runSafeBigQuery } from './bigquery-client';
import { suppressCount } from './suppression';
import { activitySource, activityWhere, activityGroupedSql, activityOrder, parseActivityRequest } from './activity-detail-query';
import type { DashboardFilterState } from '@/lib/dashboard-filters';

export function safeActivityRow(row: Record<string, unknown>): AggregateRow {
  return Object.fromEntries(activityFields.map(field => {
    const value = row[field.key];
    const isOperational = /activities|districts|partners|projects|submissions|rows|gaps|events/i.test(field.key);
    return [field.key, field.kind === 'measure'
      ? suppressCount(value == null ? null : Number(value), isOperational).displayValue
      : typeof value === 'string' && value.trim() ? value : 'Unspecified'];
  }));
}

export async function queryActivityDetail(filters: DashboardFilterState, input: Record<string, unknown>, fullExport = false) {
  const request = parseActivityRequest(input);
  const { where, params } = activityWhere(filters, request);
  const grouped = activityGroupedSql(where);
  const [summary] = await runSafeBigQuery<Record<string, number>>(`WITH grouped AS (${grouped})
    SELECT COUNT(*) AS row_count, COALESCE(SUM(events), 0) AS events, COALESCE(SUM(participants), 0) AS participants,
    COALESCE(SUM(reportable), 0) AS reportable, COUNT(DISTINCT NULLIF(partner, '')) AS partners FROM grouped`, params);
  if (!summary) throw new Error('Activity summary unavailable');
  if (['row_count', 'events', 'participants', 'reportable', 'partners'].some(key => !Number.isSafeInteger(Number(summary[key])) || Number(summary[key]) < 0)) throw new Error('Invalid activity summary');
  const totalRows = Number(summary.row_count);
  const totalPages = Math.max(1, Math.ceil(totalRows / request.pageSize));
  request.page = Math.min(request.page, totalPages);
  const rows = await runSafeBigQuery<Record<string, unknown>>(`${grouped} ORDER BY ${activityOrder(request)}${fullExport ? '' : ' LIMIT @pageSize OFFSET @offset'}`,
    fullExport ? params : { ...params, pageSize: request.pageSize, offset: (request.page - 1) * request.pageSize });
  const options: Record<string, string[]> = {};
  if (!fullExport) {
    for (const key of activityExtraFilters) {
      const parents = key === 'output' ? { outcome: request.outcome } : key === 'activity' ? { outcome: request.outcome, output: request.output } : ['subact', 'subactcode'].includes(key) ? { outcome: request.outcome, output: request.output, activity: request.activity } : {};
      const base = activityWhere(filters, parseActivityRequest(parents));
      const source = activityFields.find(field => field.key === key)!.source;
      const [values] = await runSafeBigQuery<{ values: string[] }>(`SELECT ARRAY_AGG(DISTINCT \`${source}\` IGNORE NULLS ORDER BY \`${source}\`) AS values FROM ${activitySource} ${base.where}`, base.params);
      options[key] = (values?.values ?? []).filter(Boolean);
    }
  }
  return { rows: rows.map(safeActivityRow), summary, page: { request, totalRows, totalPages, options } };
}
