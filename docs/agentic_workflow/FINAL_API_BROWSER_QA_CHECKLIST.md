# FINAL_API_BROWSER_QA_CHECKLIST

Date: 2026-06-30
Status: `pending final live API/browser QA`

## Reconciled Technical Evidence

- Technical Build: `PASSED`
- Browser Smoke: `PASSED`
- Final live API/browser QA: `pending final live API/browser QA`

## Final QA Checklist Still Required

| Check | Status |
| --- | --- |
| Configure Vercel environment variables & redeploy | Pending |
| Confirm hosted preview routes return `dataSource: "bigquery"` | Pending |
| Validate live API payload shape and contract | Pending |
| Confirm server-side small-cell suppression on live payloads | Pending |
| Confirm no survivor-level or person-level data exposure | Pending |
| Confirm freshness/E001 status | Pending admin evidence |
| Confirm DP-004 remains blocked until approved | Blocked |
| Confirm GBV/OCMC remains blocked for live activation | Blocked |
| Confirm no live geography claim | Pending final QA |
| Confirm all caveats and status panels remain visible | Pending final QA |

## Interpretation

The Codex local build and browser smoke evidence shows code is BigQuery-ready. Vercel Preview environment configuration is required to verify actual BigQuery data flow. This is not final live API/browser QA completion and does not authorize production.
## BQ_ACTUAL_002 API/Browser QA Hold

Date: 2026-06-30

Do not run or close final live API/browser QA until:

- Vercel Preview env vars are configured.
- Preview is redeployed.
- `/api/dashboard/page-data` confirms `metadata.dataSource: "bigquery"` for eligible non-GBV routes.
- GBV/OCMC remains blocked and suppression QA is complete.
- Cline parallel QA status is completed (currently pending as `cline_parallel_qa_pending`).
