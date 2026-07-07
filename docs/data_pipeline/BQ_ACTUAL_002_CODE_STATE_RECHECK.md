# BQ_ACTUAL_002_CODE_STATE_RECHECK

Date: 2026-06-30
Status: `bigquery_ready_code_env_pending`

## Files Reviewed

- `src/lib/server/bigquery-client.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/api/dashboard/page-data/route.ts`
- `src/components/dashboard/data-source-status-panel.tsx`
- `src/app/dashboard/*/page.tsx`
- `src/data/mock/ai-insights.ts`
- `docs/data_pipeline/BQ_ACTUAL_001_*`

## Source State

- Server-side BigQuery client and aggregate page-data service are present.
- `/api/dashboard/page-data` normalizes dashboard routes and returns route metadata.
- `DASHBOARD_DATA_MODE=bigquery` and `DATA_MODE=bigquery` are now accepted by the executive overview path and generic page-data path.
- Data-source status panels are present on Activity Progress, Activity Detail, Participant Reach, Geographic Coverage, Data Quality, IP Performance, Indicator Progress, Management Decision Centre, and GBV/OCMC Summary.
- GBV/OCMC remains blocked for live activation and returns explicit mock fallback metadata.

## Minimal Label Patches

- Geographic Coverage now labels the footprint as prototype pending BigQuery/geography validation.
- Management Decision Centre OCMC narrative now marks values as placeholders pending privacy clearance, suppression QA, and programme validation.
- AI insight narrative wording no longer says donor-ready.

## Current Limitation

The route bodies still mostly render mock/prototype page content. The BigQuery service currently provides aggregate metadata and selected executive overview values only after hosted environment configuration.
