'use client';

import { usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';
import type { DashboardFilterKey } from '@/lib/dashboard-filters';

const labels: Record<DashboardFilterKey, string> = {
  year: 'Year', quarter: 'Quarter', project: 'Project', implementingPartner: 'IP / Partner',
  province: 'Province', district: 'District', municipality: 'Municipality / LG',
};

export default function TopFilterBar() {
  const pathname = usePathname();
  const { dataMode, filters, options, filtersAvailable, filterMessage, setFilter, clearFilters } = useDashboardFilters();
  const route = pathname.split('/').pop();

  const supports = (key: DashboardFilterKey) => {
    if (dataMode === 'mock') return true;
    if (['data-quality', 'gbv-ocmc', 'gbv-ocmc-summary', 'indicator-progress'].includes(route ?? '')) return false;
    if (route === 'ip-performance') return key === 'implementingPartner';
    return true;
  };

  if (dataMode === 'bigquery' && !Object.keys(labels).some(key => supports(key as DashboardFilterKey))) return null;

  return (
    <section className="space-y-2 rounded-xl border bg-white px-4 py-3" aria-label="Global filters">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-full items-center gap-1 mb-1 sm:w-auto">
          <Filter className="h-4 w-4" /><span className="text-sm font-medium">Filters</span>
        </div>
        {(Object.entries(labels) as Array<[DashboardFilterKey, string]>).map(([key, label]) => {
          const supported = supports(key);
          if (!supported) return null;
          const disabled = !filtersAvailable || !supported || !options[key].length;
          const values = Array.from(new Set([...options[key], ...(filters[key] ? [filters[key]] : [])]));
          return (
            <label key={key} className="flex w-[calc(50%-0.375rem)] min-w-0 max-w-full flex-col gap-1 text-xs text-gray-600 sm:w-auto">
              {label}
              <select aria-label={label} value={filters[key]} disabled={disabled}
                title={disabled ? 'Filter options unavailable' : label}
                className="min-h-11 max-w-full rounded-lg border px-3 py-1.5 text-sm sm:max-w-36 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                onChange={event => setFilter(key, event.target.value)}>
                <option value="">{disabled ? 'Unavailable' : 'All'}</option>
                {values.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          );
        })}
        <button type="button" onClick={clearFilters} className="min-h-11 text-xs font-medium text-[#A63F00] hover:underline">Clear filters</button>
      </div>

      <p className="text-xs text-gray-500">{filterMessage} Only applicable filters are shown.</p>
    </section>
  );
}
