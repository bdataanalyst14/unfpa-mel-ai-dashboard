# Production V1 Release Scope

Updated 7 September 2026. Local implementation evidence only; live UAT and production activation are not approved by this document.

## Participant metric contract

| Metric | Required calculation | V1 implementation |
|---|---|---|
| Total Participants | SUM(combined_activity_summary.total_participants) | Aggregate SUM; never aggregate row count or distinct people |
| Reportable Participants | SUM(combined_activity_summary.total_reportable_participants) | Separate aggregate SUM |
| Individual Participant Records | COUNT(repeatdata) | Disabled until equivalent upstream aggregation and semantics are verified in an approved view |
| Individual Reportable Participants | Filtered COUNT(repeatdata) | Disabled pending verified upstream report-eligibility rule and aggregate mapping |
| Summary-mode Participants | SUM(activity_summary.gender_total) | Disabled pending verified upstream summary-mode aggregate mapping |

The last three definitions describe warehouse responsibilities, not permission for dashboard queries to repeatdata or activity_summary. No participant table access was added. Schema field names alone do not prove the upstream formulas. In particular, aggregate row counts, event counts, and reportable totals must never substitute for Total Participants. Counts are participations, not deduplicated people. Missing, negative, nonintegral, unsafe, or malformed aggregate counts fail closed.

## Route and component scope

| Route | BigQuery behavior |
|---|---|
| Executive Overview | Total events, Total Participants, Reportable Participants, districts, partners, and sex counts |
| Activity Progress | Aggregate event/participant/project/partner counts; programme planned/completed progress disabled |
| Participant & Reach | Separate total/reportable counts and aggregate sex/disability counts; unsupported breakdowns and the three unverified participant metrics disabled |
| Geographic Coverage | Province, district, municipality and event counts; municipality identity includes province and district; prototype maps/gap claims disabled |
| IP / Partner Performance | Partner, submission and event counts; only Implementing Partner filter supported |
| Data Quality & Evidence | Rows checked, rows with an issue, and derived quality score; no global dimension filters supported |
| Indicator Progress | DISABLED_PENDING_VALIDATION: no approved target/status rule |
| Management Decision Centre | DISABLED_PENDING_VALIDATION: prototype and AI content hidden |
| Activity Detail | DISABLED_PENDING_VALIDATION: live details and exports unavailable |
| GBV / OCMC Summary, including alias | DISABLED_PENDING_VALIDATION: Pending approved reporting view and privacy/reporting/suppression approval |

LIVE_BIGQUERY: additive aggregate metrics, partner submission metrics, filter options, and quality counts.

DERIVED_FROM_LIVE_AGGREGATE: sex profile display, distinct geographic/project/partner counts, and quality score `(rows checked - rows with quality issue) / rows checked * 100`. A zero denominator displays N/A. These labels classify implementation; they do not certify upstream source quality.

Mock-only: existing charts, tables, maps, synthetic targets, status rankings, trends, narratives, AI insights, and CSV exports. Eight existing prototype pages are preserved in sibling `mock-page.tsx` files. All ten operational routes select the server-side BigQuery view before prototype rendering. No operational mock content is rendered in BigQuery mode in the offline route regression tests. Browser/live reconciliation remains outstanding.

## Filters and APIs

Year -> reporting_year1; Quarter -> report_quarter1; Project -> project1; Implementing Partner (including ip alias) -> ip_name; Province -> province1. Options come only from combined_activity_summary. The five predicates are parameterized and combined with AND. Values absent from live options, duplicate values, and unsupported route filters are rejected; no unfiltered substitute is returned. District and Municipality are disabled in live mode pending filter scope validation. Existing unsupported selections remain visible and clearable. Root and route-alias redirects preserve filter values without mock allow-list validation.

Both `/api/dashboard/page-data` and `/api/dashboard/executive-overview` use the same live page-data contract. The latter retains its legacy payload only in mock mode; live consumers must use `{ route, pageName, metrics, metadata }`. No in-repository consumer depends on its old live numeric payload. Status codes: 200 live/no-data, 409 deferred, 422 unsupported filters, 503 configuration/read failure, 401/403 unauthorized. Authorization precedes data reads. The legacy overview service refuses live mode, removing its duplicate SQL, mock filter validation and misleading compatibility zeros.

## Four-view boundary

Only combined_activity_summary, indicator_progress_summary, data_quality_summary, and ip_submission_status are approved. Runtime queries currently use the combined, quality and submission views; indicator activation remains deferred. participants_flat, participants_flat_staging, staging, raw repeatdata and activity_summary are never queried by the dashboard. Runtime guards reject writes, external operations, unapproved sources, wildcard tables, comma sources and qualified CTE-name bypasses. SQL is server-owned; request values enter only as parameters. These application checks do not replace read-only IAM.

## Authentication, labeling and failure behavior

Google OAuth, verified email, exact-email registry and ADMIN/AUTHORIZED_USER RBAC are retained. BigQuery or invalid/conflicting mode configuration always requires authentication, even if DASHBOARD_AUTH_REQUIRED=false. Layout and live route reads are guarded. Anonymous APIs return 401; unauthorized sessions return 403. Callback query preservation remains in proxy.ts (Next.js 16.2.11).

Labels: `Data source: BigQuery` and `Demo / mock data`. BigQuery failures never select mock data. No-data, unavailable and deferred states have no substitute operational metrics. GBV remains disabled; ordinary aggregate small cells are suppressed before transport. No generative AI is enabled.

## Release gates and rollback

- Reconcile approved view definitions and SUM results against warehouse-controlled evidence; certify all five participant definitions before enabling the deferred three.
- Validate production WIF read access, current view schema and all five filters against the active generation. Local schema evidence is docs/data_pipeline/BIGQUERY_LIVE_SCHEMA_VALIDATION.md; no live BigQuery reads were performed in this continuation.
- Review dependency advisories: registry audit reports 4 high, 3 moderate, 1 low (8 total); no forced dependency changes made.
- Complete authenticated browser UAT and programme acceptance before activation. DATA_MODE activation remains a separate controlled operation; production configuration was not read or changed in this continuation.
- Generation refresh is an operational dependency. Existing evidence flags expiry around 12 September 2026; confirm the active generation before UAT. Expiry was not modified.
- Main branch protection still requires configuration according to the resume notes. Repository visibility was recorded as public and needs operational review; neither remote setting was rechecked or changed here.
- Rollback means explicitly withdrawing live availability or a separately authorized, visibly labeled demo-mode configuration change. Never automatically fall back to mock data during an outage.

See PRODUCTION_RELEASE_CHECKLIST.md and PRODUCTION_V1_AUDIT.md for validation evidence and remaining gates.
