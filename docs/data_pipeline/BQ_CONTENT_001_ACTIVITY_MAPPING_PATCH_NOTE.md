# BQ_CONTENT_001 Activity Mapping Patch Note

Date: 2026-07-01

## Mapping Patch

The local sandbox now maps Activity Detail rows from `combined_activity_summary` when the route returns BigQuery rows.

Mapped fields:

- `subactcode1` or `event_row_key` -> activity row ID
- `actdetails1` or `activity1` -> activity display name/description
- `ip_name` -> partner/IP
- `project1`, `outcome1`, `output1`, `subact1` -> programme hierarchy fields
- `province1`, `district1`, `palika1` -> location
- `total_reportable_participants`, `female`, `male`, `other`, `withdisability` -> reach fields
- `eventtype1`, `fundcode1`, `start_date1`, `end_date1` -> event metadata

## Schema Gap

The audited BigQuery activity tables do not expose approved evidence status or final registry validation status fields for the Activity Detail table. The UI therefore shows:

- Evidence: `Not in source`
- Status: `Pending registry validation`

No evidence or validation labels were fabricated.

## Files Patched Locally

- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/dashboard/activity-detail/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/app/dashboard/activity-progress/page.tsx`

## Deployment Status

Patch is local only. Hosted Preview was not redeployed because the local Next build hung during verification.
