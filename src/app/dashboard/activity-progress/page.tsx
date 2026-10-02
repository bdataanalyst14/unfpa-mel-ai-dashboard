import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import MonthlyActivityTrend from '@/components/charts/monthly-activity-trend';
import ProgrammeProgressChart from '@/components/charts/programme-progress-chart';
import StatusBadge from '@/components/dashboard/status-badge';
import DrillthroughButton from '@/components/dashboard/drillthrough-button';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { combinedSummary } from '@/data/mock/combined-summary';
import { Calendar, Users, MapPin, Building } from 'lucide-react';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';

const delayedActivities = [
  { id: 'ACT-2025-0045', project: 'CP9 SRHR', ip: 'ADRA Nepal', name: 'Maternal health workshop', days: 12 },
  { id: 'ACT-2025-0112', project: 'CP9 GEWE', ip: 'WOREC', name: 'Community advocacy campaign', days: 9 },
  { id: 'ACT-2025-0189', project: 'KOICA AYSRHR', ip: 'Restless Dev', name: 'Youth peer educator training', days: 8 },
];

export default async function ActivityProgressPage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageData = await getDashboardPageData('activity-progress', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';

  // Helper to extract KPI values from BigQuery metrics or fallback to mock
  const getMetric = (label: string, fallback: string | number) => {
    if (live) {
      const metric = pageData.metrics.find(m => m.label.toLowerCase() === label.toLowerCase());
      return metric ? metric.value : fallback;
    }
    return fallback;
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Progress"
        subtitle={live ? "Production V1 uses only approved aggregate BigQuery views." : "Prototype activity progress using demo/sample rows; pending final M&E activity-registry validation."}
        action={<DrillthroughButton href="/dashboard/activity-detail" label="View Activity Logs" />}
      />

      <DataSourceStatusPanel route="activity-progress" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Activities"
          value={getMetric('Total events', combinedSummary.totalEvents)}
          change={live ? "Verified aggregate count" : "Across all output clusters"}
          icon={Calendar}
        />
        <KpiCard
          label="Total Participants"
          value={getMetric('Total participants', combinedSummary.reportableParticipants)}
          change={live ? "Verified aggregate count" : "Unique registered attendees"}
          icon={Users}
        />
        <KpiCard
          label="Districts Covered"
          value={getMetric('Districts covered', combinedSummary.districtsCovered)}
          change={live ? "Verified aggregate count" : "Target districts"}
          icon={MapPin}
        />
        <KpiCard
          label="Implementing Partners"
          value={getMetric('Implementing partners', 42)}
          change={live ? "Verified aggregate count" : "Active partners"}
          icon={Building}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AwaitingDataOverlay active={live} message="Monthly trends disabled pending approved time-series contract.">
          <ChartCard
            title="Monthly Activity & Reaches Trend"
            subtitle="Overview of project intensity by calendar month"
          >
            <MonthlyActivityTrend />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={live} message="Implementation performance disabled pending target registry integration.">
          <ChartCard
            title="Implementation Performance by Project"
            subtitle="Planned vs. completed activities breakdown"
          >
            <ProgrammeProgressChart />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delayed Activities Table */}
        <AwaitingDataOverlay active={live} message="Activity-level delays disabled pending granular operational data approval.">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Delayed Activity Reports</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Activity Name</th>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">IP/Partner</th>
                    <th className="px-3 py-2 text-right">Delayed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {delayedActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-900">{act.id}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">{act.name}</td>
                      <td className="px-3 py-2.5 text-xs">{act.project}</td>
                      <td className="px-3 py-2.5 text-xs">{act.ip}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-red-600 font-mono">{act.days} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AwaitingDataOverlay>

        {/* Missing Evidence Table */}
        <AwaitingDataOverlay active={live} message="Evidence gap tracking disabled pending BigQuery workflow sync.">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Evidence Compliance Gaps</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Partner</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Evidence Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-900">ACT-2025-0012</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">WOREC</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">Karnali, Surkhet</td>
                    <td className="px-3 py-2.5"><StatusBadge status="Missing" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-900">ACT-2025-0089</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">FPAN</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">Madhesh, Dhanusha</td>
                    <td className="px-3 py-2.5"><StatusBadge status="Missing" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-900">ACT-2025-0145</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">ADRA Nepal</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">Lumbini, Rupandehi</td>
                    <td className="px-3 py-2.5"><StatusBadge status="Pending" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AwaitingDataOverlay>
      </div>
    </div>
  );
}
