'use client';

import { Users } from 'lucide-react';
import KpiCard from './kpi-card';
import { useParticipantData } from './participant-data-provider';
import type { ParticipantGroup } from '@/lib/participant-contract';

export function ParticipantGroupTable({ title, groups }: { title: string; groups: ParticipantGroup[] }) {
  return <section className="rounded-xl border bg-white p-5 overflow-x-auto">
    <h2 className="font-semibold mb-3">{title}</h2>
    <table className="w-full text-sm text-left"><thead><tr><th className="p-2">Category</th>
      {groups[0]?.metrics.map(metric => <th className="p-2 text-right" key={metric.key}>{metric.label}</th>)}
    </tr></thead><tbody>{groups.map(group => <tr className="border-t" key={group.name}><th className="p-2 font-medium">{group.name}</th>
      {group.metrics.map(metric => <td className="p-2 text-right" key={metric.key}>{metric.value?.toLocaleString() ?? metric.displayValue}</td>)}
    </tr>)}</tbody></table>
    {!groups.length && <p className="text-sm text-gray-500">No live records available for these filters.</p>}
  </section>;
}

export default function ParticipantMetricsPanel({ details = false }: { details?: boolean }) {
  const { data, loading } = useParticipantData();
  const labels = ['Total Participants', 'Reportable Participants', 'Individual Participant Records', 'Summary-mode Participants'];
  return <section className="space-y-4" aria-label="Live participant metrics" aria-busy={loading}>
    <p className="text-sm text-gray-600" role="status">{loading ? 'Loading live participant metrics…' : data?.metadata.note ?? 'Live participant data is unavailable.'}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {labels.map(label => <KpiCard key={label} label={label} icon={Users} value={loading ? 'Loading…' : data?.metrics.find(metric => metric.label === label)?.value ?? data?.metrics.find(metric => metric.label === label)?.displayValue ?? 'N/A'} />)}
    </div>
    {details && data?.metadata.dataSource === 'bigquery' && <>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold mb-3">Participant demographics</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">{data.demographics.flatMap(group => group.metrics).map(metric =>
          <div key={metric.key}><dt className="text-sm text-gray-500">{metric.label}</dt><dd className="font-semibold">{metric.value?.toLocaleString() ?? metric.displayValue}</dd></div>
        )}</dl>
      </section>
      <ParticipantGroupTable title="Participant reach by district" groups={data.districts} />
    </>}
  </section>;
}

