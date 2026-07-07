# BQ_ACTUAL_002_VERCEL_ENV_MISSING_ACTIONS

Date: 2026-06-30
Status: `blocked_bigquery_credentials_missing`

No credential values were available in the local process or Vercel project listing. No `.env` file was edited and no credential value was printed.

## Required Preview Variables

| Variable | Required For Preview | Status |
| --- | --- | --- |
| `DASHBOARD_DATA_MODE=bigquery` | Data-mode switch | Missing |
| `BIGQUERY_PROJECT_ID` | GCP project | Missing |
| `BIGQUERY_DATASET` | Dataset containing approved aggregate views | Missing |
| `BIGQUERY_LOCATION` | BigQuery job location | Missing |
| `GOOGLE_CLIENT_EMAIL` | Read-only service account identity | Missing |
| `GOOGLE_PRIVATE_KEY_BASE64` or `GOOGLE_PRIVATE_KEY` | Service account key material | Missing |
| `BIGQUERY_MAX_BYTES_BILLED` | Query-cost guardrail | Missing |
| `BIGQUERY_CACHE_TTL_SECONDS` | Optional cache TTL | Missing |

## Setup Actions

1. Add the required variables to the Vercel Preview environment only.
2. Prefer `GOOGLE_PRIVATE_KEY_BASE64` for key material storage.
3. Do not use any `NEXT_PUBLIC_*` variable for credentials.
4. Redeploy Preview after variables are added.
5. Run read-only aggregate BigQuery smoke and hosted Preview route QA.

## Blocker

`blocked_bigquery_credentials_missing`: activation cannot proceed until Preview env vars are configured securely.
