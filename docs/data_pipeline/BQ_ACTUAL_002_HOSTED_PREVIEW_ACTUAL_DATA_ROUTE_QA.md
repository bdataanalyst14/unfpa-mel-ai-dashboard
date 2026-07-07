# BQ_ACTUAL_002_HOSTED_PREVIEW_ACTUAL_DATA_ROUTE_QA

Date: 2026-06-30
Status: `not_run_preview_env_missing`

## Result

Hosted Preview actual-data route QA was not run.

## Reason

The Vercel project is linked but has no environment variables configured. A hosted Preview QA run before env setup would only confirm mock fallback.

## Required Before Running

- Configure Preview BigQuery variables.
- Redeploy Preview.
- Confirm `/api/dashboard/page-data` returns `metadata.dataSource: "bigquery"` for non-blocked eligible routes.
