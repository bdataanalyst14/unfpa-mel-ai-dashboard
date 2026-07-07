# BQ_CONTENT_002 Final Activity Mapping Patch Report

Date: 2026-07-01

## Files Reviewed

- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/dashboard/activity-detail/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `src/app/api/dashboard/page-data/route.ts`
- Activity QA and final manager documentation under `docs/data_pipeline`, `docs/dashboard_qa`, and `docs/agentic_workflow`

## Files Changed

- `src/lib/server/dashboard-page-data-service.ts`
- `src/app/dashboard/activity-detail/page.tsx`
- `src/components/ActivityDetailTable.tsx`
- `src/app/dashboard/activity-progress/page.tsx`
- `docs/data_pipeline/BQ_CONTENT_001_FINAL_ACTIVITY_DATA_CONTENT_VALIDATION_REPORT.md`
- `docs/data_pipeline/BQ_CONTENT_002_LOCAL_PATCH_REVIEW.md`
- `docs/data_pipeline/BQ_CONTENT_002_TARGETED_CHECKS.md`
- `docs/data_pipeline/BQ_CONTENT_002_BUILD_HANG_DIAGNOSIS.md`
- `docs/data_pipeline/BQ_CONTENT_002_BUILD_RESULT.md`
- `docs/data_pipeline/BQ_CONTENT_002_LOCAL_ACTIVITY_QA.md`
- `docs/data_pipeline/BQ_CONTENT_002_PREVIEW_REDEPLOY_EVIDENCE.md`
- `docs/data_pipeline/BQ_CONTENT_002_HOSTED_ACTIVITY_QA.md`
- `docs/dashboard_qa/FINAL_DASHBOARD_PAGE_CAVEAT_MATRIX.md`
- `docs/dashboard_qa/FINAL_DASHBOARD_DEMO_SAFETY_REVIEW.md`
- `docs/agentic_workflow/FINAL_MANAGER_ACTION_PACK.md`
- `docs/agentic_workflow/FINAL_CROSS_AGENT_SMT_DEMO_CLOSEOUT_REPORT.md`

## Patch Review Result

- Activity Detail no longer imports or reads `src/data/mock/main-data.ts`.
- Activity Detail now consumes BigQuery route `activityRows` when `/api/dashboard/page-data?route=activity-detail` returns `dataSource: bigquery`.
- Activity Progress no longer displays hardcoded synthetic exception rows.
- Patched activity files no longer contain `ACT-2025`, `Sample activity log`, `synthetic ACT`, `Activity 1`, `Activity 2`, or `Activity 3` sample strings.
- Missing fields are safely caveated as `Not in source`, `Pending registry validation`, and pending final activity registry/programme validation.

## Targeted Checks Result

- `npm run test:verify`: passed, 19 checks.
- `npx tsc --noEmit --pretty false`: failed on local `tsconfig.tsbuildinfo` write permission and pre-existing `suppression.test.ts` test-runner globals.
- `npx tsc --noEmit --incremental false --pretty false`: failed only on pre-existing `suppression.test.ts` globals; no activity mapping patch type errors remained.

## Build Hang Diagnosis

The build hang was a local filesystem permissions issue on stale `.next` output, not a BigQuery call during static generation.

- Non-elevated `.next` cleanup failed with access denied.
- After elevated `.next` cleanup, non-elevated build failed immediately with `EPERM: mkdir '.next'`.
- Elevated build completed successfully.

## Build Result

- Local elevated `npm run build`: passed.
- Local rebuild with Preview env file present and BigQuery mode overrides: passed.
- Remote Vercel Preview build: passed.
- Production deployment: not run.
- `vercel --prod`: not run.

## Local Activity QA Result

Local page QA passed for:

- `/dashboard/activity-detail`
- `/dashboard/activity-progress`

Both returned HTTP 200, no runtime error, no `ACT-2025-*`, no generic `Activity 1/2/3`, no outdated demo subtitle, and visible pending registry/programme caveats.

Local API remained mock because `vercel env pull` created `.env.local` with names but empty local values. Hosted Preview QA is the authoritative BigQuery verification.

## Preview Redeploy Result

- Preview URL: `https://unfpa-mel-ai-dashboard-cod001-mg0zoirdp.vercel.app`
- Deployment ID: `dpl_CwrXvjfwVpKoyDZ53f3p74QxMty3`
- Status: Ready
- Build: passed
- Production avoided: yes

## Hosted Preview Activity QA Result

Protection bypass was used for QA only. The bypass secret was not printed or recorded.

| Route | HTTP | Result |
| --- | ---: | --- |
| `/api/dashboard/page-data?route=activity-detail` | 200 | JSON; `dataSource: bigquery`; no mock fallback; 250 activity rows; suppression metadata present |
| `/api/dashboard/page-data?route=activity-progress` | 200 | JSON; `dataSource: bigquery`; no mock fallback; suppression metadata present |
| `/dashboard/activity-detail` | 200 | Dashboard content beyond login; no runtime error; no `ACT-2025-*`; no exact generic `Activity 1/2/3`; no outdated demo subtitle |
| `/dashboard/activity-progress` | 200 | Dashboard content beyond login; no runtime error; no `ACT-2025-*`; no exact generic `Activity 1/2/3`; no outdated demo subtitle |

Exact hosted Activity Detail row checks:

- `ACT-2025-*` ID count: 0
- Exact generic `Activity 1/2/3` activity-name count: 0
- Exact generic `Activity 1/2/3` ID count: 0
- `Pending registry validation` count: 250
- `Not in source` evidence count: 250

## Remaining Blockers

- Final activity registry validation remains pending programme validation.
- Evidence/validation status fields are not present in the current BigQuery activity source and remain safely caveated.
- Local API BigQuery QA is blocked by empty local env values from `vercel env pull`; hosted Preview BigQuery QA passed.
- Production remains blocked until release approval.
- DP-004 clearance and GBV/OCMC live activation remain blocked until separate approvals.

## Reality Checker Result

BigQuery is connected and serving operational activity rows in hosted Preview. The prior visible synthetic rows were frontend mock/sample content and have been removed from Activity Detail and Activity Progress. The dashboard is ready for programme review of activity content and registry mapping, but it is not production-ready and does not have final activity registry validation, DP-004 clearance, GBV/OCMC live activation, donor-ready evidence, or programme sign-off.

## Final Decision

Activity Data Status: BIGQUERY-BACKED OPERATIONAL ACTIVITY DATA DISPLAYED
Data Source: BIGQUERY
Activity Mapping: UPDATED AND VERIFIED
Activity Registry Validation: PENDING PROGRAMME VALIDATION
Dashboard Mode: ACTUAL BIGQUERY-BACKED PREVIEW DASHBOARD
Hosted Preview: VERIFIED
Production: BLOCKED UNTIL RELEASE APPROVAL
Final Manager Status: ACTIVITY DISPLAY READY FOR PROGRAMME REVIEW
