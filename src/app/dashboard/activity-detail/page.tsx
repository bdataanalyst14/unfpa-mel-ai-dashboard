import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import PageHeader from '@/components/layout/page-header';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { ActivityDetailClientContent } from './client-page';

export default async function ActivityDetailPage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') {
    return <BigQueryRouteView route="activity-detail" searchParams={resolvedParams} />;
  }
  const pageData = await getDashboardPageData('activity-detail', resolvedParams);
  const live = pageData.metadata.componentState !== 'mock_demo';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Detail Log"
        subtitle={live ? "Production V1 uses only approved aggregate BigQuery views." : "Sample activity log for SMT prototype demonstration; synthetic ACT-2025 rows are not official registry activities."}
      />

      <DataSourceStatusPanel route="activity-detail" />

      <AwaitingDataOverlay active={live} message={pageData.metadata.message}>
        <ActivityDetailClientContent />
      </AwaitingDataOverlay>
    </div>
  );
}
