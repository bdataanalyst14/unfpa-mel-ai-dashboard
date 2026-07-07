# BQ_CONTENT_001 Activity Frontend Mapping Audit

Date: 2026-07-01

## Files Reviewed

- `src/app/dashboard/activity-detail/page.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/lib/server/dashboard-page-data-service.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/app/api/dashboard/page-data/route.ts`
- `src/data/mock/main-data.ts`

## Findings

- `ACT-2025-*` and `Activity 1`, `Activity 2`, etc. were generated in `src/data/mock/main-data.ts`, not returned by the BigQuery route payload.
- The subtitle `Sample activity log for SMT prototype demonstration; synthetic ACT-2025 rows are not official registry activities.` was rendered directly in `src/app/dashboard/activity-detail/page.tsx`.
- `activity-detail` previously displayed local `mainData` rows while `DataSourceStatusPanel` separately showed BigQuery aggregate metadata for the same route.
- `activity-progress` contained hardcoded synthetic delayed/evidence rows with `ACT-2025-*` IDs independent of the BigQuery-backed status panel.
- `dashboard-page-data-service.ts` used `combined_activity_summary` for both `activity-detail` and `activity-progress` aggregate route metadata.
- Before the patch, official BigQuery row fields were not used by the Activity Detail table.

## Patch Applied

- Added a limited `activityRows` payload to the `activity-detail` route from `combined_activity_summary`.
- Updated Activity Detail to fetch BigQuery route rows and fall back to local mock rows only if route rows are unavailable.
- Updated Activity Detail subtitle to state BigQuery-backed preview data with pending registry/programme validation.
- Removed visible synthetic `ACT-2025-*` rows from Activity Progress row-level exception tables and replaced them with pending approved-view messages.

## Status

Frontend placeholder generation source identified and locally patched. Hosted Preview is not updated until a successful build and Preview redeploy complete.
