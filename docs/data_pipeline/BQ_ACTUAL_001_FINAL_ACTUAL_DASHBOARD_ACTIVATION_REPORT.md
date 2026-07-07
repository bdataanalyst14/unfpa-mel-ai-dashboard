# BQ_ACTUAL_001_FINAL_ACTUAL_DASHBOARD_ACTIVATION_REPORT

Date: 2026-06-30
Status: `bigquery_env_missing_needs_vercel_configuration`

## 1. Files Reviewed

- `package.json`
- `package-lock.json`
- `next.config.js`
- `src/lib/server/bigquery-client.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/lib/server/suppression.ts`
- `src/app/api/dashboard/executive-overview/route.ts`
- Dashboard pages under `src/app/dashboard/*`
- Dashboard chart/table/status components under `src/components/*`
- Mock data under `src/data/mock/*`
- Registry data under `src/data/registry/*`
- BigQuery documentation under `docs/data_pipeline/*`
- Readiness and final QA documentation under `docs/agentic_workflow/*` and `docs/dashboard_qa/*`

## 2. Files Changed

Source files:

- `src/lib/server/bigquery-client.ts`
- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/api/dashboard/page-data/route.ts`
- `src/components/dashboard/data-source-status-panel.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/gbv-ocmc/page.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `src/app/dashboard/activity-detail/page.tsx`
- `src/app/dashboard/participant-reach/page.tsx`
- `src/app/dashboard/data-quality/page.tsx`
- `src/app/dashboard/ip-performance/page.tsx`
- `src/app/dashboard/indicator-progress/page.tsx`
- `src/app/dashboard/management-decision-centre/page.tsx`
- `src/app/dashboard/gbv-ocmc-summary/page.tsx`

Documentation files:

- `docs/data_pipeline/BQ_ACTUAL_001_CURRENT_DATA_MODE_AUDIT.md`
- `docs/data_pipeline/BQ_ACTUAL_001_BIGQUERY_SCHEMA_CONTRACT.md`
- `docs/data_pipeline/BQ_ACTUAL_001_VERCEL_ENV_CONTRACT.md`
- `docs/data_pipeline/BQ_ACTUAL_001_BIGQUERY_WIRING_IMPLEMENTATION_NOTE.md`
- `docs/data_pipeline/BQ_ACTUAL_001_BIGQUERY_READONLY_SMOKE_EVIDENCE.md`
- `docs/data_pipeline/BQ_ACTUAL_001_LOCAL_ROUTE_QA.md`
- `docs/data_pipeline/BQ_ACTUAL_001_VERCEL_PREVIEW_SETUP_CHECKLIST.md`
- `docs/data_pipeline/BQ_ACTUAL_001_HOSTED_PREVIEW_ROUTE_QA.md`
- `docs/dashboard_qa/BQ_ACTUAL_001_DASHBOARD_LABEL_UPDATE_NOTE.md`
- `docs/data_pipeline/BQ_ACTUAL_001_FINAL_ACTUAL_DASHBOARD_ACTIVATION_REPORT.md`

## 3. BigQuery Env Contract

Defined in `BQ_ACTUAL_001_VERCEL_ENV_CONTRACT.md`.

Required/compatible variables:

