import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, action, className }: ChartCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action || (
          <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label="Export chart">
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
      <div className="flex-1 w-full flex items-center justify-center min-h-[250px]">
        {children}
      </div>
    </div>
  );
}
