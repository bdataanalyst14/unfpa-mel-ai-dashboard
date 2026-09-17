'use client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import DataQualityChart from '@/components/charts/data-quality-chart';
import EvidenceCompletionChart from '@/components/charts/evidence-completion-chart';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { combinedSummary } from '@/data/mock/combined-summary';
import { Award, FileWarning, HelpCircle, ShieldCheck } from 'lucide-react';

const disaggregationChecks = [
  { id: 'ACT-2025-0014', ip: 'ADRA Nepal', type: 'Gender Check', status: 'Failed', details: 'Female (15) + Male (12) != Total (30)' },
  { id: 'ACT-2025-0062', ip: 'WOREC', type: 'Age Check', status: 'Passed', details: 'Youth (10) <= Total (25)' },
  { id: 'ACT-2025-0105', ip: 'FPAN', type: 'Caste Check', status: 'Failed', details: 'Marginalized (32) > Total (30)' },
  { id: 'ACT-2025-0199', ip: 'CREHPA', type: 'Location Check', status: 'Passed', details: 'All palika GPS coordinates present' },
];

export default function DataQualityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality & Evidence"
        subtitle="Prototype quality/evidence controls using demo samples; pending final source and M&E validation."
      />

      <DataSourceStatusPanel route="data-quality" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Data Quality Score"
          value={`${combinedSummary.dataQualityScore}%`}
          change="Target threshold > 80%"
          changeType="positive"
          icon={Award}
        />
        <KpiCard
          label="Pending Validation"
          value={combinedSummary.pendingValidation}
          change="Awaiting M&E Unit approval"
          changeType="neutral"
          icon={HelpCircle}
        />
        <KpiCard
          label="Missing Evidence"
          value={combinedSummary.missingEvidence}
          change="Activities without uploads"
          changeType="negative"
          icon={FileWarning}
        />
        <KpiCard
          label="Submission Validation Rate"
          value="90.9%"
          change="Approved vs Rejected ratio"
          changeType="positive"
          icon={ShieldCheck}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Implementing Partner Reporting Scores"
          subtitle="Comparison of quality compliance and disaggregation checks"
        >
          <DataQualityChart />
        </ChartCard>

        <ChartCard
          title="Evidence Upload Status by IP"
          subtitle="Aggregated files uploaded, pending reviews, and missing cases"
        >
          <EvidenceCompletionChart />
        </ChartCard>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaggregation Check list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
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
                {disaggregationChecks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-950">{item.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{item.ip}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Failed' ? 'text-red-700 bg-red-50 border border-red-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Missing Evidence tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Evidence Review Status</h3>
            <p className="text-xs text-gray-500 leading-normal mb-4">
              Implementing partners are required to upload signed attendance sheets and event photos. Submissions missing validation will remain in provisional status.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-semibold text-gray-600">Pending Review Files</span>
              <span className="text-sm font-bold text-amber-600 font-mono">18 Events</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-semibold text-gray-600">Late Attachments</span>
              <span className="text-sm font-bold text-red-500 font-mono">14 Uploads</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-semibold text-gray-600">Total Validated Evidence</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">288 Uploads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

