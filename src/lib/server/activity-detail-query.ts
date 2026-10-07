import { activityFields, activitySearchKeys, activityExtraFilters, type ActivityRequest } from '@/lib/aggregate-contract';
import type { DashboardFilterState } from '@/lib/dashboard-filters';

export const activitySource = '`unfpadatabase.unfpadatabase.combined_activity_summary`';
export function parseActivityRequest(input: Record<string, unknown> = {}): ActivityRequest {
  const value = (key: string, limit = 1000) => {
    if (input[key] === undefined || input[key] === null) return '';
    if (typeof input[key] !== 'string' || input[key].length > limit) throw new Error('Invalid activity request');
    return input[key].trim();
  };
  const sort = value('sort') || 'activity';
  const direction = value('direction') || 'asc';
  const page = Number(value('page') || '1');
  const pageSize = Number(value('pageSize') || '25');
  if (!activityFields.some(field => field.key === sort) || !['asc', 'desc'].includes(direction)
    || !Number.isSafeInteger(page) || page < 1 || page > 1000000 || ![25, 50, 100].includes(pageSize)) throw new Error('Invalid activity request');
  return { search: value('search', 200), sort, direction: direction as 'asc' | 'desc', page, pageSize,
    ...Object.fromEntries(activityExtraFilters.map(key => [key, value(key)])) } as ActivityRequest;
}

export function activityWhere(filters: DashboardFilterState, request: ActivityRequest) {
  const params: Record<string, string> = {};
  const clauses: string[] = [];
  const mapping: Record<string, string> = { year: 'year', quarter: 'quarter', project: 'project', implementingPartner: 'partner', province: 'province', district: 'district', municipality: 'municipality' };
  for (const [key, alias] of Object.entries(mapping).concat(activityExtraFilters.map(key => [key, key]))) {
    const value = key in mapping ? filters[key as keyof DashboardFilterState] : request[key as typeof activityExtraFilters[number]];
    if (!value) continue;
    const field = activityFields.find(field => field.key === alias)!;
    clauses.push(`\`${field.source}\` = @${key}`);
    params[key] = value;
  }
  if (request.search) {
    clauses.push(`(${activitySearchKeys.map(key => `STRPOS(LOWER(COALESCE(\`${activityFields.find(field => field.key === key)!.source}\`, '')), LOWER(@search)) > 0`).join(' OR ')})`);
    params.search = request.search;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export function activityGroupedSql(where: string) {
  return `SELECT ${activityFields.map(field => field.kind === 'dimension'
    ? `CAST(\`${field.source}\` AS STRING) AS \`${field.key}\``
    : `\`${field.source}\` AS \`${field.key}\``).join(', ')} FROM ${activitySource} ${where}`;
}

export function activityOrder(request: ActivityRequest) {
  if (!activityFields.some(field => field.key === request.sort)) throw new Error('Invalid activity sort');
  const field = activityFields.find(field => field.key === request.sort)!;
  const safeOrder = (item: typeof field) => item.kind === 'measure' && item.key !== 'events' ? `CASE WHEN \`${item.key}\` BETWEEN 1 AND 4 THEN NULL ELSE \`${item.key}\` END` : `\`${item.key}\``;
  return `${safeOrder(field)} ${request.direction === 'desc' ? 'DESC' : 'ASC'} NULLS LAST, ${activityFields.map(safeOrder).join(', ')}`;
}
