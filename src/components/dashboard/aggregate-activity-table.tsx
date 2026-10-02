'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { activityColumns, type AggregateRow } from '@/lib/aggregate-contract';
import { createCsv, downloadCsv } from '@/lib/csv-export';

export default function AggregateActivityTable({ rows }: { rows: AggregateRow[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: number }>({ key: 'activity', direction: 1 });
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const filtered = useMemo(() => rows.filter(row => row.activity.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => {
    const left = a[sort.key], right = b[sort.key];
    return sort.direction * (/^\d+$/.test(left) && /^\d+$/.test(right) ? Number(left) - Number(right) : left.localeCompare(right, undefined, { numeric: true }));
  }), [rows, search, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const button = 'min-h-11 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary-blue disabled:opacity-50';
  return <section className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="text-base font-semibold">Activity aggregates</h2>
    <p className="mt-1 text-xs leading-relaxed text-gray-600">Published activity code/name grouped by reporting period, project, partner and geography. Participants are attendance records. Counts 1 to 4 are withheld in the table and CSV. No personal records are included.</p>
    <div className="my-4 flex flex-wrap items-end justify-between gap-3">
      <label className="w-full text-xs font-medium sm:max-w-sm">Search activity code or name
        <input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} className="mt-1 block min-h-11 w-full rounded-lg border px-3 text-sm" />
      </label>
      <button type="button" disabled={!filtered.length} className={button} onClick={() => downloadCsv('unfpa-mel-activity-aggregates.csv', createCsv(activityColumns.map(([, label]) => label), filtered.map(row => activityColumns.map(([key]) => row[key]))))}>Download CSV</button>
    </div>
    <p role="status" className="mb-3 text-xs text-gray-600">{filtered.length} aggregate groups match the active global filters and search. CSV includes all matching groups, across all pages.</p>
    <div className="max-w-full overflow-x-auto rounded-lg border" role="region" aria-label="Scrollable activity table" tabIndex={0}>
      <table className="w-full min-w-[1300px] text-left text-sm">
        <caption className="sr-only">Filtered activity aggregates. Select a column heading to sort.</caption>
        <thead className="bg-slate-50"><tr>{activityColumns.map(([key, label]) => <th key={key} scope="col" aria-sort={sort.key === key ? sort.direction === 1 ? 'ascending' : 'descending' : 'none'} className="px-3 py-2"><button type="button" className="min-h-11 text-left text-xs font-semibold" onClick={() => { setSort({key, direction: sort.key === key ? -sort.direction : 1}); setPage(0); }}>{label} {sort.key === key ? sort.direction === 1 ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" /> : <ArrowUpDown className="inline h-3 w-3" />}</button></th>)}</tr></thead>
        <tbody>{filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((row, index) => <tr key={index} className="border-t align-top even:bg-slate-50/50 hover:bg-blue-50/40">{activityColumns.map(([key]) => <td key={key} className="max-w-64 break-words px-3 py-3 tabular-nums">{row[key]}</td>)}</tr>)}</tbody>
      </table>
      {!filtered.length && <p className="p-5 text-sm">No activity groups match this search.</p>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs"><span>Page {currentPage + 1} of {pages} / {pageSize} rows per page</span><div className="flex gap-2"><button type="button" className={button} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><button type="button" className={button} disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
  </section>;
}
