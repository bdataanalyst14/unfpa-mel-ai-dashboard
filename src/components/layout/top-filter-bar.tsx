'use client';
import { Filter } from 'lucide-react';

const filters = [
  { label: 'Year', options: ['2025', '2024', '2023'] },
  { label: 'Quarter', options: ['All', 'Q1', 'Q2', 'Q3', 'Q4'] },
  { label: 'Project', options: ['All', 'CP9 SRHR', 'CP9 GEWE', 'CP9 AYSRHR', 'KOICA AYSRHR', 'UNFPA Supplies'] },
  { label: 'IP/Partner', options: ['All', 'ADRA Nepal', 'FPAN', 'WOREC', 'CREHPA'] },
  { label: 'Province', options: ['All', 'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'] },
];

export default function TopFilterBar() {
  return (
    <div className="flex items-center gap-3 flex-wrap bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>
      {filters.map((f) => (
        <select
          key={f.label}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87]"
          defaultValue={f.options[0]}
          aria-label={f.label}
        >
          {f.options.map((opt) => (
            <option key={opt} value={opt}>{f.label}: {opt}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
