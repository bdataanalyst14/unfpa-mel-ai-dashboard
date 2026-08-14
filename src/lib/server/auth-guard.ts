import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { authenticationRequired, authorizeSession } from '@/lib/server/auth-policy';

export async function getDashboardAuthorization() {
  if (!authenticationRequired()) return { allowed: true, role: 'AUTHORIZED_USER' as const, reason: 'authentication_disabled_for_mock' };
  if (!authOptions.secret || authOptions.providers.length === 0) {
    return { allowed: false, role: null, reason: 'authentication_not_configured' };
  }
  try {
    const session = await getServerSession(authOptions);
    return authorizeSession(session);
  } catch {
    return { allowed: false, role: null, reason: 'authentication_error' };
  }
}

export async function requireDashboardPageAccess(): Promise<void> {
  const authorization = await getDashboardAuthorization();
  if (!authorization.allowed) redirect('/auth/signin');
}

export async function requireDashboardApiAccess(): Promise<{ allowed: boolean; status: 401 | 403 }> {
  const authorization = await getDashboardAuthorization();
  if (authorization.allowed) return { allowed: true, status: 401 };
  return { allowed: false, status: authorization.reason === 'unauthenticated' || authorization.reason === 'authentication_not_configured' ? 401 : 403 };
}
