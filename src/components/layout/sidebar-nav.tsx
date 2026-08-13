'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Activity, Users, Target, Building2, Globe,
  ShieldAlert, FileCheck, Brain, FileSpreadsheet,
} from 'lucide-react';
import { useDashboardFilters } from '@/components/dashboard/dashboard-filter-provider';

const navItems = [
  { label: 'Executive Overview', href: '/dashboard/executive-overview', icon: LayoutDashboard },
  { label: 'Activity Progress', href: '/dashboard/activity-progress', icon: Activity },
  { label: 'Participant & Reach', href: '/dashboard/participant-reach', icon: Users },
  { label: 'Indicator Progress', href: '/dashboard/indicator-progress', icon: Target },
  { label: 'IP / Partner Performance', href: '/dashboard/ip-performance', icon: Building2 },
  { label: 'Geographic Coverage', href: '/dashboard/geographic-coverage', icon: Globe },
  { label: 'GBV / OCMC Summary', href: '/dashboard/gbv-ocmc-summary', icon: ShieldAlert },
  { label: 'Data Quality & Evidence', href: '/dashboard/data-quality', icon: FileCheck },
  { label: 'Management Decision Centre', href: '/dashboard/management-decision-centre', icon: Brain },
  { label: 'Activity Detail', href: '/dashboard/activity-detail', icon: FileSpreadsheet },
];

export default function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { hrefWithFilters } = useDashboardFilters();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Dashboard navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={hrefWithFilters(item.href)}
            prefetch={false}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
