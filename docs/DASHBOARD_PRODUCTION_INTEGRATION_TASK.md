# DASHBOARD PRODUCTION INTEGRATION — EXECUTION TASK

The BigQuery production backend and durable GCS recovery are COMPLETE and FROZEN.

Proceed with DASHBOARD PRODUCTION INTEGRATION only.

## NON-NEGOTIABLE BOUNDARY

DO NOT modify:

- BigQuery tables
- BigQuery views
- BigQuery schemas
- BigQuery release pipeline
- CombinedSummary business logic
- KoBo pipeline
- GCS backup architecture
- GCP IAM
- OAuth credentials

Do NOT run the BigQuery recovery/release pipeline.

Do NOT start another backend architecture audit.

Preserve all pre-existing workspace changes.

Do not use:
- git reset --hard
- git clean -fd
- checkout/restore that discards user work
- force push

============================================================
FROZEN BIGQUERY CONTRACT
============================================================

GCP project:
unfpadatabase

Reporting dataset:
unfpadatabase

Location:
asia-south1

Dashboard may consume ONLY these six stable views:

1. unfpadatabase.unfpadatabase.repeatdata
2. unfpadatabase.unfpadatabase.activity_summary
3. unfpadatabase.unfpadatabase.combined_activity_summary
4. unfpadatabase.unfpadatabase.indicator_progress_summary
5. unfpadatabase.unfpadatabase.data_quality_summary
6. unfpadatabase.unfpadatabase.ip_submission_status

NEVER query:

- participants_flat
- activity_summary_flat
- participants_flat_staging
- any *_staging object
- any __gen_* object
- unfpa_mel_internal.*
- raw KoBo tables
- GCS snapshots

GCS is disaster recovery only and must never be queried by the dashboard.

============================================================
LOCKED BUSINESS RULE
============================================================

CombinedSummary is already calculated in BigQuery as:

ActivitySummary participant totals
+
ONLY reportable RepeatData participant contributions.

Do NOT reproduce or redesign this rule in dashboard code.

Do NOT row-join RepeatData and ActivitySummary.

Use combined_activity_summary as the authoritative published output.

============================================================
ACCEPTED PRODUCTION REFERENCE
============================================================

repeatdata:
51,794 rows

activity_summary:
2,592 rows

ACTIVE BigQuery backing tables:
expiration = NULL

All six stable views:
expiration = NULL

Durable GCS recovery:
PRODUCTION-READY

============================================================
1. WORKSPACE PRESERVATION
============================================================

Before changing code:

- print current directory
- git status --short
- git branch --show-current
- git log -1 --oneline

Identify pre-existing changes and preserve them.

Then proceed to implementation.

============================================================
2. INSPECT CURRENT DASHBOARD DATA ACCESS
============================================================

Inspect only the dashboard production integration surface:

- package.json
- Next.js configuration
- authentication configuration/middleware
- BigQuery server-side client
- dashboard API routes
- dashboard query/data services
- DATA_MODE handling
- environment validation
- filters
- production dashboard pages
- readiness/security tests

Search for:

participants_flat
activity_summary_flat
participants_flat_staging
__gen_
unfpa_mel_internal
mock fallback
DATA_MODE
BIGQUERY_
combined_activity_summary
indicator_progress_summary
data_quality_summary
ip_submission_status
repeatdata
activity_summary

Determine which components are:
- live BigQuery
- mock
- prototype
- hard-coded
- unsupported

Do not stop after inspection.

Implement the production integration.

============================================================
3. CENTRAL SIX-VIEW ALLOWLIST
============================================================

Create or update ONE centralized server-side BigQuery allowlist containing:

repeatdata
activity_summary
combined_activity_summary
indicator_progress_summary
data_quality_summary
ip_submission_status

No arbitrary table names supplied by browser/client input.

No unrestricted dynamic table access.

All BigQuery access must remain server-side.

============================================================
4. PRODUCTION ENVIRONMENT CONTRACT
============================================================

Use the existing environment/configuration system and normalize these values:

GOOGLE_CLOUD_PROJECT_ID=unfpadatabase
BIGQUERY_DATASET_ID=unfpadatabase
BIGQUERY_LOCATION=asia-south1
BIGQUERY_MAX_BYTES_BILLED=1000000000
DATA_MODE=bigquery

Do NOT commit credentials.

Do NOT add service-account JSON to the repo.

Do NOT expose credentials through NEXT_PUBLIC_*.

Preserve the existing approved dashboard runtime authentication identity.

IMPORTANT:
Do NOT replace the dashboard read-only identity with the BigQuery
pipeline/admin service account.

If the dashboard runtime identity lacks permission to read the six views,
do not modify IAM automatically.

Report the exact missing identity/permission as a blocker.

============================================================
5. PRODUCTION PAGES
============================================================

Review and integrate every production-accessible dashboard area:

- Executive Overview
- Activity Progress
- Participant & Reach
- Indicator Progress
- IP / Partner Performance
- Geographic Coverage
- GBV / OCMC Summary
- Data Quality & Evidence
- Management Decision Centre
- Activity Detail

For each card/chart/table/filter classify and implement as:

LIVE_BIGQUERY
DERIVED_FROM_LIVE_BIGQUERY
NOT_SUPPORTED
PRIVACY_BLOCKED

When DATA_MODE=bigquery there must be NO silent display of:

- mock figures
- synthetic figures
- hard-coded programme totals
- fake trends
- prototype constants
- fake AI insights

If a component cannot be supported from the frozen six-view contract,
disable/hide it cleanly.

Do not invent values.

