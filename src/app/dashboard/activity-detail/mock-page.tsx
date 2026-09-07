'use client';
import { useState, useMemo } from 'react';
import PageHeader from '@/components/layout/page-header';
import ActivityDetailTable from '@/components/ActivityDetailTable';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { createCsv, downloadCsv } from '@/lib/csv-export';
import { Search, Download } from 'lucide-react';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';

export default function ActivityDetailPage() {
  const { filteredActivities: globallyFilteredActivities } = useDashboardFilters();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [ipFilter, setIpFilter] = useState('All');

  // Compute unique projects & IPs for local page filter dropdowns
  const uniqueProjects = useMemo(() => {
    return ['All', ...Array.from(new Set(globallyFilteredActivities.map(a => a.project)))];
  }, [globallyFilteredActivities]);

  const uniqueIps = useMemo(() => {
    return ['All', ...Array.from(new Set(globallyFilteredActivities.map(a => a.ip)))];
  }, [globallyFilteredActivities]);

  const filteredData = useMemo(() => {
    return globallyFilteredActivities.filter((a) => {
      const matchesSearch =
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.activity.toLowerCase().includes(search.toLowerCase()) ||
        a.district.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === 'All' || a.project === projectFilter;
      const matchesIp = ipFilter === 'All' || a.ip === ipFilter;
      return matchesSearch && matchesProject && matchesIp;
    });
  }, [globallyFilteredActivities, search, projectFilter, ipFilter]);

  function exportFilteredRows() {
    const csv = createCsv(
      [
        'Activity ID',
        'Project',
        'Implementing Partner',
        'Activity',
        'Province',
        'District',
        'Palika',
        'Start Date',
        'End Date',
        'Validation Status',
      ],
      filteredData.map((row) => [
        row.id,
        row.project,
        row.ip,
        row.activity,
        row.province,
        row.district,
        row.palika,
        row.startDate,
        row.endDate,
        row.validationStatus,
      ]),
    );
    downloadCsv('unfpa-mel-activity-detail.csv', csv);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Detail Log"
        subtitle="Sample activity log for SMT prototype demonstration; synthetic ACT-2025 rows are not official registry activities."
        action={
          <button
            type="button"
            onClick={exportFilteredRows}
            disabled={filteredData.length === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        }
      />

      <DataSourceStatusPanel route="activity-detail" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, activity description, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87]"
            aria-label="Search activities"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="flex-1 md:flex-none text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87]"
            aria-label="Filter by project"
          >
            {uniqueProjects.map(proj => (
              <option key={proj} value={proj}>Project: {proj}</option>
            ))}
          </select>
          <select
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className="flex-1 md:flex-none text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87]"
            aria-label="Filter by partner"
          >
            {uniqueIps.map(ip => (
              <option key={ip} value={ip}>IP: {ip}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
        <span>Showing {filteredData.length} of {globallyFilteredActivities.length} filtered records</span>
      </div>

      {/* Table Container */}
      <ActivityDetailTable data={filteredData} />
    </div>
  );
}

