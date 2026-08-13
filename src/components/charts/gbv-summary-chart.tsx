'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  formatSafeGbvTooltipValue,
  type SafeGbvChartDatum,
} from '@/lib/gbv-safe-types';

type GbvSummaryChartProps = {
  data: SafeGbvChartDatum[];
  valueLabel: string;
  defaultColor?: string;
};

export default function GbvSummaryChart({
  data,
  valueLabel,
  defaultColor = '#004B87',
}: GbvSummaryChartProps) {
  return (
    <div className="w-full" aria-label={`${valueLabel} chart`}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
            labelStyle={{ fontWeight: 'bold', color: '#111827' }}
            formatter={(_value: number, _name: string, item: { payload?: SafeGbvChartDatum }) => [
              formatSafeGbvTooltipValue(item.payload),
              valueLabel,
            ]}
          />
          <Bar dataKey="chartValue" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color ?? defaultColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ul className="sr-only">
        {data.map((entry) => (
          <li key={entry.name}>{entry.name}: {entry.displayValue} {valueLabel}</li>
        ))}
      </ul>
    </div>
  );
}
