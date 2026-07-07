# BQ_ACTUAL_006 Preview Protection And BigQuery Verification Report

Date: 2026-07-01

## Final Decision

Dashboard Mode: ACTUAL BIGQUERY-BACKED DASHBOARD
Hosted Preview: VERIFIED
Preview Protection: BYPASSED FOR QA
Technical Build: PASSED
Browser Smoke: PASSED
Data Source: BIGQUERY
MEL Validation: PENDING PROGRAMME VALIDATION
GBV/OCMC: BLOCKED FOR LIVE ACTIVATION
DP-004: BLOCKED UNTIL FINAL APPROVAL
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Live API/Browser QA: COMPLETED FOR PREVIEW ONLY
Final Manager Status: ACTUAL DASHBOARD READY FOR REVIEW

## Preview Reachability

- Preview URL: `https://unfpa-mel-ai-dashboard-cod001-7h2ee371a.vercel.app`
- Protection handling: bypass used for QA only; bypass secret was not printed or recorded.
- First API reachability test: passed
- HTTP status: 200
- Content type: `application/json`
- JSON response: yes
- HTML/login response: no
- `X-Matched-Path`: `/api/dashboard/page-data`
- Dashboard API route reached: yes

## API Data-Source Verification

| Route | HTTP | dataSource | Mock fallback | BigQuery confirmed | Freshness timestamp | Suppression metadata | Error |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `/api/dashboard/page-data?route=activity-progress` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=participant-reach` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=data-quality` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=ip-performance` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=indicator-progress` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=geographic-coverage` | 200 | `bigquery` | No | Yes | Yes | Yes | None |
| `/api/dashboard/page-data?route=management-decision-centre` | 200 | `bigquery` | No | Yes | Yes | Yes | None |

## Dashboard Page Smoke Test

| Route | HTTP | Runtime error | Dashboard content visible | Data-source panel visible in initial HTML | BigQuery confirmed by route API | Mock fallback | Safety/readiness claims |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `/dashboard/activity-progress` | 200 | No | Yes | No | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/participant-reach` | 200 | No | Yes | No | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/data-quality` | 200 | No | Yes | No | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/ip-performance` | 200 | No | Yes | No | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/indicator-progress` | 200 | No | Yes | No | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/geographic-coverage` | 200 | No | Yes | Yes | Yes | No | No DP-004, GBV/OCMC live activation, or production readiness claim observed |
| `/dashboard/management-decision-centre` | 200 | No | Yes | No | Yes | No | No GBV/OCMC live activation or production readiness claim observed; page text references DP-004 governance status but no final clearance was claimed |
| `/dashboard/gbv-ocmc` | 307 | Not verified | Redirected | Not verified | Not applicable | Not verified | GBV/OCMC live activation remains blocked |

No raw sensitive rows, service-account JSON, private keys, tokens, or protection bypass secret values were printed or recorded. No person-level identifiers, phone numbers, or email patterns were observed in the reachable dashboard HTML during smoke testing.

## Reality Check

- Preview protection was the prior blocker; the bypass allowed API requests to reach the deployed dashboard route.
- BigQuery is confirmed through the hosted Preview API metadata for all requested data-source routes.
- Mock fallback is not active on the tested BigQuery-backed API routes.
- Dashboard pages are reachable beyond login, except `/dashboard/gbv-ocmc`, which returns a redirect and remains blocked for live activation.
- This is Preview-only QA. It does not imply production readiness, DP-004 clearance, final M&E validation, donor-ready evidence, programme sign-off, or GBV/OCMC live activation.
