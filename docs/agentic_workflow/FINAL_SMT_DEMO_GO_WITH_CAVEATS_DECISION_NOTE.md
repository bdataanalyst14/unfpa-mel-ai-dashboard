# FINAL_SMT_DEMO_GO_WITH_CAVEATS_DECISION_NOTE

Date: 2026-06-30
Decision: `SMT Demo GO WITH CAVEATS`

## Decision Basis

- Technical Build: `PASSED`
- Browser Smoke: `PASSED`
- Dashboard Mode: `BIGQUERY-READY CODE, HOSTED ENV PENDING`
- Hosted Preview: `PENDING VERCEL ENV AND REDEPLOY`
- Data Source: `MOCK/PROTOTYPE UNTIL BIGQUERY ENV IS CONFIGURED`
- MEL Validation: `PENDING PROGRAMME VALIDATION`
- GBV/OCMC: `BLOCKED FOR LIVE ACTIVATION`
- DP-004: `BLOCKED UNTIL FINAL APPROVAL`
- Production: `BLOCKED UNTIL RELEASE APPROVAL`
- Final Live API/Browser QA: `PENDING`
- Final Manager Status: `BIGQUERY ACTIVATION PENDING`

## Decision Note

SMT demo may proceed with caveats. The demo must not be positioned as production, live, donor-ready evidence, final M&E validation, DP-004 clearance, or GBV/OCMC live activation. The code is BigQuery-ready, but Vercel environment variable configuration is pending to run hosted actual data. Until configured, mock fallbacks are displayed.
## BQ_ACTUAL_002 Decision Note

Date: 2026-06-30

SMT demo remains `GO WITH CAVEATS`. Actual BigQuery activation is blocked because Vercel Preview env vars are missing. Cline parallel QA is pending (`cline_parallel_qa_pending`). Use demo/prototype framing only.
