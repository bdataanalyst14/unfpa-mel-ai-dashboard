import { EyeOff, HeartHandshake, Layers, PhoneCall, ShieldCheck } from 'lucide-react';

import GbvSummaryChart from '@/components/charts/gbv-summary-chart';
import ChartCard from '@/components/dashboard/chart-card';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';
import KpiCard from '@/components/dashboard/kpi-card';
import EmptyState from '@/components/dashboard/empty-state';
import PrivacyBanner from '@/components/dashboard/privacy-banner';
import PageHeader from '@/components/layout/page-header';
import { getSafeGbvMockDashboardData } from '@/lib/server/gbv-mock-dashboard-service';
import { mainData } from '@/data/mock/main-data';
import {
  buildDashboardFilterOptions,
  parseDashboardFilters,
} from '@/lib/dashboard-filters';

export default async function GbvOcmcSummaryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseDashboardFilters(
    await searchParams,
    buildDashboardFilterOptions(mainData),
  );
  const unsupportedForGbv =
    filters.year ||
    filters.quarter ||
    filters.project ||
    filters.implementingPartner;
  const data = getSafeGbvMockDashboardData(filters.province || undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="GBV / OCMC Service Summary"
        subtitle="Mock/prototype GBV and OCMC service summary; live activation blocked pending privacy sign-off and server-side suppression."
      />

      <DataSourceStatusPanel route="gbv-ocmc" />
      <PrivacyBanner />

      {unsupportedForGbv ? (
        <EmptyState detail="The selected Year, Quarter, Project, or Implementing Partner is not present in the approved GBV mock contract. Clear those filters; live GBV data remains blocked." />
      ) : (
      <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Survivors Reached"
          value={data.kpis.total.displayValue}
          change="Aggregated health visits"
          icon={HeartHandshake}
        />
        <KpiCard
          label="Female Survivors"
          value={data.kpis.female.displayValue}
          change={`${data.kpis.femaleShare.displayValue} of caseload`}
          changeType="neutral"
          icon={ShieldCheck}
        />
        <KpiCard
          label="Referrals Made"
          value={data.kpis.referrals.displayValue}
          change="External services connected"
          changeType="positive"
          icon={PhoneCall}
        />
        <KpiCard
          label="Follow-ups Conducted"
          value={data.kpis.followUps.displayValue}
          change="Casework tracking visits"
          changeType="positive"
          icon={Layers}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="GBV Caseload Trends by Province (Aggregated)"
          subtitle="Visits by OCMC province locations (non-zero values below 5 suppressed)"
        >
          <GbvSummaryChart data={data.provinceChart} valueLabel="Survivors reached" />
        </ChartCard>

        <ChartCard
          title="Social Inclusion Disaggregation"
          subtitle="Survivors reached by caste / ethnicity classification"
        >
          <GbvSummaryChart data={data.casteChart} valueLabel="Survivors" />
        </ChartCard>
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <EyeOff className="h-5 w-5 text-[#FF6600]" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">District Service Statistics Matrix</h3>
            <p className="text-xs text-gray-500">
              OCMC service aggregates with count and derived-percentage suppression
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 font-mono text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3 text-right">Total Cases</th>
                <th className="px-4 py-3 text-right">Female Survivors</th>
                <th className="px-4 py-3 text-right">Male Survivors</th>
                <th className="px-4 py-3 text-right">Under 15 Share</th>
                <th className="px-4 py-3 text-right">Referral Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.rows.map((item) => (
                <tr key={`${item.province}-${item.district}`} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-950">{item.province}</td>
                  <td className="px-4 py-3 text-gray-900">{item.district}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{item.total.displayValue}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{item.female.displayValue}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-amber-700">{item.male.displayValue}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{item.under15Share.displayValue}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">{item.referralRate.displayValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
