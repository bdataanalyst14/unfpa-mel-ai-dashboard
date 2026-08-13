import { redirect } from 'next/navigation';
import { mainData } from '@/data/mock/main-data';
import {
  buildDashboardFilterOptions,
  parseDashboardFilters,
  serializeDashboardFilters,
} from '@/lib/dashboard-filters';

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseDashboardFilters(
    await searchParams,
    buildDashboardFilterOptions(mainData),
  );
  const query = serializeDashboardFilters(filters).toString();
  redirect(`/dashboard/executive-overview${query ? `?${query}` : ''}`);
}
