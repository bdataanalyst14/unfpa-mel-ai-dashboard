# BQ_ACTUAL_001_CURRENT_DATA_MODE_AUDIT

Date: 2026-06-30
Status: `bigquery_env_missing_needs_vercel_configuration`

## Files Reviewed

- `package.json`, `package-lock.json`, `next.config.js`
- `src/lib/server/bigquery-client.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/lib/server/suppression.ts`
- `src/app/api/dashboard/executive-overview/route.ts`
- Dashboard pages under `src/app/dashboard/*`
- Mock data under `src/data/mock/*`
- Registry data under `src/data/registry/*`
- BigQuery documentation under `docs/data_pipeline/*`
- Final readiness documentation under `docs/agentic_workflow/*`

## Current Data Mode Findings

| Area | Current source before BQ_ACTUAL_001 | Reconciled status after BQ_ACTUAL_001 |
| --- | --- | --- |
| Executive Overview | BigQuery service already wired for aggregate KPIs when `DATA_MODE=bigquery`; otherwise mock fallback. | Existing wiring preserved. |
| Activity Progress | Mock `combinedSummary` plus static delayed/evidence rows. | BigQuery aggregate metadata API and visible status panel added; page KPIs still need full component data replacement after env is configured. |
| Activity Detail | Mock `mainData` with client-side filters. | BigQuery aggregate metadata API and visible status panel added; row-level UI remains sample/demo until safe aggregate detail contract is validated. |
| Participant Reach | Mock `combinedSummary` and static age/caste/district tables. | BigQuery aggregate metadata API and visible status panel added. |
| Geographic Coverage | Protected map/mock geography page. | BigQuery API contract exists for aggregate metadata, but protected geography page source was not edited. |
| Data Quality | Mock `combinedSummary` and static validation examples. | BigQuery aggregate metadata API and visible status panel added. |
| IP Performance | Mock `combinedSummary` and static scorecards. | BigQuery aggregate metadata API and visible status panel added. |
| Indicator Progress | Mock CPD/UNSDCF indicator samples. | BigQuery aggregate metadata API and visible status panel added; final M&E validation remains pending. |
| Management Decision Centre | Mock AI insights and management actions. | BigQuery aggregate metadata API and visible status panel added; narrative remains illustrative/prototype. |
| GBV/OCMC | Mock GBV services with client-side masking. | Live activation remains blocked. API returns explicit blocked/fallback metadata. |

## BigQuery Wiring Already Present

- `@google-cloud/bigquery` is already present in `package.json` and `package-lock.json`.
- `src/lib/server/bigquery-dashboard-service.ts` already wires Executive Overview aggregate KPIs to BigQuery via approved summary views.
- `src/lib/server/suppression.ts` provides server-side count/percentage suppression helpers.

## Environment Variables Needed

- `DASHBOARD_DATA_MODE=bigquery` or legacy `DATA_MODE=bigquery`
- `BIGQUERY_PROJECT_ID` or `GOOGLE_CLOUD_PROJECT` or legacy `GOOGLE_CLOUD_PROJECT_ID`
- `BIGQUERY_DATASET` or legacy `BIGQUERY_DATASET_ID`
- `BIGQUERY_LOCATION`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` or `GOOGLE_PRIVATE_KEY_BASE64`
- `BIGQUERY_MAX_BYTES_BILLED`
- `BIGQUERY_CACHE_TTL_SECONDS`

Current local environment check: all required BigQuery env vars were missing/unknown in this Codex session. No values were printed.

## Metadata Findings

- Executive Overview already has metadata in API/page output.
- BQ_ACTUAL_001 added `/api/dashboard/page-data` for route-level aggregate data-source metadata.
- BQ_ACTUAL_001 added visible status panels to non-protected dashboard pages.
- Each API response includes `dataSource`, `freshnessTimestamp`, `suppressionApplied`, and `validationStatus`.

## Suppression Findings

- Server suppression helpers exist and are used for BigQuery aggregate display values in the new route-level service.
- GBV/OCMC live activation remains blocked until privacy sign-off and final suppression QA are complete.

## Data Flow Readiness

| Route | Can actual data flow after env config? | Current blocker |
| --- | --- | --- |
| Activity Progress | Yes, aggregate snapshot via API/status panel. | Vercel/local BigQuery env pending; full chart/KPI replacement pending. |
| Activity Detail | Partial, aggregate availability metadata only. | Safe aggregate row-detail contract pending. |
| Participant Reach | Yes, aggregate snapshot via API/status panel. | Env pending; full chart/table replacement pending. |
| Geographic Coverage | API can query aggregate geography metadata. | Protected geography page was not edited; live geography validation pending. |
| Data Quality | Yes, aggregate snapshot via API/status panel. | Env pending. |
| IP Performance | Yes, aggregate snapshot via API/status panel. | Env pending. |
| Indicator Progress | Yes, aggregate metadata via API/status panel. | Programme M&E validation pending. |
| Management Decision Centre | Partial, quality/IP aggregate metadata. | Decision rules and narrative validation pending. |
| GBV/OCMC | No live activation. | Privacy sign-off and final suppression QA required. |
