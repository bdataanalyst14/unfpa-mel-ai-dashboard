# Google OAuth application authentication

This dashboard uses NextAuth 4 with Google OAuth for user identity. OAuth setup is a future controlled checkpoint; no OAuth credentials are created by this repository change.

## Runtime contract

The server-only application variables are:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `DASHBOARD_AUTH_REQUIRED=true`
- `DASHBOARD_AUTHORIZED_EMAILS`
- `DASHBOARD_ADMIN_EMAILS`

Authorization uses exact, normalized email matches in the two comma-separated allowlists. Empty or missing authorization configuration fails closed. Wildcards and domain-wide authorization are not supported.

## Next checkpoint: Google Cloud setup

- Google Cloud project: `unfpadatabase`
- OAuth client name: `UNFPA MEL Dashboard Preview UAT`
- Application type: Web application
- Authorized redirect URI: `<STABLE_PREVIEW_UAT_URL>/api/auth/callback/google`

Use one approved stable Vercel branch URL for Preview UAT. Do not register arbitrary per-deployment Preview URLs. An Authorized JavaScript Origin is not required by this server-side NextAuth provider flow; add one only if a later verified runtime requirement establishes it.

The OAuth client ID is configuration. The OAuth client secret is a secret and must be stored only in the Vercel Preview environment. Do not put either value in `NEXT_PUBLIC_*` variables.

Google OAuth user login does not use service-account JSON, the `vercel-mel-preview` service account, or the Workload Identity Federation provider. Those mechanisms remain exclusively for server-side BigQuery authentication.

## Protected surface

`/dashboard` and `/dashboard/*` require an authorized session. `/api/dashboard/*` and all BigQuery-backed routes enforce authorization before entering the data service. Unauthenticated API requests receive `401`; authenticated but unapproved users receive `403`. `/api/health` remains public and minimal.

The browser session contains only the provider user identifier, email, display name, verified-email status, and derived application role. Google access tokens, ID tokens, and refresh tokens are neither copied into the browser session nor logged.
