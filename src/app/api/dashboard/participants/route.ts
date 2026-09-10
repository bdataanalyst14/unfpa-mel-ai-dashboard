import { NextRequest, NextResponse } from 'next/server';
import { filtersFromParams } from '@/lib/participant-contract';
import { getParticipantMetrics, getParticipantFilterOptions } from '@/lib/server/participant-metrics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (request.nextUrl.searchParams.get('options') === '1') {
    try {
      return NextResponse.json(await getParticipantFilterOptions(), { headers });
    } catch {
      return NextResponse.json({ error: 'Live filter options unavailable' }, { status: 503, headers });
    }
  }
  const data = await getParticipantMetrics(filtersFromParams(request.nextUrl.searchParams));
  return NextResponse.json(data, { headers, status: data.metadata.dataSource === 'bigquery' ? 200 : 503 });
}
