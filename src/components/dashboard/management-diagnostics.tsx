import type { DashboardPageData } from '@/lib/server/dashboard-page-data-service';
import { concentration, ratio } from '@/lib/management-analysis';
import AnalyticalMatrix from './analytical-matrix';
import ReachScatter from './reach-scatter';
import DrillthroughButton from './drillthrough-button';

export default function ManagementDiagnostics({ data }: { data: DashboardPageData }) {
  const rows = (key: string) => data.sections?.find(section => section.key === key)?.rows ?? [];
  const metric = (label: string) => data.metrics.find(item => item.label === label)?.value;
  const panel = 'min-w-0 rounded-xl border bg-white p-5 shadow-sm';
  const signals = [
    ['Partner concentration', `Top 3 partners account for ${concentration(rows('partner'), 3)} of reported activities.`, 'Review whether this reflects programme design, portfolio size or reporting differences.', 'ip-performance'],
    ['Project concentration', `Largest project accounts for ${concentration(rows('project'), 1)} of reported activities.`, 'Review the implementation mix against programme plans.', 'activity-progress'],
    ['Geographic concentration', `Top 5 districts account for ${concentration(rows('district'), 5)} of reported activities.`, 'Review the reported event-location footprint with programme owners.', 'geographic-coverage'],
    ['Reporting freshness', `Latest published pipeline sync: ${data.metadata.freshnessTimestamp ?? 'Unavailable'}. Latest activity end date: ${data.metadata.latestActivityDate ?? 'Unavailable'}.`, 'Review reporting pipeline freshness; an activity date is not a sync timestamp.', 'data-quality'],
  ];
  const reliability = data.reliability;
  return <div className="space-y-6">
    <section className={panel}><h2 className="text-base font-semibold">Management Attention</h2><p className="mt-1 text-xs text-slate-600">Deterministic observations. Advisory only; human review required.</p><div className="mt-4 grid gap-5 md:grid-cols-2">{signals.map(([title, observation, action, route]) => <article key={title} className="rounded-lg border-l-4 border-[#004B87] bg-slate-50 p-4"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm">{observation}</p><p className="my-3 text-xs leading-relaxed text-slate-600">{action}</p><DrillthroughButton href={`/dashboard/${route}`} label={`Review ${title.toLowerCase()}`} /></article>)}</div></section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Management diagnostics">{[
      ['Top partner activity share', concentration(rows('partner'), 1)], ['Top 3 partner concentration', concentration(rows('partner'), 3)],
      ['Reportable attendance share', ratio(metric('Reportable participants'), metric('Total participants'))], ['Attendance per reported activity', ratio(metric('Total participants'), metric('Reported activities'), false)],
    ].map(([label, value]) => <div key={label} className={panel}><p className="text-xs text-slate-600">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</section>
    <section className={panel}><h2 className="mb-4 text-sm font-semibold">Reach and implementation volume</h2><ReachScatter rows={rows('partner')} /></section>
    {['project', 'partner'].map(key => <section key={key} className={panel}><h2 className="mb-3 text-sm font-semibold">{key === 'project' ? 'Project' : 'Partner'} Management Matrix</h2><AnalyticalMatrix label={`${key} management matrix`} rows={rows(key).map(row => ({ ...row, share: ratio(row.events, metric('Reported activities')), attendanceRatio: ratio(row.participants, row.events, false), reportableShare: ratio(row.reportable, row.participants) }))} columns={[
      ['label', key === 'project' ? 'Project' : 'Partner'], ['events', 'Reported activities'], ['participants', 'Participants'], ['reportable', 'Reportable participants'],
      [key === 'project' ? 'partners' : 'projects', key === 'project' ? 'Partners' : 'Projects'], ['provinces', 'Provinces'], ['districts', 'Districts'], ['share', 'Activity share'],
      key === 'project' ? ['attendanceRatio', 'Participants/activity'] : ['reportableShare', 'Reportable share'],
    ]} /></section>)}
    <section className={panel}><h2 className="text-sm font-semibold">Data Reliability for Decision-Making</h2><p className="my-3 text-xs text-slate-600">Completeness of selected combined summary rows. These are aggregate rows, not reported activities. No composite score is calculated.</p>{reliability && <dl className="grid gap-4 sm:grid-cols-3">{[['Geography', reliability.missingGeography], ['Project', reliability.missingProject], ['Partner', reliability.missingPartner]].map(([name, missing]) => <div key={name}><dt className="text-xs text-slate-600">{name} completeness</dt><dd className="mt-1 font-semibold">{ratio(String(reliability.rows - Number(missing)), String(reliability.rows))}</dd><dd className="text-xs">{Number(missing).toLocaleString()} / {reliability.rows.toLocaleString()} rows incomplete</dd></div>)}</dl>}<div className="mt-4"><DrillthroughButton href="/dashboard/data-quality" label="Review incomplete records and latest DQ snapshot" /></div></section>
  </div>;
}
