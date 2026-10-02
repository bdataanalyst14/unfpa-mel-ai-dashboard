import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import MockPage from './mock-page';

export default async function Page({ searchParams }: { searchParams?: Promise<ExecutiveOverviewFilters> }) {
  const params = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') return <BigQueryRouteView route="management-decision-centre" searchParams={params} />;
  return <MockPage />;
}
