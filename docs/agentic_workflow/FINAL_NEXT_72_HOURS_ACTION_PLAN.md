# FINAL_NEXT_72_HOURS_ACTION_PLAN

Date: 2026-06-30
Status: `BIGQUERY_ACTIVATION_PENDING`

| Owner | Action | Status | Dependency | Evidence/source document |
| --- | --- | --- | --- | --- |
| Manager/SMT Lead | Approve SMT demo with caveats. | Ready | Manager decision | `FINAL_MANAGER_ACTION_PACK.md` |
| Technical Lead | Configure BigQuery environment variables in Vercel Preview. | Pending | Cloud access | `BQ_ACTUAL_001_VERCEL_ENV_CONTRACT.md` |
| Release Manager | Redeploy Vercel Preview and verify routing. | Pending | Vercel env configuration | `BQ_ACTUAL_001_HOSTED_PREVIEW_ROUTE_QA.md` |
| Dashboard QA Lead | Run hosted route verification once env vars are active. | Pending | Preview redeploy | `BQ_ACTUAL_001_HOSTED_PREVIEW_ROUTE_QA.md` |
| Data Engineer | Keep E001 refresh/admin approval open. | Pending | Admin evidence | `DATA_PIPELINE_FINAL_E001_DP004_READINESS_NOTE.md` |
| Privacy/Security Lead | Confirm GBV/OCMC remains blocked for live activation. | Pending | Privacy sign-off | `GEMINI_FINAL_SECURITY_PRIVACY_NARRATIVE_REVIEW.md` |
| MEL Lead | Validate provisional CPD and activity/workplan mappings. | Pending | Programme review | `MEL_FINAL_PROGRAMME_VALIDATION_CAVEAT_NOTE.md` |
| Release Owner | Keep production deployment hold. | Blocked | All final gates | `FINAL_RELEASE_GATE_REGISTER.md` |
| Technical Lead | Add BQ_ACTUAL_002 required variables to Vercel Preview only. | Pending | Secure credential access | `BQ_ACTUAL_002_VERCEL_ENV_MISSING_ACTIONS.md` |
| Dashboard QA Lead | Run actual-data API/browser QA after Preview redeploy. | Pending | Preview env and redeploy | `BQ_ACTUAL_002_HOSTED_PREVIEW_ACTUAL_DATA_ROUTE_QA.md` |
| Cline QA Agent | Execute Cline parallel QA once Vercel actual data is active. | Pending | Codex activation evidence | `cline_parallel_qa_pending` |

## Current Status

```text
Dashboard Mode: BIGQUERY-READY CODE, HOSTED ENV PENDING
Hosted Preview: PENDING VERCEL ENV AND REDEPLOY
Technical Build: PASSED
Browser Smoke: PASSED
Data Source: MOCK/PROTOTYPE UNTIL BIGQUERY ENV IS CONFIGURED
MEL Validation: PENDING PROGRAMME VALIDATION
GBV/OCMC: BLOCKED FOR LIVE ACTIVATION
DP-004: BLOCKED UNTIL FINAL APPROVAL
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Live API/Browser QA: PENDING
Final Manager Status: BIGQUERY ACTIVATION PENDING
```
