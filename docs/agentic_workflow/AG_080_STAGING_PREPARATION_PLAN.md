# AG-080 Staging Preparation Plan

Date: 2026-07-04

Status: Planning only. No staging deployment performed.

## Objective

Prepare a safe staging-readiness plan for the UNFPA MEL AI Dashboard without performing deployment, credential work, BigQuery live connection, connector enablement, refresh, production migration, external API calls, or source-code cleanup.

Protected map files were not modified.

## Current Readiness Status

| Area | Readiness status | Notes |
|---|---|---|
| Build | Previously passed, not reproduced in this checkout | Current `npm run build` failed before compilation because `next` was not resolved locally. Treat as a local dependency/environment caveat before staging. |
| `test:verify` | Passed | Current run passed 19 local suppression and service-wiring checks. It confirmed no BigQuery calls, live routes, refresh scripts, credentials, or `.env` reads. |
| Lint | Previously passed, not reproduced in this checkout | Current `npm run lint` failed before lint because `next` was not resolved locally. Treat as a local dependency/environment caveat before staging. |
| Privacy/suppression | Ready for staging planning with sign-off gate | Server/API suppression wiring exists; GBV/OCMC remains blocked for live activation pending privacy sign-off and final suppression QA. |
| Decision support | Accepted with caveats | Decision-support review was accepted; management-decision content remains illustrative where registry/workplan linkage is not final. |
| LLM/security | Accepted | LLM security, governance, and prompt-safety audit accepted; no LLM API call is authorized by this plan. |
| MCP/connector hardening | Accept with minor coverage caveat | AG-070/071 was targeted, not exhaustive, and found no connector or MCP workflow activation. |

## Staging Prerequisites

| Prerequisite | Required decision or evidence |
|---|---|
| Manager approval | Required before any staging environment setup, preview deployment, BigQuery validation, or cleanup coding. |
| Environment variables | Required only through authorized deployment channels. Names already visible in source/docs include `DASHBOARD_DATA_MODE`, `DATA_MODE`, `BIGQUERY_PROJECT_ID`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT_ID`, `BIGQUERY_DATASET`, `BIGQUERY_DATASET_ID`, `BIGQUERY_LOCATION`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY_BASE64`, `GOOGLE_PRIVATE_KEY`, `BIGQUERY_MAX_BYTES_BILLED`, and `BIGQUERY_CACHE_TTL_SECONDS`. Values must not be exposed in docs or chat. |
| BigQuery access approval | Required before any read-only live validation. Access should be aggregate-only and privacy-approved. |
| Vercel/project access approval | Required before any preview deployment or hosted route QA. |
| Privacy/safeguarding sign-off | Required before any staging validation involving real or sensitive programme data, especially GBV/OCMC. |
| Rollback owner | Required before preview deployment. Must be named by management or technical lead. |
| Validation owner | Required before preview deployment. Must own route smoke testing, privacy/suppression QA, and go/no-go evidence. |

## Staging Risk Register

| Risk | Severity | Staging impact | Proposed mitigation |
|---|---|---|---|
| `next.config.js` contains obsolete `experimental.appDir` | Medium | Non-blocking warning can obscure real build warnings. | Approve pre-staging cleanup to remove obsolete key, then rerun build/lint. |
| `Copy Narrative Draft` button appears placeholder-like | Medium | User-facing staging review may interpret it as broken functionality. | Either implement clipboard behavior or clearly disable/label the control before staging. |
| `npm audit` vulnerabilities | Medium | Security review may block staging if undocumented. | Document findings for security review; do not run `npm audit fix --force`. |
| In-memory `Map` cache is not durable across restarts | Low/Medium | Preview/serverless restarts can lose cache and increase query frequency. | Keep TTL conservative; document behavior; consider durable cache only after approval. |
| Local dependency resolution currently missing `next` | High | Current checkout could not reproduce build/lint. | Restore/install dependencies only with approved setup command, then rerun build/lint before staging. |
| Connector gating risk | High | Accidental Google/MCP connector activation would exceed staging scope. | Keep connectors disabled unless separately approved; document no connector workflow activation. |
| BigQuery gating risk | High | Live read validation requires approved credentials, aggregate-only access, and privacy controls. | Require separate manager, data-owner, and privacy approval before any live read. |
| Vercel gating risk | High | Unauthorized preview deployment or env configuration could expose incomplete controls. | Use authorized project access only after manager approval and rollback owner assignment. |
| Privacy/suppression sign-off risk | High | GBV/OCMC or small-cell exposure would block staging acceptance. | Keep GBV/OCMC live activation blocked; run privacy/suppression QA after authorized preview deployment. |

