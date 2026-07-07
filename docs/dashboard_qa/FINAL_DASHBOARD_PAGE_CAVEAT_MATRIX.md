# FINAL_DASHBOARD_PAGE_CAVEAT_MATRIX

Date: 2026-06-30
Status: `bigquery_activation_pending`

| Page/Route | Demo status | Caveat | Not allowed claim |
| --- | --- | --- | --- |
| `/` | `demo_ready_with_caveats` | Redirect response verified. | Production readiness |
| `/dashboard` | `demo_ready_with_caveats` | Redirects to Executive Overview. Fallback active until Vercel env configured. | Actual BigQuery data visible |
| `/dashboard/geographic-coverage` | `demo_ready_with_caveats` | `prototype/mock`; no live geography. | Live geography, DP-004 clearance |
| `/dashboard/participant-reach` | `demo_ready_with_caveats` | Aggregate/demo framing only. Fallback active. | Live dashboard or final API QA |
| `/dashboard/data-quality` | `demo_ready_with_caveats` | Evidence/freshness remains gated. Fallback active. | Final data-pipeline clearance |
| `/dashboard/ip-performance` | `demo_ready_with_caveats` | Demo aggregate view. Fallback active. | Production evidence |
| `/dashboard/indicator-progress` | `prototype/demo only` | Pending final M&E validation and registry review. Fallback active. | Final M&E validation |
| `/dashboard/management-decision-centre` | `illustrative/prototype` | AI/management narrative is illustrative. Fallback active. | Donor-ready evidence |
| `/dashboard/activity-detail` | `sample/demo only` | Synthetic/sample activity rows remain caveated. Fallback active. | Official workplan sign-off |
| `/dashboard/activity-progress` | `sample/demo only` | Activity linkage remains pending validation. Fallback active. | Final programme evidence |
| `/dashboard/gbv-ocmc-summary` | `BLOCKED FOR LIVE ACTIVATION` | Mock/prototype only; privacy sign-off required. | GBV/OCMC live activation |

## Summary

Build status = `PASSED`.
Browser smoke status = `PASSED`.
All demo pages remain `demo_ready_with_caveats` displaying a data-source panel reflecting mock fallback. Production remains blocked until release approval.
## BQ_ACTUAL_002 Page Caveat Update

Date: 2026-06-30

| Page | Current data-source caveat |
| --- | --- |
| Executive Overview | BigQuery-ready for selected aggregate KPIs, but hosted env pending; charts/insights remain prototype. |
| Activity Progress | Status panel BigQuery-ready; page body remains mock/prototype until routed to verified actual data. |
| Activity Detail | Status panel BigQuery-ready; page body remains mock/prototype until routed to verified actual data. |
| Participant Reach | Status panel BigQuery-ready; page body remains mock/prototype until routed to verified actual data. |
| Geographic Coverage | Status panel added; geography values remain prototype and not live geography. |
| Data Quality | Status panel BigQuery-ready; page body remains mock/prototype until routed to verified actual data. |
| IP Performance | Status panel BigQuery-ready; page body remains mock/prototype until routed to verified actual data. |
| Indicator Progress | Status panel BigQuery-ready; indicator mappings remain pending M&E validation. |
| Management Decision Centre | Prototype narrative only; not donor-ready evidence. |
| GBV/OCMC Summary | Mock/prototype only; blocked for live activation. |

- Cline parallel QA status: `cline_parallel_qa_pending` (all Cline QA evidence files are missing).

## BQ_CONTENT_002 Activity Mapping Update

Date: 2026-07-01

| Page | Current data-source caveat |
| --- | --- |
| Activity Detail | BigQuery-backed operational activity rows displayed in Preview; evidence status not in source; pending final activity registry and programme validation. |
| Activity Progress | BigQuery-backed activity data displayed in Preview; row-level exception views pending approved reporting views and final activity registry/programme validation. |

Production remains blocked until release approval. DP-004 clearance, GBV/OCMC live activation, final M&E validation, and programme sign-off are not claimed.
