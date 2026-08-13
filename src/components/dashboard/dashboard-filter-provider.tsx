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
  buildDashboardFilterOptions,
  filterActivities,
  parseDashboardFilters,
  serializeDashboardFilters,
  type DashboardFilterKey,
  type DashboardFilterState,
} from '@/lib/dashboard-filters';

type DashboardFilterContextValue = {
  filters: DashboardFilterState;
  options: ReturnType<typeof buildDashboardFilterOptions>;
  filteredActivities: typeof mainData;
  setFilter: (key: DashboardFilterKey, value: string) => void;
  clearFilters: () => void;
  hrefWithFilters: (href: string) => string;
};

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null);
const options = buildDashboardFilterOptions(mainData);

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseDashboardFilters(new URLSearchParams(searchParams.toString()), options),
    [searchParams],
  );
  const filteredActivities = useMemo(
    () => filterActivities(mainData, filters),
    [filters],
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
    [filters, replaceFilters],
  );

  const clearFilters = useCallback(
    () =>
      replaceFilters({
        year: '',
        quarter: '',
        project: '',
        implementingPartner: '',
        province: '',
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
      options,
      filteredActivities,
      setFilter,
      clearFilters,
      hrefWithFilters,
    }),
    [clearFilters, filteredActivities, filters, hrefWithFilters, setFilter],
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
