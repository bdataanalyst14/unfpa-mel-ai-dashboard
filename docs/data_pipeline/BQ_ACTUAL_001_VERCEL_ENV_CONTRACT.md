# BQ_ACTUAL_001_VERCEL_ENV_CONTRACT

Date: 2026-06-30
Status: `bigquery_env_missing_needs_vercel_configuration`

No secret values are included in this document.

| Variable | Purpose | Local | Vercel Preview | Production | Sensitive | Current status in Codex session |
| --- | --- | --- | --- | --- | --- | --- |
| `DASHBOARD_DATA_MODE=bigquery` | Preferred dashboard data-mode switch. | Required | Required | Required | No | Missing |
| `DATA_MODE=bigquery` | Legacy compatibility data-mode switch. | Optional if preferred var set | Optional if preferred var set | Optional if preferred var set | No | Missing |
| `BIGQUERY_PROJECT_ID` | Preferred GCP project ID. | Required | Required | Required | No | Missing |
| `GOOGLE_CLOUD_PROJECT` | Google SDK project alias. | Optional alias | Optional alias | Optional alias | No | Missing |
| `GOOGLE_CLOUD_PROJECT_ID` | Legacy project alias. | Optional alias | Optional alias | Optional alias | No | Missing |
| `BIGQUERY_DATASET` | Preferred dataset ID. | Required | Required | Required | No | Missing |
| `BIGQUERY_DATASET_ID` | Legacy dataset alias. | Optional alias | Optional alias | Optional alias | No | Missing |
| `BIGQUERY_LOCATION` | BigQuery region/location. | Required | Required | Required | No | Missing |
| `GOOGLE_CLIENT_EMAIL` | Service account client email. | Required unless using platform ADC | Required | Required | Yes | Missing |
| `GOOGLE_PRIVATE_KEY` | Service account private key with escaped newlines. | Required unless base64 or ADC used | Required unless base64 used | Required unless base64 used | Yes | Missing |
| `GOOGLE_PRIVATE_KEY_BASE64` | Preferred private key option for Vercel env storage. | Optional alternative | Optional alternative | Optional alternative | Yes | Missing |
| `BIGQUERY_MAX_BYTES_BILLED` | Query-cost guardrail. | Recommended | Recommended | Required | No | Missing |
| `BIGQUERY_CACHE_TTL_SECONDS` | Server cache TTL for aggregate queries. | Optional | Optional | Optional | No | Missing |

## Vercel Rules

- Store sensitive values only in Vercel environment settings.
- Do not commit `.env` files.
- Do not use `NEXT_PUBLIC_*` for credentials.
- Redeploy Preview after env vars are added.
