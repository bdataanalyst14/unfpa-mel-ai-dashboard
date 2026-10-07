import { requireDashboardPageAccess } from '@/lib/server/auth-guard';
import { getDashboardPageData, type DashboardRouteKey } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import ProductionDashboardView from './production-dashboard-view';

export default async function BigQueryRouteView({ route, searchParams }: { route: DashboardRouteKey; searchParams?: ExecutiveOverviewFilters }) {
  await requireDashboardPageAccess(`/dashboard/${route === 'gbv-ocmc' ? 'gbv-ocmc-summary' : route}`);
  const data = await getDashboardPageData(route, searchParams);
  return <ProductionDashboardView route={route} data={data} participants={data.participants} />;
}
