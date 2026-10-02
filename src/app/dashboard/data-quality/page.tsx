import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import DataQualityChart from '@/components/charts/data-quality-chart';
import EvidenceCompletionChart from '@/components/charts/evidence-completion-chart';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { Award, FileWarning, HelpCircle, ShieldCheck } from 'lucide-react';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';

export default async function DataQualityPage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageData = await getDashboardPageData('data-quality', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';
  
  // The route exists but data is strictly disabled per production contract
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality & Evidence"
        subtitle="Not currently calculated — pending validated latest-snapshot logic."
      />

      <DataSourceStatusPanel route="data-quality" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AwaitingDataOverlay active={true} message="Not currently calculated — pending validated latest-snapshot logic.">
          <KpiCard
            label="Data Quality Score"
            value="N/A"
            change="Target threshold > 80%"
            changeType="neutral"
            icon={Award}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={true} message="Not currently calculated — pending validated latest-snapshot logic.">
          <KpiCard
            label="Pending Validation"
            value="N/A"
            change="Awaiting M&E Unit approval"
            changeType="neutral"
            icon={HelpCircle}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={true} message="Evidence tracking pending live attachment integration.">
          <KpiCard
            label="Missing Evidence"
            value="N/A"
            change="Activities without uploads"
            changeType="neutral"
            icon={FileWarning}
          />
        </AwaitingDataOverlay>
        <AwaitingDataOverlay active={true} message="Validation tracking pending BigQuery integration.">
          <KpiCard
            label="Submission Validation Rate"
            value="N/A"
            change="Approved vs Rejected ratio"
            changeType="neutral"
            icon={ShieldCheck}
          />
        </AwaitingDataOverlay>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AwaitingDataOverlay active={true} message="Quality cross-tabs disabled pending logic approval." className="lg:col-span-1">
          <ChartCard
            title="Implementing Partner Reporting Scores"
            subtitle="Comparison of quality compliance and disaggregation checks"
          >
            <DataQualityChart />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={true} message="Evidence tracking disabled pending attachment links." className="lg:col-span-1">
          <ChartCard
            title="Evidence Upload Status by IP"
            subtitle="Aggregated files uploaded, pending reviews, and missing cases"
          >
            <EvidenceCompletionChart />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaggregation Check list */}
        <AwaitingDataOverlay active={true} message="Granular row validations disabled pending approved data contracts." className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Disaggregation &amp; Consistency Validations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Activity ID</th>
                    <th className="px-4 py-3">Implementing Partner</th>
                    <th className="px-4 py-3">Check Type</th>
                    <th className="px-4 py-3">Result Flag</th>
                    <th className="px-4 py-3">Details / Calculation Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {/* Values removed */}
                </tbody>
              </table>
            </div>
          </div>
        </AwaitingDataOverlay>

        {/* Missing Evidence tracker */}
        <AwaitingDataOverlay active={true} message="Evidence file status tracking disabled pending implementation." className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Evidence Review Status</h3>
              <p className="text-xs text-gray-500 leading-normal mb-4">
                Implementing partners are required to upload signed attendance sheets and event photos. Submissions missing validation will remain in provisional status.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-600">Pending Review Files</span>
                <span className="text-sm font-bold text-amber-600 font-mono">N/A</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-600">Late Attachments</span>
                <span className="text-sm font-bold text-red-500 font-mono">N/A</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-600">Total Validated Evidence</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">N/A</span>
              </div>
            </div>
          </div>
        </AwaitingDataOverlay>
      </div>
    </div>
  );
}
