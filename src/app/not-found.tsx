import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <section className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#004B87]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950">Page not found</h1>
        <p className="mt-3 text-sm text-gray-600">
          The requested dashboard page does not exist or is not available.
        </p>
        <Link
          href="/dashboard/executive-overview"
          className="mt-6 inline-flex rounded-lg bg-[#004B87] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87]"
        >
          Return to Executive Overview
        </Link>
      </section>
    </main>
  );
}
