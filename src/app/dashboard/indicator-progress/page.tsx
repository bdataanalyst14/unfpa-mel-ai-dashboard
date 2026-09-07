import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import MockPage from './mock-page';

export default async function Page({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  if (getDashboardDataMode() === 'bigquery') {
    return <BigQueryRouteView route='indicator-progress' searchParams={await searchParams} />;
  }
  return <MockPage />;
}
