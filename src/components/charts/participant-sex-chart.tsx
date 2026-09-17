'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

import { useParticipantData } from '@/components/dashboard/participant-data-provider';

interface ParticipantSexChartProps {
  data?: Array<{ name: string; value: number; color: string }>;
}

export default function ParticipantSexChart({ data: suppliedData }: ParticipantSexChartProps) {
  const { data: liveData, loading } = useParticipantData();
  const data = suppliedData ?? liveData?.demographics.flatMap(group => group.metrics).filter(metric => ['female', 'male', 'other'].includes(metric.key)).map(metric => ({ name: metric.label, value: metric.value ?? 0, color: metric.key === 'female' ? '#004B87' : metric.key === 'male' ? '#FF6600' : '#9CA3AF' }));
  if (!data?.length || (!suppliedData && liveData?.demographics.some(group => group.metrics.some(metric => ['female', 'male', 'other'].includes(metric.key) && metric.suppressed)))) return <p>{loading ? 'Loading participant profile?' : 'Participant profile unavailable or suppressed.'}</p>;
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
