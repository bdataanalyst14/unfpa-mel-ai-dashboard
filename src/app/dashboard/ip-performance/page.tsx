import BigQueryRouteView from '@/components/dashboard/bigquery-route-view';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import IpRankingChart from '@/components/charts/ip-ranking-chart';
import EvidenceCompletionChart from '@/components/charts/evidence-completion-chart';
import DataQualityChart from '@/components/charts/data-quality-chart';
import ManagementActionTable from '@/components/dashboard/management-action-table';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { combinedSummary } from '@/data/mock/combined-summary';
import { Building, Award, ShieldAlert, FileClock } from 'lucide-react';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';

const ipScorecards = [
  { name: 'ADRA Nepal', events: 45, compliance: 92.5, late: 1, quality: 'Excellent' },
  { name: 'FPAN', value: 38, compliance: 88.0, late: 2, quality: 'Good' },
  { name: 'WOREC', value: 35, compliance: 81.2, late: 4, quality: 'Fair' },
  { name: 'CREHPA', value: 29, compliance: 90.0, late: 1, quality: 'Good' },
  { name: 'Restless Dev', value: 24, compliance: 85.0, late: 2, quality: 'Good' },
  { name: 'NFCC', value: 21, compliance: 86.5, late: 1, quality: 'Good' },
];

export default async function IpPerformancePage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (getDashboardDataMode() === 'bigquery') {
    return <BigQueryRouteView route="ip-performance" searchParams={resolvedParams} />;
  }
  const pageData = await getDashboardPageData('ip-performance', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';

  const getMetric = (label: string, fallback: string | number) => {
    if (live) {
      const metric = pageData.metrics.find(m => m.label.toLowerCase() === label.toLowerCase());
      return metric ? metric.value : fallback;
    }
    return fallback;
  };

  const activePartners = getMetric('Reporting partners', combinedSummary.ipsReporting);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Implementing Partner (IP) Performance"
        subtitle={live ? "Production V1 uses only approved aggregate BigQuery views." : "Tracking partner activity submissions, reporting timeliness, data quality, and evidence compliance."}
      />

      <DataSourceStatusPanel route="ip-performance" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Partners"
          value={activePartners}
          change={live ? "Verified reporting entities" : "Currently submitting data"}
          icon={Building}
        />
        <AwaitingDataOverlay active={live} message="Quality scoring disabled pending approved rule engines.">
          <KpiCard
            label="Avg Quality Score"
            value={`${combinedSummary.dataQualityScore}%`}
            change="IP data accuracy aggregate"
            changeType="positive"
            icon={Award}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={live} message="Timeliness tracking disabled pending baseline contracts.">
          <KpiCard
            label="Late Submissions"
            value={combinedSummary.lateSubmissions}
            change="Days to upload > 15 days"
            changeType="negative"
            icon={FileClock}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={live} message="Validation tracking pending BigQuery integration.">
          <KpiCard
            label="Pending Validations"
            value={combinedSummary.pendingValidation}
            change="Awaiting M&E unit review"
            changeType="neutral"
            icon={ShieldAlert}
          />
        </AwaitingDataOverlay>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AwaitingDataOverlay active={live} message="Volume rankings disabled pending valid aggregated groupings." className="lg:col-span-1">
          <ChartCard
            title="IP Activity Volume Ranking"
            subtitle="Total activities logged by partner"
          >
            <IpRankingChart />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={live} message="Evidence completeness tracking disabled." className="lg:col-span-1">
          <ChartCard
            title="Evidence Completeness Status"
            subtitle="Distribution of evidence by partner"
          >
            <EvidenceCompletionChart />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={live} message="Quality cross-tabs disabled pending logic approval." className="lg:col-span-1">
          <ChartCard
            title="Data Quality vs. Disaggregation"
            subtitle="Score metrics comparison"
          >
            <DataQualityChart />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scorecard table */}
        <AwaitingDataOverlay active={live} message="Granular partner scorecards disabled pending M&E logic approval." className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Partner Performance Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Implementing Partner</th>
                    <th className="px-4 py-3 text-right">Compliance Rate (%)</th>
                    <th className="px-4 py-3 text-right">Late Reports</th>
                    <th className="px-4 py-3 text-right">M&E Quality Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {ipScorecards.map((ip, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{ip.name}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">{ip.compliance || 85.0}%</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600">{ip.late}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ip.quality === 'Excellent' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                          ip.quality === 'Good' ? 'text-blue-700 bg-blue-50 border border-blue-100' :
                          'text-amber-700 bg-amber-50 border border-amber-100'
                        }`}>
                          {ip.quality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AwaitingDataOverlay>

        {/* Management actions */}
        <AwaitingDataOverlay active={live} message="AI/Management actions disabled in production." className="lg:col-span-1">
          <ManagementActionTable />
        </AwaitingDataOverlay>
      </div>
    </div>
  );
}
