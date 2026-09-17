'use client';
import { useParticipantData } from '@/components/dashboard/participant-data-provider';
import { ParticipantGroupTable } from '@/components/dashboard/participant-metrics-panel';

export default function MonthlyActivityTrend() {
  const { data, loading } = useParticipantData();
  if (loading) return <p>Loading monthly participant reach?</p>;
  return <ParticipantGroupTable title="Monthly participant reach" groups={data?.monthly ?? []} />;
}
