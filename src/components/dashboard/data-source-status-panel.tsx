'use client';

import { useEffect, useState } from 'react';
import { Database, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';

type Metric = {
  label: string;
  value: string;
  note?: string;
};

type DashboardPageData = {
  route: string;
  pageName: string;
  metrics: Metric[];
  metadata: {
    dataSource: 'bigquery' | 'mock';
    freshnessTimestamp: string | null;
    suppressionApplied: boolean;
    validationStatus: string;
    fallbackReason?: string;
  };
};

function formatTimestamp(value: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kathmandu',
  });
}

export default function DataSourceStatusPanel({ route }: { route: string }) {
  const [data, setData] = useState<DashboardPageData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/dashboard/page-data?route=${encodeURIComponent(route)}`, {
      cache: 'no-store',
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: DashboardPageData) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [route]);

  if (failed) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        BigQuery metadata unavailable. Fallback mode must be verified before final live API/browser QA.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
        Loading data-source metadata...
      </div>
    );
  }

  const isBigQuery = data.metadata.dataSource === 'bigquery';

  return (
    <section
      className={`rounded-xl border px-4 py-3 text-xs ${
        isBigQuery ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
      }`}
      aria-label="Data source status"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          {isBigQuery ? (
            <Database className="h-4 w-4 text-emerald-700" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-700" />
          )}
          <span>
            Data source: {isBigQuery ? 'BigQuery' : 'Mock/prototype fallback'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-gray-600">
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Freshness: {formatTimestamp(data.metadata.freshnessTimestamp)}
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Suppression metadata: {data.metadata.suppressionApplied ? 'applied' : 'not verified'}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-gray-600">
        Validation status: {data.metadata.validationStatus}
        {data.metadata.fallbackReason ? `; ${data.metadata.fallbackReason}` : ''}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((item) => (
          <div key={item.label} className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
            <p className="font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{item.value}</p>
            {item.note ? <p className="mt-1 text-[10px] text-gray-500">{item.note}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
