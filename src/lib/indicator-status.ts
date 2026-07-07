import type { IndicatorStatus } from './types';

export function getIndicatorStatus(achievementPct: number): IndicatorStatus {
  if (achievementPct >= 80) return 'On Track';
  if (achievementPct >= 50) return 'Watch';
  if (achievementPct > 0) return 'Off Track';
  return 'No Data';
}

export function getStatusColor(status: IndicatorStatus): string {
  switch (status) {
    case 'On Track': return 'text-emerald-600 bg-emerald-50';
    case 'Watch': return 'text-amber-600 bg-amber-50';
    case 'Off Track': return 'text-red-600 bg-red-50';
    case 'No Data': return 'text-gray-500 bg-gray-100';
  }
}

export function getStatusDotColor(status: IndicatorStatus): string {
  switch (status) {
    case 'On Track': return 'bg-emerald-500';
    case 'Watch': return 'bg-amber-500';
    case 'Off Track': return 'bg-red-500';
    case 'No Data': return 'bg-gray-400';
  }
}
