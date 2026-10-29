# PR #11 — configuration names, environment scope and readiness

Date: 29 October 2026. Reviewed source/head: 74365c680ec5291ae48fdfb12563571092283d74. [Decision package](PR11_PRODUCTION_GO_NO_GO_PACKAGE.md).

**Metadata inspection only. No values decrypted, read into this decision or printed; no environment mutation, secret pull, login, deployment or warehouse query.** Vercel filter_project_envs was requested with decrypt=false. Only key, target, branch, type and custom-environment scope were retained. The inspected project was unfpa-mel-ai-dashboard in the existing bdataanalyst14s-projects scope. This identifies the metadata target, not proof of project protection or credential correctness.

## Effective scope matrix

P = key exists in Production metadata. G = generic Preview key applies to this branch. OLD = Preview entry exists only for ops/google-auth-preview-uat and does NOT apply to release/ui-ux-acceptance-2026-10-28. Absent means no applicable key was returned, not that a value was tested. No custom-environment entries were returned.

Required values below are source/policy requirements, not inspected environment values. Server variables must have appropriate build AND runtime scope. Never expose them through NEXT_PUBLIC_* or record secret/allowlist contents publicly.

| Name | Release requirement / purpose | Production observed | PR #11 Preview observed |
|---|---|---|---|
| DATA_MODE | Explicit bigquery, aligned with the next row | P | G |
| DASHBOARD_DATA_MODE | Explicit bigquery for this release; one alias is technically supported, but conflict/invalid input fails closed | Absent | G |
| BIGQUERY_PROJECT_ID | Canonical required project alias: unfpadatabase | P | G |
| GOOGLE_CLOUD_PROJECT_ID / GOOGLE_CLOUD_PROJECT | Optional project aliases; if supplied they must also be unfpadatabase; never required in addition to a valid canonical alias | Both absent | Both absent |
| BIGQUERY_DATASET_ID | Canonical required dataset alias: unfpadatabase | P | G |
| BIGQUERY_DATASET | Optional dataset alias; if supplied must agree with frozen dataset | Absent | Absent |
| BIGQUERY_LOCATION | Exactly asia-south1 for BigQuery jobs | P | G |
| BIGQUERY_MAX_BYTES_BILLED | Explicit owner-approved positive integer at most 1,000,000,000; approval may impose a lower limit | Absent — BLOCKER for validator | Absent — BLOCKER for validator |
| GCP_PROJECT_NUMBER | Numeric GCP project number, NOT the textual project ID | P | G |
| GCP_SERVICE_ACCOUNT_EMAIL | Approved environment-specific read identity; do not assume a particular account name or identical Production/Preview identity | P | G |
| GCP_WORKLOAD_IDENTITY_POOL_ID | Complete approved WIF pool ID | P | G |
| GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID | Complete approved WIF provider ID | P | G |
| GOOGLE_OAUTH_CLIENT_ID | Approved Google Web client for the target origin/callback | P | OLD only — BLOCKER |
| GOOGLE_OAUTH_CLIENT_SECRET | Existing protected client secret for the target OAuth client | P | OLD only — BLOCKER |
| AUTH_SECRET | Preferred nonempty NextAuth session secret | P | OLD only — BLOCKER unless valid fallback separately provisioned |
| NEXTAUTH_SECRET | Supported fallback only when AUTH_SECRET is undefined; an empty defined AUTH_SECRET does not safely fall back | Absent | Absent |
| NEXTAUTH_URL | Exact approved target origin; Google callback is origin + /api/auth/callback/google; Preview must not point to Production | P | OLD only — BLOCKER |
| DASHBOARD_AUTH_REQUIRED | Explicit true for release policy; BigQuery mode enforces authentication even if false is supplied | P | OLD only — explicit policy gap |
| DASHBOARD_AUTHORIZED_EMAILS | Exact normalized approved ordinary-user list, where AUTHORIZED_USER access is intended | Absent; owner must decide intended role scope | G, plus OLD override that does not apply here |
| DASHBOARD_ADMIN_EMAILS | Exact normalized approved administrators; needed for the existing ADMIN-only pre-UAT validator | P | Absent — BLOCKER for ADMIN pre-UAT |
| BIGQUERY_CACHE_TTL_SECONDS | Optional cache control; not a privacy approval or incident-containment guarantee | Absent | G |
| ENABLE_GBV_SUPPRESSION | Historical operations flag; not a participant-publication switch and cannot enable live GBV or certify suppression | Absent | G |

