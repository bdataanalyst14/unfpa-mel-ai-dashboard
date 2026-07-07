# BQ_CONTENT_002 Hosted Activity QA

Date: 2026-07-01

Preview URL: `https://unfpa-mel-ai-dashboard-cod001-mg0zoirdp.vercel.app`

Protection bypass was used for QA only. The bypass secret was not printed or recorded.

## API QA

| Route | HTTP | Content type | dataSource | Mock fallback | Activity rows | Suppression | Result |
| --- | ---: | --- | --- | --- | ---: | --- | --- |
| `/api/dashboard/page-data?route=activity-detail` | 200 | `application/json` | `bigquery` | No | 250 | Present | Passed |
| `/api/dashboard/page-data?route=activity-progress` | 200 | `application/json` | `bigquery` | No | 0 | Present | Passed |

Exact hosted `activityRows` checks:

- `ACT-2025-*` ID count: 0
- Exact generic `Activity 1/2/3` activity-name count: 0
- Exact generic `Activity 1/2/3` ID count: 0
- `Pending registry validation` count: 250
- `Not in source` evidence count: 250
- Outdated demo subtitle in API payload: no

## Page QA

| Route | HTTP | Login/protection | Runtime error | `ACT-2025-*` | Generic `Activity 1/2/3` | Outdated subtitle | Caveat |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `/dashboard/activity-detail` | 200 | No | No | No | No | No | Pending registry/programme validation visible |
| `/dashboard/activity-progress` | 200 | No | No | No | No | No | Pending registry/programme validation visible |

## Safety Claims

No production readiness claim, DP-004 clearance claim, or GBV/OCMC live activation claim was observed on the tested activity pages.
