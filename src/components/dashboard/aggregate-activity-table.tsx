'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { allActivityColumns, activityPresets, activityColumnGroups, defaultVisibleColumns, activityExtraFilters, type AggregateRow, type ActivityPage } from '@/lib/aggregate-contract';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AggregateActivityTable({ rows, page }: { rows: AggregateRow[]; page: ActivityPage }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(page.request.search);
  const [visible, setVisible] = useState(defaultVisibleColumns);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const columns = allActivityColumns.filter(([key]) => visible.includes(key));
  const update = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if ('outcome' in changes) { params.delete('output'); params.delete('activity'); }
    if ('output' in changes) params.delete('activity');
    if (['outcome', 'output', 'activity'].some(key => key in changes)) { params.delete('subact'); params.delete('subactcode'); }
    for (const [key, value] of Object.entries(changes)) { if (value) params.set(key, value); else params.delete(key); }
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };
  const exportCsv = async (visibleOnly = false) => {
    setExporting(true); setError('');
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page'); params.delete('columns');
      if (visibleOnly) params.set('columns', visible.join(','));
      const response = await fetch(`/api/dashboard/activity-detail/export?${params}`);
      if (!response.ok || !response.headers.get('content-type')?.includes('text/csv')) throw new Error('Export unavailable');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = 'unfpa-activity-detail.csv'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Export unavailable. No partial CSV was downloaded. Please retry.'); }
    finally { setExporting(false); }
  };
  return <section aria-busy={pending} className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-base font-semibold">Activity aggregates</h2><p className="mt-1 text-xs text-slate-600">Attendance records, not unique people. Counts 1–4 are withheld.</p></div>
      <Dialog><DialogTrigger asChild><Button variant="ghost">Data definitions</Button></DialogTrigger>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Data definitions</DialogTitle><DialogDescription>Published aggregate measures and interpretation.</DialogDescription></DialogHeader>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold">Reported activities</dt><dd>Sum of published activity implementation occurrences. These are not unique activities or unique events.</dd></div>
            <div><dt className="font-semibold">Total participants</dt><dd>Published total attendance records. People may attend more than once.</dd></div>
            <div><dt className="font-semibold">Reportable participants</dt><dd>Published attendance included under upstream reporting rules. The dashboard uses this measure directly and does not infer eligibility from completeness.</dd></div>
            <div><dt className="font-semibold">Disaggregations</dt><dd>Age bands overlap across reporting modes; do not add them together. Published sex, age, social inclusion and disability totals are source measures, not extra people. Unknown values are N/A, not zero.</dd></div>
            <div><dt className="font-semibold">Repeat and submission contributions</dt><dd>Published contribution counts are not unique people or distinct submissions. Do not add them to total participants.</dd></div>
            <div><dt className="font-semibold">Results hierarchy</dt><dd>Reported outcome, output and activity labels describe programme context, not achievement. Indicator linkage remains pending validation.</dd></div>
          </dl>
        </DialogContent></Dialog>
    </div>
    <div className="mb-4 flex flex-wrap items-end gap-2">
      <form className="flex min-w-0 flex-1 items-end gap-2" onSubmit={event => { event.preventDefault(); update({ search }); }}>
        <label className="min-w-0 flex-1 text-xs font-medium">Search activities, locations or projects<input type="search" value={search} onChange={event => setSearch(event.target.value)} maxLength={200} placeholder="Activity, partner, outcome or location" className="mt-1 min-h-11 w-full rounded-lg border px-3 text-sm" /></label>
        <Button type="submit" variant="outline" disabled={pending}>Search</Button>
      </form>
      <Dialog><DialogTrigger asChild><Button variant="outline">More Filters</Button></DialogTrigger><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Activity filters</DialogTitle><DialogDescription>Apply to KPIs, all table rows and exports within the global reporting scope.</DialogDescription></DialogHeader>
        {activityExtraFilters.map(key => <label key={key} className="min-w-0 text-sm">{allActivityColumns.find(([field]) => field === key)?.[1]}<select className="mt-1 min-h-11 w-full min-w-0 rounded border px-2" value={page.request[key]} disabled={pending} onChange={event => update({ [key]: event.target.value })}><option value="">All</option>{page.options[key]?.map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}
        <Button variant="outline" onClick={() => update(Object.fromEntries(activityExtraFilters.map(key => [key, ''])))}>Clear activity filters</Button>
      </DialogContent></Dialog>
      <Dialog><DialogTrigger asChild><Button variant="outline">Columns</Button></DialogTrigger><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Customize columns</DialogTitle><DialogDescription>Visibility changes do not change totals, grouping or the full CSV.</DialogDescription></DialogHeader>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setVisible(allActivityColumns.map(([key]) => key))}>Select all analytical fields</Button><Button variant="outline" onClick={() => setVisible(defaultVisibleColumns)}>Reset to default</Button></div>
        <div className="flex flex-wrap gap-2">{Object.entries(activityPresets).map(([name, keys]) => <Button key={name} variant="outline" onClick={() => setVisible(keys)}>{name}</Button>)}</div>
        <div className="grid gap-5 sm:grid-cols-2">{activityColumnGroups.map(group => <fieldset key={group.group}><legend className="mb-2 text-sm font-semibold">{group.group}</legend>{group.columns.map(([key, label]) => <label className="flex min-h-9 items-center gap-2 text-sm" key={key}><input type="checkbox" checked={visible.includes(key)} disabled={visible.length === 1 && visible.includes(key)} onChange={event => setVisible(current => event.target.checked ? [...current, key] : current.filter(value => value !== key))} />{label}</label>)}</fieldset>)}</div>
      </DialogContent></Dialog>
      <Button variant="outline" disabled={pending || exporting || !page.totalRows} onClick={() => exportCsv()}>Download Full Combined Summary CSV</Button>
      <Button variant="ghost" disabled={pending || exporting || !page.totalRows} onClick={() => exportCsv(true)}>Download Visible Columns CSV</Button>
    </div>
    {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
    <p role="status" className="mb-3 text-xs text-slate-600">{pending ? 'Updating filtered aggregates…' : `${page.totalRows.toLocaleString()} matching aggregate rows. Full CSV includes all matching rows and all approved fields.`}{exporting ? ' Preparing CSV…' : ''}</p>
    <div className="max-h-[65vh] max-w-full overflow-auto rounded-lg border" role="region" aria-label="Scrollable activity table" tabIndex={0}>
      <table className="w-full text-left text-sm"><caption className="sr-only">Filtered activity aggregates. Column headings sort all matching rows.</caption><thead className="sticky top-0 z-10 bg-slate-50"><tr>{columns.map(([key, label]) => <th key={key} scope="col" className="border-b bg-slate-50 px-3 py-2" aria-sort={page.request.sort === key ? page.request.direction === 'asc' ? 'ascending' : 'descending' : 'none'}><button disabled={pending} className="flex min-h-11 items-center gap-1 whitespace-nowrap text-xs font-semibold" onClick={() => update({ sort: key, direction: page.request.sort === key && page.request.direction === 'asc' ? 'desc' : 'asc' })}>{label}<ArrowUpDown className="h-3 w-3" /></button></th>)}</tr></thead>
        <tbody className="divide-y">{rows.map((row, index) => <tr key={index} className="align-top hover:bg-slate-50">{columns.map(([key]) => <td key={key} className={`px-3 py-3 tabular-nums ${['activity', 'subact', 'outcome', 'output'].includes(key) ? 'min-w-[18rem] max-w-[26rem] whitespace-normal break-words' : 'min-w-[7rem]'}`}><span title={row[key]} className={['activity', 'subact', 'outcome', 'output'].includes(key) ? 'line-clamp-3' : ''}>{/^\d+$/.test(row[key] ?? '') ? Number(row[key]).toLocaleString('en-US') : row[key] ?? 'N/A'}</span></td>)}</tr>)}</tbody>
      </table>{!rows.length && <p className="p-5 text-sm">No activity groups match this search.</p>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600"><span>Page {page.request.page} of {page.totalPages}</span><label>Rows per page<select value={page.request.pageSize} disabled={pending} onChange={event => update({ pageSize: event.target.value })} className="ml-2 min-h-11 rounded border px-2">{[25, 50, 100].map(size => <option key={size}>{size}</option>)}</select></label><div className="flex gap-2"><Button variant="outline" disabled={pending || page.request.page === 1} onClick={() => update({ page: String(page.request.page - 1) })}>Previous</Button><Button variant="outline" disabled={pending || page.request.page >= page.totalPages} onClick={() => update({ page: String(page.request.page + 1) })}>Next</Button></div></div>
  </section>;
}