## Safe Pre-Staging Coding Backlog

Proposed only. Do not implement unless explicitly approved.

| Backlog item | Rationale | Constraint |
|---|---|---|
| Remove obsolete `experimental.appDir` from `next.config.js` | Removes known non-blocking Next.js warning. | No dependency changes. |
| Implement `Copy Narrative Draft` clipboard behavior or clearly disable/label it | Avoids placeholder interaction in staging review. | Keep behavior local; do not call external APIs. |
| Document `npm audit` vulnerabilities for security review | Gives manager/security owner a clear decision point. | Do not run `npm audit fix --force`. |
| Preserve protected map files | Map is explicitly out of scope. | Do not edit `src/components/GeographicCoverageMap.tsx` or `src/data/geo/nepal-map-base.ts`. |
| Do not introduce new dependencies | Keeps staging delta small and auditable. | Use existing framework/components only if cleanup is approved. |

## Recommended Staging Sequence

1. Re-establish local dependency completeness through approved setup only if needed.
2. Run local `npm run build`, `npm run test:verify`, and `npm run lint`.
3. Obtain manager approval for staging preparation.
4. Configure authorized environment variables through the approved Vercel/project channel only.
5. Confirm rollback owner and validation owner.
6. Perform authorized Vercel Preview deployment only after approval.
7. Run hosted route smoke testing for dashboard routes and API routes.
8. Run privacy/suppression QA, including confirmation that GBV/OCMC remains blocked unless separately approved.
9. Perform BigQuery read-only validation only if separately approved by manager, data owner, and privacy/safeguarding owner.
10. Confirm rollback plan and rollback trigger criteria.
11. Prepare final manager go/no-go note.

## Manager Decisions Required

| Decision | Required before |
|---|---|
| Approve pre-staging cleanup coding | Any source-code cleanup starts. |
| Approve staging environment setup | Any environment variable configuration or staging project setup. |
| Approve BigQuery live validation | Any read-only BigQuery validation or hosted BigQuery route QA. |
| Approve Vercel preview deployment | Any preview deployment command or Vercel deployment action. |
| Approve security review of npm audit findings | Any vulnerability disposition or dependency remediation. |

## Explicit Non-Actions In AG-080

- No staging deployment performed.
- No production deployment performed.
- No Vercel deploy command run.
- No Google connector enabled.
- No MCP connector workflow activated.
- No BigQuery live call run.
- No refresh script run.
- No LLM API call run.
- No `.env` file read or edited.
- No credential, secret, token, or service account file read or edited.
- No destructive git command run.
- No `npm audit fix --force` run.
- No protected map file modified.
- No custom Nepal SVG map replaced.
- No Google Maps or external map dependency introduced.

## Command Evidence From This Planning Pass

| Command | Result |
|---|---|
| `npm run test:verify` | Passed, 19 checks. |
| `npm run lint` | Failed before lint because `next` was not resolved locally. |
| `npm run build` | Failed before build because `next` was not resolved locally. |

The staging plan therefore recommends resolving local dependency completeness before any deployment approval is exercised.

## Recommended Manager Decision

Approve AG-080 as a planning artifact only. Do not start staging deployment or AG-081 yet. First decide whether to authorize the narrow pre-staging cleanup backlog and dependency completeness check, then rerun build, lint, and `test:verify` before any preview deployment.
