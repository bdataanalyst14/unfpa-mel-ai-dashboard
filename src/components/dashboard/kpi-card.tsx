import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export default function KpiCard({ label, value, change, changeType = 'neutral', icon: Icon, iconColor, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change && (
            <p className={cn('text-xs font-medium',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-gray-500',
            )}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg shrink-0', iconColor || 'bg-[#004B87]/10')}>
            <Icon className={cn('h-5 w-5', iconColor ? 'text-white' : 'text-[#004B87]')} />
          </div>
        )}
      </div>
    </div>
  );
}
