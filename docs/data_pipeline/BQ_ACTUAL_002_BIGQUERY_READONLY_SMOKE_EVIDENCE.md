# BQ_ACTUAL_002_BIGQUERY_READONLY_SMOKE_EVIDENCE

Date: 2026-06-30
Status: `not_run_credentials_missing`

## Local Env Presence Check

All checked BigQuery/data-mode variables were absent in the local process:

- `DASHBOARD_DATA_MODE`
- `DATA_MODE`
- `BIGQUERY_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_DATASET_ID`
- `BIGQUERY_LOCATION`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_PRIVATE_KEY_BASE64`
- `BIGQUERY_MAX_BYTES_BILLED`
- `BIGQUERY_CACHE_TTL_SECONDS`

## Vercel Env Check

The linked Vercel project returned an empty environment variable list.

## Result

Read-only BigQuery smoke was not run because no credentials or dataset settings were available. No BigQuery query was executed.
