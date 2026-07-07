'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'CP9 SRHR', planned: 100, completed: 82, completionRate: 82 },
  { name: 'CP9 GEWE', planned: 80, completed: 52, completionRate: 65 },
  { name: 'CP9 AYSRHR', planned: 60, completed: 48, completionRate: 80 },
  { name: 'KOICA AYSRHR', planned: 50, completed: 42, completionRate: 84 },
  { name: 'UNFPA Supplies', planned: 52, completed: 50, completionRate: 96 },
];

export default function ProgrammeProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        <Bar dataKey="planned" name="Planned Activities" fill="#004B87" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" name="Completed Activities" fill="#FF6600" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
