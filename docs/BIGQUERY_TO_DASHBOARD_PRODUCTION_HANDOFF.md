# BigQuery to dashboard production handoff

Project: `unfpadatabase`  
Dataset: `unfpadatabase`  
Location: `asia-south1`

This handoff covers dashboard integration only. The BigQuery backend remains frozen. No BigQuery/GCS objects, release or recovery pipelines, IAM, OAuth credentials, or Production deployments were changed. Existing workspace edits were retained.

## Frozen data contract

The centralized allowlist is `src/lib/server/readiness-manifest-contract.js`, shared by the server client and dashboard preflight. Only these fully qualified stable views are approved:

- `unfpadatabase.unfpadatabase.repeatdata`
- `unfpadatabase.unfpadatabase.activity_summary`
- `unfpadatabase.unfpadatabase.combined_activity_summary`
- `unfpadatabase.unfpadatabase.indicator_progress_summary`
- `unfpadatabase.unfpadatabase.data_quality_summary`
- `unfpadatabase.unfpadatabase.ip_submission_status`

CombinedSummary is the authoritative published result of ActivitySummary participant totals plus only reportable RepeatData contributions. Dashboard code consumes the published combined view; it does not recompute this business rule or row-join its inputs. Participant totals represent attendance records, not unique people.

`participants_flat`, `activity_summary_flat`, `participants_flat_staging`, every staging or `__gen_*` object, `unfpa_mel_internal.*`, raw KoBo tables, and GCS snapshots are prohibited. GCS backup is disaster recovery only and is never a dashboard data source.

## View to API and dashboard mapping

| View | API / server use | Dashboard areas |
|---|---|---|
| combined_activity_summary | `/api/dashboard/page-data`; `/api/dashboard/participants`; server filter options | Executive Overview, Activity Progress, Participant & Reach, Geographic Coverage, Activity Detail |
| indicator_progress_summary | `/api/dashboard/page-data?route=indicator-progress` | Indicator aggregate volume; target achievement remains unsupported |
| data_quality_summary | `/api/dashboard/page-data?route=data-quality` | Data Quality & Evidence aggregate checks |
| ip_submission_status | `/api/dashboard/page-data?route=ip-performance`; refresh timestamp for combined metrics | IP / Partner Performance; source freshness |
| repeatdata | Aggregate-only read/schema preflight; no browser row endpoint | No participant-level component |
| activity_summary | Read/schema preflight; no independent combined-total reconstruction | No separate production component |

`/api/dashboard/executive-overview` also delegates to the aggregate page-data contract in BigQuery mode. The legacy synthetic overview service refuses BigQuery requests. Production pages use the aggregate page-data contract.

## Component classification

| Area | Supported components | Disabled components and classification |
|---|---|---|
| Executive Overview | DERIVED_FROM_LIVE_BIGQUERY: events, participants, reportable participants, coverage, partners, sex counts | NOT_SUPPORTED: targets, synthetic trends, AI insights, prototype narrative |
| Activity Progress | DERIVED_FROM_LIVE_BIGQUERY: activity volume and participant/partner/project counts | NOT_SUPPORTED: planned/completed status, delays, targets, evidence claims |
| Participant & Reach | DERIVED_FROM_LIVE_BIGQUERY: suppressed aggregate participant and demographic counts | NOT_SUPPORTED: unsupported disaggregations, unique-person claims; PRIVACY_BLOCKED: participant rows/export |
| Indicator Progress | DERIVED_FROM_LIVE_BIGQUERY: reported indicator/activity volume and participant aggregates | NOT_SUPPORTED: target achievement, performance status, IP attribution |
| IP / Partner Performance | DERIVED_FROM_LIVE_BIGQUERY: reporting partners, submissions, events | NOT_SUPPORTED: rankings, timeliness, quality scores, suggested actions |
| Geographic Coverage | DERIVED_FROM_LIVE_BIGQUERY: provinces, districts, palikas, events | NOT_SUPPORTED: prototype maps, gap claims, synthetic populations |
| GBV / OCMC | None | PRIVACY_BLOCKED: all live GBV/OCMC components pending explicit approved aggregate/privacy contract |
| Data Quality & Evidence | DERIVED_FROM_LIVE_BIGQUERY: rows checked, rows with issues, quality percentage; LIVE_BIGQUERY: source refresh timestamp | NOT_SUPPORTED: evidence links, validation workflow, per-partner prototype tables |
| Management Decision Centre | None | NOT_SUPPORTED: prototype/AI recommendations and simulated actions |
| Activity Detail | DERIVED_FROM_LIVE_BIGQUERY: events and attendance totals grouped by activity, limited to 100 groups | NOT_SUPPORTED: individual event detail/evidence/export contract; PRIVACY_BLOCKED: raw participant export |

