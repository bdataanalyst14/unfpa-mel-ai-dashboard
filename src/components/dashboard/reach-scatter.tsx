'use client';

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AggregateRow } from '@/lib/aggregate-contract';
import { numeric, ratio } from '@/lib/management-analysis';

export default function ReachScatter({ rows }: { rows: AggregateRow[] }) {
  const points = rows
    .filter(row => numeric(row.events) !== null && numeric(row.participants) !== null)
    .map(row => ({
      name: row.label,
      activities: Number(row.events),
      attendance: Number(row.participants),
    }));

  return (
    <div className="w-full space-y-2">
      <div
        className="h-72 w-full"
        role="img"
        aria-label="Partner reported activities versus participant attendance"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            id="reach-scatter-chart"
            margin={{ top: 15, right: 20, bottom: 35, left: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              type="number"
              dataKey="activities"
              name="Reported activities"
              tick={{ fontSize: 10, fill: '#64748B' }}
              label={{
                value: 'Reported activities',
                position: 'insideBottom',
                offset: -12,
                fontSize: 11,
                fill: '#475569',
              }}
            />
            <YAxis
              type="number"
              dataKey="attendance"
              name="Attendance"
              tick={{ fontSize: 10, fill: '#64748B' }}
              width={65}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              label={{
                value: 'Participant attendance',
                angle: -90,
                position: 'insideLeft',
                fontSize: 11,
                fill: '#475569',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#94A3B8' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                const attendanceRatio = ratio(String(data.attendance), String(data.activities), false);
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs space-y-1">
                    <p className="font-semibold text-[#004B87]">{data.name}</p>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Reported activities:</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        {data.activities.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Participant attendance:</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        {data.attendance.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-100 pt-1 text-[11px] text-slate-500">
                      <span>Ratio:</span>
                      <span className="font-medium text-slate-700 tabular-nums">
                        {attendanceRatio} participants / activity
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              data={points}
              fill="#004B87"
              stroke="#FF6600"
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-600">
        Each point is a partner. Withheld values are omitted. Volume and attendance do not establish effectiveness. Exact values are available in the comparison matrix.
      </p>
      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004B87]">Partner chart values and ratios</summary>
        <div className="max-h-64 overflow-auto" tabIndex={0} role="region" aria-label="Partner chart values">
          <table className="w-full text-left">
            <caption className="sr-only">Publishable partner counts used in the scatter plot</caption>
            <thead><tr><th scope="col" className="p-2">Partner</th><th scope="col" className="p-2 text-right">Reported activities</th><th scope="col" className="p-2 text-right">Attendance</th><th scope="col" className="p-2 text-right">Attendance/activity</th></tr></thead>
            <tbody>{points.map(point => <tr key={point.name}><th scope="row" className="p-2 font-medium">{point.name}</th><td className="p-2 text-right tabular-nums">{point.activities.toLocaleString('en-US')}</td><td className="p-2 text-right tabular-nums">{point.attendance.toLocaleString('en-US')}</td><td className="p-2 text-right tabular-nums">{ratio(String(point.attendance), String(point.activities), false)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
