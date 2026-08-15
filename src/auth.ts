import type { NextAuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { resolveConfiguredRole } from '@/lib/server/auth-policy';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
const authSecret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim();

export const authConfigurationComplete = Boolean(clientId && clientSecret && authSecret);

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: 'jwt' },
  providers: authConfigurationComplete
    ? [
        GoogleProvider({
          clientId: clientId!,
          clientSecret: clientSecret!,
        }),
      ]
    : [],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/unauthorized',
  },
  callbacks: {
    async signIn({ profile }) {
      const claims = profile as Record<string, unknown> | undefined;
      return Boolean(authConfigurationComplete && typeof claims?.email === 'string' && claims.email && claims.email_verified === true);
    },
    async jwt({ token, profile }) {
      if (profile) {
        const claims = profile as Record<string, unknown>;
        const email = typeof claims.email === 'string' ? claims.email : undefined;
        token.userId = typeof claims.sub === 'string' ? claims.sub : undefined;
        token.email = typeof email === 'string' ? email : undefined;
        token.name = typeof claims.name === 'string' ? claims.name : undefined;
        token.emailVerified = claims.email_verified === true;
        token.role = resolveConfiguredRole(email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === 'string' ? token.userId : '';
        session.user.email = typeof token.email === 'string' ? token.email : null;
        session.user.name = typeof token.name === 'string' ? token.name : null;
        session.user.emailVerified = token.emailVerified === true;
        session.user.role = token.role === 'ADMIN' || token.role === 'AUTHORIZED_USER' ? token.role : null;
      }
      return session;
    },
  },
};

export type DashboardAuthUser = User & {
  id: string;
  emailVerified: boolean;
  role: 'AUTHORIZED_USER' | 'ADMIN' | null;
};
