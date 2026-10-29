'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { numeric } from '@/lib/management-analysis';

const COLORS = ['#004B87', '#176BA0', '#3983B6', '#579BC5', '#79B2D3', '#A0C9E0', '#23577B', '#487D9D', '#669AB8', '#BDDCEB'];

export default function AggregatePie({
  metrics,
  label,
}: {
  metrics: { label: string; value: string | number }[];
  label?: string;
}) {
  const data = useMemo(
    () =>
      metrics
        .filter(m => numeric(String(m.value)) !== null && Number(m.value) > 0)
        .map(m => ({ name: m.label, value: Number(m.value) })),
    [metrics]
  );

  const totalPublished = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const colorMap = new Map(data.map((item, index) => [item.name, COLORS[index % COLORS.length]]));

  return (
    <div aria-label={label} className="w-full">
      <div className="relative h-56 w-full">
        {data.length ? <>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart id={label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'aggregate-pie'}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={84}
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map(entry => (
                <Cell
                  key={entry.name}
                  fill={colorMap.get(entry.name) ?? '#004B87'}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${new Intl.NumberFormat('en-US').format(value)} (${totalPublished ? ((value / totalPublished) * 100).toFixed(1) : '0'}%)`,
                name || label || 'Count',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-slate-900">
            {totalPublished >= 1000 ? totalPublished.toLocaleString('en-US') : totalPublished}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Published
          </span>
        </div>
        </> : <div role="status" className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center text-xs text-slate-600">
          {metrics.some(metric => numeric(String(metric.value)) === 0)
            ? 'Published counts are zero; no slices to display.'
            : 'No publishable counts available; no slices to display.'}
        </div>}
      </div>

      <dl tabIndex={0} aria-label={`${label ?? 'Chart'} categories`} className="mt-3 flex max-h-40 flex-wrap justify-center gap-x-4 gap-y-2 overflow-y-auto px-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004B87]">
        {metrics.map(metric => {
          const numVal = numeric(String(metric.value));
          const isNumeric = numVal !== null;
          const color = colorMap.get(metric.label);
          const percent = numVal !== null && totalPublished > 0 ? ((numVal / totalPublished) * 100).toFixed(1) : null;

          return (
            <div
              key={metric.label}
              className="flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1 border border-slate-100"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: color ?? '#94A3B8' }}
                aria-hidden="true"
              />
              <dt className="text-slate-600">{metric.label}:</dt>
              <dd className="font-semibold tabular-nums text-slate-900">
                {isNumeric ? Number(metric.value).toLocaleString('en-US') : metric.value}
                {percent !== null && (
                  <span className="ml-1 text-[11px] font-normal text-slate-500">
                    ({percent}%)
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {totalPublished > 0 && <p className="mt-2 text-center text-xs text-slate-500">Percentages use the sum of publishable categories, excluding withheld or unavailable counts.</p>}

      {metrics.some(metric => numeric(String(metric.value)) === null) && (
        <p className="mt-2.5 text-center text-xs text-slate-500">
          Withheld or unavailable categories have no slice. The ring shows publishable counts only.
        </p>
      )}
    </div>
  );
}
