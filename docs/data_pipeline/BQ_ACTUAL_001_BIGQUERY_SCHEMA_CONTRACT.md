# BQ_ACTUAL_001_BIGQUERY_SCHEMA_CONTRACT

Date: 2026-06-30
Status: `bigquery_schema_contract_defined_from_existing_docs_and_code`

## Approved Aggregate Views

Do not query raw/staging participant data. The dashboard may use only approved aggregate views already documented in `BIGQUERY_TABLE_VIEW_CATALOG.md` and `BIGQUERY_LIVE_SCHEMA_VALIDATION.md`.

| Dashboard page | BigQuery table/view needed | Required columns | Expected types | Aggregation level | Suppression requirement | Freshness field | Route/component | Fallback behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Executive Overview | `combined_activity_summary`, `data_quality_summary`, `ip_submission_status` | `event_count`, `total_reportable_participants`, `female`, `male`, `other`, `district1`, `ip_name`, `records_with_quality_issue`, `latest_sync_time` | INT64, STRING, TIMESTAMP | Aggregate activity/IP/quality | Suppress non-zero counts `<5`; metadata required | `ip_submission_status.latest_sync_time` | `/dashboard/executive-overview`, `/api/dashboard/executive-overview` | Explicit mock fallback with metadata |
| Activity Progress | `combined_activity_summary` | `event_count`, `total_reportable_participants`, `project1`, `district1` | INT64, STRING | Aggregate activity/project/geography | Suppress non-zero counts `<5` | `ip_submission_status.latest_sync_time` | `/dashboard/activity-progress`, `/api/dashboard/page-data?route=activity-progress` | Explicit mock fallback with status panel |
| Activity Detail | `combined_activity_summary` | `activity1`, `subact1`, `ip_name`, `province1`, `district1`, `total_reportable_participants` | STRING, INT64 | Aggregate activity row; no raw person rows | Suppress counts `<5`; no raw IDs/PII | `ip_submission_status.latest_sync_time` | `/dashboard/activity-detail`, `/api/dashboard/page-data?route=activity-detail` | Aggregate metadata only until safe detail table contract validated |
| Participant Reach | `combined_activity_summary` | `total_reportable_participants`, `female`, `male`, `other`, `withdisability`, age/caste aggregate fields | INT64 | Aggregate participant/disaggregation | Suppress small cells; no person-level rows | `ip_submission_status.latest_sync_time` | `/dashboard/participant-reach`, `/api/dashboard/page-data?route=participant-reach` | Explicit mock fallback with status panel |
| Geographic Coverage | `combined_activity_summary` | `province1`, `district1`, `palika1`, `event_count` | STRING, INT64 | Aggregate geography | Suppress small cells and do not expose protected geometry edits | `ip_submission_status.latest_sync_time` | `/dashboard/geographic-coverage`, `/api/dashboard/page-data?route=geographic-coverage` | Protected page remains prototype until live geography validation |
| Data Quality | `data_quality_summary` | `run_timestamp`, `total_rows`, `records_with_quality_issue` | TIMESTAMP, INT64 | Aggregate quality run | No sensitive rows; counts may be suppressed if small | `run_timestamp` | `/dashboard/data-quality`, `/api/dashboard/page-data?route=data-quality` | Explicit mock fallback with status panel |
| IP Performance | `ip_submission_status` | `ip_name`, `total_submissions`, `total_events`, `latest_sync_time` | STRING, INT64, TIMESTAMP | Aggregate IP status | Counts suppressed if small; no raw submission IDs | `latest_sync_time` | `/dashboard/ip-performance`, `/api/dashboard/page-data?route=ip-performance` | Explicit mock fallback with status panel |
| Indicator Progress | `indicator_progress_summary` | `indicator1`, `activity1`, `total_events`, `total_reportable_participants` | STRING, INT64 | Aggregate indicator/activity | Suppress small cells; final M&E validation pending | `ip_submission_status.latest_sync_time` | `/dashboard/indicator-progress`, `/api/dashboard/page-data?route=indicator-progress` | Explicit mock fallback; not final M&E evidence |
| Management Decision Centre | `data_quality_summary`, `ip_submission_status` | `records_with_quality_issue`, `ip_name`, `latest_sync_time` | INT64, STRING, TIMESTAMP | Aggregate quality/IP status | Suppress small cells; narrative not donor-ready | `latest_sync_time` / `run_timestamp` | `/dashboard/management-decision-centre`, `/api/dashboard/page-data?route=management-decision-centre` | Explicit mock fallback; illustrative/prototype narrative |
| GBV/OCMC | `TBD_FROM_BIGQUERY` approved pre-suppressed GBV aggregate view only | `TBD_FROM_BIGQUERY`; no person-level/survivor-level fields | Aggregate only | Pre-suppressed GBV/OCMC aggregate | Required before any live activation | `TBD_FROM_BIGQUERY` | `/dashboard/gbv-ocmc`, `/dashboard/gbv-ocmc-summary` | Blocked for live activation until privacy sign-off |

## Forbidden Tables/Fields

Do not query `participants_flat`, `participants_flat_staging`, raw Kobo rows, person-level records, survivor-level data, service-account JSON, tokens, or private keys. Do not expose raw partner-sensitive records to the browser.
