import { requireDashboardPageAccess } from '@/lib/server/auth-guard';
import { AlertTriangle, Database, ShieldCheck } from 'lucide-react';

import EmptyState from '@/components/dashboard/empty-state';
import KpiCard from '@/components/dashboard/kpi-card';
import PageHeader from '@/components/layout/page-header';
import {
  getDashboardPageData,
  type DashboardRouteKey,
} from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';

function formatTimestamp(value: string | null): string {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kathmandu',
  });
}

export default async function BigQueryRouteView({
  route,
  searchParams,
}: {
  route: DashboardRouteKey;
  searchParams?: ExecutiveOverviewFilters;
}) {
  await requireDashboardPageAccess(`/dashboard/${route}`);
  const data = await getDashboardPageData(route, searchParams);
  const live = data.metadata.componentState === 'live_bigquery';
  const noData = data.metadata.componentState === 'no_data';
  const unavailable = data.metadata.componentState === 'unavailable';

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.pageName}
        subtitle="Production V1 uses only approved aggregate BigQuery views."
      />
      <section
        className={`rounded-xl border px-4 py-3 text-sm ${
          unavailable
            ? 'border-red-200 bg-red-50 text-red-900'
            : live
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-amber-200 bg-amber-50 text-amber-950'
        }`}
        aria-label="BigQuery data source status"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-semibold">
            {unavailable ? <AlertTriangle className="h-4 w-4" /> : <Database className="h-4 w-4" />}
            Data source: BigQuery
          </span>
          <span>Freshness: {formatTimestamp(data.metadata.freshnessTimestamp)}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed">{data.metadata.message}</p>
        <p className="mt-1 flex items-center gap-1 text-xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          Small-cell suppression: {data.metadata.suppressionApplied ? 'applied' : 'not available'}
        </p>
      </section>

      {live ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Live aggregate metrics">
            {data.metrics.map((item) => (
              <KpiCard key={item.label} label={item.label} value={item.value} change={item.note} />
            ))}
          </section>
          {route === 'participant-reach' ? (
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm" aria-label="Participant Profile by Sex">
              <h2 className="text-sm font-semibold text-gray-900">Participant Profile by Sex</h2>
              <p className="mt-1 text-xs text-gray-500">Directly derived from approved aggregate counts; values below the suppression threshold are shown as &lt;5.</p>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {data.metrics.filter((item) => /^(Female|Male|Other) participants$/i.test(item.label)).map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
                    <dd className="mt-1 text-xl font-semibold text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={noData ? 'No approved aggregate data matches the selected filters' : unavailable ? 'BigQuery data is unavailable' : 'Component disabled pending validation'}
          detail={data.metadata.message}
        />
      )}
    </div>
  );
}
