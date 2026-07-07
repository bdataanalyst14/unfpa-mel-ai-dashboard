# BigQuery Connection Audit

**Execution Date:** 2026-06-14

## 1. Required Environment Variables
The dashboard expects the following variables for BigQuery connection:
- `GOOGLE_CLOUD_PROJECT_ID`
- `BIGQUERY_DATASET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `BIGQUERY_LOCATION` (Optional, defaults to 'asia-south1')
- `BIGQUERY_MAX_BYTES_BILLED` (Optional)
- `BIGQUERY_CACHE_TTL_SECONDS` (Optional, defaults to 300)

## 2. Service Account Assumptions
- A GCP Service Account with `roles/bigquery.dataViewer` and `roles/bigquery.jobUser` is expected.
- Credentials must be passed as `GOOGLE_CLIENT_EMAIL` and a Base64/newline-encoded `GOOGLE_PRIVATE_KEY`.

## 3. Dataset/Project/Location Assumptions
- Data resides in the `BIGQUERY_DATASET_ID` dataset inside `GOOGLE_CLOUD_PROJECT_ID`.
- Region is assumed `asia-south1` unless overridden.

## 4. Credentials Availability
- Credentials are **AVAILABLE** and verified via live connection test.
- Project ID: `unfpadatabase`
- Dataset ID: `unfpadatabase`

## 5. Read-Only Connection Test
- **Status:** COMPLETED on 2026-06-14.
- All safe aggregate views (`combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`) are accessible and populated.
- 15 IPs verified as reporting in the live pipeline.

## 6. Safe Fallback Behavior
- The dashboard code uses `process.env.DATA_MODE`. If it is not set to `bigquery` (or if it fails/falls back), the system defaults to returning mocked data via `mockOverview()`.
- The `getExecutiveOverviewData` and `bigquery-dashboard-service.ts` functions implement a `try-catch` block that gracefully falls back to mock data if the query fails or credentials are missing.

## 7. Recommended Production Credential Approach
- Store credentials in a secure secrets manager (Vercel Secrets, Google Secret Manager).
- Never commit `.env` or service account JSON files to the repository.
- Ensure the production Service Account only has access to approved aggregate/reporting views, actively blocking access to raw or staging participant-level tables.
