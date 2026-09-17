# ANTIGRAVITY DASHBOARD UI/UX + LIVE UAT TASK

Continue from the CURRENT working tree.

Codex has already completed the core production dashboard integration.
Preserve all existing Codex changes. Do not redo the completed integration.

Read first:

- docs/DASHBOARD_PRODUCTION_INTEGRATION_TASK.md
- docs/BIGQUERY_TO_DASHBOARD_PRODUCTION_HANDOFF.md

## CURRENT ACCEPTED BASELINE

Already implemented:

- six-view BigQuery production integration
- Year filter
- Quarter filter
- Project filter
- IP filter
- Province filter
- District filter
- Palika filter
- no mock fallback in BigQuery mode
- explicit BigQuery data-source state
- Google OAuth preserved
- RBAC preserved
- anonymous dashboard blocked
- anonymous API returns 401
- query-cost guard = 1,000,000,000 bytes
- lint PASS
- typecheck PASS
- tests PASS
- dashboard readiness PASS
- build PASS

Production has NOT been deployed.

## FROZEN BACKEND

Do not modify BigQuery, KoBo, GCS, IAM or CombinedSummary logic.

Project:
unfpadatabase

Dataset:
unfpadatabase

Location:
asia-south1

Only approved dashboard views:

- repeatdata
- activity_summary
- combined_activity_summary
- indicator_progress_summary
- data_quality_summary
- ip_submission_status

Never query:

- participants_flat
- activity_summary_flat
- *_staging
- __gen_*
- unfpa_mel_internal.*
- raw KoBo objects
- GCS recovery objects

Known live anchors:

repeatdata = 51,794
activity_summary = 2,592

## TASK 1 — CANONICAL UI/UX REVIEW AND IMPLEMENTATION

Review all available UI references including:

- Figma_dashboard
- google stitch dashboard_v1
- google_stitich_dashboard_v2
- UNFPA Nepal MEL Dashboard Prototype
- unfpapalika
- docs/dashboard_qa
- docs/mel-review
- src/app/dashboard
- src/components/dashboard

The current Production-looking implementation is NOT automatically the visual
source of truth.

Compare the rendered application with the best canonical references and
ACTUALLY FIX meaningful UI/UX differences.

Do not stop after an audit.

Preserve the secure current Next.js architecture.

Target design:

- professional UNFPA Nepal MEL Intelligence Dashboard
- senior-management / donor-facing
- light content background
- navy/blue analytical/navigation system
- UNFPA orange used as accent
- consistent card system
- compact KPI hierarchy
- professional typography
- restrained shadows/borders
- strong information hierarchy
- accessible contrast
- responsive layout

Avoid:

- generic admin-template appearance
- oversized whitespace
- giant KPI cards
- excessive gradients
- excessive pie charts
- inconsistent page layouts
- fake AI content
- prototype placeholders

## TASK 2 — GLOBAL SHELL

Reconcile:

- collapsible sidebar
- active route state
- compact header
- global filters
- KPI row
- analytics grid
- management/evidence area where appropriate
- detail/table area
- footer with source, refresh and privacy information

Ensure all dashboard pages use one coherent visual system.

## TASK 3 — ROUTE-BY-ROUTE UI

Review/fix:

1. Executive Overview
2. Activity Progress
3. Participant & Reach
4. Indicator Progress
5. IP / Partner Performance
6. Geographic Coverage
7. GBV / OCMC
8. Data Quality & Evidence
9. Management Decision Centre
10. Activity Detail

GBV / OCMC remains privacy blocked unless already explicitly approved.

Management Decision Centre remains NOT_SUPPORTED unless deterministic,
approved live-data insights exist.

Do not invent AI insights.

## TASK 4 — FILTER UX

Existing live filters:

- Year
- Quarter
- Project
- IP
- Province
- District
- Palika

Also use where currently supported:

- Outcome
- Output
- Activity
- Indicator
- Fund Code
- Event Type

Provide proper:

- active selections
- reset/clear
- loading state
- disabled state
- no-result state
- responsive mobile/tablet presentation

No fake filtering.

## TASK 5 — NEPAL MAP

PRESERVE the existing custom Nepal geographic implementation.

Do not replace it with Google Maps or another generic map.

Preserve/fix:

- geography context
- programme/activity density
- privacy-safe aggregation
- legend
- tooltip/hover
- selected geography
- responsive layout
- privacy indicator

Do not alter geographic source data unless a deterministic defect exists.

## TASK 6 — RENDERED RESPONSIVE QA

Actual rendered visual inspection is mandatory.

Validate all relevant routes at:

375px
768px
1024px
1440px

Check:

- navigation
- filters
- KPIs
- charts
- tables
- map
- typography
- spacing
- horizontal overflow
- loading
- no data
- errors
- disabled states
- privacy-blocked state
- keyboard focus

Do not declare PASS from source inspection alone.

Create/update:

docs/dashboard_qa/PRODUCTION_UIUX_RECONCILIATION.md

For every route record:

REFERENCE USED:
DIFFERENCES FOUND:
FIXES APPLIED:
RESPONSIVE STATUS:
LIVE-DATA STATUS:
PRIVACY STATUS:
REMAINING DIFFERENCE:

