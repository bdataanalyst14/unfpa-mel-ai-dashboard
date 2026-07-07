import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PrivacyBanner({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/20 shadow-sm', className)}>
      <ShieldAlert className="h-5 w-5 text-[#FF6600] shrink-0" />
      <p className="text-sm font-semibold text-[#FF6600]">
        {message || 'Aggregated GBV service data only. No individual survivor records are displayed.'}
      </p>
    </div>
  );
}
