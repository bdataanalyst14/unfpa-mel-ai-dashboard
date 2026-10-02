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
  return <Panel title="Management Attention" subtitle="Advisory only  /  Human review required">
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

export default function ProductionDashboardView({ route, data, participants }: { route: DashboardRouteKey; data: DashboardPageData; participants?: ParticipantData }) {
  const live = data.metadata.componentState === 'live_bigquery';
  const metrics = live ? data.metrics : [];
  const select = (...labels: string[]) => metrics.filter(metric => labels.includes(metric.label));
  const demographic = live && participants?.metadata.dataSource === 'bigquery' ? participants.demographics.flatMap(group => group.metrics) : [];
  const demographicMetrics = (keys: string[]) => demographic.filter(metric => keys.includes(metric.key)).map(metric => ({ label: metric.label, value: metric.displayValue }));
  const sections = live ? data.sections ?? [] : [];
  const districtMetrics = sections.find(section => section.key === 'district')?.rows.map(row => ({ label: row.label, value: row.events })) ?? [];
  const map = <LocalUnitCoverageMap districts={districtMetrics} selectedDistrict={data.metadata.filtersApplied.district} compact={route === 'executive-overview'} />;
  const analysis = (keys: string[]) => sections.filter(section => keys.includes(section.key)).map(section => <MetricPanel key={section.key} title={section.title} subtitle={`Largest reported event volumes; up to ${route === 'executive-overview' ? 5 : 10} groups. Volume is not a performance score.`} metrics={section.rows.slice(0, route === 'executive-overview' ? 5 : 10).map(row => ({ label: row.label, value: row.events }))} />);
  const sex = <MetricPanel title="Participant Profile by Sex" subtitle="Attendance counts; values below five are withheld." metrics={select('Female participants', 'Male participants', 'Other participants')} />;
  const kpis = route === 'executive-overview' || route === 'management-decision-centre'
    ? select('Total events', 'Total participants', 'Districts covered', 'Implementing partners') : route === 'activity-detail' ? select('Total events', 'Total participants', 'Reportable participants', 'Implementing partners') : route === 'participant-reach' ? select('Total participants', 'Reportable participants', 'Participants with disability') : metrics;
  const timestamp = data.metadata.freshnessTimestamp;
  const parsed = timestamp ? new Date(timestamp) : null;
  const freshness = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu' }) : 'Not available';
  return <div className="space-y-6">
    <PageHeader title={route === 'management-decision-centre' ? 'Management Decision Centre' : route === 'ip-performance' ? 'Partner Implementation & Reporting' : data.pageName}
      subtitle={route === 'management-decision-centre' ? 'Programme review and evidence-based follow-up. Advisory only; human review required.' : 'Programme monitoring from approved aggregate reporting data.'}
      action={route === 'executive-overview' ? <DrillthroughButton href="/dashboard/management-decision-centre" label="Decision Centre" /> : undefined} />
    {['indicator-progress', 'data-quality', 'gbv-ocmc'].includes(route) ? <Panel title={route === 'indicator-progress' ? 'Pending indicator linkage validation' : route === 'data-quality' ? 'Data Quality calculation pending' : 'GBV / OCMC aggregate reporting'}>
      <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-700">
        {route === 'indicator-progress' ? <><p>Indicator-level progress is not yet available for production reporting. Activity-to-indicator linkage and target registry validation are in progress.</p><p className="font-semibold">INDICATOR LINKAGE VALIDATION REMAINS REQUIRED.</p><p>Activity totals are not indicator achievement. Targets, reporting periods and outcome/output mappings require programme validation before performance reporting is enabled.</p></> : route === 'data-quality' ? <><p>Data Quality Score is not currently calculated pending validated latest-snapshot logic.</p><p>Evidence integration and validation tracking are pending. Historical snapshots cannot be added together to calculate a current quality score.</p></> : <><p>GBV/OCMC aggregate reporting is not yet available in the production dashboard.</p><p>Only approved aggregate information will be displayed. Survivor-level records are never displayed. Activation requires approved aggregate reporting and suppression/privacy controls.</p></>}
      </div>
    </Panel> : <>
      {!live && <Panel title={data.metadata.componentState === 'no_data' ? 'No production data available for these filters' : 'No production data available'}><p role="status" className="text-sm text-gray-600">{data.metadata.message}</p></Panel>}
      {live && <>
        <section aria-label="Aggregate metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map(item => <KpiCard key={item.label} label={item.label} value={/^\d+$/.test(item.value) ? Number(item.value) : item.value} className="min-w-0 break-words !p-4" change={item.label.toLowerCase().includes('participants') ? 'Attendance records, not unique people' : 'Selected reporting scope'} />)}
          {route === 'participant-reach' && <KpiCard className="min-w-0 break-words !p-4" label="Female Share" value={(() => {
            const female = select('Female participants')[0]?.value;
            const totals = select('Female participants', 'Male participants', 'Other participants');
            if (!female || totals.length !== 3 || totals.some(item => !/^\d+$/.test(item.value))) return 'Privacy-restricted';
            const denominator = totals.reduce((sum, item) => sum + Number(item.value), 0);
            return denominator ? `${(Number(female) / denominator * 100).toFixed(1)}%` : 'N/A';
          })()} change="Of reported sex-disaggregated attendance" />}
        </section>
        {route === 'executive-overview' && <>
          <div className="grid gap-6 xl:grid-cols-2"><Panel title="Geographic Coverage" subtitle="Activity density: reported events by district">{map}</Panel><div className="space-y-4">{sex}<Panel title="Partner reporting overview"><p className="text-sm text-gray-600">{select('Implementing partners')[0]?.value} partners report activity in the selected scope.</p><div className="mt-3"><DrillthroughButton href="/dashboard/ip-performance" label="Review partner implementation" /></div></Panel></div></div>
          <div className="grid gap-6 xl:grid-cols-2">{analysis(['project', 'partner'])}</div>
          <ManagementAttention data={data} />
        </>}
        {route === 'activity-progress' && <><div className="grid gap-6 xl:grid-cols-2">{analysis(['partner', 'project', 'district', 'activity'])}</div>
          <MetricPanel title="Participant volume by activity" subtitle="Top 10 by attendance; not unique people or indicator achievement." metrics={[...(sections.find(section => section.key === 'activity')?.rows ?? [])].sort((a, b) => (/^\d+$/.test(b.participants) ? Number(b.participants) : -1) - (/^\d+$/.test(a.participants) ? Number(a.participants) : -1)).slice(0, 10).map(row => ({label: row.label, value: row.participants}))} />
          <DrillthroughButton href="/dashboard/activity-detail" label="Explore activity table and download CSV" /></>}
        {route === 'participant-reach' && <div className="grid gap-6 xl:grid-cols-2">
          {sex}
          <MetricPanel title="Age Profile" subtitle="Source age bands can overlap; do not add them together." metrics={demographicMetrics(['below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above'])} />
          <MetricPanel title="Social Inclusion Profile" subtitle="Published caste and ethnicity categories." metrics={demographicMetrics(['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast'])} />
          <MetricPanel title="Disability Profile" metrics={demographicMetrics(['withdisability', 'nodisability'])} />
        </div>}
        {route === 'geographic-coverage' && <><Panel title="Nepal Programme Coverage" subtitle="Activity density: district event counts. Local-unit polygons show district aggregates only.">{map}</Panel><div className="grid gap-6 xl:grid-cols-2">{analysis(['province', 'district'])}</div></>}
        {route === 'ip-performance' && <><div className="grid gap-6 xl:grid-cols-2">{analysis(['partner'])}<MetricPanel title="Participants by partner" subtitle="Attendance volume, not a quality or performance score." metrics={sections[0]?.rows.map(row => ({label: row.label, value: row.participants})) ?? []} /></div><Panel title="Partner comparison" subtitle="Published submission totals above and combined implementation totals below have separate aggregation bases."><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr>{['Partner', 'Events', 'Participants', 'Reportable participants', 'Districts', 'Projects'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{sections[0]?.rows.map(row => <tr key={row.label} className="border-t"><th className="p-3 font-medium">{row.label}</th><td className="p-3">{row.events}</td><td className="p-3">{row.participants}</td><td className="p-3">{row.reportable}</td><td className="p-3">{row.districts ?? 'N/A'}</td><td className="p-3">{row.projects ?? 'N/A'}</td></tr>)}</tbody></table></div></Panel></>}
        {route === 'activity-detail' && <AggregateActivityTable key={JSON.stringify(data.metadata.filtersApplied)} rows={data.activityRows ?? []} />}
        {route === 'management-decision-centre' && <><ManagementAttention data={data} /><div className="grid gap-6 xl:grid-cols-2">{analysis(['partner', 'district'])}</div><Panel title="Reporting concentration" subtitle="Deterministic observation / Advisory only / Human review required"><p className="text-sm text-gray-700">{(() => {
          const partner = sections.find(section => section.key === 'partner')?.rows.find(row => /^\d+$/.test(row.events));
          const total = select('Total events')[0]?.value;
          return partner && total && /^\d+$/.test(total) && Number(total) > 0 ? `${partner.label} has the largest publishable event volume: ${partner.events} events (${(Number(partner.events) / Number(total) * 100).toFixed(1)}% of the selected total). This describes reporting concentration, not partner effectiveness. Review coverage and reporting scope with programme owners.` : 'Concentration cannot be calculated from available unsuppressed counts.';
        })()}</p><p className="mt-3 text-xs text-gray-500">Human-led, reviewable and non-authoritative. AI assistance is not enabled. No programme decisions or actions are executed automatically.</p></Panel></>}
      </>}
    </>}
    <footer aria-label="BigQuery data source status" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-gray-600">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" />Data source: BigQuery  /  {live && route !== 'indicator-progress' ? 'Live aggregates' : 'No live values displayed'}</span><span>Freshness: {freshness} (Nepal time)</span></div>
      <p>{data.metadata.message}</p>
      {participants && <p>Participant analysis: {participants.metadata.note} A separate demographic refresh timestamp is not supplied.</p>}
      <p className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Aggregate view only. Small counts are withheld as &lt;5. No personal or survivor-level records are shown.</p>
    </footer>
  </div>;
}
