import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import ParticipantMetricsPanel from '@/components/dashboard/participant-metrics-panel';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';
import ProgrammeProgressChart from '@/components/charts/programme-progress-chart';
import IndicatorStatusChart from '@/components/charts/indicator-status-chart';
import ParticipantSexChart from '@/components/charts/participant-sex-chart';
import DrillthroughButton from '@/components/dashboard/drillthrough-button';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { getExecutiveOverviewData } from '@/lib/server/bigquery-dashboard-service';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { Calendar, MapPin, Building, ShieldAlert, Database, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

export default async function ExecutiveOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') {
    return <BigQueryRouteView route="executive-overview" searchParams={resolvedParams} />;
  }
  const dataMode = getDashboardDataMode();

  // We need mock layout data to render the skeleton/disabled charts
  // Since getExecutiveOverviewData throws in BigQuery mode, we mock it locally or bypass it
  let mockOverview;
  if (dataMode === 'mock') {
    mockOverview = await getExecutiveOverviewData(resolvedParams);
  } else {
    // Fake mock data for the disabled layout elements when in BigQuery mode
    mockOverview = {
      summary: { totalEvents: 0, districtsCovered: 0, dataQualityScore: 0, ipsReporting: 0, approvedSubmissions: 0 },
      insights: [],
      metadata: { sourceLabel: '', note: '' }
    };
  }

  const pageData = await getDashboardPageData('executive-overview', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';

  // Helper to extract KPI values from BigQuery metrics or fallback to mock
  const getMetric = (label: string, fallback: string | number) => {
    if (live) {
      const metric = pageData.metrics.find(m => m.label.toLowerCase() === label.toLowerCase());
      return metric ? metric.value : fallback;
    }
    return fallback;
  };

  const totalEvents = getMetric('Total events', mockOverview.summary.totalEvents);
  const districtsCovered = getMetric('Districts covered', `${mockOverview.summary.districtsCovered} / 77`);
  const dataQualityScore = getMetric('Data quality score', `${mockOverview.summary.dataQualityScore}%`);
  const ipsReporting = getMetric('Implementing partners', mockOverview.summary.ipsReporting);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Overview"
        subtitle="UNFPA Nepal Monitoring, Evaluation & Learning (MEL) Dashboard"
        action={<DrillthroughButton href="/dashboard/management-decision-centre" label="Decision Centre" />}
      />

      <div className={`rounded-xl border px-4 py-3 text-sm ${
          pageData.metadata.componentState === 'unavailable'
            ? 'border-red-200 bg-red-50 text-red-900'
            : live
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-blue-100 bg-blue-50/60 text-gray-600'
        }`}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className={`flex items-center gap-2 font-medium ${live ? 'text-emerald-900' : 'text-[#004B87]'}`}>
            <Database className="h-4 w-4" />
            <span>Data source: {live ? 'BigQuery' : (mockOverview.metadata.sourceLabel || pageData.metadata.dataSource)}</span>
          </div>
          <span>Freshness: {formatTimestamp(pageData.metadata.freshnessTimestamp)}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed opacity-80">{pageData.metadata.message || mockOverview.metadata.note}</p>
        {live && (
          <p className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
            <ShieldCheck className="h-3 w-3" />
            Small-cell suppression: {pageData.metadata.suppressionApplied ? 'applied' : 'not available'}
          </p>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Events"
          value={totalEvents}
          change={live ? "Verified aggregate count" : "+12% from last quarter"}
          changeType="positive"
          icon={Calendar}
        />
        <KpiCard
          label="Districts Covered"
          value={districtsCovered}
          change={live ? "Core project areas active" : "Core project areas active"}
          changeType="neutral"
          icon={MapPin}
        />
        <AwaitingDataOverlay active={live} message="Data Quality scoring logic pending BigQuery validation">
          <KpiCard
            label="Data Quality Score"
            value={dataQualityScore}
            change="Target threshold &gt;80%"
            changeType={!live && mockOverview.summary.dataQualityScore >= 80 ? 'positive' : 'negative'}
            icon={ShieldAlert}
          />
        </AwaitingDataOverlay>
      </div>

      <ParticipantMetricsPanel />

      {/* Main Grid: Charts & AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AwaitingDataOverlay active={live} message="Planned-vs-completed project trends pending approved live contracts.">
            <ChartCard
              title="Programme Progress by Project"
              subtitle="Planned vs. completed activities"
              action={<DrillthroughButton href="/dashboard/activity-progress" />}
            >
              <ProgrammeProgressChart />
            </ChartCard>
          </AwaitingDataOverlay>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AwaitingDataOverlay active={live} message="Indicator Performance disabled pending approved target registry.">
              <ChartCard
                title="Indicator Performance Status"
                subtitle="CPD Q2 output indicator distribution"
                action={<DrillthroughButton href="/dashboard/indicator-progress" />}
              >
                <IndicatorStatusChart />
              </ChartCard>
            </AwaitingDataOverlay>

            <ChartCard
              title="Participant Profile by Sex"
              subtitle="Aggregated attendee distribution"
              action={<DrillthroughButton href="/dashboard/participant-reach" />}
            >
              <ParticipantSexChart  />
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <AwaitingDataOverlay active={live} message="AI Insights are prototype-only and disabled in BigQuery mode." className="h-full">
            <AIInsightPanel insights={mockOverview.insights} className="h-full" />
          </AwaitingDataOverlay>

          <div className="bg-[#082A4D] rounded-xl p-5 text-white shadow-sm border border-blue-900">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5 text-[#FF6600]" />
              <h3 className="font-semibold">IP / Partner Summary</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Currently, {ipsReporting} implementing partners are reporting operational activities across provinces. {live ? '' : `Q2 reviews indicate ${mockOverview.summary.approvedSubmissions} submissions validated.`}
            </p>
            <DrillthroughButton href="/dashboard/ip-performance" label="Review IP Performance" className="text-[#FF6600] hover:text-[#ff8533]" />
          </div>
        </div>
      </div>
    </div>
  );
}
