'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { AggregateSection } from '@/lib/aggregate-contract';
import { useDashboardFilters } from './dashboard-filter-provider';
import LocalUnitCoverageMap from './local-unit-coverage-map';

const measures: Record<string, string> = { events: 'Reported activities', participants: 'Participant attendance', reportable: 'Reportable participants' };
const provinceNames: Record<string, string> = { '1': 'Koshi', '2': 'Madhesh', '3': 'Bagmati', '4': 'Gandaki', '5': 'Lumbini', '6': 'Karnali', '7': 'Sudurpashchim' };

export default function GeographicExplorer({ sections, compact = false }: { sections: AggregateSection[]; compact?: boolean }) {
  const [measure, setMeasure] = useState('events');
  const [pending, startTransition] = useTransition();
  const { filters, options } = useDashboardFilters();
  const router = useRouter(), pathname = usePathname(), search = useSearchParams();
  const select = (province: string, district = '') => {
    const params = new URLSearchParams(search.toString());
    for (const key of ['province', 'district', 'municipality', 'page']) params.delete(key);
    if (province) params.set('province', province);
    if (district) params.set('district', district);
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };
  const districts = sections.find(section => section.key === 'district')?.rows ?? [];
  return <div className="space-y-3" aria-busy={pending}>
    <div className="flex flex-wrap items-center gap-3"><label className="text-xs">Map by<select aria-label="Map measure" className="ml-2 min-h-11 rounded border px-2" value={measure} onChange={event => setMeasure(event.target.value)}>{Object.entries(measures).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
    <nav aria-label="Geographic drill state" className="flex flex-wrap items-center gap-2 text-xs"><span>Nepal{filters.province && ` > ${filters.province}`}{filters.district && ` > ${filters.district}`}{filters.municipality && ` > ${filters.municipality}`}</span>{(filters.province || filters.district) && <><button className="min-h-11 rounded border px-3" disabled={pending} onClick={() => select(filters.district ? filters.province : '')}>Back</button><button className="min-h-11 rounded border px-3" disabled={pending} onClick={() => select('')}>Reset geography</button></>}</nav>
    <LocalUnitCoverageMap districts={districts.map(row => ({ label: row.label, value: row[measure] }))} measure={measures[measure]} compact={compact} selectedDistrict={filters.district} onSelect={(district, province) => {
      const name = options.district.find(value => value.toLowerCase() === district.toLowerCase());
      const provinceName = options.province.find(value => value === provinceNames[province]);
      if (!filters.province && provinceName) select(provinceName);
      else if (name) select(filters.province || provinceName || '', name);
    }} />
    <p className="text-xs text-slate-600">Select a reported district polygon to focus its province, then select again to filter the district. All polygons carry district values. Municipality selection is available only through the event-location filter.</p>
    {!compact && <div className="grid gap-3 sm:grid-cols-2">{['province', 'district'].map(key => <div key={key}><h3 className="mb-2 text-xs font-semibold">{key === 'province' ? 'Provinces' : 'Districts'} · {measures[measure]}</h3><div className="max-h-64 overflow-auto rounded border">{sections.find(section => section.key === key)?.rows.map(row => <button key={row.label} disabled={pending || row.label === 'Unspecified'} className="flex min-h-11 w-full items-center justify-between gap-3 border-b p-3 text-left text-xs hover:bg-slate-50" onClick={() => select(key === 'province' ? row.label : filters.province, key === 'district' ? row.label : '')}><span>{row.label}</span><span className="font-semibold">{/^\d+$/.test(row[measure]) ? Number(row[measure]).toLocaleString() : row[measure]}</span></button>)}</div></div>)}</div>}
  </div>;
}
