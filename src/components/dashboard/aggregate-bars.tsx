import type { DashboardPageMetric } from '@/lib/types';

export default function AggregateBars({ metrics, label }: { metrics: DashboardPageMetric[]; label: string }) {
  const numeric = metrics.map(metric => (/^\d+$/.test(metric.value) ? Number(metric.value) : null));
  const maximum = Math.max(1, ...numeric.filter((value): value is number => value !== null));

  return (
    <dl
      className="max-h-80 w-full space-y-3 overflow-y-auto pr-2 focus:outline-none focus:ring-1 focus:ring-[#004B87]/30 rounded-md"
      aria-label={label}
      tabIndex={0}
    >
      {metrics.map((metric, index) => {
        const val = numeric[index];
        const isNumeric = val !== null;
        const formatted = isNumeric ? val.toLocaleString('en-US') : metric.value;
        const widthPercent = isNumeric ? Math.min(100, Math.max(0, (val / maximum) * 100)) : 0;

        return (
          <div
            key={metric.label}
            className="group rounded-md p-1.5 -mx-1.5 transition-colors hover:bg-slate-50/90"
            title={`${metric.label}: ${formatted}`}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <dt className="min-w-0 font-medium text-slate-700 break-words group-hover:text-slate-900">
                {metric.label}
              </dt>
              <dd className="shrink-0 font-semibold tabular-nums text-slate-900">
                {formatted}
              </dd>
            </div>
            {isNumeric ? (
              <div
                className="h-4 w-full rounded bg-slate-100 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded bg-[#004B87] transition-all duration-300 group-hover:bg-[#003865]"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {metric.value === '<5'
                  ? 'Small count withheld; no bar displayed.'
                  : 'Value unavailable; no bar displayed.'}
              </p>
            )}
          </div>
        );
      })}
    </dl>
  );
}
