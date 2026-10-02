'use client';

import { useState } from 'react';
import type { DashboardPageMetric } from '@/lib/types';

export default function AggregateActivityTable({ metrics }: { metrics: DashboardPageMetric[] }) {
  const [search, setSearch] = useState('');
  const rows = metrics.filter(metric => metric.label.endsWith(' - events')).map(metric => {
    const name = metric.label.slice(0, -' - events'.length);
    return { name, events: metric.value, participants: metrics.find(item => item.label === `${name} - participants`)?.value ?? 'N/A' };
  }).filter(row => row.name.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <section className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">Activity aggregates</h2>
      <p className="mt-1 text-xs text-gray-500">Up to 100 activity groups. Search covers the loaded groups. Participants are attendance records, not unique people.</p>
      <label className="my-4 block text-xs font-medium text-gray-600">
        Search activity
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border px-3 text-sm sm:max-w-sm" />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-600"><tr>
            {['Activity', 'Events', 'Participants', 'Evidence / validation'].map(label => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}
          </tr></thead>
          <tbody>{rows.map(row => <tr key={row.name} className="border-b border-gray-100">
            <th scope="row" className="min-w-40 px-3 py-3 font-medium">{row.name}</th>
            <td className="px-3 py-3 tabular-nums">{row.events}</td><td className="px-3 py-3 tabular-nums">{row.participants}</td>
            <td className="px-3 py-3 text-xs text-gray-500">Not available</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-600" role="status">{rows.length ? `${rows.length} activity groups shown.` : 'No activity groups match this search.'}</p>
    </section>
  );
}
