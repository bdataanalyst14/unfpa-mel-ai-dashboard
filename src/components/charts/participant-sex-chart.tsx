'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const defaultData = [
  { name: 'Female', value: 11128, color: '#004B87' },
  { name: 'Male', value: 7106, color: '#FF6600' },
  { name: 'Other', value: 313, color: '#9CA3AF' },
];

interface ParticipantSexChartProps {
  data?: Array<{ name: string; value: number; color: string }>;
}

export default function ParticipantSexChart({ data = defaultData }: ParticipantSexChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), 'Participants']}
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
