'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'ADRA', Approved: 38, Pending: 5, Missing: 2 },
  { name: 'FPAN', Approved: 30, Pending: 6, Missing: 2 },
  { name: 'WOREC', Approved: 25, Pending: 7, Missing: 3 },
  { name: 'CREHPA', Approved: 24, Pending: 4, Missing: 1 },
  { name: 'Restless', Approved: 20, Pending: 3, Missing: 1 },
  { name: 'NFCC', Approved: 17, Pending: 3, Missing: 1 },
];

export default function EvidenceCompletionChart() {
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
        <Bar dataKey="Approved" name="Approved" stackId="a" fill="#10B981" />
        <Bar dataKey="Pending" name="Pending Review" stackId="a" fill="#F59E0B" />
        <Bar dataKey="Missing" name="Missing" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
