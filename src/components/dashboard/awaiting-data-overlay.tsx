import { Lock } from 'lucide-react';
import React from 'react';

export default function AwaitingDataOverlay({
  children,
  active = false,
  message = 'This component is disabled pending an approved live data contract.',
  className = '',
}: {
  children: React.ReactNode;
  active?: boolean;
  message?: string;
  className?: string;
}) {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className={`relative group overflow-hidden rounded-xl ${className}`}>
      <div className="min-h-48 flex flex-col items-center justify-center p-6 text-center bg-gray-50/40 backdrop-blur-[1px]">
        <div className="rounded-full bg-gray-100 p-3 mb-3 shadow-sm border border-gray-200">
          <Lock className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Not supported</h3>
        <p className="text-xs text-gray-600 max-w-[250px] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
