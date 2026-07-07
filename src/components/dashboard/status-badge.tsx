import { cn } from '@/lib/utils';
import type { IndicatorStatus, EvidenceStatus, ValidationStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

type BadgeStatus = IndicatorStatus | EvidenceStatus | ValidationStatus;

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  'On Track': { bg: 'bg-emerald-50 border border-emerald-200/50', text: 'text-emerald-700', icon: CheckCircle2 },
  'Approved': { bg: 'bg-emerald-50 border border-emerald-200/50', text: 'text-emerald-700', icon: CheckCircle2 },
  'Validated': { bg: 'bg-emerald-50 border border-emerald-200/50', text: 'text-emerald-700', icon: CheckCircle2 },
  'Watch': { bg: 'bg-amber-50 border border-amber-200/50', text: 'text-amber-700', icon: AlertTriangle },
  'Pending': { bg: 'bg-amber-50 border border-amber-200/50', text: 'text-amber-700', icon: AlertTriangle },
  'Off Track': { bg: 'bg-red-50 border border-red-200/50', text: 'text-red-700', icon: XCircle },
  'Missing': { bg: 'bg-red-50 border border-red-200/50', text: 'text-red-700', icon: XCircle },
  'Rejected': { bg: 'bg-red-50 border border-red-200/50', text: 'text-red-700', icon: XCircle },
  'No Data': { bg: 'bg-gray-100 border border-gray-200/50', text: 'text-gray-500', icon: MinusCircle },
};

export default function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  const config = statusConfig[status] || statusConfig['No Data'];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0', config.bg, config.text, className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {status}
    </span>
  );
}
