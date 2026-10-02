import type { DashboardPageMetric } from '@/lib/types';

export default function AggregateBars({ metrics, label }: { metrics: DashboardPageMetric[]; label: string }) {
  const numeric = metrics.map(metric => /^\d+$/.test(metric.value) ? Number(metric.value) : null);
  const maximum = Math.max(1, ...numeric.filter((value): value is number => value !== null));
  return (
    <dl className="w-full space-y-4" aria-label={label}>
      {metrics.map((metric, index) => (
        <div key={metric.label}>
          <div className="mb-1 flex items-start justify-between gap-3 text-xs">
            <dt className="min-w-0 break-words text-gray-600">{metric.label}</dt>
            <dd className="shrink-0 font-semibold tabular-nums text-gray-900">{/^\d+$/.test(metric.value) ? Number(metric.value).toLocaleString('en-US') : metric.value}</dd>
          </div>
          {numeric[index] !== null ? (
            <div className="h-2 rounded bg-slate-100" aria-hidden="true">
              <div className="h-2 rounded bg-[#004B87]" style={{ width: `${numeric[index]! / maximum * 100}%` }} />
            </div>
          ) : <p className="text-xs text-gray-500">{metric.value === '<5' ? 'Small count withheld; no bar displayed.' : 'Value unavailable; no bar displayed.'}</p>}
        </div>
      ))}
    </dl>
  );
}