============================================================
6. REPORTING DIMENSIONS
============================================================

Use these finalized dimensions where supported:

ip_name
report_date
reporting_year
report_quarter
project
outcome
output
activity
subactivity
activity_detail
subactivity_code
indicator
fund_code
event_type
start_date
end_date
province_name
district_name
palika_name

RepeatData may additionally support approved aggregate analysis using:

organization_position
sex_name
caste
combined_age
disability
participant_type_name
report_eligibility_status

Do not expose direct participant identifiers.

Do not expose participant-level rows in the browser.

RepeatData may only be used server-side to produce approved aggregate results.

============================================================
7. FILTERS
============================================================

Make production filters genuinely query live data.

Prioritize:

- Year
- Quarter
- Project
- Implementing Partner
- Province
- District
- Palika
- Outcome
- Output
- Activity
- Indicator

Every visible filter must either:

WORK with live data

or

be explicitly disabled.

No fake filtering.

Use parameterized BigQuery queries.

============================================================
8. QUERY SAFETY / COST
============================================================

Apply BIGQUERY_MAX_BYTES_BILLED to dashboard BigQuery jobs.

Prefer:

- aggregate views where possible
- selected columns, not SELECT *
- server-side filtering
- bounded result sets
- stable views only

Do not create new BigQuery objects.

Do not query raw/internal tables.

============================================================
9. BIGQUERY FAILURE BEHAVIOR
============================================================

When DATA_MODE=bigquery:

NEVER silently fall back to mock data.

Use clear safe states:

- Loading
- No data
- Unsupported
- Temporarily unavailable
- Authorization failure

Show:

Data source: BigQuery

when live.

Mock/development mode must be explicitly labelled:

Demo / mock data

============================================================
10. AUTHENTICATION / AUTHORIZATION
============================================================

Preserve existing:

- Google OAuth
- exact-email allowlist
- RBAC
- ADMIN behavior
- authorization before data access
- callbackUrl handling
- open redirect protection

Acceptance:

anonymous protected dashboard => blocked

anonymous dashboard API => 401

unauthorized BigQuery calls => 0

credentials in browser/client bundle => 0

============================================================
11. PRIVACY
============================================================

Preserve all privacy/suppression controls.

No direct participant identifiers.

No survivor-level records.

No raw participant export.

GBV / OCMC remains disabled unless the currently approved aggregate/privacy
contract explicitly supports it.

Availability of data does NOT automatically constitute privacy approval.

============================================================
12. HANDOFF DOCUMENT
============================================================

Create/update:

docs/BIGQUERY_TO_DASHBOARD_PRODUCTION_HANDOFF.md

Include:

Project:
unfpadatabase

Dataset:
unfpadatabase

Location:
asia-south1

Approved six views.

Document:

- view-to-API mapping
- view-to-dashboard mapping
- dimensions used
- filters
- privacy restrictions
- prohibited tables
- DATA_MODE behavior
- authentication model
- query-cost guard
- refresh dependency
- CombinedSummary frozen rule
- GCS backup is disaster-recovery only

============================================================
13. DEVELOPMENT TEST STRATEGY
============================================================

Do NOT repeatedly run the entire suite while editing.

Use targeted checks during implementation.

When implementation stabilizes, run ONE complete validation cycle using
scripts actually present in package.json.

Expected where available:

npm ci
npm run lint
npm run typecheck
npm test
npm run test:dashboard-readiness
npm run build

Do NOT run:

npm audit fix --force

Do not perform unrelated package upgrades.

============================================================
14. LIVE READ-ONLY BIGQUERY SMOKE
============================================================

If approved dashboard runtime credentials are already available,
perform READ-ONLY live smoke tests.

Confirm:

- project = unfpadatabase
- dataset = unfpadatabase
- location = asia-south1
- six stable views are reachable
- no raw/internal query occurs
- representative dashboard APIs return live results
- filters work
- BIGQUERY_MAX_BYTES_BILLED is enforced
- BigQuery mode does not fall back to mock

Do not modify BigQuery.

If runtime credentials are unavailable, report this as the :
ACTIVITY PROGRESS:
PARTICIPANT & REACH:
INDICATOR PROGRESS:
IP/PARTNER PERFORMANCE:
GEOGRAPHIC COVERAGE:
GBV/OCMC:
DATA QUALITY:
MANAGEMENT DECISION CENTRE:
ACTIVITY DETAIL:

YEAR FILTER:
QUARTER FILTER:
PROJECT FILTER:
IP FILTER:
PROVINCE FILTER:
DISTRICT FILTER:
PALIKA FILTER:

MOCK FALLBACK IN BIGQUERY MODE:
DATA SOURCE LABELLING:

GOOGLE OAUTH:
RBAC:
ANONYMOUS DASHBOARD ACCESS:
ANONYMOUS API ACCESS:
CREDENTIAL EXPOSURE:

BIGQUERY READ-ONLY SMOKE:
LIVE DATA:
QUERY COST GUARD:

LINT:
TYPECHECK:
TESTS:
DASHBOARD READINESS:
BUILD:

HANDOFF DOCUMENT:

BLOCKERS:
FILES CHANGED:

BIGQUERY MODIFIED:
NO

GCS MODIFIED:
NO

PRODUCTION DEPLOYED:
NO

FINAL STATUS:

Use exactly:

DASHBOARD PRODUCTION INTEGRATION READY FOR FINAL ACTIVATION

only if implementation, live-data integration, auth/privacy regression,
tests and build pass.

Otherwise report the smallest remaining blocker and stop there.

The BigQuery backend remains FROZEN.
