# BQ_ACTUAL_001_BIGQUERY_WIRING_IMPLEMENTATION_NOTE

Date: 2026-06-30
Status: `bigquery_env_missing_needs_vercel_configuration`

## Files Changed

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

## Before

- Executive Overview had partial BigQuery aggregate wiring.
- Most dashboard pages imported mock data directly and did not show route-level data-source metadata.
- `/dashboard` and `/dashboard/gbv-ocmc` were unavailable as route aliases in the local build.

## After

- BigQuery client supports preferred and legacy env names.
- Server-side page aggregate service added for route-level BigQuery aggregate snapshots.
- API route `/api/dashboard/page-data?route=...` returns page-ready aggregate metadata and suppressed display values.
- Visible data-source status panel added to non-protected dashboard pages.
- `/dashboard` redirects to Executive Overview.
- `/dashboard/gbv-ocmc` redirects to GBV/OCMC Summary.
- GBV/OCMC live activation remains blocked in API metadata.

## Privacy Impact

- BigQuery runs server-side only.
- No credentials are used in client code.
- No `NEXT_PUBLIC_*` credentials were introduced.
- No raw sensitive rows are returned.
- New API uses aggregate views only.
- Suppression display values are applied to numeric aggregate metrics.
- Mock fallback is explicit and visible when BigQuery env is unavailable.

## Rollback Note

Revert the listed source files to return to prior mock-only route behavior. No dependency or package-lock change was made because `@google-cloud/bigquery` already existed.
