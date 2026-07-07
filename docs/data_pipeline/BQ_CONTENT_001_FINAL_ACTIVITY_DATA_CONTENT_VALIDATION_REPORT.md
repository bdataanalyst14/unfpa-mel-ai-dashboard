# BQ_CONTENT_001 Final Activity Data Content Validation Report

Date: 2026-07-01

## Files Reviewed

- `src/app/dashboard/activity-detail/page.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/lib/server/dashboard-page-data-service.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/app/api/dashboard/page-data/route.ts`
- `src/data/mock/main-data.ts`

## Files Changed

- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/dashboard/activity-detail/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `docs/data_pipeline/BQ_CONTENT_001_ACTIVITY_FRONTEND_MAPPING_AUDIT.md`
- `docs/data_pipeline/BQ_CONTENT_001_ACTIVITY_TABLE_CONTENT_AUDIT.md`
- `docs/data_pipeline/BQ_CONTENT_001_ACTIVITY_ROUTE_PAYLOAD_AUDIT.md`
- `docs/dashboard_qa/BQ_CONTENT_001_ACTIVITY_LABEL_PATCH_NOTE.md`
- `docs/data_pipeline/BQ_CONTENT_001_ACTIVITY_MAPPING_PATCH_NOTE.md`
- `docs/data_pipeline/BQ_CONTENT_001_ACTIVITY_HOSTED_PREVIEW_QA.md`

## BigQuery Tables Audited

- `activity_summary_flat`
- `activity_summary_flat_staging`
- `combined_activity_summary`

Read-only aggregate/schema checks found:

- `activity_summary_flat`: 682 rows, 682 distinct IDs/keys, 0 `ACT-2025-*` patterns, 0 generic `Activity N` names, 676 rows with activity details.
- `activity_summary_flat_staging`: 682 rows, 682 distinct IDs/keys, 0 `ACT-2025-*` patterns, 0 generic `Activity N` names, 676 rows with activity details.
- `combined_activity_summary`: 1798 rows, 1798 distinct event keys, 0 `ACT-2025-*` patterns, 0 generic `Activity N` names, 1672 rows with activity details.

## Activity Data Content Finding

The BigQuery activity tables appear operational/registry-like rather than synthetic seed-like. Partner/IP fields, geography fields, reporting periods, activity labels, activity details, event metadata, and participant aggregates are present.

The visible `ACT-2025-*`, `Activity 1`, `Activity 2`, and sample subtitle content came from frontend mock/sample code, not from the audited BigQuery tables.

## Route Payload Finding

Hosted Preview API routes were reachable through QA bypass and returned:

- `/api/dashboard/page-data?route=activity-detail`: `dataSource: bigquery`, no mock fallback, aggregate metadata only.
- `/api/dashboard/page-data?route=activity-progress`: `dataSource: bigquery`, no mock fallback, aggregate metadata only.

Hosted payloads did not include `ACT-2025-*` or `Activity 1` strings.

## Frontend Mapping Finding

Before patch:

- Activity Detail table used `src/data/mock/main-data.ts`.
- Activity Progress row-level exception tables contained hardcoded synthetic `ACT-2025-*` examples.
- BigQuery metadata was shown separately by `DataSourceStatusPanel`, but the visible activity rows were local sample rows.

After local patch:

- Activity Detail can fetch `activityRows` from the `activity-detail` route and map actual BigQuery fields.
- Activity Progress no longer displays synthetic `ACT-2025-*` exception rows.
- Missing evidence/validation fields are shown as `Not in source` and `Pending registry validation`; no evidence status or validation status is fabricated.

## Label And Caveat Changes

Activity Detail subtitle now distinguishes:

- BigQuery row state: `Activity log from BigQuery-backed preview data. Pending final activity registry and programme validation.`
- Fallback state: `Activity log is using local fallback rows because BigQuery activity rows are not available in this browser session.`

Activity Progress subtitle now states that aggregates are BigQuery-backed and row-level exception lists are pending approved activity registry mapping and programme validation.

## Build Result

- `npm run test:verify`: passed.
- `npx tsc --noEmit --incremental false --pretty false`: new mapper type errors resolved; remaining errors are pre-existing test-runner globals in `src/lib/server/suppression.test.ts`.
- `npm run build`: did not complete. Next.js build remained active with no final success/failure output and was stopped to avoid leaving orphaned Node processes.

## Hosted Preview QA Result

Hosted Preview API remains BigQuery-backed for activity routes. Hosted pages were not redeployed after the local patch because the local build did not complete.

Production deployment was not run. `vercel --prod` was not run.

## Remaining Blocker

Resolve the local Next.js build hang, then run a Preview-only redeploy and repeat hosted QA for:

- `/dashboard/activity-detail`
- `/dashboard/activity-progress`
- `/api/dashboard/page-data?route=activity-detail`
- `/api/dashboard/page-data?route=activity-progress`

## Final Decision

Activity Data Status: BIGQUERY-BACKED BUT FRONTEND MAPPING NEEDS ACTIVITY FIELD PATCH
Data Source: BIGQUERY
Activity Mapping: PATCH REQUIRED
Activity Registry Validation: PENDING PROGRAMME VALIDATION
Dashboard Mode: ACTUAL BIGQUERY-BACKED PREVIEW DASHBOARD WITH MAPPING GAP
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Manager Status: BIGQUERY CONNECTED, ACTIVITY DISPLAY MAPPING NEEDS FIX

## Reality Check

The content gap is not caused by BigQuery returning synthetic `ACT-2025-*` records. It is caused by the hosted frontend still displaying local mock/sample rows while BigQuery-backed route metadata is active. A local mapping/label patch has been prepared, but it is not verified in a completed build or deployed Preview yet.

## BQ_CONTENT_002 Update

Date: 2026-07-01

The activity mapping patch was finalized, built, redeployed to Preview, and verified on `https://unfpa-mel-ai-dashboard-cod001-mg0zoirdp.vercel.app`.

- Activity Detail API now returns `dataSource: bigquery`, no mock fallback, and 250 mapped BigQuery activity rows.
- Hosted activity rows contain 0 `ACT-2025-*` IDs and 0 exact generic `Activity 1/2/3` row labels.
- Activity Detail and Activity Progress pages no longer show the outdated demo subtitle or hardcoded synthetic exception rows.
- Evidence and registry gaps remain safely caveated as `Not in source` and `Pending registry validation`.
- Activity registry validation remains pending programme validation.
