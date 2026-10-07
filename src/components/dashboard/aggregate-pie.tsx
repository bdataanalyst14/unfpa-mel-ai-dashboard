'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AggregatePie({ metrics, label }: { metrics: { label: string; value: string | number }[]; label?: string }) {
  const data = metrics
    .filter(m => /^\d+$/.test(String(m.value)) && Number(m.value) > 0)
    .map(m => ({ name: m.label, value: Number(m.value) }));

  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-gray-500">No numeric data available</div>;
  }

  const COLORS = ['#004B87', '#E57200', '#00A859', '#7C2081', '#E80053', '#0083A9'];

  return (
    <div aria-label={label}>
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart id={label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'aggregate-pie'}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [new Intl.NumberFormat().format(value), label ?? 'Count']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <dl className="mt-2 flex max-h-40 flex-wrap justify-center gap-x-4 gap-y-2 overflow-y-auto text-xs">{metrics.map(metric => <div key={metric.label} className="flex gap-1"><dt>{metric.label}:</dt><dd>{metric.value}</dd></div>)}</dl>
    {metrics.some(metric => !/^\d+$/.test(String(metric.value))) && <p className="mt-2 text-xs text-slate-600">Withheld or unavailable categories have no slice. The ring shows publishable counts only.</p>}
    </div>
  );
}
