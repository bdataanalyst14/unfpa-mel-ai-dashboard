# DATA_PIPELINE_FINAL_UNBLOCKING_CHECKLIST

Date: 2026-06-30
Status: `data_pipeline_blockers_preserved`

| Gate | Status | Required action |
| --- | --- | --- |
| Vercel Preview environment configuration & redeploy | Pending | Set BigQuery environment variables in Vercel. |
| E001 freshness/admin approval | Pending | Produce approved freshness/admin evidence. |
| E002 final live API/browser suppression QA | Pending | Validate live payload suppression and caveats. |
| DP-004 | Blocked | Wait for E001/E002 and route approval. |
| GBV/OCMC live activation | Blocked | Privacy and suppression sign-off required. |
| Live geography | Pending validation | Do not claim live geography. |
| Production | Blocked | All release gates must close first. |

Technical Build: `PASSED`.
Browser Smoke: `PASSED`.
These results do not unblock live data gates by themselves.
## BQ_ACTUAL_002 Unblocking Checklist

Date: 2026-06-30

- Configure Vercel Preview variables listed in `BQ_ACTUAL_002_VERCEL_ENV_MISSING_ACTIONS.md`.
- Redeploy Vercel Preview after env configuration.
- Run read-only BigQuery smoke against approved aggregate views only.
- Run hosted Preview actual-data API/browser QA.
- Execute Cline parallel QA once Codex activation evidence is available (currently pending as `cline_parallel_qa_pending`).
- Keep GBV/OCMC blocked until privacy and suppression QA pass.
- Keep DP-004, production, live geography, and final donor-ready claims blocked.
