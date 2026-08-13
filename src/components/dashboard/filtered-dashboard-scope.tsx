'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Activity, Building2, Download, MapPin, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ActivityDetailTable from '@/components/ActivityDetailTable';
import GeographicCoverageMap from '@/components/GeographicCoverageMap';
import ChartCard from '@/components/dashboard/chart-card';
import KpiCard from '@/components/dashboard/kpi-card';
import EmptyState from '@/components/dashboard/empty-state';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';
import {
  hasActiveDashboardFilters,
  summarizeActivities,
} from '@/lib/dashboard-filters';
import { createCsv, downloadCsv } from '@/lib/csv-export';

export default function FilteredDashboardScope({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { filters, filteredActivities } = useDashboardFilters();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const active = hasActiveDashboardFilters(filters);

  if (!mounted) return children;
  if (!active || pathname.includes('/gbv-ocmc')) return children;

  const exportRows = () => {
    const csv = createCsv(
      ['Activity ID', 'Year', 'Quarter', 'Project', 'Implementing Partner', 'Province', 'District'],
      filteredActivities.map((row) => [
        row.id,
        row.year,
        row.quarter,
        row.project,
        row.ip,
        row.province,
        row.district,
      ]),
    );
    downloadCsv('unfpa-mel-filtered-activities.csv', csv);
  };

  if (filteredActivities.length === 0) {
    return (
      <section className="space-y-6" aria-label="Empty filtered dashboard results">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            No data available for the selected filters
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Clear one or more filters to broaden the validated synthetic mock-data view.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1" data-empty-kind="csv">
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-500 opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
          <p className="text-xs text-gray-600">CSV export is unavailable because there are no filtered rows.</p>
        </div>
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-empty-kind="kpi"
        >
          <KpiCard label="Activities" value="—" change="No matching data" icon={Activity} />
          <KpiCard label="Participants" value="—" change="No matching data" icon={Users} />
          <KpiCard label="Districts" value="—" change="No matching data" icon={MapPin} />
          <KpiCard label="Partners" value="—" change="No matching data" icon={Building2} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div data-empty-kind="chart">
            <ChartCard title="Filtered activity distribution" subtitle="Validated synthetic mock rows">
              <EmptyState
                title="No chart data for the selected filters"
                detail="The chart will appear when at least one activity row matches."
              />
            </ChartCard>
          </div>
          <div
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            data-empty-kind="map"
          >
            <EmptyState
              title="No map data for the selected filters"
              detail="The coverage map will appear when a matching activity row is available."
            />
          </div>
        </div>
        <div data-empty-kind="table">
          <EmptyState
            title="No table rows for the selected filters"
            detail="No activity records match the current Year, Quarter, Project, Implementing Partner, and Province selection."
          />
        </div>
      </section>
    );
  }

  const summary = summarizeActivities(filteredActivities);
  const projectChart = Array.from(
    filteredActivities.reduce((totals, row) => {
      const current = totals.get(row.project) ?? { activities: 0, participants: 0 };
      totals.set(row.project, {
        activities: current.activities + 1,
        participants: current.participants + row.totalParticipants,
      });
      return totals;
    }, new Map<string, { activities: number; participants: number }>()),
    ([project, values]) => ({ project, ...values }),
  );

  return (
    <section className="space-y-6" aria-label="Filtered mock dashboard results">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Filtered mock-data view. These synthetic activity rows are not live programme data.
          </span>
          <button
            type="button"
            onClick={exportRows}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Activities" value={summary.totalActivities} icon={Activity} />
        <KpiCard label="Participants" value={summary.totalParticipants} icon={Users} />
        <KpiCard label="Districts" value={summary.districts} icon={MapPin} />
        <KpiCard label="Partners" value={summary.partners} icon={Building2} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Filtered activity distribution"
          subtitle="Activities by project in the current URL-backed scope"
        >
          <div className="w-full" aria-label="Filtered activities by project chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="project"
                  stroke="#6B7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Bar dataKey="activities" name="Activities" fill="#004B87" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ul className="sr-only">
              {projectChart.map((item) => (
                <li key={item.project}>
                  {item.project}: {item.activities} activities, {item.participants} participants
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <GeographicCoverageMap activities={filteredActivities} hideGbv />
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Filtered activity rows
        </h2>
        <ActivityDetailTable data={filteredActivities.slice(0, 50)} />
        {filteredActivities.length > 50 ? (
          <p className="mt-2 text-xs text-gray-600">
            Showing the first 50 of {filteredActivities.length} filtered mock rows.
          </p>
        ) : null}
      </div>
    </section>
  );
}
