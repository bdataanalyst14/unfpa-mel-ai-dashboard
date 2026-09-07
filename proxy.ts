import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dashboardAuthenticationRequired } from '@/lib/dashboard-mode';

function authRequired() {
  return dashboardAuthenticationRequired();
}

export async function proxy(request: NextRequest) {
  if (!authRequired()) return NextResponse.next();
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = secret ? await getToken({ req: request, secret }).catch(() => null) : null;
  if (token) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const signIn = new URL('/auth/signin', request.url);
  signIn.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
};
