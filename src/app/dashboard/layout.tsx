import DashboardShell from '@/components/layout/dashboard-shell';
import TopFilterBar from '@/components/layout/top-filter-bar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <TopFilterBar />
      {children}
    </DashboardShell>
  );
}
