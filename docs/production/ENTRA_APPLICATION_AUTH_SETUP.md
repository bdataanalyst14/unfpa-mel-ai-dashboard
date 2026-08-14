# Microsoft Entra application authentication

This dashboard uses Auth.js/NextAuth with the Microsoft Entra ID provider for
single-tenant organizational sign-in. This document is a preparation guide;
it does not create an Entra app registration or configure Vercel variables.

## Runtime contract

Server-only placeholders are configured separately for Preview and Production:

- `AUTH_SECRET` (or the library-compatible `NEXTAUTH_SECRET`)
- `AZURE_AD_TENANT_ID`
- `AZURE_AD_CLIENT_ID`
- `AZURE_AD_CLIENT_SECRET`
- `DASHBOARD_AUTH_REQUIRED=true`
- `DASHBOARD_AUTHORIZED_EMAILS`
- `DASHBOARD_ADMIN_EMAILS`
- optionally `DASHBOARD_AUTHORIZED_EMAIL_DOMAIN`

The tenant must be one exact UNFPA tenant. `common`, `organizations`, and
`consumers` are not accepted. Authorization is deny-by-default: an authenticated
user must be present in an approved server-side allowlist or domain, and admin
access must be explicitly listed.

## Entra administrator setup (future)

The UNFPA/Entra administrator will need to create:

1. An app registration for the dashboard, supporting accounts in one
   organizational tenant only.
2. A Web platform redirect URI for each approved environment. Auth.js uses:
   - Local: `http://localhost:3000/api/auth/callback/azure-ad`
   - Preview/UAT: the approved stable Preview URL followed by
     `/api/auth/callback/azure-ad`
   - Production: the approved Production URL followed by
     `/api/auth/callback/azure-ad`
3. A logout/redirect configuration matching the final approved URLs.
4. Client ID, tenant ID, and a client secret or certificate, delivered through
   protected server-side configuration only.
5. Only `openid profile email` login scopes. Microsoft Graph permissions are
   not required for this dashboard.
6. Optional Entra application roles only if the allowlist is later migrated to
   app-role claims; arbitrary client-supplied roles are never trusted.

Preview URLs can change between deployments. Do not register arbitrary preview
URLs; use a stable approved UAT alias before registering the Preview callback.

## Protected surface

`/dashboard/*` and `/api/dashboard/*` require an authorized session. The server
data layer checks the session before constructing a BigQuery client. Unauthenticated
API requests receive `401`; authenticated but unauthorized requests receive
`403`. `/api/health` remains a minimal status endpoint and does not expose
configuration, identity claims, or credentials.

The application session contains only a stable user ID, basic display identity,
tenant ID, and derived application role. OAuth access and ID tokens are not
returned to browser code or logged.
