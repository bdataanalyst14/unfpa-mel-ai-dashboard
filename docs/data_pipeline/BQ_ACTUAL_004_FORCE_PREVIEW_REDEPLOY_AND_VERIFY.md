# BQ_ACTUAL_004 Force Preview Redeploy And Verify

Date: 2026-07-01

## Final Decision

Dashboard Mode: NOT VERIFIED - VERCEL AUTHENTICATION REQUIRED
Hosted Preview: NOT REDEPLOYED
Data Source: NOT VERIFIED
Final Manager Status: VERCEL CLI AUTHENTICATION REQUIRED BEFORE PREVIEW REDEPLOY

## Execution Summary

The requested Preview redeploy and BigQuery verification could not be completed because the Vercel CLI in `C:\unfpa-mel-final-build-sandbox-013` has no active authentication.

Running `vercel env ls` started an interactive Vercel device-login flow instead of returning the Preview environment variable list. No credential values were printed or recorded.

## Step 1 - Preview Environment Presence

Status: BLOCKED

Expected variables to confirm in Preview:

- `DASHBOARD_DATA_MODE`
- `DATA_MODE`
- `BIGQUERY_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_DATASET_ID`
- `BIGQUERY_LOCATION`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY_BASE64`

Result: not verified because Vercel CLI authentication is missing.

## Step 2 - Fresh Preview Redeploy

Status: NOT RUN

- New deployment URL: not available
- Deployment status: not available
- Production avoided: yes
- `vercel --prod` run: no

## Step 3 - API Data-Source Endpoint Tests

Status: NOT RUN

Routes not tested because no new Preview deployment URL was produced:

- `/api/dashboard/page-data?route=activity-progress`
- `/api/dashboard/page-data?route=participant-reach`
- `/api/dashboard/page-data?route=data-quality`
- `/api/dashboard/page-data?route=ip-performance`
- `/api/dashboard/page-data?route=indicator-progress`

## Step 4 - Dashboard Page Tests

Status: NOT RUN

Routes not tested because no new Preview deployment URL was produced:

- `/dashboard/activity-progress`
- `/dashboard/participant-reach`
- `/dashboard/data-quality`
- `/dashboard/ip-performance`
- `/dashboard/indicator-progress`
- `/dashboard/geographic-coverage`
- `/dashboard/management-decision-centre`

## Step 5 - Diagnosis

Primary blocker:

- Vercel CLI has no authenticated session in the build sandbox.

Observed non-secret details:

- Working folder exists: `C:\unfpa-mel-final-build-sandbox-013`
- Vercel CLI is installed.
- `.vercel/project.json` exists and links the sandbox to project `unfpa-mel-ai-dashboard-cod001`.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` were not present in the local process environment.
- User-level Vercel auth config was not present.

Required next condition:

- Authenticate Vercel CLI for this sandbox or provide a non-printing `VERCEL_TOKEN`, then rerun the approved Preview-only redeploy and route verification.
