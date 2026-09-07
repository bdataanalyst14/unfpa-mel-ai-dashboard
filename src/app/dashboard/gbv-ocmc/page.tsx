import { redirect } from 'next/navigation';
import { preserveDashboardFilterParams } from '@/lib/dashboard-filters';

export default async function GbvOcmcRouteAliasPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = preserveDashboardFilterParams(await searchParams).toString();
  redirect(`/dashboard/gbv-ocmc-summary${query ? `?${query}` : ''}`);
}
