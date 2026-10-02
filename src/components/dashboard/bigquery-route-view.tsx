import { requireDashboardPageAccess } from '@/lib/server/auth-guard';
import { getDashboardPageData, type DashboardRouteKey } from '@/lib/server/dashboard-page-data-service';
import { getParticipantMetrics } from '@/lib/server/participant-metrics';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import ProductionDashboardView from './production-dashboard-view';

export default async function BigQueryRouteView({ route, searchParams }: { route: DashboardRouteKey; searchParams?: ExecutiveOverviewFilters }) {
  await requireDashboardPageAccess(`/dashboard/${route === 'gbv-ocmc' ? 'gbv-ocmc-summary' : route}`);
  const data = await getDashboardPageData(route, searchParams);
  const participants = data.metadata.componentState === 'live_bigquery' && route === 'participant-reach'
    ? await getParticipantMetrics(data.metadata.filtersApplied) : undefined;
  return <ProductionDashboardView route={route} data={data} participants={participants} />;
}
