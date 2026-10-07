import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardApiAccess } from '@/lib/server/auth-guard';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { allActivityColumns } from '@/lib/aggregate-contract';
import { createCsv } from '@/lib/csv-export';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authorization = await requireDashboardApiAccess();
  if (!authorization.allowed) return NextResponse.json({ error: 'Authentication required.' }, { status: authorization.status });
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const params = request.nextUrl.searchParams;
    if (Array.from(params.keys()).some(key => params.getAll(key).length > 1)) return NextResponse.json({ error: 'Repeated parameters are unsupported.' }, { status: 422, headers });
    const input = Object.fromEntries(params);
    const data = await getDashboardPageData('activity-detail', input, input, true);
    if (data.metadata.componentState !== 'live_bigquery') return NextResponse.json({ error: data.metadata.message }, { status: data.metadata.responseStatus, headers });
    const selected = params.get('columns')?.split(',');
    if (selected?.some(key => !allActivityColumns.some(([field]) => field === key))) return NextResponse.json({ error: 'Invalid export columns.' }, { status: 422, headers });
    const columns = selected ? allActivityColumns.filter(([key]) => selected.includes(key)) : allActivityColumns;
    return new NextResponse('\uFEFF' + createCsv(columns.map(([, label]) => label), (data.activityRows ?? []).map(row => columns.map(([key]) => row[key]))), {
      headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="unfpa-activity-detail.csv"' },
    });
  } catch {
    return NextResponse.json({ error: 'Export unavailable. No partial CSV was returned.' }, { status: 503, headers });
  }
}
