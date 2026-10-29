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

      {compact ? (
        <div className="space-y-4">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Large custom Nepal Programme Coverage Map */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <LocalUnitCoverageMap
              districts={districts.map(row => ({ label: row.label, value: row[measure] }))}
              measure={measures[measure]}
              compact={false}
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
          </div>

          {/* RIGHT: District activity/reach ranking & province summary */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">
                    District Ranking · {measures[measure]}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Scroll to inspect; click to filter district
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {districts.length} reported
                </span>
              </div>
              <div
                tabIndex={0}
                aria-label="District activity and reach ranking"
                className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 rounded border border-slate-200 bg-white text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004B87]"
              >
                {districts.map(row => {
                  const isSelected = filters.district?.toLowerCase() === row.label.toLowerCase();
                  return (
                    <button
                      key={row.label}
                      disabled={pending || row.label === 'Unspecified'}
                      className={`flex min-h-10 w-full items-center justify-between gap-3 p-2.5 text-left transition-colors hover:bg-blue-50/40 disabled:opacity-50 ${
                        isSelected ? 'bg-blue-50 font-semibold text-[#004B87]' : 'text-slate-700'
                      }`}
                      onClick={() => select(filters.province, row.label)}
                    >
                      <span className="truncate">{row.label}</span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {/^\d+$/.test(row[measure])
                          ? Number(row[measure]).toLocaleString('en-US')
                          : row[measure]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <h3 className="mb-2 text-xs font-semibold text-slate-800">
                Provinces · {measures[measure]}
              </h3>
              <div
                tabIndex={0}
                aria-label="Province ranking"
                className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded border border-slate-200 bg-white text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004B87]"
              >
                {sections
                  .find(section => section.key === 'province')
                  ?.rows.map(row => {
                    const isSelected = filters.province?.toLowerCase() === row.label.toLowerCase();
                    return (
                      <button
                        key={row.label}
                        disabled={pending || row.label === 'Unspecified'}
                        className={`flex min-h-8 w-full items-center justify-between gap-2 p-2 text-left transition-colors hover:bg-blue-50/40 disabled:opacity-50 ${
                          isSelected ? 'bg-blue-50 font-semibold text-[#004B87]' : 'text-slate-700'
                        }`}
                        onClick={() => select(row.label, '')}
                      >
                        <span className="truncate">{row.label}</span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          {/^\d+$/.test(row[measure])
                            ? Number(row[measure]).toLocaleString('en-US')
                            : row[measure]}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
