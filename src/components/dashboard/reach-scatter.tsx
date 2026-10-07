'use client';

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { AggregateRow } from '@/lib/aggregate-contract';
import { numeric } from '@/lib/management-analysis';

export default function ReachScatter({ rows }: { rows: AggregateRow[] }) {
  const points = rows.filter(row => numeric(row.events) !== null && numeric(row.participants) !== null).map(row => ({ name: row.label, activities: Number(row.events), attendance: Number(row.participants) }));
  return <div><div className="h-72 w-full" role="img" aria-label="Partner reported activities versus participant attendance"><ResponsiveContainer width="100%" height="100%"><ScatterChart id="reach-scatter-chart" margin={{ top: 10, right: 12, bottom: 25, left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="activities" name="Reported activities" tick={{ fontSize: 10 }} label={{ value: 'Reported activities', position: 'bottom', fontSize: 11 }} /><YAxis type="number" dataKey="attendance" name="Attendance" tick={{ fontSize: 10 }} width={55} /><Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => active && payload?.length ? <div className="rounded border bg-white p-3 text-xs"><p className="font-semibold">{payload[0].payload.name}</p><p>Reported activities: {payload[0].payload.activities.toLocaleString()}</p><p>Participant attendance: {payload[0].payload.attendance.toLocaleString()}</p></div> : null} /><Scatter data={points} fill="#004B87" isAnimationActive={false} /></ScatterChart></ResponsiveContainer></div><p className="text-xs text-slate-600">Each point is a partner. Withheld values are omitted. Volume and attendance do not establish effectiveness. Exact values are available in the comparison matrix.</p></div>;
}
