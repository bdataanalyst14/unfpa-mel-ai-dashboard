export default function DashboardLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl bg-white motion-reduce:animate-none" />
        ))}
      </div>
      <span className="sr-only">Loading dashboard data</span>
    </div>
  );
}
