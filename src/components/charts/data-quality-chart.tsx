'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'ADRA', overall: 89.2, disaggregation: 92.5 },
  { name: 'FPAN', overall: 85.4, disaggregation: 88.0 },
  { name: 'WOREC', overall: 78.9, disaggregation: 81.2 },
  { name: 'CREHPA', overall: 88.1, disaggregation: 90.0 },
  { name: 'Restless', overall: 82.5, disaggregation: 85.0 },
  { name: 'NFCC', overall: 84.0, disaggregation: 86.5 },
];

export default function DataQualityChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
          formatter={(value: number) => [`${value}%`]}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        <Bar dataKey="overall" name="Overall Quality" fill="#004B87" radius={[4, 4, 0, 0]} />
        <Bar dataKey="disaggregation" name="Disaggregation Rate" fill="#FF6600" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