## TASK 7 — HOSTED WIF / BIGQUERY LIVE UAT

Do not use the pipeline/admin service-account JSON.

Use the existing Vercel Workload Identity Federation architecture.

Known runtime identity:

Project:
unfpadatabase

Project number:
710881309655

Service account:
vercel-mel-preview@unfpadatabase.iam.gserviceaccount.com

WIF pool:
vercel-dashboard

WIF provider:
unfpa-mel-preview

Expected equivalent runtime configuration:

DATA_MODE=bigquery
BIGQUERY_PROJECT_ID=unfpadatabase
BIGQUERY_DATASET_ID=unfpadatabase
BIGQUERY_LOCATION=asia-south1
BIGQUERY_MAX_BYTES_BILLED=1000000000
GCP_PROJECT_NUMBER=710881309655
GCP_SERVICE_ACCOUNT_EMAIL=vercel-mel-preview@unfpadatabase.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID=vercel-dashboard
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=unfpa-mel-preview

Use exact environment variable names required by current code.

Do not display secret values.
Do not create keys.
Do not modify IAM.

If the existing Vercel project/Preview environment is available, create at
most ONE fresh Preview deployment for validation.

Do NOT deploy Production.

Verify:

- Google OAuth
- authorized session
- anonymous dashboard blocked
- anonymous API = 401
- Vercel OIDC
- Google STS/WIF
- service-account impersonation
- BigQuery read-only access
- all six stable views
- no prohibited raw/internal queries
- BigQuery writes = 0
- query byte guard
- no mock fallback

## TASK 8 — LIVE FILTER VALIDATION

Verify against live hosted data:

- Year
- Quarter
- Project
- IP
- Province
- District
- Palika

and where exposed:

- Outcome
- Output
- Activity
- Indicator

Validate real options, selected values, cascading behavior, empty results and
no mock fallback.

## TASK 9 — FINAL VALIDATION

Do targeted checks while editing.

After implementation stabilizes, run ONE final complete validation cycle using
the actual package.json scripts:

- lint
- typecheck
- tests
- dashboard readiness
- build

Do not repeatedly rerun the full suite.

Do not run npm audit fix --force.

## AUTONOMY

Work autonomously through normal repository-local operations.

Do not stop merely to ask whether to continue from one task phase to the next.

Use sub-agents where useful.

Stop only for a genuine external blocker requiring human secret entry,
external access, IAM approval, or Production authorization.

Do NOT deploy Production.

## FINAL REPORT

Return:

REPOSITORY:
BRANCH:
HEAD:
PREVIOUS CODEX WORK PRESERVED:

CANONICAL UI REFERENCES FOUND:
PRIMARY UI REFERENCE:
SECONDARY UI REFERENCES:

UI/UX DIFFERENCES FOUND:
UI/UX FIXES APPLIED:

GLOBAL SHELL:
SIDEBAR:
HEADER:
FILTER BAR:
KPI SYSTEM:
CARD SYSTEM:
CHART SYSTEM:
TABLE SYSTEM:
NEPAL MAP:
FOOTER:

EXECUTIVE OVERVIEW UI:
ACTIVITY PROGRESS UI:
PARTICIPANT & REACH UI:
INDICATOR PROGRESS UI:
IP/PARTNER PERFORMANCE UI:
GEOGRAPHIC COVERAGE UI:
GBV/OCMC UI:
DATA QUALITY UI:
MANAGEMENT DECISION CENTRE UI:
ACTIVITY DETAIL UI:

375PX:
768PX:
1024PX:
1440PX:

WIF SERVICE ACCOUNT:
WIF AUTH:
VERCEL PREVIEW:
BIGQUERY READ-ONLY SMOKE:
SIX-VIEW ACCESS:
REPEATDATA LIVE COUNT:
ACTIVITYSUMMARY LIVE COUNT:
PROHIBITED TABLE QUERIES:
BIGQUERY WRITES:

YEAR FILTER LIVE:
QUARTER FILTER LIVE:
PROJECT FILTER LIVE:
IP FILTER LIVE:
PROVINCE FILTER LIVE:
DISTRICT FILTER LIVE:
PALIKA FILTER LIVE:

MOCK FALLBACK:
DATA SOURCE LABELLING:

GOOGLE OAUTH:
RBAC:
ANONYMOUS DASHBOARD:
ANONYMOUS API:
PRIVACY:
CLIENT SECRET SCAN:
QUERY COST GUARD:

LINT:
TYPECHECK:
TESTS:
DASHBOARD READINESS:
BUILD:

UI/UX RECONCILIATION DOCUMENT:
BIGQUERY HANDOFF DOCUMENT:

FILES CHANGED:
REMAINING BLOCKERS:

BIGQUERY MODIFIED:
NO

GCS MODIFIED:
NO

IAM MODIFIED:
NO

PRODUCTION DEPLOYED:
NO

FINAL STATUS:

Use exactly:

DASHBOARD UI/UX + LIVE BIGQUERY UAT READY FOR FINAL PRODUCTION ACTIVATION

only if rendered UI/UX QA, responsive QA, WIF, six-view live BigQuery access,
filters, OAuth/RBAC, privacy and final validation all pass.

Otherwise report only the smallest remaining blockers.

Do not reopen the frozen BigQuery backend.
