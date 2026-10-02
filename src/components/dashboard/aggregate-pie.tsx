'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AggregatePie({ metrics, label }: { metrics: { label: string; value: string | number }[]; label?: string }) {
  const data = metrics
    .filter(m => /^\d+$/.test(String(m.value)) && Number(m.value) > 0)
    .map(m => ({ name: m.label, value: Number(m.value) }));

  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-gray-500">No numeric data available</div>;
  }

  const COLORS = ['#004B87', '#E57200', '#00A859', '#7C2081', '#E80053', '#0083A9'];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
            formatter={(value: number) => [new Intl.NumberFormat().format(value), 'Participants']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
