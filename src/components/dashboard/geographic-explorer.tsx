'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { AggregateSection } from '@/lib/aggregate-contract';
import { useDashboardFilters } from './dashboard-filter-provider';
import LocalUnitCoverageMap from './local-unit-coverage-map';

const measures: Record<string, string> = {
  events: 'Reported activities',
  participants: 'Participant attendance',
  reportable: 'Reportable participants',
};

const provinceNames: Record<string, string> = {
  '1': 'Koshi',
  '2': 'Madhesh',
  '3': 'Bagmati',
  '4': 'Gandaki',
  '5': 'Lumbini',
  '6': 'Karnali',
  '7': 'Sudurpashchim',
};

export default function GeographicExplorer({
  sections,
  compact = false,
}: {
  sections: AggregateSection[];
  compact?: boolean;
}) {
  const [measure, setMeasure] = useState('events');
  const [pending, startTransition] = useTransition();
  const { filters, options } = useDashboardFilters();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const select = (province: string, district = '') => {
    const params = new URLSearchParams(search.toString());
    for (const key of ['province', 'district', 'municipality', 'page']) params.delete(key);
    if (province) params.set('province', province);
    if (district) params.set('district', district);
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };

  const districts = sections.find(section => section.key === 'district')?.rows ?? [];

  return (
    <div className="space-y-4" aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
          <span>Map measure:</span>
          <select
            aria-label="Map measure"
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-sm focus:border-[#004B87] focus:outline-none focus:ring-1 focus:ring-[#004B87]"
            value={measure}
            onChange={event => setMeasure(event.target.value)}
          >
            {Object.entries(measures).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Geographic drill state" className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-700">
            Nepal
            {filters.province && <span className="text-slate-400 font-normal"> &gt; </span>}
            {filters.province && <span className="font-semibold text-[#004B87]">{filters.province}</span>}
            {filters.district && <span className="text-slate-400 font-normal"> &gt; </span>}
            {filters.district && <span className="font-semibold text-[#004B87]">{filters.district}</span>}
            {filters.municipality && <span className="text-slate-400 font-normal"> &gt; </span>}
            {filters.municipality && <span className="font-semibold text-[#004B87]">{filters.municipality}</span>}
          </span>
          {(filters.province || filters.district || filters.municipality) && (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                className="min-h-8 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                disabled={pending}
                onClick={() =>
                  select(
                    filters.municipality || filters.district ? filters.province : '',
                    filters.municipality ? filters.district : ''
                  )
                }
              >
                Back
              </button>
              <button
                type="button"
                className="min-h-8 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-[#A63F00] shadow-sm hover:bg-orange-50 disabled:opacity-50"
                disabled={pending}
                onClick={() => select('')}
              >
                Reset geography
              </button>
            </div>
          )}
        </nav>
      </div>

      <LocalUnitCoverageMap
        districts={districts.map(row => ({ label: row.label, value: row[measure] }))}
        measure={measures[measure]}
        compact={compact}
        selectedDistrict={filters.district}
        onSelect={(district, province) => {
          const name = options.district.find(value => value.toLowerCase() === district.toLowerCase());
          const provinceLabel = provinceNames[province] ?? province;
          const provinceName = options.province.find(value => value.toLowerCase() === provinceLabel.toLowerCase());
          if (!filters.province && provinceName) select(provinceName);
          else if (name) select(filters.province || provinceName || '', name);
        }}
      />

      <p className="text-xs text-slate-500">
        Select a reported district polygon to focus its province, then select again to filter the district. All polygons carry district values. Municipality selection is available only through the event-location filter.
      </p>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {['province', 'district'].map(key => (
            <div key={key} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <h3 className="mb-2 text-xs font-semibold text-slate-800">
                {key === 'province' ? 'Provinces' : 'Districts'} · {measures[measure]}
              </h3>
              <div className="max-h-64 overflow-auto rounded border border-slate-200 bg-white">
                {sections
                  .find(section => section.key === key)
                  ?.rows.map(row => (
                    <button
                      key={row.label}
                      disabled={pending || row.label === 'Unspecified'}
                      className="flex min-h-10 w-full items-center justify-between gap-3 border-b border-slate-100 p-2.5 text-left text-xs transition-colors hover:bg-blue-50/40 disabled:opacity-50 last:border-b-0"
                      onClick={() =>
                        select(
                          key === 'province' ? row.label : filters.province,
                          key === 'district' ? row.label : ''
                        )
                      }
                    >
                      <span className="font-medium text-slate-700">{row.label}</span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {/^\d+$/.test(row[measure])
                          ? Number(row[measure]).toLocaleString('en-US')
                          : row[measure]}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
