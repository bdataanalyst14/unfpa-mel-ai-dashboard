'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';
import type { DashboardFilterKey } from '@/lib/dashboard-filters';

const labels: Record<DashboardFilterKey, string> = {
  year: 'Year', quarter: 'Quarter', project: 'Project', implementingPartner: 'IP / Partner',
  province: 'Province', district: 'District', municipality: 'Municipality / LG',
};

export default function TopFilterBar() {
  const pathname = usePathname();
  const { dataMode, filters, options, filtersAvailable, filterMessage, setFilter, clearFilters } = useDashboardFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const route = pathname.split('/').pop();

  const supports = (key: DashboardFilterKey) => {
    if (dataMode === 'mock') return true;
    if (['data-quality', 'gbv-ocmc', 'gbv-ocmc-summary'].includes(route ?? '')) return false;
    if (route === 'ip-performance') return key === 'implementingPartner';
    if (route === 'indicator-progress') return key !== 'implementingPartner';
    return true;
  };

  return (
    <section className="space-y-2 rounded-xl border bg-white px-4 py-3" aria-label="Global filters">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-1 mb-1">
          <Filter className="h-4 w-4" /><span className="text-sm font-medium">Filters</span>
        </div>
        {(Object.entries(labels) as Array<[DashboardFilterKey, string]>).map(([key, label]) => {
          const supported = supports(key);
          const disabled = !filtersAvailable || !supported || !options[key].length;
          const values = Array.from(new Set([...options[key], ...(filters[key] ? [filters[key]] : [])]));
          return (
            <label key={key} className="flex w-[calc(50%-0.375rem)] min-w-0 max-w-full flex-col gap-1 text-xs text-gray-600 sm:w-auto">
              {label}
              <select aria-label={label} value={filters[key]} disabled={disabled}
                title={!supported ? 'Not supported on this page' : disabled ? 'Filter options unavailable' : label}
                className="min-h-11 max-w-full rounded-lg border px-3 py-1.5 text-sm sm:max-w-36 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                onChange={event => setFilter(key, event.target.value)}>
                <option value="">{!supported ? 'Not supported' : disabled ? 'Unavailable' : 'All'}</option>
                {values.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          );
        })}
        <button type="button" aria-expanded={showAdvanced} aria-controls="advanced-dashboard-filters" onClick={() => setShowAdvanced(!showAdvanced)} className="flex min-h-11 items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          More Filters
        </button>
        <button type="button" onClick={clearFilters} className="min-h-11 text-xs font-medium text-[#A63F00] hover:underline">Clear filters</button>
      </div>

      {showAdvanced && (
        <div id="advanced-dashboard-filters" className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          {['Outcome', 'Output', 'Activity', 'Indicator', 'Fund Code', 'Event Type', 'Date range'].map(label => (
            <label key={label} className="flex flex-col gap-1 text-xs text-gray-600">
              {label}
              <select aria-label={label} disabled title="Not supported by the current dashboard query contract"
                className="cursor-not-allowed rounded-lg border bg-gray-100 px-3 py-1.5 text-sm text-gray-500">
                <option>Not supported</option>
              </select>
            </label>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">{filterMessage} Disabled filters are not supported on this page or have no available options.</p>
    </section>
  );
}
