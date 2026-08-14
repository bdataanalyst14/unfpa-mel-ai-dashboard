import { NextRequest, NextResponse } from 'next/server';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { requireDashboardApiAccess } from '@/lib/server/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authorization = await requireDashboardApiAccess();
  if (!authorization.allowed) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: authorization.status });
  }
  try {
    const route = request.nextUrl.searchParams.get('route');
    const params = request.nextUrl.searchParams;
    const data = await getDashboardPageData(route, {
      year: params.get('year') ?? undefined,
      quarter: params.get('quarter') ?? undefined,
      project: params.get('project') ?? undefined,
      province: params.get('province') ?? undefined,
      implementingPartner:
        params.get('implementingPartner') ?? params.get('ip') ?? undefined,
    });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Dashboard data is temporarily unavailable.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
