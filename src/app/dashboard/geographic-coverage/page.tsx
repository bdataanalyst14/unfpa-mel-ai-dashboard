import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import GeographicCoverageMap from '@/components/GeographicCoverageMap';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { combinedSummary } from '@/data/mock/combined-summary';
import { MapPin, Globe, Compass, AlertCircle } from 'lucide-react';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { DistrictActivityChart } from './client-charts';

const districtData = [
  { name: 'Kathmandu', value: 34, participants: 1250 },
  { name: 'Dhanusha', value: 28, participants: 980 },
  { name: 'Morang', value: 26, participants: 850 },
  { name: 'Kailali', value: 22, participants: 780 },
  { name: 'Surkhet', value: 20, participants: 680 },
  { name: 'Rupandehi', value: 19, participants: 620 },
  { name: 'Kaski', value: 18, participants: 720 },
  { name: 'Rukum West', value: 12, participants: 420 },
  { name: 'Humla', value: 8, participants: 180 },
];

const coverageGaps = [
  { district: 'Jajarkot', province: 'Karnali', projectGap: 'CP9 SRHR', status: 'Low Activity', lastActive: '45 days ago' },
  { district: 'Bajhang', province: 'Sudurpashchim', projectGap: 'CP9 GEWE', status: 'No Activity', lastActive: 'Never' },
  { district: 'Sarlahi', province: 'Madhesh', projectGap: 'KOICA AYSRHR', status: 'Pending Startup', lastActive: 'Planned' },
  { district: 'Rolpa', province: 'Lumbini', projectGap: 'CP9 SRHR', status: 'Low Activity', lastActive: '30 days ago' },
];

export default async function GeographicCoveragePage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') {
    return <BigQueryRouteView route="geographic-coverage" searchParams={resolvedParams} />;
  }
  const pageData = await getDashboardPageData('geographic-coverage', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';

  const getMetric = (label: string, fallback: string | number) => {
    if (live) {
      const metric = pageData.metrics.find(m => m.label.toLowerCase() === label.toLowerCase());
      return metric ? metric.value : fallback;
    }
    return fallback;
  };

  const districtsCovered = getMetric('Active districts', combinedSummary.districtsCovered);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geographic Coverage"
        subtitle={live ? "Production V1 uses only approved aggregate BigQuery views." : "Tracking provincial implementation density, district-level activities, and coverage gaps."}
      />

      <DataSourceStatusPanel route="geographic-coverage" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Provinces Covered"
          value="7 / 7"
          change="Prototype footprint; validate before live use"
          icon={Globe}
        />
        <KpiCard
          label="Districts Covered"
          value={`${districtsCovered} / 77`}
          change="Target districts active"
          changeType="positive"
          icon={MapPin}
        />
        <AwaitingDataOverlay active={live} message="Palika-level coverage disabled pending approved target registry.">
          <KpiCard
            label="Estimated Palikas"
            value="182"
            change="Municipal units reached"
            changeType="neutral"
            icon={Compass}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={live} message="Coverage gaps logic pending BigQuery validation.">
          <KpiCard
            label="Coverage Gaps"
            value="3 Districts"
            change="Requires target intervention"
            changeType="negative"
            icon={AlertCircle}
          />
        </AwaitingDataOverlay>
      </div>

      {/* Main Grid: Stylized Map Placeholder & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Local-unit map card */}
        <AwaitingDataOverlay active={live} message="Granular boundary map disabled in production pending spatial approval." className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Nepal Coverage Footprint</h3>
              <p className="text-xs text-gray-500 mb-4">Local-unit boundary layer for coverage analysis</p>
            </div>
            <GeographicCoverageMap />
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-500 leading-normal">
                Boundary source: converted Local Unit shapefile served from dashboard public map assets; coverage values remain prototype until BigQuery/geography validation passes.
              </p>
            </div>
          </div>
        </AwaitingDataOverlay>

        {/* Activity and Reaches charts */}
        <AwaitingDataOverlay active={live} message="District activity density charts disabled pending time-series contracts." className="lg:col-span-2">
          <ChartCard
            title="District Operations & Activity Density"
            subtitle="Top active districts by activity count"
          >
            <DistrictActivityChart data={districtData} />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Coverage gaps table */}
      <AwaitingDataOverlay active={live} message="Coverage gaps logic pending baseline targets integration.">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Intervention Gaps & Coverage Flags</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">Project Component Gap</th>
                  <th className="px-4 py-3">Status Flag</th>
                  <th className="px-4 py-3 text-right">Last Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {coverageGaps.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-950">{item.district}</td>
                    <td className="px-4 py-3 text-xs">{item.province}</td>
                    <td className="px-4 py-3 text-xs text-[#004B87] font-semibold">{item.projectGap}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'No Activity' ? 'text-red-700 bg-red-50 border border-red-100' :
                        item.status === 'Low Activity' ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                        'text-blue-700 bg-blue-50 border border-blue-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-600 font-mono">{item.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AwaitingDataOverlay>
    </div>
  );
}
