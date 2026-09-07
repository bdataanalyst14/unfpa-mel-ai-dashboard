import { Suspense } from 'react';
import DashboardShell from '@/components/layout/dashboard-shell';
import TopFilterBar from '@/components/layout/top-filter-bar';
import { DashboardFilterProvider } from '@/components/dashboard/dashboard-filter-provider';
import FilteredDashboardScope from '@/components/dashboard/filtered-dashboard-scope';
import { headers } from 'next/headers';
import { requireDashboardPageAccess } from '@/lib/server/auth-guard';
import { getDashboardRuntime } from '@/lib/server/dashboard-runtime';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '/dashboard';
  await requireDashboardPageAccess(currentPath);
  const runtime = await getDashboardRuntime();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm text-gray-600">
          Loading dashboard filters...
        </div>
      }
    >
      <DashboardFilterProvider
        dataMode={runtime.dataMode}
        liveOptions={runtime.filterOptions}
        filtersAvailable={runtime.filtersAvailable}
        filterMessage={runtime.filterMessage}
      >
        <DashboardShell dataMode={runtime.dataMode}>
          <TopFilterBar />
          <FilteredDashboardScope>{children}</FilteredDashboardScope>
        </DashboardShell>
      </DashboardFilterProvider>
    </Suspense>
  );
}