Unsupported production components are replaced by explicit safe states. Prototype children are not mounted behind overlays in BigQuery mode. Counts from 1 through 4 are rendered as `<5`; unavailable counts are not converted to zero. Zero matching records receive a no-data state.

## Dimensions and filters

Repository schema evidence uses published physical column names with suffix `1`. The semantic reporting dimensions map to these existing columns without any schema changes: reporting_year → reporting_year1, report_quarter → report_quarter1, project → project1, outcome → outcome1, output → output1, activity → activity1, indicator → indicator1, province_name → province1, district_name → district1, palika_name → palika1, and ip_name → ip_name. Other documented columns include subact1, actdetails1, subactcode1, fundcode1, eventtype1, start_date1 and end_date1. These are existing repository schema evidence, not a fresh live schema certification. Report date and any other unverified dimension are not invented.

Year, Quarter, Project, Implementing Partner, Province, District and Palika selections use server-produced live options and parameterized predicates. Filter capability is route-specific: combined-view routes support these dimensions; IP status supports only Implementing Partner; data quality supports no dimensional filtering; indicator aggregates cannot support Implementing Partner. Unsupported selections produce an explicit response rather than an unfiltered substitute. Outcome, Output, Activity and Indicator controls are explicitly disabled where not implemented.

No client-provided table or column name enters SQL. Queries select aggregate columns and apply server-side predicates and result bounds. Readiness checks on RepeatData return only aggregate availability/counts, never direct identifiers or participant rows.

## Runtime and authentication

Production environment contract:

```dotenv
GOOGLE_CLOUD_PROJECT_ID=unfpadatabase
BIGQUERY_DATASET_ID=unfpadatabase
BIGQUERY_LOCATION=asia-south1
BIGQUERY_MAX_BYTES_BILLED=1000000000
DATA_MODE=bigquery
```

Legacy project/dataset aliases remain compatible when they identify the frozen project/dataset. Conflicting configuration fails safely. Configure exactly one existing approved authentication mode: Vercel WIF, approved external ADC, or approved external PEM. Never substitute a pipeline/admin account. No credentials are committed or exposed through `NEXT_PUBLIC_*`.

Google OAuth, verified exact-email allowlists, ADMIN and authorized-user RBAC, callback URL preservation and open-redirect protection remain in place. Page and API guards execute before data services. Anonymous dashboard requests are blocked; anonymous API requests return 401 without BigQuery calls. Live GBV remains disabled even for ADMIN. Authenticated responses are private and non-cacheable.

In `DATA_MODE=bigquery`, failures return unavailable/authorization states with no mock fallback. Successful live output is labelled `Data source: BigQuery`. Development mode is explicitly labelled `Demo / mock data`. Invalid or conflicting mode configuration cannot silently enable a demo production experience.

All dashboard BigQuery jobs enforce a positive maximum billed-byte limit no greater than 1,000,000,000 bytes, with that value as the default. This is a per-job cap, not a total session budget. Queries are read-only. Dashboard code creates no BigQuery objects.

Refresh depends on the existing frozen upstream publishing process. The dashboard reads stable views and displays published sync/run timestamps where available. It does not trigger KoBo ingestion, warehouse release, recovery, or GCS reads. Historical accepted reference counts (RepeatData 51,794; ActivitySummary 2,592) are reference evidence, not hard-coded UI totals or a current read certification.

## Validation and activation boundary

