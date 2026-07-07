import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';
import ProgrammeProgressChart from '@/components/charts/programme-progress-chart';
import IndicatorStatusChart from '@/components/charts/indicator-status-chart';
import ParticipantSexChart from '@/components/charts/participant-sex-chart';
import DrillthroughButton from '@/components/dashboard/drillthrough-button';

import { getExecutiveOverviewData } from '@/lib/server/bigquery-dashboard-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { Calendar, Users, MapPin, Building, ShieldAlert, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExecutiveOverviewPage({
  searchParams,
}: {
  searchParams?: ExecutiveOverviewFilters;
}) {
  const overview = await getExecutiveOverviewData(searchParams);
  const { summary: combinedSummary, insights: activeInsights, metadata } = overview;
  const refreshed = metadata.lastRefreshed
    ? new Date(metadata.lastRefreshed).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kathmandu',
      })
    : 'Not available';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Overview"
        subtitle="UNFPA Nepal Monitoring, Evaluation & Learning (MEL) Dashboard"
        action={<DrillthroughButton href="/dashboard/management-decision-centre" label="Decision Centre" />}
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-gray-600">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium text-[#004B87]">
            <Database className="h-4 w-4" />
            <span>Data source: {metadata.sourceLabel}</span>
          </div>
          <span>Last refreshed: {refreshed} NPT</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{metadata.note}</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Events"
          value={combinedSummary.totalEvents}
          change="+12% from last quarter"
          changeType="positive"
          icon={Calendar}
        />
        <KpiCard
          label="Reportable Participants"
          value={combinedSummary.reportableParticipants}
          change="+8% from last quarter"
          changeType="positive"
          icon={Users}
        />
        <KpiCard
          label="Districts Covered"
          value={`${combinedSummary.districtsCovered} / 77`}
          change="Core project areas active"
          changeType="neutral"
          icon={MapPin}
        />
        <KpiCard
          label="Data Quality Score"
          value={`${combinedSummary.dataQualityScore}%`}
          change="Target threshold &gt;80%"
          changeType={combinedSummary.dataQualityScore >= 80 ? 'positive' : 'negative'}
          icon={ShieldAlert}
        />
      </div>

      {/* Main Grid: Charts & AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="Programme Progress by Project"
            subtitle="Planned vs. completed activities"
            action={<DrillthroughButton href="/dashboard/activity-progress" />}
          >
            <ProgrammeProgressChart />
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Indicator Performance Status"
              subtitle="CPD Q2 output indicator distribution"
              action={<DrillthroughButton href="/dashboard/indicator-progress" />}
            >
              <IndicatorStatusChart />
            </ChartCard>

            <ChartCard
              title="Participant Profile by Sex"
              subtitle="Aggregated attendee distribution"
              action={<DrillthroughButton href="/dashboard/participant-reach" />}
            >
              <ParticipantSexChart data={overview.participantSex} />
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <AIInsightPanel insights={activeInsights} className="h-full" />
          
          <div className="bg-[#082A4D] rounded-xl p-5 text-white shadow-sm border border-blue-900">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5 text-[#FF6600]" />
              <h3 className="font-semibold">IP / Partner Summary</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Currently, {combinedSummary.ipsReporting} implementing partners are reporting operational activities across 7 provinces. Q2 reviews indicate {combinedSummary.approvedSubmissions} submissions validated.
            </p>
            <DrillthroughButton href="/dashboard/ip-performance" label="Review IP Performance" className="text-[#FF6600] hover:text-[#ff8533]" />
          </div>
        </div>
      </div>
    </div>
  );
}
