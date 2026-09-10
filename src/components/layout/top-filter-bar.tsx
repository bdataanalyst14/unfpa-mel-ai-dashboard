'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';

const labels = { year: 'Year', quarter: 'Quarter', project: 'Project', implementingPartner: 'IP/Partner', province: 'Province', district: 'District' };

export default function TopFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dashboard/participants?options=1', { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(setOptions).catch(() => { if (!controller.signal.aborted) setUnavailable(true); });
    return () => controller.abort();
  }, []);
  return <div className="flex items-center gap-3 flex-wrap bg-white rounded-xl px-4 py-3 border">
    <Filter className="h-4 w-4" /><span className="text-sm">Participant filters</span>
    {Object.entries(labels).map(([key, label]) => {
      const selected = search.get(key) ?? (key === 'implementingPartner' ? search.get('ip') : null) ?? '';
      const values = Array.from(new Set([...(options[key] ?? []), ...(selected ? [selected] : [])]));
      return <select key={key} aria-label={label} value={selected} className="text-sm border rounded-lg px-3 py-1.5" onChange={event => {
        const params = new URLSearchParams(search.toString());
        if (event.target.value) params.set(key, event.target.value); else params.delete(key);
        if (key === 'implementingPartner') params.delete('ip');
        if (key === 'province') params.delete('district');
        router.replace(pathname + '?' + params.toString(), { scroll: false });
      }}><option value="">{label}: All</option>{values.map(value => <option key={value} value={value}>{label}: {value}</option>)}</select>;
    })}
    {unavailable && <span className="text-xs text-amber-700">Live filter options unavailable</span>}
  </div>;
}