- `DASHBOARD_DATA_MODE=bigquery`
- `DATA_MODE=bigquery` legacy fallback
- `BIGQUERY_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_PROJECT_ID` legacy fallback
- `BIGQUERY_DATASET`
- `BIGQUERY_DATASET_ID` legacy fallback
- `BIGQUERY_LOCATION`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_PRIVATE_KEY_BASE64`
- `BIGQUERY_MAX_BYTES_BILLED`
- `BIGQUERY_CACHE_TTL_SECONDS`

Current Codex session status: required BigQuery env vars were missing/unknown. No secret values were printed.

## 4. Dependency Status

`@google-cloud/bigquery` was already present in `package.json` and `package-lock.json`. No dependency was added. No `npm install` or `npm ci` was run by this task.

## 5. BigQuery Smoke Result

Status: `bigquery_credentials_missing`.

No read-only BigQuery smoke query was run because credentials/env vars were unavailable in the session. No raw rows, credentials, service-account JSON, private keys, or tokens were printed.

## 6. Code Wiring Result

Status: `bigquery_env_missing_needs_vercel_configuration`.

Implemented server-side BigQuery-ready wiring:

- BigQuery env alias support and `GOOGLE_PRIVATE_KEY_BASE64` support.
- Server-only route aggregate service using approved aggregate views.
- `/api/dashboard/page-data?route=...` API endpoint.
- Visible data-source status panel on non-protected dashboard pages.
- Explicit fallback metadata when BigQuery env is missing or unavailable.
- GBV/OCMC route remains blocked for live activation.
- `/dashboard` and `/dashboard/gbv-ocmc` route aliases now redirect to valid pages.

## 7. Local Route QA

Local verification in `C:\unfpa-mel-final-build-sandbox-013`:

- `npm run test:verify`: passed, 19 checks.
- `npm run build`: passed.
- `npm run start -- -p 3050`: started for route QA only.

Route QA summary:

| Route | HTTP status | Data source metadata | BigQuery data visible | Fallback visible | Notes |
| --- | ---: | --- | --- | --- | --- |
| `/` | 307 | `mock` | No | Yes | Redirect response. |
| `/dashboard` | 307 | `mock` | No | Yes | Redirects to Executive Overview. |
| `/dashboard/geographic-coverage` | 200 | `mock` | No | Yes | Protected geography page not edited. |
| `/dashboard/participant-reach` | 200 | `mock` | No | Yes | Env missing. |
| `/dashboard/data-quality` | 200 | `mock` | No | Yes | Env missing. |
| `/dashboard/ip-performance` | 200 | `mock` | No | Yes | Env missing. |
| `/dashboard/activity-progress` | 200 | `mock` | No | Yes | Env missing. |
| `/dashboard/activity-detail` | 200 | `mock` | No | Yes | Env missing. |
| `/dashboard/indicator-progress` | 200 | `mock` | No | Yes | Env missing and M&E validation pending. |
| `/dashboard/management-decision-centre` | 200 | `mock` | No | Yes | Env missing; narrative remains illustrative/prototype. |
| `/dashboard/gbv-ocmc` | 307 | `mock` | No | Yes | GBV/OCMC remains blocked for live activation. |

No route showed person-level data, production readiness claim, DP-004 clearance claim, or GBV/OCMC live activation claim.

## 8. Hosted Preview QA

Status: `hosted_preview_qa_pending_vercel_env_and_redeploy`.

Hosted preview QA was not run because Vercel Preview BigQuery env vars and redeploy were not confirmed in this task.

## 9. Pages Now BigQuery-Backed

No page was confirmed BigQuery-backed in this task because BigQuery credentials/env vars were missing locally and Vercel Preview env/redeploy was pending.

## 10. Pages Still Fallback/Mock

All tested pages remained mock/prototype fallback in local QA due missing BigQuery env configuration. The code is prepared to show BigQuery aggregate metadata once the env is configured and aggregate queries succeed.

## 11. Suppression/Privacy Status

- Server-side suppression helpers remain in place.
- New route aggregate service applies suppressed display values to numeric aggregate metrics.
- New API responses include `suppressionApplied` metadata.
- No raw participant or survivor rows are returned.
- GBV/OCMC remains blocked for live activation pending privacy sign-off and final suppression QA.

## 12. Remaining Blockers

- Configure BigQuery env vars locally and in Vercel Preview.
- Redeploy Vercel Preview after env vars are added.
- Run read-only aggregate BigQuery smoke query.
- Confirm hosted preview routes return `dataSource: "bigquery"` where expected.
- Replace page labels only after route-level BigQuery backing is verified.
- Complete final live API/browser QA.
- Complete programme M&E validation.
- Keep GBV/OCMC blocked until privacy sign-off.
- Keep DP-004 blocked until final approval.
- Keep production blocked until release approval.

## 13. Final Decision Block

```text
Dashboard Mode: BIGQUERY-READY CODE, HOSTED ENV PENDING
Hosted Preview: PENDING VERCEL ENV AND REDEPLOY
Technical Build: PASSED
Browser Smoke: PASSED
Data Source: MOCK/PROTOTYPE UNTIL BIGQUERY ENV IS CONFIGURED
MEL Validation: PENDING PROGRAMME VALIDATION
GBV/OCMC: BLOCKED FOR LIVE ACTIVATION
DP-004: BLOCKED UNTIL FINAL APPROVAL
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Live API/Browser QA: PENDING
Final Manager Status: BIGQUERY ACTIVATION PENDING
```
