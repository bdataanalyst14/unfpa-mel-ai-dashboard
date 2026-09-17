import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardApiAccess } from '@/lib/server/auth-guard';
import { filtersFromParams, participantFilterColumns } from '@/lib/participant-contract';
import { getParticipantMetrics, getParticipantFilterOptions } from '@/lib/server/participant-metrics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const authorization = await requireDashboardApiAccess();
  if (!authorization.allowed) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: authorization.status, headers });
  }
  const params = request.nextUrl.searchParams;
  if ([...Object.keys(participantFilterColumns), 'ip'].some(key => params.getAll(key).length > 1)
    || (params.has('ip') && params.has('implementingPartner') && params.get('ip') !== params.get('implementingPartner'))) {
    return NextResponse.json({ error: 'Repeated or conflicting filter values are unsupported.' }, { status: 422, headers });
  }
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
