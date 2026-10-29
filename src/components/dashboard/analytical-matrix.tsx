'use client';

import { useMemo, useState } from 'react';
import type { AggregateRow } from '@/lib/aggregate-contract';
import { numeric } from '@/lib/management-analysis';

const MEASURE_KEYS = new Set([
  'events',
  'participants',
  'reportable',
  'provinces',
  'districts',
  'palikas',
  'partners',
  'projects',
]);
const RATIO_KEYS = new Set(['share', 'attendanceRatio', 'reportableShare']);
const sortValue = (value: string | undefined, key: string) => RATIO_KEYS.has(key)
  ? value !== undefined && /^\d+(\.\d+)?%?$/.test(value) && Number.isFinite(Number.parseFloat(value)) ? Number.parseFloat(value) : null
  : numeric(value);

export default function AnalyticalMatrix({
  rows,
  columns,
  label,
}: {
  rows: AggregateRow[];
  columns: [string, string][];
  label: string;
}) {
  const [sort, setSort] = useState({ key: columns[0][0], direction: 1 });

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (!MEASURE_KEYS.has(sort.key) && !RATIO_KEYS.has(sort.key)) return sort.direction * (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '', undefined, { numeric: true });
      const left = sortValue(a[sort.key], sort.key);
      const right = sortValue(b[sort.key], sort.key);
      if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
      if (left !== null && right !== null) {
        return sort.direction * (left - right);
      }
      return (
        sort.direction *
        (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '', undefined, { numeric: true })
      );
    });
  }, [rows, sort]);

  return (
    <div className="w-full space-y-2">
      <div
        className="max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm"
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <table className="w-full text-xs">
          <caption className="sr-only">{label}</caption>
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map(([key, title]) => {
                const isNumericCol = MEASURE_KEYS.has(key) || RATIO_KEYS.has(key);
                const isActive = sort.key === key;
                return (
                  <th
                    key={key}
                    aria-sort={
                      isActive
                        ? sort.direction === 1
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={`px-3 py-2 font-semibold ${
                      isNumericCol ? 'text-right' : 'text-left'
                    } ${isActive ? 'text-[#004B87] bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <button
                      type="button"
                      className={`inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap hover:text-[#004B87] focus:outline-none focus:underline ${
                        isNumericCol ? 'justify-end' : 'justify-start'
                      }`}
                      onClick={() =>
                        setSort({
                          key,
                          direction: isActive ? -sort.direction : 1,
                        })
                      }
                    >
                      <span>{title}</span>
                      <span className="text-[11px] text-slate-400" aria-hidden="true">
                        {isActive ? (sort.direction === 1 ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((row, index) => (
              <tr
                key={index}
                className="align-top transition-colors hover:bg-blue-50/30 odd:bg-white even:bg-slate-50/30"
              >
                {columns.map(([key]) => {
                  const rawVal = row[key];
                  const numVal = numeric(rawVal);
                  const isNumericCol = MEASURE_KEYS.has(key) || RATIO_KEYS.has(key);

                  return (
                    <td
                      key={key}
                      className={`min-w-24 max-w-80 break-words px-3 py-2.5 tabular-nums ${
                        isNumericCol ? 'text-right' : 'text-left'
                      }`}
                    >
                      {rawVal === '<5' ? (
                        <span
                          title="Small count withheld under privacy rules (<5)"
                          className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60"
                        >
                          &lt;5
                        </span>
                      ) : (
                        <span title={rawVal} className="text-slate-800">
                          {!MEASURE_KEYS.has(key) || numVal === null
                            ? rawVal ?? 'N/A'
                            : numVal.toLocaleString('en-US')}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Showing {rows.length} records</span>
        <span>Click column headers to sort</span>
      </div>
    </div>
  );
}
