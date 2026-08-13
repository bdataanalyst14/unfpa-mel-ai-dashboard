'use client';

import { Filter, X } from 'lucide-react';

import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';
import {
  DASHBOARD_FILTER_KEYS,
  hasActiveDashboardFilters,
  type DashboardFilterKey,
} from '@/lib/dashboard-filters';

const labels: Record<DashboardFilterKey, string> = {
  year: 'Year',
  quarter: 'Quarter',
  project: 'Project',
  implementingPartner: 'Implementing Partner',
  province: 'Province',
};

export default function TopFilterBar() {
  const { filters, options, setFilter, clearFilters } = useDashboardFilters();
  const active = hasActiveDashboardFilters(filters);

  return (
    <section
      className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
      aria-label="Global filters"
    >
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>
      {DASHBOARD_FILTER_KEYS.map((key) => (
        <select
          key={key}
          className="min-h-11 w-full min-w-0 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] sm:w-auto"
          value={filters[key]}
          aria-label={labels[key]}
          onChange={(event) => setFilter(key, event.target.value)}
        >
          <option value="">{labels[key]}: All</option>
          {options[key].map((option) => (
            <option key={option} value={option}>
              {labels[key]}: {option}
            </option>
          ))}
        </select>
      ))}
      <button
        type="button"
        onClick={clearFilters}
        disabled={!active}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Clear
      </button>
      <p className="basis-full text-xs text-gray-600">
        Filters apply to validated synthetic mock rows and are preserved in the URL. No live data is enabled.
      </p>
    </section>
  );
}
