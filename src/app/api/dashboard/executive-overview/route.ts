import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { NextRequest, NextResponse } from 'next/server';

import { getExecutiveOverviewData } from '@/lib/server/bigquery-dashboard-service';
import { requireDashboardApiAccess } from '@/lib/server/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authorization = await requireDashboardApiAccess();
  if (!authorization.allowed) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: authorization.status });
  }
  try {
    const params = request.nextUrl.searchParams;
    if (['year', 'quarter', 'project', 'implementingPartner', 'ip', 'province', 'district', 'municipality'].some((key) => params.getAll(key).length > 1)) {
      return NextResponse.json({ error: 'Repeated filter values are unsupported.' }, { status: 422 });
    }
    const filters = {
      year: params.get('year') ?? undefined,
      quarter: params.get('quarter') ?? undefined,
      project: params.get('project') ?? undefined,
      province: params.get('province') ?? undefined,
      district: params.get('district') ?? undefined,
      municipality: params.get('municipality') ?? undefined,
      implementingPartner:
        params.get('implementingPartner') ?? params.get('ip') ?? undefined,
    };
    if (getDashboardDataMode() === 'bigquery') {
      const data = await getDashboardPageData('executive-overview', filters);
      return NextResponse.json(data, {
        status: data.metadata.responseStatus,
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }
    const data = await getExecutiveOverviewData(filters);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Executive Overview data is temporarily unavailable.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
