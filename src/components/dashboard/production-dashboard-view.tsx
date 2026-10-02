import type { ReactNode } from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import KpiCard from './kpi-card';
import DrillthroughButton from './drillthrough-button';
import AggregateBars from './aggregate-bars';
import AggregateActivityTable from './aggregate-activity-table';
import LocalUnitCoverageMap from './local-unit-coverage-map';
import type { DashboardPageData, DashboardPageMetric, DashboardRouteKey } from '@/lib/server/dashboard-page-data-service';
import type { ParticipantData } from '@/lib/participant-contract';

function Panel({ title, children, subtitle, className = '' }: { title: string; children: ReactNode; subtitle?: string; className?: string }) {
  return <section className={`min-w-0 self-start rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="mt-1 text-xs leading-relaxed text-gray-500">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </section>;
}

function Pending({ title, reason }: { title: string; reason: string }) {
  return <Panel title={title}><div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-semibold text-slate-700">Data not yet available</p>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">{reason}</p>
  </div></Panel>;
}

function MetricPanel({ title, metrics, subtitle }: { title: string; metrics: DashboardPageMetric[]; subtitle?: string }) {
  return metrics.length ? <Panel title={title} subtitle={subtitle}><AggregateBars metrics={metrics} label={title} /></Panel>
    : <Pending title={title} reason="No approved aggregate values are available for this selection." />;
}

function ManagementAttention({ data }: { data: DashboardPageData }) {
  const live = data.metadata.componentState === 'live_bigquery';
  const value = (label: string) => data.metrics.find(metric => metric.label === label)?.value ?? 'Not available';
  return <Panel title="Management Attention" subtitle="Advisory only · Human review required">
    <div className="grid gap-5 lg:grid-cols-3">
      <div><h3 className="text-xs font-semibold text-[#004B87]">Operational summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">{live
          ? `The selected reporting scope contains ${value('Total events')} events and ${value('Total participants')} participant attendance records across ${value('Districts covered')} districts. Attendance records do not represent unique people.`
          : 'An operational summary cannot be produced for this selection until approved aggregate data is available.'}</p>
      </div>
      <div><h3 className="text-xs font-semibold text-[#004B87]">Review priorities</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">Confirm the reporting period and source freshness before using these figures. Review participant inclusion and geographic reach with programme focal points. Volume alone does not establish programme performance.</p>
        <div className="mt-3"><DrillthroughButton href="/dashboard/participant-reach" label="Review participant reach" /></div>
      </div>
      <div><h3 className="text-xs font-semibold text-[#004B87]">Evidence before decisions</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">Target achievement, partner risk rankings and Data Quality Score remain unavailable. Validate evidence before making funding, performance or donor-reporting decisions. No actions are assigned or executed automatically.</p>
      </div>
    </div>
  </Panel>;
}

const pendingPanels: Partial<Record<DashboardRouteKey, Array<[string, string]>>> = {
  'activity-progress': [
    ['Programme Progress by Project', 'Planned and completed activity targets are not yet available.'],
    ['Progress by IP / Partner', 'Partner progress against plans is not yet available.'],
    ['Activity Type', 'Event-type classifications are not supported by the current reporting data.'],
    ['Monthly Activity Trend', 'A validated event time series is not yet available.'],
    ['Delayed Activities & Evidence', 'Due dates, completion status and evidence validation are not yet available.'],
  ],
  'indicator-progress': [
    ['Targets vs. Achievements', 'Approved targets and achievement definitions are not connected.'],
    ['Indicator Performance Status', 'On-track and off-track status cannot be assigned without approved targets.'],
    ['Indicator Detail', 'Only combined indicator totals are available; indicator-level progress remains unavailable.'],
  ],
  'ip-performance': [
    ['IP Activity Volume Ranking', 'The current response contains combined partner totals, not a partner ranking.'],
    ['Participant Reach by IP', 'Partner-level attendance counts are not available in this response.'],
    ['Evidence Completeness Status', 'Evidence completeness by partner is not yet available.'],
    ['Data Quality Scorecard', 'Quality scores are disabled pending validated latest-snapshot calculations.'],
    ['Partner Follow-up', 'No approved overdue-report or corrective-action records are available.'],
  ],
  'data-quality': [
    ['IP Data Quality Scores', 'Scores remain disabled pending a validated latest-snapshot calculation.'],
    ['Evidence Completeness', 'Approved evidence completeness measures are not yet available.'],
    ['Validation Trend', 'Comparable validated snapshots are not yet available.'],
    ['Failed Checks', 'No approved check-level results are available.'],
    ['Correction Tracker', 'No approved correction statuses or assigned follow-up actions are available.'],
  ],
};

export default function ProductionDashboardView({ route, data, participants }: { route: DashboardRouteKey; data: DashboardPageData; participants?: ParticipantData }) {
  const live = data.metadata.componentState === 'live_bigquery';
  const metrics = live ? data.metrics : [];
  const select = (...labels: string[]) => metrics.filter(metric => labels.includes(metric.label));
  const demographic = live && participants?.metadata.dataSource === 'bigquery' ? participants.demographics.flatMap(group => group.metrics) : [];
  const demographicMetrics = (keys: string[]) => demographic.filter(metric => keys.includes(metric.key)).map(metric => ({ label: metric.label, value: metric.displayValue }));
  const districtMetrics = live && participants?.metadata.dataSource === 'bigquery' ? participants.districts.flatMap(group => {
    const count = group.metrics.find(metric => metric.key === 'totalParticipants');
    return count ? [{ label: group.name, value: count.displayValue }] : [];
  }) : [];
  const districtRanking = [...districtMetrics].sort((a, b) => {
    const count = (value: string) => /^\d+$/.test(value) ? Number(value) : -1;
    return count(b.value) - count(a.value) || a.label.localeCompare(b.label);
  }).slice(0, 10);
  const map = <LocalUnitCoverageMap districts={districtMetrics} selectedDistrict={data.metadata.filtersApplied.district} compact={route === 'executive-overview'} />;
  const sex = <MetricPanel title="Participant Profile by Sex" subtitle="Attendance counts; values below five are withheld." metrics={select('Female participants', 'Male participants', 'Other participants')} />;
  const kpis = route === 'executive-overview' || route === 'management-decision-centre'
    ? select('Total events', 'Total participants', 'Districts covered', 'Implementing partners') : metrics;
  const timestamp = data.metadata.freshnessTimestamp;
  const parsed = timestamp ? new Date(timestamp) : null;
  const freshness = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu' }) : 'Not available';
  return <div className="space-y-6">
    <PageHeader title={route === 'management-decision-centre' ? 'Management Decision Centre' : data.pageName}
      subtitle={route === 'management-decision-centre' ? 'Programme review and evidence-based follow-up. Advisory only; human review required.' : 'Programme monitoring from approved aggregate reporting data.'}
      action={route === 'executive-overview' ? <DrillthroughButton href="/dashboard/management-decision-centre" label="Decision Centre" /> : undefined} />
    {!live && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">{data.metadata.componentState === 'no_data' ? 'No approved aggregate data matches the selected filters' : data.metadata.componentState === 'unavailable' ? 'Temporarily unavailable' : route === 'gbv-ocmc' ? 'Privacy blocked' : 'Data not yet available'}</p>
      <p className="mt-1 text-xs leading-relaxed">{data.metadata.message}</p>
    </div>}
    {route !== 'activity-detail' && route !== 'gbv-ocmc' && <section aria-label="Aggregate metrics" className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${route === 'participant-reach' || route === 'ip-performance' ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
      {kpis.map(item => <KpiCard key={item.label} label={item.label} value={item.value} change={item.label === 'Total participants' ? 'Attendance records, not unique people' : undefined} />)}
      {!kpis.length && (route === 'data-quality' ? ['Data Quality Score', 'Rows checked', 'Rows with quality issue', 'Evidence completeness'] : ['Total events', 'Total participants']).map(label => <KpiCard key={label} label={label} value="Not available" change={route === 'data-quality' ? 'Disabled pending validation' : 'No approved values for this selection'} />)}
    </section>}
    {route === 'executive-overview' && <>
      <div className="grid gap-6 xl:grid-cols-3">
        <Pending title="Programme Progress by Project" reason="Planned versus completed activity totals are not yet available." />
        <Pending title="Indicator Performance Status" reason="Approved targets and achievement status are not yet available." />
        <Panel title="Geographic Coverage" subtitle="District reach on the Nepal boundary layer">{map}<div className="mt-3"><DrillthroughButton href="/dashboard/geographic-coverage" /></div></Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {sex}
        <Panel title="IP / Partner Attention"><p className="text-sm leading-relaxed text-gray-600">{live ? `${select('Implementing partners')[0]?.value ?? 'Not available'} implementing partners appear in the selected reporting scope.` : 'Partner reporting totals are not available for this selection.'} Partner risk and performance rankings remain unavailable.</p><div className="mt-4"><DrillthroughButton href="/dashboard/ip-performance" label="Review IP Performance" /></div></Panel>
        <Pending title="Data Quality & Evidence Attention" reason="Data Quality Score is disabled. Review validated evidence before programme sign-off." />
      </div>
      <ManagementAttention data={data} />
    </>}
    {route === 'participant-reach' && <>
      <div className="grid gap-6 xl:grid-cols-3">
        {sex}
        <MetricPanel title="Age Profile" subtitle="Source age bands can overlap; do not add them together." metrics={demographicMetrics(['below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above'])} />
        <MetricPanel title="Social Inclusion Profile" metrics={demographicMetrics(['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast'])} />
        <MetricPanel title="Disability Profile" metrics={demographicMetrics(['withdisability', 'nodisability']).length ? demographicMetrics(['withdisability', 'nodisability']) : select('Participants with disability')} />
        <Pending title="Participant Type" reason="Validated participant-type classifications are not yet available." />
        <Pending title="Organization / Position" reason="Approved organization and role aggregates are not yet available." />
      </div>
      <MetricPanel title="Participant Reach by District" subtitle="Top ten available district attendance counts. Demographic inclusion by district is not yet available." metrics={districtRanking} />
    </>}
    {route === 'geographic-coverage' && <>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Nepal Programme Coverage Map" subtitle="District reach is the available density measure; activity density awaits approved data." className="xl:col-span-2">{map}</Panel>
        <MetricPanel title="District Participant Reach Ranking" subtitle="Top ten available district attendance counts. Suppressed counts are unranked." metrics={districtRanking} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Pending title="Project × District Coverage Matrix" reason="Project-by-district coverage is not available from the current reporting response." />
        <Pending title="Coverage Gaps & Follow-up" reason="Coverage targets are not yet available. Missing data must not be interpreted as an intervention gap." />
      </div>
    </>}
    {route === 'activity-progress' && <MetricPanel title="Activity & Participant Volume" subtitle="Events and attendance counts, not target achievement." metrics={select('Total events', 'Total participants', 'Reportable participants')} />}
    {pendingPanels[route] && <div className="grid gap-6 xl:grid-cols-2">{pendingPanels[route]!.map(([title, reason]) => <Pending key={title} title={title} reason={reason} />)}</div>}
    {route === 'activity-detail' && <AggregateActivityTable metrics={metrics} />}
    {route === 'management-decision-centre' && <>
      <ManagementAttention data={data} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Programme Review Narrative" subtitle="Deterministic summary · Draft for human review">
          <p className="text-sm leading-relaxed text-gray-700">{live ? `Current approved reporting shows ${select('Total events')[0]?.value ?? 'Not available'} events and ${select('Total participants')[0]?.value ?? 'Not available'} participant attendance records. These figures describe reported activity volume. They do not establish target achievement, unique reach or quality of results.` : 'A review narrative requires available approved aggregate data. No narrative figures are substituted.'}</p>
          <p className="mt-3 text-xs text-gray-500">Confirm scope, freshness and evidence with programme owners before external use. This text is not generated by AI.</p>
        </Panel>
        <Pending title="Off-Track Targets & Partner Risks" reason="Risk severity and target status require validated performance and evidence data. No automatic prioritization is applied." />
        <Pending title="Follow-up Action Tracker" reason="No approved assigned-action records are connected. Review and assignment remain with programme managers." />
        <Pending title="AI Narrative Generation" reason="Generative insights remain disabled. Only the aggregate review summary above is available." />
      </div>
    </>}
    {route === 'gbv-ocmc' && <Panel title="GBV / OCMC Privacy Safeguards"><p className="text-sm leading-relaxed text-gray-600">Service summaries remain blocked pending explicit aggregate-reporting and suppression approval. No survivor records, case locations or demographic breakdowns are displayed.</p></Panel>}
    <footer aria-label="BigQuery data source status" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-gray-600">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" />Data source: BigQuery · {live ? 'Live aggregates' : 'No live values displayed'}</span><span>Freshness: {freshness} (Nepal time)</span></div>
      <p>{data.metadata.message}</p>
      {participants && <p>Participant analysis: {participants.metadata.note} A separate demographic refresh timestamp is not supplied.</p>}
      <p className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Aggregate view only. Small counts are withheld as &lt;5. No personal or survivor-level records are shown.</p>
    </footer>
  </div>;
}