Presence does not confirm nonempty values or email membership. A Production admin list can permit an intentionally admin-only deployment; absence of an ordinary-user list is not by itself a code failure. That intended audience and the role-testing plan still need signed approval. No individual is automatically ADMIN by name, domain, employment or prior test identity. If an address appears in both lists, the current policy gives ADMIN precedence.

## Platform-provided versus operator-managed names

- VERCEL_OIDC_TOKEN is supplied/resolved by the platform SDK in active request context. Do not retrieve, paste, store or manually configure it for this procedure. Token presence/lifetime is not attested by the environment-name inventory.
- VERCEL_ENV and VERCEL_GIT_COMMIT_SHA are deployment provenance/platform metadata. Verify the resulting Preview target and actual approved Git revision; do not substitute a manually set variable as identity evidence.
- VERCEL_ORG_ID / VERCEL_PROJECT_ID are CLI/automation project selectors where needed, not Google auth or application session credentials. The checklist uses explicit project/scope flags instead of copying environment files.
- GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_PRIVATE_KEY_BASE64 and GOOGLE_PRIVATE_KEY_FILE belong to alternate ADC/PEM modes and must be absent for the WIF deployment. Their metadata was not returned for either target. No secret file or local .env file was opened to verify this.
- No NEXT_PUBLIC_* key was returned by the metadata inventory. This is not a new client-bundle audit.

## Correct WIF and readiness interpretation

The four WIF identifiers must be complete together. ADC, PEM and WIF modes are mutually exclusive. Pool/provider resource paths use locations/global and token exchange uses Google STS/service-account impersonation; asia-south1 is the BigQuery job location, not an STS region. Owners must attest issuer/audience/subject restrictions for the specific Vercel project/team and Preview environment, plus impersonation and read-only BigQuery permissions. Successful SELECTs alone cannot prove that write permissions are absent.

The build's prebuild script creates the immutable server-only .vercel-runtime/bigquery-readiness-manifest.json. Postbuild verifies bundle tracing. Runtime validation binds the exact six-object list, mode, project/dataset, location, cost cap and WIF identifiers to the build configuration hash before constructing the WIF client. A mismatch/missing manifest must fail closed. It does not attest schema, lineage, consent, least-privilege IAM, current data, expiry or owner approval.

Use a new remote Preview build with the approved Preview configuration. A locally built mock/NONE manifest or Production prebuilt artifact cannot establish staging WIF readiness. No persistent /etc or /var/lib preflight file is required for WIF; those belong to historical alternate-runtime procedures.

The current ADMIN validator in src/lib/server/pre-uat-validation.ts checks six views using up to twelve sequential SELECT jobs (two per view), with no retries. It requires an explicit cap in [1, 1,000,000,000]; a governance approval may set a stricter cap. Per-query caps are not an overall UAT budget. Approve the entire request/job/bytes/time budget separately, including UI/API/CSV reads, and stop if it would be exceeded. Its result cannot certify lineage or approve UAT. No public validator route exists; do not invent or inject one to run this checklist.

## Owner actions outstanding — not executed here

1. Approve all six data sources and restricted publication policy with both responsible owners; the historical four-view approval is insufficient.
2. Separately authorize configuration administrators to resolve applicable Preview OAuth/session/origin/admin scope and explicit cap, and the Production policy gaps. Do not copy credentials or private allowlists into the PR, a shell command or the old branch.
3. Attest approved values, scope, protected Preview origin/callback, deployment protection and WIF/IAM bindings using a restricted record. Names-only evidence cannot close those checks.
4. Approve the exact published head for protected Preview deployment and a separate bounded read-only UAT. Until then, both staging execution and Production release remain NO-GO.

Sources: current src/auth.ts, src/lib/dashboard-mode.ts, src/lib/server/auth-policy.ts, auth-guard.ts, bigquery-client.ts, vercel-gcp-wif.ts, readiness-manifest-contract.js and pre-uat-validation.ts; metadata-only inventory in [correction evidence](pr11-release-package-2026-10-29/evidence.json). Platform scope/protection behavior: [Vercel environment variables](https://vercel.com/docs/environment-variables), [Deployment Protection](https://vercel.com/docs/deployment-protection).
