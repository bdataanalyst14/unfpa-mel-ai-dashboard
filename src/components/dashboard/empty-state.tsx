import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No data available for the selected filters',
  detail = 'Clear one or more filters to broaden the current mock-data view.',
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <section
      className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"
      role="status"
    >
      <Inbox className="h-8 w-8 text-gray-400" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-lg text-sm text-gray-600">{detail}</p>
    </section>
  );
}
