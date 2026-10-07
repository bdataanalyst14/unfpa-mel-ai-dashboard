import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import type { ExecutiveOverviewFilters } from '@/lib/types';

export default async function Page({ searchParams }: { searchParams?: Promise<ExecutiveOverviewFilters> }) {
  const params = searchParams ? await searchParams : {};
  return <BigQueryRouteView route="activity-detail" searchParams={params} />;
}
