import { Clock } from 'lucide-react';

export default function DataFreshnessFooter() {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kathmandu'
  });
  
  return (
    <footer className="px-6 py-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-auto">
      <div className="flex items-start gap-2.5 text-xs text-gray-500 max-w-4xl leading-normal">
        <Clock className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          Data as of {formatted} NPT – refreshed daily. Figures are provisional where validation, evidence, or data quality checks are pending. No personal identifiers or survivor-level GBV records are displayed.
        </p>
      </div>
    </footer>
  );
}
