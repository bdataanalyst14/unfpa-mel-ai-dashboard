'use client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import IndicatorStatusChart from '@/components/charts/indicator-status-chart';
import TargetVsActualChart from '@/components/charts/target-vs-actual-chart';
import StatusBadge from '@/components/dashboard/status-badge';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { cpdIndicators } from '@/data/mock/cpd-indicators';
import { unsdcfIndicators } from '@/data/mock/unsdcf-sp-indicators';
import { Target, CheckCircle2, AlertTriangle, XCircle, BarChart } from 'lucide-react';

export default function IndicatorProgressPage() {
  const onTrackCount = cpdIndicators.filter(i => i.status === 'On Track').length;
  const watchCount = cpdIndicators.filter(i => i.status === 'Watch').length;
  const offTrackCount = cpdIndicators.filter(i => i.status === 'Off Track').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicator Progress"
        subtitle="Prototype indicator tracking using demo samples; pending final M&E validation and not for official programme sign-off."
      />

      <DataSourceStatusPanel route="indicator-progress" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Indicators Tracked"
          value={cpdIndicators.length}
          change="Across all output clusters"
          icon={Target}
        />
        <KpiCard
          label="On Track"
          value={onTrackCount}
          change="Achievement rate &gt;= 80%"
          changeType="positive"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Watch"
          value={watchCount}
          change="Achievement rate 50% - 79%"
          changeType="neutral"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Off Track"
          value={offTrackCount}
          change="Achievement rate &lt; 50%"
          changeType="negative"
          icon={XCircle}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="CPD Key Targets vs. Achievements (Absolute)"
          subtitle="Comparison of Q2 targets and recorded progress values"
        >
          <TargetVsActualChart />
        </ChartCard>

        <ChartCard
          title="Indicator Overall Status Distribution"
          subtitle="Breakdown of tracking categories"
        >
          <IndicatorStatusChart />
        </ChartCard>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPD Indicator List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">CPD Q2 Output Indicators (demo sample only)</h3>
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100 sticky top-0 bg-white">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Indicator Description</th>
                  <th className="px-3 py-2 text-right">Target</th>
                  <th className="px-3 py-2 text-right">Actual</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {cpdIndicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-900 font-semibold">{ind.code}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 leading-normal max-w-md">{ind.description}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium">{ind.target.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-gray-950">{ind.actual.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right"><StatusBadge status={ind.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* UNSDCF/SP Matrix Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-5 w-5 text-[#004B87]" />
            <h3 className="text-sm font-semibold text-gray-900">UNSDCF &amp; Strategic Plan Mappings</h3>
          </div>
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100 sticky top-0 bg-white">
                <tr>
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {unsdcfIndicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-xs text-gray-600">{ind.framework}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-900">{ind.code}</td>
                    <td className="px-3 py-2.5 text-right"><StatusBadge status={ind.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


