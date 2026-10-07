import type { ReactNode } from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import KpiCard from './kpi-card';
import DrillthroughButton from './drillthrough-button';
import AggregateBars from './aggregate-bars';
import AggregatePie from './aggregate-pie';
import AggregateActivityTable from './aggregate-activity-table';
import GeographicExplorer from './geographic-explorer';
import AnalyticalMatrix from './analytical-matrix';
import ManagementDiagnostics from './management-diagnostics';
import ReachScatter from './reach-scatter';
import { ratio } from '@/lib/management-analysis';
import type { DashboardPageData, DashboardPageMetric, DashboardRouteKey } from '@/lib/server/dashboard-page-data-service';
import type { ParticipantData } from '@/lib/participant-contract';
import AnalyticalFilterControls from './analytical-filter-controls';

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

function MetricPanel({ title, metrics, subtitle, type = 'bar' }: { title: string; metrics: DashboardPageMetric[]; subtitle?: string; type?: 'bar' | 'pie' }) {
  return metrics.length ? <Panel title={title} subtitle={subtitle}>
    {type === 'pie' ? <AggregatePie metrics={metrics} label={title} /> : <AggregateBars metrics={metrics} label={title} />}
  </Panel>
    : <Pending title={title} reason="No approved aggregate values are available for this selection." />;
}

