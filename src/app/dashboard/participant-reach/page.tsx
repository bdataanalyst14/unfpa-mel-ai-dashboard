import PageHeader from '@/components/layout/page-header';
import KpiCard from '@/components/dashboard/kpi-card';
import ChartCard from '@/components/dashboard/chart-card';
import ParticipantSexChart from '@/components/charts/participant-sex-chart';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import AwaitingDataOverlay from '@/components/dashboard/awaiting-data-overlay';

import { combinedSummary } from '@/data/mock/combined-summary';
import { Users, UserPlus, HelpCircle, Accessibility, Percent } from 'lucide-react';

import { getDashboardPageData } from '@/lib/server/dashboard-page-data-service';
import type { ExecutiveOverviewFilters } from '@/lib/types';
import { getDashboardDataMode } from '@/lib/server/bigquery-client';
import { getParticipantMetrics } from '@/lib/server/participant-metrics';

import { AgeProfileChart, SocialInclusionChart } from './client-charts';

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

const disabilityData = [
  { name: 'Without Disability', value: 17800, color: '#004B87' },
  { name: 'With Disability', value: 747, color: '#FF6600' },
];

const typeData = [
  { name: 'Community Member', value: 12500, color: '#004B87' },
  { name: 'Service Provider', value: 3200, color: '#0066B3' },
  { name: 'Govt Official', value: 1800, color: '#FF6600' },
  { name: 'CSO Rep', value: 1047, color: '#FF8533' },
];

const orgData = [
  { name: 'Local Gov', value: 850, color: '#004B87' },
  { name: 'Health Facility', value: 620, color: '#0066B3' },
  { name: 'School', value: 410, color: '#FF6600' },
  { name: 'Ward Comm.', value: 320, color: '#FF8533' },
];

const inclusionDistricts = [
  { district: 'Kathmandu', total: 1250, femalePct: 62.4, disabilityPct: 4.8, marginalizedPct: 22.4 },
  { district: 'Dhanusha', total: 980, femalePct: 58.0, disabilityPct: 3.9, marginalizedPct: 35.8 },
  { district: 'Morang', total: 850, femalePct: 61.2, disabilityPct: 4.2, marginalizedPct: 29.5 },
  { district: 'Kaski', total: 720, femalePct: 65.0, disabilityPct: 5.1, marginalizedPct: 18.0 },
  { district: 'Surkhet', total: 680, femalePct: 59.5, disabilityPct: 3.5, marginalizedPct: 41.2 },
];

export default async function ParticipantReachPage({ searchParams }: {
  searchParams?: Promise<ExecutiveOverviewFilters>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageData = await getDashboardPageData('participant-reach', resolvedParams);
  const live = pageData.metadata.componentState === 'live_bigquery';

  const participants = live ? await getParticipantMetrics(pageData.metadata.filtersApplied) : undefined;
  const demographic = live && participants?.metadata.dataSource === 'bigquery' ? participants.demographics.flatMap(group => group.metrics) : [];
  const demographicMetrics = (keys: string[]) => demographic.filter(metric => keys.includes(metric.key)).map(metric => ({ name: metric.label, value: Number(String(metric.value).replace(/[^0-9]/g, '')) || 0, color: '#004B87' }));

  const liveAgeData = live ? demographicMetrics(['below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above']) : ageData;
  const liveCasteData = live ? demographicMetrics(['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast']) : casteData;
  const liveDisabilityData = live ? demographicMetrics(['withdisability', 'nodisability']) : disabilityData;
  const renderDisability = liveDisabilityData.length ? liveDisabilityData : disabilityData;

  const getMetric = (label: string, fallback: string | number) => {
    if (live) {
      const metric = pageData.metrics.find(m => m.label.toLowerCase() === label.toLowerCase());
      return metric ? metric.value : fallback;
    }
    return fallback;
  };

  const reportableParticipants = getMetric('Reportable participants', combinedSummary.reportableParticipants);
  const femalePct = live
    ? (Number(String(getMetric('Female participants', 0)).replace(/[^0-9]/g, '')) / Number(String(reportableParticipants).replace(/[^0-9]/g, '')) * 100 || 0).toFixed(1)
    : ((combinedSummary.femaleParticipants / combinedSummary.reportableParticipants) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participant & Reach Profile"
        subtitle={live ? "Production V1 uses only approved aggregate BigQuery views." : "Operational reach analytics disaggregated by gender, age groups, caste, ethnicity, and disability."}
      />

      <DataSourceStatusPanel route="participant-reach" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Reached"
          value={reportableParticipants}
          change={live ? "Verified aggregate count" : "Unique registered attendees"}
          icon={Users}
        />
        <AwaitingDataOverlay active={live} message="Target beneficiaries disabled pending population crosswalk.">
          <KpiCard
            label="Direct Beneficiaries"
            value={combinedSummary.beneficiaries}
            change="Target population"
            changeType="positive"
            icon={UserPlus}
          />
        </AwaitingDataOverlay>
        <KpiCard
          label="Female Share"
          value={`${femalePct}%`}
          change={live ? "From valid disaggregations" : `${combinedSummary.femaleParticipants.toLocaleString()} females reached`}
          changeType="positive"
          icon={Percent}
        />
        <AwaitingDataOverlay active={live} message="Guest tracking disabled pending verification rules.">
          <KpiCard
            label="Guests / Stakeholders"
            value={combinedSummary.guests}
            change="Non-reportable categories"
            changeType="neutral"
            icon={HelpCircle}
          />
        </AwaitingDataOverlay>
      </div>

      {/* Core Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartCard
            title="Gender Profile"
            subtitle="Participant share by sex"
          >
            <ParticipantSexChart />
          </ChartCard>
        </div>

        <div className="lg:col-span-1">
          <ChartCard
            title="Age Profile"
            subtitle="Participant share by age category (Source bands can overlap)"
          >
            <AgeProfileChart data={liveAgeData} />
          </ChartCard>
        </div>

        <div className="lg:col-span-1">
          <ChartCard
            title="Social Inclusion Profile"
            subtitle="Inclusion by caste and ethnicity classification"
          >
            <SocialInclusionChart data={liveCasteData} />
          </ChartCard>
        </div>
      </div>

      {/* Additional Classifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartCard
            title="Disability Profile"
            subtitle="Participants by disability status"
          >
            <AgeProfileChart data={renderDisability} />
          </ChartCard>
        </div>

        <AwaitingDataOverlay active={live} message="Participant type classifications disabled pending metadata registry." className="lg:col-span-1">
          <ChartCard
            title="Participant Type"
            subtitle="Distribution by attendee category"
          >
            <SocialInclusionChart data={typeData} />
          </ChartCard>
        </AwaitingDataOverlay>

        <AwaitingDataOverlay active={live} message="Organizational data disabled pending metadata registry." className="lg:col-span-1">
          <ChartCard
            title="Organization / Position"
            subtitle="Institutional and role affiliation"
          >
            <SocialInclusionChart data={orgData} />
          </ChartCard>
        </AwaitingDataOverlay>
      </div>

      {/* Inclusion by District Table */}
      <AwaitingDataOverlay active={live} message="Granular geographic inclusion matrices disabled pending approved aggregate contracts.">
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
      </AwaitingDataOverlay>
    </div>
  );
}
