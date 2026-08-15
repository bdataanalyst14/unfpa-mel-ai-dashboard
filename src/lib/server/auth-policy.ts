export const DASHBOARD_ROLES = ['AUTHORIZED_USER', 'ADMIN'] as const;
export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

function configuredValues(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveConfiguredRole(email: unknown): DashboardRole | null {
  if (typeof email !== 'string' || !email.includes('@')) return null;
  const normalized = email.trim().toLowerCase();
  if (configuredValues('DASHBOARD_ADMIN_EMAILS').includes(normalized)) return 'ADMIN';
  if (configuredValues('DASHBOARD_AUTHORIZED_EMAILS').includes(normalized)) return 'AUTHORIZED_USER';
  return null;
}

export function authenticationRequired(): boolean {
  if (process.env.DASHBOARD_AUTH_REQUIRED === 'true') return true;
  return process.env.DATA_MODE === 'bigquery' || process.env.DASHBOARD_DATA_MODE === 'bigquery';
}

export type SessionLike = {
  user?: { id?: unknown; email?: unknown; name?: unknown; emailVerified?: unknown; role?: unknown } | null;
} | null;

export function authorizeSession(session: SessionLike): { allowed: boolean; role: DashboardRole | null; reason: string } {
  if (!session?.user) return { allowed: false, role: null, reason: 'unauthenticated' };
  if (typeof session.user.id !== 'string' || !session.user.id) return { allowed: false, role: null, reason: 'malformed_session' };
  if (session.user.emailVerified !== true) return { allowed: false, role: null, reason: 'email_not_verified' };
  const role = resolveConfiguredRole(session.user.email);
  if (!role || session.user.role !== role) return { allowed: false, role: null, reason: 'role_not_authorized' };
  return { allowed: true, role, reason: 'authorized' };
}
