'use client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import PrivacyBanner from '@/components/dashboard/privacy-banner';
import GbvSummaryChart from '@/components/charts/gbv-summary-chart';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { gbvServiceData } from '@/data/mock/gbv-services';
import { suppressSmallCount } from '@/lib/privacy-rules';
import { ShieldCheck, HeartHandshake, PhoneCall, Layers, EyeOff } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function GbvOcmcSummaryPage() {
  const aggregateTotal = gbvServiceData.reduce((sum, r) => sum + r.totalSurvivors, 0);
  const aggregateFemale = gbvServiceData.reduce((sum, r) => sum + r.femaleSurvivors, 0);
  const aggregateMale = gbvServiceData.reduce((sum, r) => sum + r.maleSurvivors, 0);
  const aggregateReferral = gbvServiceData.reduce((sum, r) => sum + r.referralCount, 0);
  const aggregateFollowUp = gbvServiceData.reduce((sum, r) => sum + r.followUpCount, 0);

  // Group by caste/ethnicity overall
  const overallCaste: Record<string, number> = {};
  gbvServiceData.forEach(r => {
    Object.entries(r.byCasteEthnicity).forEach(([caste, val]) => {
      overallCaste[caste] = (overallCaste[caste] || 0) + val;
    });
  });
  const casteChartData = Object.entries(overallCaste).map(([caste, val]) => ({
    name: caste,
    survivors: val
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="GBV / OCMC Service Summary"
        subtitle="Mock/prototype GBV and OCMC service summary; live activation blocked pending privacy sign-off and server-side suppression."
      />

      <DataSourceStatusPanel route="gbv-ocmc" />

      {/* Privacy Warning Banner */}
      <PrivacyBanner />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Survivors Reached"
          value={aggregateTotal}
          change="Aggregated health visits"
          icon={HeartHandshake}
        />
        <KpiCard
          label="Female Survivors"
          value={aggregateFemale}
          change="94.6% of caseload"
          changeType="neutral"
          icon={ShieldCheck}
        />
        <KpiCard
          label="Referrals Made"
          value={aggregateReferral}
          change="External services connected"
          changeType="positive"
          icon={PhoneCall}
        />
        <KpiCard
          label="Follow-ups Conducted"
          value={aggregateFollowUp}
          change="Casework tracking visits"
          changeType="positive"
          icon={Layers}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="GBV Caseload Trends by Province (Aggregated)"
          subtitle="Visits by OCMC province locations (values <=4 suppressed)"
        >
          <GbvSummaryChart />
        </ChartCard>

        <ChartCard
          title="Social Inclusion Disaggregation"
          subtitle="Survivors reached by Caste / Ethnicity classification"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={casteChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                formatter={(value: number) => [suppressSmallCount(value), 'Survivors']}
              />
              <Bar dataKey="survivors" fill="#004B87" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Aggregated Statistics Matrix (Suppressing small cells) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <EyeOff className="h-5 w-5 text-[#FF6600]" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">District Service Statistics Matrix</h3>
            <p className="text-xs text-gray-500">Includes OCMC-specific services and cell suppression protocol checks (&lt; 5)</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3 text-right">Total Cases</th>
                <th className="px-4 py-3 text-right">Female Survivors</th>
                <th className="px-4 py-3 text-right">Male Survivors</th>
                <th className="px-4 py-3 text-right">Under 15 Share</th>
                <th className="px-4 py-3 text-right">Referral Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {gbvServiceData.map((item, index) => {
                const referralRate = ((item.referralCount / item.totalSurvivors) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-950">{item.province}</td>
                    <td className="px-4 py-3 text-gray-900">{item.district}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{suppressSmallCount(item.totalSurvivors)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{suppressSmallCount(item.femaleSurvivors)}</td>
                    {/* Applying small-cell suppression here */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-amber-600">
                      {suppressSmallCount(item.maleSurvivors)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{suppressSmallCount(item.under15)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 font-semibold">{referralRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

