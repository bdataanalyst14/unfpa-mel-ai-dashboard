# BQ_ACTUAL_001_HOSTED_PREVIEW_ROUTE_QA

Date: 2026-06-30
Status: `hosted_preview_qa_pending_vercel_env_and_redeploy`

## Result

Hosted preview QA was not run because Vercel Preview BigQuery env vars and redeploy have not been confirmed in this task.

## Routes Pending Verification

- `https://agfinal-g4cmuqjeb-bdataanalyst14s-projects.vercel.app/dashboard/activity-progress`
- `/dashboard/geographic-coverage`
- `/dashboard/participant-reach`
- `/dashboard/data-quality`
- `/dashboard/ip-performance`
- `/dashboard/indicator-progress`
- `/dashboard/management-decision-centre`
- `/dashboard/gbv-ocmc`

## Required Evidence After Preview Redeploy

| Route | HTTP 200 | No runtime error | `dataSource: "bigquery"` | Freshness timestamp | Suppression verified | No mock fallback | No production/DP-004/GBV live claim |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Activity Progress | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Geographic Coverage | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Participant Reach | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Data Quality | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| IP Performance | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Indicator Progress | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Management Decision Centre | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| GBV/OCMC | Pending | Pending | Must remain blocked unless privacy signed off | Pending | Pending | Pending | Pending |
