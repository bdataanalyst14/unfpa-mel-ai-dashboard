import { Clock } from 'lucide-react';

export default function DataFreshnessFooter({ dataMode }: { dataMode: 'bigquery' | 'mock' }) {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
      <div className="max-w-4xl flex items-start gap-2.5 text-xs leading-normal text-gray-500">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>
          {dataMode === 'bigquery'
            ? 'BigQuery freshness is shown with each live aggregate component. Unsupported components remain disabled. No personal identifiers or survivor-level GBV records are displayed.'
            : 'Demo / mock data has no production refresh timestamp. Figures are illustrative and no personal identifiers or survivor-level GBV records are displayed.'}
        </p>
      </div>
    </footer>
  );
}
