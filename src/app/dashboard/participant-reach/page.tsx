'use client';
import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import ParticipantSexChart from '@/components/charts/participant-sex-chart';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { combinedSummary } from '@/data/mock/combined-summary';
import { Users, UserPlus, HelpCircle, Eye, Accessibility, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';

const ageData = [
  { name: 'Youth (< 24)', value: 6491, color: '#004B87' },
  { name: 'Adult (25-49)', value: 10200, color: '#FF6600' },
  { name: 'Senior (50+)', value: 1856, color: '#9CA3AF' },
];

const casteData = [
  { name: 'Janajati', value: 5193, color: '#004B87' },
  { name: 'Brahmin/Chhetri', value: 4822, color: '#0066B3' },
  { name: 'Madhesi', value: 3709, color: '#FF6600' },
  { name: 'Dalit', value: 2967, color: '#FF8533' },
  { name: 'Muslim', value: 1112, color: '#10B981' },
  { name: 'Other', value: 744, color: '#9CA3AF' },
];

const inclusionDistricts = [
  { district: 'Kathmandu', total: 1250, femalePct: 62.4, disabilityPct: 4.8, marginalizedPct: 22.4 },
  { district: 'Dhanusha', total: 980, femalePct: 58.0, disabilityPct: 3.9, marginalizedPct: 35.8 },
  { district: 'Morang', total: 850, femalePct: 61.2, disabilityPct: 4.2, marginalizedPct: 29.5 },
  { district: 'Kaski', total: 720, femalePct: 65.0, disabilityPct: 5.1, marginalizedPct: 18.0 },
  { district: 'Surkhet', total: 680, femalePct: 59.5, disabilityPct: 3.5, marginalizedPct: 41.2 },
];

export default function ParticipantReachPage() {
  const femalePct = ((combinedSummary.femaleParticipants / combinedSummary.reportableParticipants) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participant & Reach Profile"
        subtitle="Operational reach analytics disaggregated by gender, age groups, caste, ethnicity, and disability."
      />

      <DataSourceStatusPanel route="participant-reach" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Reached"
          value={combinedSummary.reportableParticipants}
          change="Unique registered attendees"
          icon={Users}
        />
        <KpiCard
          label="Direct Beneficiaries"
          value={combinedSummary.beneficiaries}
          change="Target population"
          changeType="positive"
          icon={UserPlus}
        />
        <KpiCard
          label="Female Share"
          value={`${femalePct}%`}
          change={`${combinedSummary.femaleParticipants.toLocaleString()} females reached`}
          changeType="positive"
          icon={Percent}
        />
        <KpiCard
          label="Guests / Stakeholders"
          value={combinedSummary.guests}
          change="Non-reportable categories"
          changeType="neutral"
          icon={HelpCircle}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Gender Profile"
          subtitle="Participant share by sex"
          className="lg:col-span-1"
        >
          <ParticipantSexChart />
        </ChartCard>

        <ChartCard
          title="Age Profile"
          subtitle="Participant share by age category"
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                formatter={(value: number) => [value.toLocaleString(), 'Participants']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Social Inclusion Profile"
          subtitle="Inclusion by caste and ethnicity classification"
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={casteData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                formatter={(value: number) => [value.toLocaleString(), 'Participants']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {casteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Inclusion by District Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Accessibility className="h-5 w-5 text-[#004B87]" />
          <h3 className="text-sm font-semibold text-gray-900">Geographic Inclusion & Disaggregation Ratios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3 text-right">Total Reached</th>
                <th className="px-4 py-3 text-right">Female Share (%)</th>
                <th className="px-4 py-3 text-right">Disability Rate (%)</th>
                <th className="px-4 py-3 text-right">Marginalized Groups Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {inclusionDistricts.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-950">{item.district}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{item.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">{item.femalePct}%</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{item.disabilityPct}%</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{item.marginalizedPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
