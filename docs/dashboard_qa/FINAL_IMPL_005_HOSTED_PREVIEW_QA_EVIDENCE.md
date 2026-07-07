# FINAL_IMPL_005_HOSTED_PREVIEW_QA_EVIDENCE

Generated: 2026-07-03 05:28:56 +05:45

Preview URL: https://unfpa-mel-ai-dashboard-clean-8hwx8a0m3-bdataanalyst14s-projects.vercel.app
Production alias: https://unfpa-mel-ai-dashboard-clean.vercel.app

## Vercel Inspection
Deployment ID: dpl_B6EUwMTC5einSTASeRcax6dqNeGk
Deployment target: production
Deployment status: Ready
Deployment URL: https://unfpa-mel-ai-dashboard-clean-8hwx8a0m3-bdataanalyst14s-projects.vercel.app
Aliases:
- https://unfpa-mel-ai-dashboard-clean.vercel.app
- https://unfpa-mel-ai-dashboard-clean-bdataanalyst14s-projects.vercel.app
Production alias points to this deployment: yes, per npx vercel inspect dpl_B6EUwMTC5einSTASeRcax6dqNeGk aliases.
Production release-control review required. Production remains blocked.
## Hosted Curl Checks
Finite curl.exe checks used -i -L --max-time 20 and completed without timeout.

/api/dashboard/page-data?route=activity-progress: final HTTP 200 after 302/307 redirects; content-type text/html; charset=utf-8; text/html; Vercel Login/protection HTML with X-Matched-Path: /login and initial redirect to vercel.com/sso-api; completed.
/: final HTTP 200 after 302/307 redirects; content-type text/html; charset=utf-8; text/html; Vercel Login/protection HTML with X-Matched-Path: /login and initial redirect to vercel.com/sso-api; completed.
/dashboard: final HTTP 200 after 302/307 redirects; content-type text/html; charset=utf-8; text/html; Vercel Login/protection HTML with X-Matched-Path: /login and initial redirect to vercel.com/sso-api; completed.
/dashboard/activity-detail: final HTTP 200 after 302/307 redirects; content-type text/html; charset=utf-8; text/html; Vercel Login/protection HTML with X-Matched-Path: /login and initial redirect to vercel.com/sso-api; completed.
/dashboard/participant-reach: final HTTP 200 after 302/307 redirects; content-type text/html; charset=utf-8; text/html; Vercel Login/protection HTML with X-Matched-Path: /login and initial redirect to vercel.com/sso-api; completed.

Hosted API QA = failed/not verified.
BigQuery JSON not verified.
Required metadata not verified: filtersApplied, unsupportedFilters, fieldNotInSource, totalRowsAvailable, filteredRows, displayedRows, freshness, suppression.

Hosted Browser QA = failed/not verified.
UI checks not verified: filters, CSV export, Participant Reach age caveat, evidence/status wording, unsafe labels, console/network errors.
## Result
Hosted API QA: failed/not verified.
Hosted Browser QA: failed/not verified.
Production remains blocked.

