# BQ_ACTUAL_005 Final Hosted BigQuery Verification Report

Date: 2026-07-01

## Final Decision

Dashboard Mode: BIGQUERY ENV CONFIGURED BUT HOSTED VERIFICATION BLOCKED
Hosted Preview: NOT VERIFIED
Technical Build: PASSED
Browser Smoke: PASSED
Data Source: NOT VERIFIED
MEL Validation: PENDING PROGRAMME VALIDATION
GBV/OCMC: BLOCKED FOR LIVE ACTIVATION
DP-004: BLOCKED UNTIL FINAL APPROVAL
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Live API/Browser QA: PENDING
Final Manager Status: VERCEL AUTHENTICATION OR UI REDEPLOY URL REQUIRED

## CLI Authentication And Preview Environment

- Vercel CLI authentication: confirmed as `bdataanalyst14`
- Project: `unfpa-mel-ai-dashboard-cod001`
- Preview environment variables confirmed by name and scope only:
  - `DASHBOARD_DATA_MODE` - Preview
  - `DATA_MODE` - Preview
  - `BIGQUERY_PROJECT_ID` - Preview
  - `GOOGLE_CLOUD_PROJECT` - Preview
  - `GOOGLE_CLOUD_PROJECT_ID` - Preview
  - `BIGQUERY_DATASET` - Preview
  - `BIGQUERY_DATASET_ID` - Preview
  - `BIGQUERY_LOCATION` - Preview
  - `GOOGLE_CLIENT_EMAIL` - Preview
  - `GOOGLE_PRIVATE_KEY_BASE64` - Preview

No environment variable values or credential values were printed or recorded.

## Preview Redeploy

- Deployment command: `vercel --confirm --force`
- Deployment status: Ready
- Deployment target: Preview
- New Preview URL: `https://unfpa-mel-ai-dashboard-cod001-7h2ee371a.vercel.app`
- Deployment ID: `dpl_98oyby3u4RN31jnqCD6TPWJoUFKA`
- Production avoided: yes
- `vercel --prod` run: no

Build completed successfully. The deployment output included the expected Next.js API functions for `/api/dashboard/page-data` and `/api/dashboard/executive-overview`.

## API Endpoint Verification

All API endpoint requests returned HTTP 200, but the response was HTML instead of JSON. Response headers showed `X-Matched-Path: /login`, so the hosted Preview routes were not publicly verifiable from the test client.

| Route | HTTP | dataSource | Mock fallback | Freshness timestamp | Suppression metadata | Error |
| --- | ---: | --- | --- | --- | --- | --- |
| `/api/dashboard/page-data?route=activity-progress` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |
| `/api/dashboard/page-data?route=participant-reach` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |
| `/api/dashboard/page-data?route=data-quality` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |
| `/api/dashboard/page-data?route=ip-performance` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |
| `/api/dashboard/page-data?route=indicator-progress` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |
| `/api/dashboard/page-data?route=geographic-coverage` | 200 | Not available | Not verified | Not verified | Not verified | Served `/login` HTML instead of API JSON |

## Dashboard Page Verification

Dashboard page requests returned HTTP 200, but the hosted response was the Preview login/protection page, not the dashboard page content. BigQuery status, data-source panel visibility, and mock fallback status could not be confirmed.

| Route | HTTP | Runtime error | Data-source panel visible | BigQuery confirmed | Mock fallback | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `/dashboard/activity-progress` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/participant-reach` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/data-quality` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/ip-performance` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/indicator-progress` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/geographic-coverage` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/management-decision-centre` | 200 | No | No | No | Not verified | Served login/protection page |
| `/dashboard/gbv-ocmc` | 200 | No | No | No | Not verified | Served login/protection page |

No person-level dashboard data was accessible during hosted verification. No DP-004 clearance claim, GBV/OCMC live activation claim, or production readiness claim was confirmed from dashboard content because the dashboard content was not reachable.

## Diagnosis

- Preview env variables are attached to Preview by name and scope.
- Fresh Preview redeploy completed and is marked Ready.
- The tested Preview URL is the latest deployment listed by Vercel.
- API and dashboard route verification is blocked because requests are served the Vercel `/login` page instead of the deployed dashboard/API response.
- No deployment logs were available through `vercel logs` for the tested requests.
- BigQuery cannot be confirmed or rejected from hosted routes until the Preview URL is accessible for verification, or a valid Vercel protection bypass is provided through a non-printing mechanism.
