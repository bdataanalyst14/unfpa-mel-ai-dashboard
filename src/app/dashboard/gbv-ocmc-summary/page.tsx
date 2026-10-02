import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import type { ExecutiveOverviewFilters } from '@/lib/types';


export default async function Page({ searchParams }: { searchParams?: Promise<ExecutiveOverviewFilters> }) {
  const params = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') return <BigQueryRouteView route="gbv-ocmc" searchParams={params} />;
  return <BigQueryRouteView route="gbv-ocmc" searchParams={params} />;
}
