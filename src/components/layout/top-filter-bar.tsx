'use client';

import { usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';
import type { DashboardFilterKey } from '@/lib/dashboard-filters';

const labels: Record<DashboardFilterKey, string> = {
  year: 'Year',
  quarter: 'Quarter',
  project: 'Project',
  implementingPartner: 'IP / Partner',
  province: 'Province',
  district: 'District',
  municipality: 'Municipality / LG',
};

export default function TopFilterBar() {
  const pathname = usePathname();
  const {
    dataMode,
    filters,
    options,
    filtersAvailable,
    filterMessage,
    setFilter,
    clearFilters,
  } = useDashboardFilters();
  const route = pathname.split('/').pop();

  const supports = (key: DashboardFilterKey) => {
    if (dataMode === 'mock') return true;
    if (['data-quality', 'gbv-ocmc', 'gbv-ocmc-summary', 'indicator-progress'].includes(route ?? ''))
      return false;
    if (route === 'ip-performance') return key === 'implementingPartner';
    return true;
  };

  if (
    dataMode === 'bigquery' &&
    !Object.keys(labels).some(key => supports(key as DashboardFilterKey))
  )
    return null;

  const renderFilter = ([key, label]: [DashboardFilterKey, string]) => {
    const supported = supports(key);
    if (!supported) return null;
    const disabled = !filtersAvailable || !supported || !options[key].length;
    const values = Array.from(
      new Set([...options[key], ...(filters[key] ? [filters[key]] : [])])
    );
    return (
      <label
        key={key}
        className="flex w-[calc(50%-0.375rem)] min-w-0 max-w-full flex-col gap-1 text-xs font-medium text-slate-700 sm:w-auto"
      >
        {label}
        <select
          aria-label={label}
          value={filters[key]}
          disabled={disabled}
          title={disabled ? 'Filter options unavailable' : label}
          className="min-h-10 max-w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm focus:border-[#004B87] focus:outline-none focus:ring-1 focus:ring-[#004B87] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:max-w-36"
          onChange={event => setFilter(key, event.target.value)}
        >
          <option value="">{disabled ? 'Unavailable' : 'All'}</option>
          {values.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    );
  };

  const entries = Object.entries(labels) as Array<[DashboardFilterKey, string]>;
  const geographyKeys = ['province', 'district', 'municipality'];
  const compact = dataMode === 'bigquery' && route === 'activity-progress';

  return (
    <section
      className="space-y-2.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
      aria-label="Global filters"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-full items-center gap-1.5 mb-1.5 sm:w-auto sm:mb-2">
          <Filter className="h-4 w-4 text-[#004B87]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Filters</span>
        </div>
        {entries.filter(([key]) => !compact || !geographyKeys.includes(key)).map(renderFilter)}
        <button
          type="button"
          onClick={clearFilters}
          className="min-h-10 text-xs font-semibold text-[#A63F00] hover:text-[#FF6600] hover:underline transition-colors pb-1.5 sm:pb-2"
        >
          Clear filters
        </button>
      </div>

      {compact && (
        <details className="text-xs text-slate-600 border-t border-slate-100 pt-2">
          <summary className="cursor-pointer py-1 font-medium hover:text-slate-900">
            Event location filters
            {filters.province || filters.district || filters.municipality ? ' (active)' : ''}
          </summary>
          <div className="flex flex-wrap gap-3 py-2">
            {entries.filter(([key]) => geographyKeys.includes(key)).map(renderFilter)}
          </div>
        </details>
      )}
      <p className="text-[11px] text-slate-500">
        {filterMessage} Only applicable filters are shown.
      </p>
    </section>
  );
}
