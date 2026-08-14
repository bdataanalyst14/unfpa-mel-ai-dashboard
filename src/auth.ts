import type { NextAuthOptions, User } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

import { resolveConfiguredRole, isTenantAllowed } from '@/lib/server/auth-policy';

const tenantId = process.env.AZURE_AD_TENANT_ID?.trim();
const clientId = process.env.AZURE_AD_CLIENT_ID?.trim();
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET?.trim();
const authSecret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim();

export const authConfigurationComplete = Boolean(tenantId && clientId && clientSecret && authSecret);

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: 'jwt' },
  providers: authConfigurationComplete
    ? [
        AzureADProvider({
          clientId: clientId!,
          clientSecret: clientSecret!,
          tenantId: tenantId!,
          authorization: { params: { scope: 'openid profile email' } },
        }),
      ]
    : [],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/unauthorized',
  },
  callbacks: {
    async signIn({ profile }) {
      const claims = profile as (Record<string, unknown> | undefined);
      return authConfigurationComplete && isTenantAllowed(claims?.tid);
    },
    async jwt({ token, profile }) {
      if (profile) {
        const claims = profile as Record<string, unknown>;
        const email = typeof claims.email === 'string' ? claims.email : claims.preferred_username;
        token.userId = typeof claims.oid === 'string'
          ? claims.oid
          : (typeof claims.sub === 'string' ? claims.sub : undefined);
        token.email = typeof email === 'string' ? email : undefined;
        token.name = typeof claims.name === 'string' ? claims.name : undefined;
        token.tenantId = typeof claims.tid === 'string' ? claims.tid : undefined;
        token.role = resolveConfiguredRole(email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === 'string' ? token.userId : '';
        session.user.email = typeof token.email === 'string' ? token.email : null;
        session.user.name = typeof token.name === 'string' ? token.name : null;
        session.user.tenantId = typeof token.tenantId === 'string' ? token.tenantId : '';
        session.user.role = token.role === 'ADMIN' || token.role === 'AUTHORIZED_USER' ? token.role : null;
      }
      return session;
    },
  },
};

export type DashboardAuthUser = User & {
  id: string;
  tenantId: string;
  role: 'AUTHORIZED_USER' | 'ADMIN' | null;
};
