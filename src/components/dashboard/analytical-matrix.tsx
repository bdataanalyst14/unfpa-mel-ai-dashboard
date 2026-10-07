'use client';

import { useMemo, useState } from 'react';
import type { AggregateRow } from '@/lib/aggregate-contract';
import { numeric } from '@/lib/management-analysis';

export default function AnalyticalMatrix({ rows, columns, label }: { rows: AggregateRow[]; columns: [string, string][]; label: string }) {
  const [sort, setSort] = useState({ key: columns[0][0], direction: 1 });
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const left = numeric(a[sort.key]), right = numeric(b[sort.key]);
    return sort.direction * (left !== null && right !== null ? left - right : (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '', undefined, { numeric: true }));
  }), [rows, sort]);
  return <div className="max-h-96 overflow-auto rounded-lg border" tabIndex={0} role="region" aria-label={label}>
    <table className="w-full text-left text-xs"><caption className="sr-only">{label}</caption><thead className="sticky top-0 z-10 bg-slate-50"><tr>{columns.map(([key, title]) => <th key={key} aria-sort={sort.key === key ? sort.direction === 1 ? 'ascending' : 'descending' : 'none'} className="border-b px-3"><button className="min-h-11 whitespace-nowrap font-semibold" onClick={() => setSort({ key, direction: sort.key === key ? -sort.direction : 1 })}>{title} ↕</button></th>)}</tr></thead>
      <tbody>{sorted.map((row, index) => <tr key={index} className="border-b align-top hover:bg-slate-50">{columns.map(([key]) => <td key={key} className="min-w-24 max-w-80 break-words p-3 tabular-nums"><span title={row[key]} className="line-clamp-3">{numeric(row[key]) === null ? row[key] ?? 'N/A' : Number(row[key]).toLocaleString('en-US')}</span></td>)}</tr>)}</tbody>
    </table>
  </div>;
}
