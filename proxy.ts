import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function authRequired() {
  return process.env.DASHBOARD_AUTH_REQUIRED === 'true'
    || process.env.DATA_MODE === 'bigquery'
    || process.env.DASHBOARD_DATA_MODE === 'bigquery';
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
  signIn.searchParams.set('callbackUrl', request.nextUrl.href);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
};
