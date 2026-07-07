'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'EmONC Facilities', target: 180, actual: 165 },
  { name: 'Midwives Deployed', target: 150, actual: 140 },
  { name: 'Peer Educators', target: 1200, actual: 980 },
  { name: 'OCMC Facilities', target: 77, actual: 69 },
  { name: 'CSE Schools', target: 500, actual: 115 },
];

export default function TargetVsActualChart() {
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
        <Bar dataKey="target" name="Target Value" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual Achieved" fill="#004B87" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
