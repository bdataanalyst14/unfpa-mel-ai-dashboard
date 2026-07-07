# BQ_CONTENT_001 Activity Route Payload Audit

Date: 2026-07-01

Preview URL: `https://unfpa-mel-ai-dashboard-cod001-7h2ee371a.vercel.app`

## Hosted Route Payload Results

Protection bypass was used for QA only. The bypass secret was not printed or recorded.

| Route | HTTP | Content type | dataSource | Payload keys | First metric field names | Contains row records | Contains `Activity 1` | Contains `ACT-2025-*` |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| `/api/dashboard/page-data?route=activity-detail` | 200 | `application/json` | `bigquery` | `route`, `pageName`, `metrics`, `metadata` | `label`, `value` | No | No | No |
| `/api/dashboard/page-data?route=activity-progress` | 200 | `application/json` | `bigquery` | `route`, `pageName`, `metrics`, `metadata` | `label`, `value` | No | No | No |

## Finding

- Hosted route metadata is BigQuery-backed.
- Hosted API payload did not contain the synthetic `Activity 1` or `ACT-2025-*` labels.
- Hosted API did not yet expose row-level activity records.
- The placeholder row labels were therefore frontend-local mock/sample data, not API payload data.

## Local Patch Note

The local sandbox was patched so the `activity-detail` route can include an `activityRows` array mapped from `combined_activity_summary`. This local route patch is not hosted until a successful build and Preview redeploy complete.
