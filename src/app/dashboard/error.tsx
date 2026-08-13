'use client';

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Dashboard content could not be loaded</h2>
      <p className="mt-2 text-sm">
        No sensitive diagnostic details are shown. Try the request again or contact the approved support team.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 cursor-pointer rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
      >
        Try again
      </button>
    </section>
  );
}
