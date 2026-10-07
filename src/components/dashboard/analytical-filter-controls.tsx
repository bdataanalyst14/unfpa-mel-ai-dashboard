'use client';
import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { analyticalLabels, type AnalyticalControls, type AnalyticalKey } from '@/lib/analytical-filters';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AnalyticalFilterControls({ controls }: { controls: AnalyticalControls }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const update = (key: AnalyticalKey, value: string) => {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key === 'outcome') { params.delete('output'); params.delete('activity'); }
    if (key === 'output') params.delete('activity');
    if (['outcome', 'output', 'activity'].includes(key)) { params.delete('subact'); params.delete('subactcode'); }
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };
  const keys = Object.keys(controls.options) as AnalyticalKey[];
  return <div className="flex flex-wrap items-center gap-3" aria-busy={pending}>
    <Dialog><DialogTrigger asChild><Button variant="outline">More Filters</Button></DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Analytical filters</DialogTitle><DialogDescription>Applies to every KPI and chart on this page. Participant type is available for name-list attendance only.</DialogDescription></DialogHeader>
        {keys.map(key => <label key={key} className="text-sm">{analyticalLabels[key]}<select aria-label={analyticalLabels[key]} value={controls.values[key]} disabled={pending} className="mt-1 min-h-11 w-full rounded border px-2" onChange={event => update(key, event.target.value)}><option value="">All</option>{Array.from(new Set([...(controls.options[key] ?? []), ...(controls.values[key] ? [controls.values[key]] : [])])).map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}
      </DialogContent>
    </Dialog>
    <p className="text-xs text-slate-600">{pending ? 'Updating analysis…' : keys.filter(key => controls.values[key]).map(key => `${analyticalLabels[key]}: ${controls.values[key]}`).join(' · ') || 'All available analytical categories'}</p>
  </div>;
}
