# BQ_ACTUAL_001_VERCEL_PREVIEW_SETUP_CHECKLIST

Date: 2026-06-30
Status: `hosted_preview_qa_pending_vercel_env_and_redeploy`

## Required Preview Activation Actions

1. Add BigQuery env vars to the Vercel Preview environment.
2. Store sensitive values only in Vercel env settings; do not commit `.env` or service-account JSON.
3. Set `DASHBOARD_DATA_MODE=bigquery`.
4. Set project/dataset/location env vars using the names in `BQ_ACTUAL_001_VERCEL_ENV_CONTRACT.md`.
5. Add service-account credentials using `GOOGLE_CLIENT_EMAIL` and either `GOOGLE_PRIVATE_KEY_BASE64` or `GOOGLE_PRIVATE_KEY`.
6. Redeploy Preview because env changes do not affect previous deployments.
7. Confirm hosted preview route status.
8. Confirm API metadata says `dataSource: "bigquery"` for routes expected to use actual data.
9. Confirm no mock fallback on pages expected to use actual data.
10. Confirm suppression and freshness metadata.
11. Confirm production remains blocked.

## Do Not Do

- Do not run `vercel --prod`.
- Do not store credentials in source, markdown, or `NEXT_PUBLIC_*` variables.
- Do not activate GBV/OCMC live data before privacy sign-off.
