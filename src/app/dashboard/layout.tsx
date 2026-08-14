import { Suspense } from 'react';
import DashboardShell from '@/components/layout/dashboard-shell';
import TopFilterBar from '@/components/layout/top-filter-bar';
import { DashboardFilterProvider } from '@/components/dashboard/dashboard-filter-provider';
import FilteredDashboardScope from '@/components/dashboard/filtered-dashboard-scope';
import { requireDashboardPageAccess } from '@/lib/server/auth-guard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardPageAccess();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm text-gray-600">
          Loading dashboard filters...
        </div>
      }
    >
      <DashboardFilterProvider>
        <DashboardShell>
          <TopFilterBar />
          <FilteredDashboardScope>{children}</FilteredDashboardScope>
        </DashboardShell>
      </DashboardFilterProvider>
    </Suspense>
  );
}
