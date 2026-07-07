'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { suppressSmallCount } from '@/lib/privacy-rules';

const data = [
  { name: 'Koshi', survivors: 125, color: '#004B87' },
  { name: 'Madhesh', survivors: 98, color: '#0066B3' },
  { name: 'Bagmati', survivors: 210, color: '#FF6600' },
  { name: 'Gandaki', survivors: 75, color: '#FF8533' },
  { name: 'Lumbini', survivors: 88, color: '#10B981' },
  { name: 'Karnali', survivors: 42, color: '#F59E0B' },
  { name: 'Sudurpashchim', survivors: 65, color: '#9CA3AF' },
];

export default function GbvSummaryChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
          formatter={(value: number) => [suppressSmallCount(value), 'Survivors Reached']}
        />
        <Bar dataKey="survivors" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
