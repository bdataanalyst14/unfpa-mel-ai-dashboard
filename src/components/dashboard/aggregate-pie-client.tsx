'use client';
import dynamic from 'next/dynamic';
export const AggregatePie = dynamic(() => import('./aggregate-pie'), { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-gray-50 border border-gray-100"></div> });
