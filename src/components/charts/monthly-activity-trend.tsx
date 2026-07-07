'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { month: 'Jan', activities: 22, participants: 1100 },
  { month: 'Feb', activities: 28, participants: 1450 },
  { month: 'Mar', activities: 35, participants: 1980 },
  { month: 'Apr', activities: 42, participants: 2200 },
  { month: 'May', activities: 48, participants: 2700 },
  { month: 'Jun', activities: 55, participants: 3120 },
];

export default function MonthlyActivityTrend() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" stroke="#004B87" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#FF6600" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        <Line yAxisId="left" type="monotone" dataKey="activities" name="Activities Conducted" stroke="#004B87" strokeWidth={2} activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="participants" name="Participants Reached" stroke="#FF6600" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
