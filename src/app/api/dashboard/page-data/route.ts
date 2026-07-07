import { NextRequest, NextResponse } from 'next/server';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get('route');
  const data = await getDashboardPageData(route);

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
