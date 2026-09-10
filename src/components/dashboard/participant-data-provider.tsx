'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { filtersFromParams, type ParticipantData } from '@/lib/participant-contract';

const ParticipantContext = createContext<{ data: ParticipantData | null; loading: boolean }>({ data: null, loading: true });

export function ParticipantDataProvider({ children }: { children: React.ReactNode }) {
  const search = useSearchParams();
  const query = new URLSearchParams({ ...filtersFromParams(new URLSearchParams(search.toString())) }).toString();
  const [state, setState] = useState<{ query: string; data: ParticipantData | null } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dashboard/participants?' + query, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!controller.signal.aborted) setState({ query, data: data.metadata ? data : null });
      })
      .catch(() => { if (!controller.signal.aborted) setState({ query, data: null }); });
    return () => controller.abort();
  }, [query]);
  const current = state?.query === query;
  return <ParticipantContext.Provider value={{ data: current ? state.data : null, loading: !current }}>{children}</ParticipantContext.Provider>;
}

export function useParticipantData() { return useContext(ParticipantContext); }

