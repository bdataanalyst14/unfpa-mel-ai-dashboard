# BQ_ACTUAL_001_LOCAL_ROUTE_QA

Date: 2026-06-30
Environment: `C:\unfpa-mel-final-build-sandbox-013`
Status: `bigquery_env_missing_needs_vercel_configuration`

## Commands Run

```powershell
npm run test:verify
npm run build
npm run start -- -p 3050
```

## Test And Build Result

- `npm run test:verify`: passed, 19 checks.
- `npm run build`: passed.
- Build warning: `experimental.appDir` is not recognized by Next.js 14; warning did not fail build.

## Local Route QA Table

| Route | HTTP status | Runtime error | API dataSource metadata | Actual BigQuery-backed data visible | Mock fallback visible | Freshness timestamp visible | Suppression metadata visible | No person-level data visible | No production readiness claim | No DP-004 clearance claim | No GBV/OCMC live activation claim |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 307 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard` | 307 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/geographic-coverage` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/participant-reach` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/data-quality` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/ip-performance` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/activity-progress` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/activity-detail` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/indicator-progress` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/management-decision-centre` | 200 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/gbv-ocmc` | 307 | No | `mock` | No | Yes | No | Yes | Yes | Yes | Yes | Yes |

## Interpretation

Local build and route QA passed. Actual BigQuery data was not visible because BigQuery env vars were missing. The app now exposes explicit fallback metadata instead of silently pretending actual data is loaded.
