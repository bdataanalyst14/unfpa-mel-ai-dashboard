# AG-088 Corrected Staging Smoke Test Report

## Status

Failed.

Access through the manager-provided share method succeeded and no Vercel login/SSO wall was observed on the direct dashboard content routes tested. The AG-083 smoke test still cannot be marked passed because browser-level visual checks, screenshots, console/runtime-error inspection, navigation interaction, and responsive checks were not completed in this run.

## Access

Access method: Vercel Shareable Link used; token redacted.

The share token was used only for runtime access. The full share URL and token were not written to repository files.

## Route Results

| Route | Result | Evidence note |
|---|---|---|
| `/` | Redirect observed | Root route redirects toward dashboard entry; no Vercel login wall recorded in redacted runtime check. |
| `/dashboard` | Redirect observed | Dashboard route redirects toward the configured dashboard page; no Vercel login wall recorded in redacted runtime check. |
| `/dashboard/executive-overview` | HTTP 200 | Dashboard content detected; privacy/data-source language detected. |
| `/dashboard/activity-progress` | HTTP 200 | Dashboard content detected. |
| `/dashboard/indicator-progress` | HTTP 200 | Dashboard content detected. |
| `/dashboard/participant-reach` | HTTP 200 | Dashboard content detected. |
| `/dashboard/data-quality` | HTTP 200 | Dashboard content detected. |
| `/dashboard/gbv-ocmc-summary` | HTTP 200 | Dashboard content detected; privacy/suppression language detected. |
| `/dashboard/ip-performance` | HTTP 200 | Dashboard content detected. |
| `/dashboard/activity-detail` | HTTP 200 | Dashboard content detected. |
| `/dashboard/management-decision-centre` | HTTP 200 | Dashboard content detected; advisory/privacy language detected. |
| `/dashboard/geographic-coverage` | HTTP 200 | Dashboard content detected; map page payload returned. |

## API Results

| Route | Result | Evidence note |
|---|---|---|
| `/api/dashboard/executive-overview` | HTTP 200 | JSON-like response observed. BigQuery live validation was not performed. |
| `/api/dashboard/page-data` | HTTP 200 | JSON-like response observed. BigQuery live validation was not performed. |

## Findings

Critical:

- None confirmed from the redacted HTTP smoke checks.

Major:

- AG-083 cannot be marked passed from this run because browser-level visual inspection, screenshots, console/runtime-error review, interactive navigation checks, Copy Narrative Draft behavior, and responsive checks were not completed.

Minor:

- Root and `/dashboard` routes were observed as redirects rather than terminal content routes during HTTP checks. This is expected for the current routing pattern but should be confirmed in browser QA.

## Safety Confirmation

- Source code was not changed.
- Protected map files were not touched.
- No Vercel commands were run.
- No deployment or production action occurred.
- No `.env`, credentials, cookies, Vercel tokens, bypass secrets, service account files, or environment variables were accessed.
- Logs, environment variables, browser cookies, and transcripts were not searched for tokens.
- The full share link and `_vercel_share` token were not saved in repository files.

## Recommendation

Request a browser-based AG-083 rerun using the approved access method. Do not approve production readiness or AG-090 until the full visual and interactive smoke-test checklist passes with evidence.
