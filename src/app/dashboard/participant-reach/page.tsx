import PageHeader from '@/components/layout/page-header';
import ParticipantMetricsPanel from '@/components/dashboard/participant-metrics-panel';

export default function ParticipantReachPage() {
  return <div className="space-y-6">
    <PageHeader title="Participant Reach & Inclusion" subtitle="Live attendance counts and demographic categories from the locked reporting view" />
    <ParticipantMetricsPanel details />
  </div>;
}

