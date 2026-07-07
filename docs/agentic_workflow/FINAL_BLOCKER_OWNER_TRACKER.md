# FINAL_BLOCKER_OWNER_TRACKER

Date: 2026-06-30
Status: `active_blockers_preserved`

| Blocker | Owner | Current status | Required closure evidence |
| --- | --- | --- | --- |
| Vercel Preview environment configuration & redeploy | Technical Lead/Release Manager | Pending | Environment variables set in Vercel and build redeployed |
| E001 refresh/admin approval | Data Engineer/Admin | Pending | Approved freshness/admin evidence |
| E002 final live API/browser suppression QA | Technical/Data QA | Pending | Live API/browser payload QA with suppression confirmation |
| DP-004 clearance | SRE/Data Owner | Blocked | E001/E002 and route-connection approval |
| GBV/OCMC privacy sign-off | Privacy/Security Lead | Blocked for live activation | Privacy and suppression sign-off |
| Programme M&E validation | MEL Lead | Pending | Approved registry/activity crosswalk validation |
| Live geography validation | GIS/Data Owner | Pending | Approved live geography evidence |
| Production deployment hold | Release Owner | Blocked | All release gates closed |
| Registry/activity crosswalk validation | MEL/Data Owner | Pending | Exact indicator/activity mapping evidence |
| Final donor-ready evidence validation | Manager/MEL Lead | Pending | Approved evidence package |
## BQ_ACTUAL_002 Blocker Update

Date: 2026-06-30

| Blocker | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Vercel Preview BigQuery env vars | Technical Lead / credential owner | `BLOCKED - missing` | `BQ_ACTUAL_002_VERCEL_ENV_CONFIGURATION_EVIDENCE.md` |
| Vercel Preview redeploy | Release Manager | `PENDING` | `BQ_ACTUAL_002_VERCEL_PREVIEW_REDEPLOY_EVIDENCE.md` |
| BigQuery read-only smoke | Data Engineer | `PENDING` | `BQ_ACTUAL_002_BIGQUERY_READONLY_SMOKE_EVIDENCE.md` |
| Hosted actual-data route QA | Dashboard QA Lead | `PENDING` | `BQ_ACTUAL_002_HOSTED_PREVIEW_ACTUAL_DATA_ROUTE_QA.md` |
| Cline parallel QA | Cline QA Agent | `PENDING` | `cline_parallel_qa_pending` |
