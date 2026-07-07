'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const data = [
  { name: 'ADRA Nepal', value: 45 },
  { name: 'FPAN', value: 38 },
  { name: 'WOREC', value: 35 },
  { name: 'CREHPA', value: 29 },
  { name: 'Restless Dev', value: 24 },
  { name: 'NFCC', value: 21 },
  { name: 'Ipas Nepal', value: 18 },
];

export default function IpRankingChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
        <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} width={80} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
          formatter={(value: number) => [value, 'Activities']}
        />
        <Bar dataKey="value" fill="#004B87" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#004B87' : '#0066B3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