export default function ProductionDashboardView({ route, data, participants }: { route: DashboardRouteKey; data: DashboardPageData; participants?: ParticipantData }) {
  const live = data.metadata.componentState === 'live_bigquery';
  const metrics = live ? data.metrics : [];
  const select = (...labels: string[]) => metrics.filter(metric => labels.includes(metric.label));
  const demographic = live && participants?.metadata.dataSource === 'bigquery' ? participants.demographics.flatMap(group => group.metrics) : [];
  const demographicMetrics = (keys: string[]) => demographic.filter(metric => keys.includes(metric.key)).map(metric => ({ label: metric.label, value: metric.displayValue }));
  const sections = live ? data.sections ?? [] : [];
  const map = <GeographicExplorer sections={sections} compact={route === 'executive-overview'} />;
  const analysis = (keys: string[]) => sections.filter(section => keys.includes(section.key)).map(section => <MetricPanel key={section.key} title={section.title} subtitle="All reported categories; scroll to inspect the full ranking. Volume is not a performance score." metrics={section.rows.map(row => ({ label: row.label, value: row.events }))} type={['eventtype'].includes(section.key) ? 'pie' : 'bar'} />);
  const profileNote = route === 'executive-overview' ? 'Reportable attendance profile; total attendance also includes non-reportable records.' : 'Selected attendance population; values below five are withheld.';
  const sex = <MetricPanel title="Participant Profile by Sex" subtitle={profileNote} metrics={select('Female participants', 'Male participants', 'Other participants')} type="pie" />;
  const kpis = route === 'executive-overview' || route === 'management-decision-centre'
    ? select('Reported activities', 'Total participants', 'Districts covered', 'Implementing partners') : route === 'activity-detail' ? select('Reported activities', 'Total participants', 'Reportable participants', 'Implementing partners') : route === 'participant-reach' ? select('Total participants', 'Reportable participants', 'Participants with disability') : route === 'data-quality' ? select('Aggregate rows reviewed', 'Geographic gaps', 'Project gaps', 'Partner gaps', 'Validated rows') : metrics;
  const timestamp = data.metadata.freshnessTimestamp;
  const parsed = timestamp ? new Date(timestamp) : null;
  const freshness = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu' }) : 'Not available';
  return <div className="space-y-6">
    <PageHeader title={route === 'management-decision-centre' ? 'Management Decision Centre' : route === 'ip-performance' ? 'Partner Implementation & Reporting' : data.pageName}
      subtitle={route === 'management-decision-centre' ? 'Programme review and evidence-based follow-up. Advisory only; human review required.' : 'Programme monitoring from approved aggregate reporting data.'}
      action={route === 'executive-overview' ? <DrillthroughButton href="/dashboard/management-decision-centre" label="Decision Centre" /> : undefined} />
    {data.analyticalControls && <AnalyticalFilterControls controls={data.analyticalControls} />}
    {['indicator-progress', 'gbv-ocmc'].includes(route) ? <Panel title={route === 'indicator-progress' ? 'Pending indicator linkage validation' : 'GBV / OCMC aggregate reporting'}>
      <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-700">
        {route === 'indicator-progress' ? <><p>Indicator-level progress is not yet available for production reporting. Activity-to-indicator linkage and target registry validation are in progress.</p><p className="font-semibold">INDICATOR LINKAGE VALIDATION REMAINS REQUIRED.</p><p>Activity totals are not indicator achievement. Targets, reporting periods and outcome/output mappings require programme validation before performance reporting is enabled.</p></> : <><p>GBV/OCMC aggregate reporting is not yet available in the production dashboard.</p><p>Only approved aggregate information will be displayed. Survivor-level records are never displayed. Activation requires approved aggregate reporting and suppression/privacy controls.</p></>}
      </div>
    </Panel> : <>
      {!live && <Panel title={data.metadata.componentState === 'no_data' ? 'No production data available for these filters' : 'No production data available'}><p role="status" className="text-sm text-gray-600">{data.metadata.message}</p></Panel>}
      {live && <>
        <section aria-label="Aggregate metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map(item => <KpiCard key={item.label} label={item.label} value={/^\d+$/.test(item.value) ? Number(item.value) : item.value} className="min-w-0 break-words !p-4" change={item.label.toLowerCase().includes('participants') ? 'Attendance records, not unique people' : item.note || 'Selected reporting scope'} />)}
          {route === 'participant-reach' && <KpiCard className="min-w-0 break-words !p-4" label="Female Share" value={(() => {
            const female = select('Female participants')[0]?.value;
            const totals = select('Female participants', 'Male participants', 'Other participants');
            if (!female || totals.length !== 3 || totals.some(item => !/^\d+$/.test(item.value))) return 'Privacy-restricted';
            const denominator = totals.reduce((sum, item) => sum + Number(item.value), 0);
            return denominator ? `${(Number(female) / denominator * 100).toFixed(1)}%` : 'N/A';
          })()} change="Of reported sex-disaggregated attendance" />}
        </section>
        {route === 'executive-overview' && <>
          <div className="grid gap-6 xl:grid-cols-2"><Panel title="Geographic Coverage" subtitle="Reported activity density by event location; district aggregates">{map}</Panel>{sex}
            <MetricPanel title="Age Profile" subtitle={`${profileNote} Source age bands overlap; do not add them.`} metrics={demographicMetrics(['below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above'])} />
            <MetricPanel title="Social Inclusion Profile" subtitle={profileNote} metrics={demographicMetrics(['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast'])} />
            <MetricPanel title="Disability Profile" subtitle={profileNote} metrics={demographicMetrics(['withdisability', 'nodisability'])} type="pie" />
            <MetricPanel title="Activity / Event Type" type="pie" subtitle="Reported implementation contributions by published event type." metrics={sections.find(section => section.key === 'eventtype')?.rows.map(row => ({ label: row.label, value: row.events })) ?? []} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">{analysis(['project', 'partner'])}</div>
        </>}
        {route === 'activity-progress' && <><div className="grid gap-6 xl:grid-cols-2">{analysis(['partner', 'project', 'district', 'eventtype'])}</div>
          <MetricPanel title="Participant volume by activity" subtitle="All activities ranked by attendance; not unique people or indicator achievement." metrics={[...(sections.find(section => section.key === 'activity')?.rows ?? [])].sort((a, b) => (/^\d+$/.test(b.participants) ? Number(b.participants) : -1) - (/^\d+$/.test(a.participants) ? Number(a.participants) : -1)).map(row => ({label: row.label, value: row.participants}))} />
          <Panel title="Programme hierarchy" subtitle="Project ? Outcome ? Output ? Activity ? Sub-activity. Published labels describe implementation context, not achievement."><AnalyticalMatrix label="Programme hierarchy" rows={sections.find(section => section.key === 'hierarchy')?.rows ?? []} columns={[['project', 'Project'], ['outcome', 'Outcome'], ['output', 'Output'], ['activity', 'Activity'], ['subact', 'Sub-activity'], ['events', 'Reported activities'], ['participants', 'Attendance']]} /></Panel><Panel title="Implementation volume and reach"><ReachScatter rows={sections.find(section => section.key === 'partner')?.rows ?? []} /></Panel><DrillthroughButton href="/dashboard/activity-detail" label="Explore activity table and download CSV" /></>}
        {route === 'participant-reach' && <div className="grid gap-6 xl:grid-cols-2">
          {sex}
          <Panel title="Reportable attendance share" subtitle="Published reporting eligibility, not a measure of unique people."><p className="text-3xl font-semibold">{ratio(select('Reportable participants')[0]?.value, select('Total participants')[0]?.value)}</p><AggregatePie label="Reportability composition" metrics={select('Reportable participants', 'Non-reportable participants')} /></Panel>
          {sections.map(section => <MetricPanel key={section.key} title={section.title} subtitle="Same selected attendance population as demographic profiles." metrics={section.rows.map(row => ({ label: row.label, value: row.participants }))} type={section.key === 'participantType' ? 'pie' : 'bar'} />)}
          <MetricPanel title="Age Profile" subtitle="Source age bands can overlap; do not add them together." metrics={demographicMetrics(['below_15', 'age_15_19', 'age_16_24', 'age_20_24', 'age_25_49', 'age_25_54', 'age_50_and_above', 'age_55_and_above'])} />
          <MetricPanel title="Social Inclusion Profile" subtitle="Published caste and ethnicity categories." metrics={demographicMetrics(['hilldalit', 'teraidalit', 'hilljanajati', 'teraijanajati', 'madhesi', 'muslim', 'bc', 'other_cast'])} />
          <MetricPanel title="Disability Profile" metrics={demographicMetrics(['withdisability', 'nodisability'])} type="pie" />
        </div>}
        {route === 'geographic-coverage' && <><Panel title="Reported geographic footprint" subtitle="Event locations, not participant residence. Select a measure and geography to explore.">{map}</Panel>{['project', 'partner', 'district'].map(key => <Panel key={key} title={`${key === 'project' ? 'Project' : key === 'partner' ? 'Partner' : 'District'} geographic footprint`}><AnalyticalMatrix label={`${key} geographic footprint`} rows={sections.find(section => section.key === key)?.rows ?? []} columns={[[ 'label', key ], ['provinces', 'Provinces'], ['districts', 'Districts'], ['palikas', 'Palikas'], ['events', 'Reported activities'], ['participants', 'Attendance'], ['partners', 'Partners'], ['projects', 'Projects']]} /></Panel>)}</>}
        {route === 'ip-performance' && <><div className="grid gap-6 xl:grid-cols-2">{analysis(['partner'])}<MetricPanel title="Participants by partner" subtitle="Attendance volume, not a quality or performance score." metrics={sections[0]?.rows.map(row => ({label: row.label, value: row.participants})) ?? []} /></div><Panel title="Partner comparison" subtitle="Published submission totals above and combined implementation totals below have separate aggregation bases."><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr>{['Partner', 'Reported activities', 'Participants', 'Reportable participants', 'Districts', 'Projects'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{sections[0]?.rows.map(row => <tr key={row.label} className="border-t"><th className="p-3 font-medium">{row.label}</th><td className="p-3">{row.events}</td><td className="p-3">{row.participants}</td><td className="p-3">{row.reportable}</td><td className="p-3">{row.districts ?? 'N/A'}</td><td className="p-3">{row.projects ?? 'N/A'}</td></tr>)}</tbody></table></div></Panel></>}
        {route === 'data-quality' && <div className="mt-6"><Panel title="Data Quality Implementation Information" subtitle="Current measurement logic and limitations.">
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Validation Tracking:</strong> The validated row count comes only from the latest available quality snapshot. It counts records checked, not records passing every check; historical snapshots are not added.</p>
            <p><strong>Completeness Metrics:</strong> Geographic, Project, and Partner gap metrics display the volume of records in the current reporting dataset lacking these fundamental programmatic attributes.</p>
            <p><strong>Duplication Analysis:</strong> True duplicate detection is intentionally disabled because the production data contract provides pre-aggregated summary records. Without a canonical physical activity ID, duplication cannot be definitively calculated.</p>
          </div>
        </Panel></div>}
        {route === 'activity-detail' && data.activityPage && <AggregateActivityTable key={JSON.stringify(data.metadata.filtersApplied)} rows={data.activityRows ?? []} page={data.activityPage} />}
        {route === 'management-decision-centre' && <ManagementDiagnostics data={data} />}
      </>}
    </>}
    <footer aria-label="BigQuery data source status" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-gray-600">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" />Data source: BigQuery  /  {live && route !== 'indicator-progress' ? 'Live aggregates' : 'No live values displayed'}</span><span>{route === 'data-quality' ? 'Latest DQ snapshot' : 'Reporting pipeline sync'}: {freshness} (Nepal time)</span></div>
      <p>{data.metadata.message}</p>{data.metadata.latestActivityDate && <p>Latest reported activity end date in selected scope: {data.metadata.latestActivityDate}. This is an activity date, not a data refresh timestamp.</p>}
      {participants && <p>Participant analysis: {participants.metadata.note} A separate demographic refresh timestamp is not supplied.</p>}
      <p className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Aggregate view only. Sensitive small counts are withheld as &lt;5. No personal or survivor-level records are shown.</p>
    </footer>
  </div>;
}
