import { redirect } from 'next/navigation';
import { preserveDashboardFilterParams } from '@/lib/dashboard-filters';

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = preserveDashboardFilterParams(await searchParams).toString();
  redirect(`/dashboard/executive-overview${query ? `?${query}` : ''}`);
}