Live read-only verification requires the approved dashboard runtime credentials and its existing permissions. Local `.env.local` contains an OIDC token only; the available production environment files contain redacted/placeholder runtime values, and the process supplies no usable dashboard BigQuery authentication configuration. No fallback to a developer/pipeline identity is allowed.

Remaining external verification: use the existing dashboard identity to confirm all six views, current schemas, representative authenticated APIs, live filter results and the billed-byte guard. If denied, report that exact identity and permission; do not change IAM. No IAM failure has been inferred from absent credentials. Production activation/deployment is outside this execution.

Validation on 17 September 2026:

- `npm ci`: passed without package upgrades. The existing dependency tree reports six advisories (one low, two moderate, two high, one critical); no forced fixes were applied.
- `npm run lint`: passed, with eight existing unused-variable warnings in preserved utility scripts. Their CommonJS syntax is allowed by a narrow ESLint configuration entry.
- `npm run typecheck`: passed.
- `npm test`: its initial run exposed obsolete four-view fixture assumptions. After correcting those fixtures and the offline dashboard preflight, every constituent test passed individually, including the production smoke invoked by `test:verify`; the entire suite was not repeatedly rerun.
- `npm run test:dashboard-readiness`: passed.
- `npm run build`: passed with the server-only readiness manifest included in the build traces. The local build generates a mock/NONE manifest; this certifies compilation, not an authenticated live WIF deployment.
- Production regression tests exercise all ten page guards, seven parameterized filters, no-data/error states, participant API authorization for both metrics and options, duplicate-filter rejection, and zero service reads for denied requests.
- Local built-server HTTP smoke with `DATA_MODE=bigquery`: anonymous dashboard request returned 307 to sign-in with callback URL; page-data, executive-overview, participants and participant-options APIs all returned 401. The local server was stopped after validation.
- Browser JavaScript inspection: zero credential markers across 51 compiled JavaScript files. Source checks also reject server BigQuery imports and credential variables in client components.
- Live BigQuery read-only smoke: BLOCKED by unavailable usable dashboard runtime credentials. No live rows, live filter results, or current view schemas are certified by offline fixtures.

## Files changed in this execution

Pre-existing page edits, client chart files, the awaiting-data overlay and participant-metrics edits were preserved and extended. The existing task document, scratch lint outputs, `scripts/uat-live.js`, `test_prod.js`, and `test_prod2.js` were retained; they were not deleted or executed against Production.

```text
.env.example
.env.production.example
eslint.config.mjs
docs/BIGQUERY_TO_DASHBOARD_PRODUCTION_HANDOFF.md
scripts/dashboard/bigquery-readonly.js
scripts/dashboard/production-preflight.js
scripts/test-dashboard-bigquery-readonly.js
scripts/test-pre-uat-validation.js
scripts/test-production-smoke.js
scripts/test-production-v1.js
scripts/test-vercel-gcp-wif.js
scripts/test-vercel-readiness-manifest.js
src/app/api/dashboard/participants/route.ts
src/app/dashboard/activity-detail/page.tsx
src/app/dashboard/activity-detail/client-page.tsx
src/app/dashboard/activity-progress/page.tsx
src/app/dashboard/data-quality/page.tsx
src/app/dashboard/executive-overview/page.tsx
src/app/dashboard/gbv-ocmc-summary/page.tsx
src/app/dashboard/geographic-coverage/page.tsx
src/app/dashboard/geographic-coverage/client-charts.tsx
src/app/dashboard/indicator-progress/page.tsx
src/app/dashboard/ip-performance/page.tsx
src/app/dashboard/management-decision-centre/page.tsx
src/app/dashboard/participant-reach/page.tsx
src/app/dashboard/participant-reach/client-charts.tsx
src/components/dashboard/awaiting-data-overlay.tsx
src/components/dashboard/bigquery-route-view.tsx
src/components/dashboard/dashboard-filter-provider.tsx
src/components/dashboard/data-source-status-panel.tsx
src/components/layout/top-filter-bar.tsx
src/lib/participant-contract.ts
src/lib/server/bigquery-client.ts
src/lib/server/dashboard-page-data-service.ts
src/lib/server/participant-metrics.ts
src/lib/server/pre-uat-validation.ts
src/lib/server/readiness-manifest-contract.js
```
