# Vercel Preview to Google Cloud authentication

> **PR #11 status, 29 October 2026: historical four-view/earlier-runtime record, not current deployment authorization.** Use [the corrected decision package](PR11_PRODUCTION_GO_NO_GO_PACKAGE.md), [configuration/readiness matrix](PR11_CONFIGURATION_AND_READINESS_MATRIX.md) and [protected staging checklist](PR11_PROTECTED_STAGING_UAT_CHECKLIST.md). Current code accepts six objects (repeatdata, activity_summary, combined_activity_summary, indicator_progress_summary, data_quality_summary, ip_submission_status); that technical expansion requires explicit project-owner and data-governance approval. Historical approval is not extended by this notice. No mock fallback, old activation/rollback command or earlier participant-publication claim below authorizes a PR #11 release.

Historical planned keyless runtime path under the earlier four-view boundary (not a PR #11 approval):

`Vercel Preview request -> Vercel OIDC token -> Google Workload Identity Provider -> service-account impersonation -> read-only BigQuery identity -> four stable aggregate views`

The dashboard obtains the Vercel OIDC token only inside server request execution. Google Auth Library exchanges it through STS and service-account impersonation. No service-account JSON is uploaded to Vercel, and no PEM is required for Vercel WIF.

Configure all four server-only WIF variables together: `GCP_PROJECT_NUMBER`, `GCP_SERVICE_ACCOUNT_EMAIL`, `GCP_WORKLOAD_IDENTITY_POOL_ID`, and `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`. Never expose them through `NEXT_PUBLIC_*`. Configure BigQuery resource variables separately as documented in `.env.production.example`.

Local ADC through an approved external `GOOGLE_APPLICATION_CREDENTIALS` file and the protected PEM mode remain available for controlled local/server validation. Credential modes are mutually exclusive and incomplete or conflicting configuration fails closed.

Pool/provider creation, IAM binding, and Vercel Preview/UAT environment configuration are separate post-merge checkpoints. Production remains mock-backed until separately approved. The dashboard identity must be read-only and limited operationally to the four allowlisted aggregate views; participant and staging objects remain prohibited.

## Readiness evidence contracts

Vercel WIF deployments use an immutable, server-only readiness manifest generated automatically during `npm run build`. The semantic payload is canonicalized and SHA-256 bound to the deployment's data mode, BigQuery resource configuration, WIF identifiers, and exact four-view allowlist. Next.js output tracing explicitly bundles `.vercel-runtime/bigquery-readiness-manifest.json` into server functions. Runtime re-creates the semantic configuration from server environment variables and fails closed before BigQuery client construction if the manifest is missing, malformed, unsupported, or mismatched. The manifest is never placed under `public/` and contains no token, key, or credential content.

Vercel runtime does not depend on `/var/lib`, `/etc`, `/tmp`, or another writable persistent filesystem location for readiness evidence.

Traditional ADC and PEM deployments continue to require the existing externally protected preflight evidence file and its existing configuration-hash and object validation. Bundled evidence is not substituted for either traditional authentication mode.
