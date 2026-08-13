import { Clock } from 'lucide-react';

export default function DataFreshnessFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
      <div className="max-w-4xl flex items-start gap-2.5 text-xs leading-normal text-gray-500">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>
          Data refresh timestamp: Not available. Figures are provisional where validation, evidence, or data quality checks are pending. No personal identifiers or survivor-level GBV records are displayed.
        </p>
      </div>
    </footer>
  );
}
