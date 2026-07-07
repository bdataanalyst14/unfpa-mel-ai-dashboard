# BQ_CONTENT_001 Activity Hosted Preview QA

Date: 2026-07-01

Preview URL: `https://unfpa-mel-ai-dashboard-cod001-7h2ee371a.vercel.app`

## Hosted API QA

Protection bypass was used for QA only. The bypass secret was not printed or recorded.

| Route | HTTP | dataSource | Mock fallback | Notes |
| --- | ---: | --- | --- | --- |
| `/api/dashboard/page-data?route=activity-detail` | 200 | `bigquery` | No | Hosted route returns aggregate metadata only; no row payload yet |
| `/api/dashboard/page-data?route=activity-progress` | 200 | `bigquery` | No | Hosted route returns aggregate metadata only |

## Hosted Page QA

| Route | Status |
| --- | --- |
| `/dashboard/activity-detail` | Existing hosted page still requires redeploy to receive local mapping/label patch |
| `/dashboard/activity-progress` | Existing hosted page still requires redeploy to receive local synthetic-row removal |

## Build And Redeploy Status

- `npm run test:verify`: passed
- `npm run build`: did not complete; local Next build remained active with no final output and was stopped to avoid leaving orphaned Node processes
- Preview redeploy after patch: not run
- Production deploy: not run
- `vercel --prod`: not run

## QA Conclusion

Hosted Preview API remains BigQuery-backed for the tested activity routes. The local Activity Detail mapping patch and Activity Progress label cleanup are not visible on Hosted Preview until the build hang is resolved and a Preview-only redeploy is completed.
