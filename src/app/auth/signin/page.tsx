'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-900">UNFPA MEL Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in with your approved Microsoft organizational account.</p>
        <button
          type="button"
          className="mt-6 w-full rounded-md bg-[#004B87] px-4 py-3 font-medium text-white"
          onClick={() => signIn('azure-ad')}
        >
          Sign in with Microsoft
        </button>
      </section>
    </main>
  );
}
