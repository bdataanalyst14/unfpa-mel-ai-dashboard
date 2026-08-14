export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <section className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-gray-600">Your account is not authorized to access this dashboard.</p>
      </section>
    </main>
  );
}
