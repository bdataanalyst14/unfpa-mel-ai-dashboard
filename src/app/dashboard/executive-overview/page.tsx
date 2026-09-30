import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';
import ProgrammeProgressChart from '@/components/charts/programme-progress-chart';
import IndicatorStatusChart from '@/components/charts/indicator-status-chart';
import ParticipantSexChart from '@/components/charts/participant-sex-chart';
import DataQualityChart from '@/components/charts/data-quality-chart';
import LocalUnitCoverageMap from '@/components/dashboard/local-unit-coverage-map';
import DrillthroughButton from '@/components/dashboard/drillthrough-button';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { getExecutiveOverviewData } from '@/lib/server/bigquery-dashboard-service';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import { getParticipantMetrics } from '@/lib/server/participant-metrics';
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
  if ((resolvedParams as Record<string, string>).qaError === 'boundary') {
    throw new Error('Intentional browser-QA error');
  }
  const dataMode = getDashboardDataMode();

  let mockOverview;
  if (dataMode === 'mock') {
    mockOverview = await getExecutiveOverviewData(resolvedParams);
  } else {
    mockOverview = {
      summary: { totalEvents: 0, districtsCovered: 0, dataQualityScore: 0, ipsReporting: 0, approvedSubmissions: 0 },
      insights: [],
      metadata: { sourceLabel: '', note: '' }
    };
  }

  const pageData = await getDashboardPageData('executive-overview', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';
  const participants = live ? await getParticipantMetrics(pageData.metadata.filtersApplied) : undefined;
  const districtMetrics = live && participants?.metadata.dataSource === 'bigquery' ? participants.districts.flatMap(group => {
    const count = group.metrics.find(metric => metric.key === 'totalParticipants');
    return count ? [{ label: group.name, value: count.displayValue }] : [];
  }) : [];

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
          label="Total Participants"
          value={getMetric('Reportable participants', '18,547')}
          change={live ? "Verified aggregate count" : "Unique registered attendees"}
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

      {/* Main analytical row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AwaitingDataOverlay active={live} message="Planned-vs-completed project trends pending approved live contracts." className="h-full">
          <ChartCard
            title="Programme Progress by Project"
            subtitle="Planned vs. completed activities"
            action={<DrillthroughButton href="/dashboard/activity-progress" />}
            className="h-full"
          >
            <ProgrammeProgressChart />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={live} message="Indicator Performance disabled pending approved target registry." className="h-full">
          <ChartCard
            title="Indicator Performance Status"
            subtitle="CPD Q2 output indicator distribution"
            action={<DrillthroughButton href="/dashboard/indicator-progress" />}
            className="h-full"
          >
            <IndicatorStatusChart />
          </ChartCard>
        </AwaitingDataOverlay>

        <ChartCard
          title="Geographic Coverage"
          subtitle="Activity density by District"
          action={<DrillthroughButton href="/dashboard/geographic-coverage" />}
          className="h-full"
        >
          <div className="w-full min-w-0 rounded-lg border border-slate-100 bg-slate-50/50 p-2 sm:p-4">
            <LocalUnitCoverageMap districts={districtMetrics} compact />
          </div>
        </ChartCard>
      </div>

      {/* Next analytical row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col h-full">
          <ChartCard
            title="Participant Profile by Sex"
            subtitle="Aggregated attendee distribution"
            action={<DrillthroughButton href="/dashboard/participant-reach" />}
            className="h-full"
          >
            <ParticipantSexChart  />
          </ChartCard>
        </div>

        <div className="bg-[#082A4D] rounded-xl p-5 text-white shadow-sm border border-blue-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5 text-[#FF6600]" />
              <h3 className="font-semibold">Top IP / Partner Attention</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Currently, {ipsReporting} implementing partners are reporting operational activities across provinces. {live ? '' : `Q2 reviews indicate ${mockOverview.summary.approvedSubmissions} submissions validated.`}
            </p>
          </div>
          <DrillthroughButton href="/dashboard/ip-performance" label="Review IP Performance" className="text-[#FF6600] hover:text-[#ff8533] self-start" />
        </div>

        <AwaitingDataOverlay active={live} message="Data Quality logic pending BigQuery validation." className="h-full">
          <ChartCard
            title="Data Quality & Evidence Attention"
            subtitle="Completeness & validation trends"
            action={<DrillthroughButton href="/dashboard/data-quality" />}
            className="h-full"
          >
            <DataQualityChart />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Integrated management panel */}
      <div>
        <AwaitingDataOverlay active={live} message="AI Insights are prototype-only and disabled in BigQuery mode." className="h-full">
          <AIInsightPanel insights={mockOverview.insights} className="h-full" />
        </AwaitingDataOverlay>
      </div>

      {/* Source, freshness, caveat, privacy footer */}
      <div className={`rounded-xl border px-4 py-3 text-sm mt-8 ${
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
    </div>
  );
}
