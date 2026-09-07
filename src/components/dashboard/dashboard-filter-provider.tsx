'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { mainData } from '@/data/mock/main-data';
import {
  DASHBOARD_FILTER_KEYS,
  buildDashboardFilterOptions,
  filterActivities,
  parseDashboardFilters,
  serializeDashboardFilters,
  type DashboardFilterKey,
  type DashboardFilterState,
} from '@/lib/dashboard-filters';

type DashboardFilterContextValue = {
  dataMode: 'bigquery' | 'mock';
  filtersAvailable: boolean;
  filterMessage: string;
  filters: DashboardFilterState;
  options: ReturnType<typeof buildDashboardFilterOptions>;
  filteredActivities: typeof mainData;
  setFilter: (key: DashboardFilterKey, value: string) => void;
  clearFilters: () => void;
  hrefWithFilters: (href: string) => string;
};

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null);
const mockOptions = buildDashboardFilterOptions(mainData);
const emptyOptions: Record<DashboardFilterKey, string[]> = {
  year: [],
  quarter: [],
  project: [],
  implementingPartner: [],
  province: [],
  district: [],
  municipality: [],
};

export function DashboardFilterProvider({
  children,
  dataMode = 'mock',
  liveOptions,
  filtersAvailable = true,
  filterMessage,
}: {
  children: ReactNode;
  dataMode?: 'bigquery' | 'mock';
  liveOptions?: ReturnType<typeof buildDashboardFilterOptions>;
  filtersAvailable?: boolean;
  filterMessage?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const options = useMemo(
    () => (dataMode === 'bigquery' ? liveOptions ?? emptyOptions : mockOptions),
    [dataMode, liveOptions],
  );
  const filters = useMemo(
    () => dataMode === 'bigquery'
      ? Object.fromEntries(DASHBOARD_FILTER_KEYS.map((key) => [key,
          searchParams.get(key) ?? (key === 'implementingPartner' ? searchParams.get('ip') : null) ?? '',
        ])) as DashboardFilterState
      : parseDashboardFilters(new URLSearchParams(searchParams.toString()), options),
    [searchParams, options, dataMode],
  );
  const filteredActivities = useMemo(
    () => (dataMode === 'mock' ? filterActivities(mainData, filters) : []),
    [dataMode, filters],
  );

  const replaceFilters = useCallback(
    (next: DashboardFilterState) => {
      const params = serializeDashboardFilters(
        next,
        new URLSearchParams(searchParams.toString()),
      );
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setFilter = useCallback(
    (key: DashboardFilterKey, value: string) => {
      replaceFilters({ ...filters, [key]: options[key].includes(value) ? value : '' });
    },
    [filters, replaceFilters, options],
  );

  const clearFilters = useCallback(
    () =>
      replaceFilters({
        year: '',
        quarter: '',
        project: '',
        implementingPartner: '',
        province: '',
        district: '',
        municipality: '',
      }),
    [replaceFilters],
  );

  const hrefWithFilters = useCallback(
    (href: string) => {
      const [target, query = ''] = href.split('?');
      const params = serializeDashboardFilters(filters, new URLSearchParams(query));
      return params.size ? `${target}?${params.toString()}` : target;
    },
    [filters],
  );

  const value = useMemo(
    () => ({
      filters,
      dataMode,
      filtersAvailable,
      filterMessage: filterMessage ?? (dataMode === 'bigquery'
        ? 'Live filters use approved aggregate BigQuery data.'
        : 'Demo / mock data filters are active.'),
      options,
      filteredActivities,
      setFilter,
      clearFilters,
      hrefWithFilters,
    }),
    [clearFilters, dataMode, filterMessage, filteredActivities, filters, filtersAvailable, hrefWithFilters, options, setFilter],
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilters(): DashboardFilterContextValue {
  const value = useContext(DashboardFilterContext);
  if (!value) throw new Error('useDashboardFilters must be used inside DashboardFilterProvider.');
  return value;
}
