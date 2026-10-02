# Production UI completion - local owner review

Starting branch: main. Starting HEAD: c93e92768be592087d44a16ab4bbb407c0b36fe2 (documentation follow-up to production patch 4aa570f).
No push, deployment, tag, IAM change, credential change, warehouse mutation or production release was performed.

## Reconciliation record

| Page | Starting UI | Approved data available | Earlier usable component | Gap and implemented action |
|---|---|---|---|---|
| Executive | Prototype layout and disabled grids | Combined events, attendance, district/partner counts, sex | AggregateBars, production view, local-unit map from de3feb0 | Activate production-only view; project/partner volume, sex, district event map, management summary |
| Activity | KPIs plus disabled trend/delay/evidence panels | Combined activity/project/IP/district dimensions | AggregateBars, ChartCard | Parameterized grouped volume charts and activity attendance ranking; no planned/completed inference |
| Participant | Live profiles mixed with prototype fallback paths | Published aggregate demographics | Existing participant-metrics suppression and AggregateBars | Four demographic panels, total/reportable distinction, safe female share; no fallback arrays |
| Indicator | Disabled prototype achievement layout | Published activity-associated indicator volumes, no approved target registry | Existing pending view | One intentional pending state; no activity totals presented as achievement |
| Partner | Totals plus unsupported scoring panels | ip_submission_status totals; combined partner aggregates | AggregateBars | Partner event/attendance comparison and district/project footprint; no performance scores |
| Geography | Map plus unsupported coverage panels | Combined geographic dimensions and events | LocalUnitCoverageMap | Map colour uses district events; province/district rankings; 777 features unchanged |
| GBV/OCMC | Giant disabled layout | No approved activation contract | Existing production privacy state | One intentional no-data state; no survivor data or exports |
| Data Quality | Repeated disabled panels | Historical quality snapshots, no certified latest-snapshot formula | Existing disabled service | One pending calculation/evidence/validation section; no score or historical accumulation |
| Management | Disabled/empty and metadata warning | Same combined operational aggregates as overview | ManagementAttention and production view | Deterministic summary and reporting concentration, partner/geographic observations; direct server metadata |
| Activity Detail | Card wall/limited paired metrics | Combined period/project/IP/geography/activity aggregate dimensions | AggregateActivityTable; earlier ActivityDetailTable history | Sortable searchable paginated table and suppressed aggregate-only CSV |

History reviewed: 4aa570f, c93e927, de3feb0 production view, 01e7b4f/9c79d8a ActivityDetailTable. Prototype evidence/status columns were not restored. Existing demo pages remain behind explicit mock-mode dispatch; no production failures dispatch to them.

## Contract decisions

The frozen handoff and existing service identify combined_activity_summary as authoritative. The dashboard does not reconstruct it from activity_summary or repeatdata, and does not read raw participant records. New SQL uses only already-used fields: reporting_year1, report_quarter1, project1, ip_name, province1, district1, palika1, activity1, event_count, total_participants and total_reportable_participants. Partner footprint uses distinct project/district counts. No targets, hierarchy validation, timeliness, evidence or AI results are inferred.

INDICATOR LINKAGE VALIDATION REMAINS REQUIRED. The registry review records draft/unapproved indicator, target and activity crosswalks. No local catalogue or mapping status is promoted to production metadata.

Data Quality remains pending validated latest-snapshot logic. The proposal sums historical total_rows and records_with_quality_issue and is not a valid current snapshot calculation. The existing run_timestamp alone does not certify a complete snapshot key, partition or latest-run semantics. No score query is enabled.

Activity Detail groups by the eight published dimensions and provides Events, Participants and Reportable participants. It deliberately excludes personal records and granular demographic cross-tabs. Activity code/name is the published activity1 value; no separate name/code mapping is invented. All aggregate cells are suppressed server-side before browser serialization. CSV uses the identical filtered/searchable rows across all pages, explicit column allowlisting, quoting and formula neutralization. Over 10,000 groups fails closed and requires narrower global filters; no silently truncated export is allowed. KPI totals describe global filters; search narrows the table/export and shows its matching group count.

All seven filters are supported for combined-view pages, including Management. Partner status supports only IP/Partner. Indicator, Data Quality and GBV pending pages have no filter controls. Province/district/municipality options cascade from live dimension tuples. Navigation drops filters unsupported by the target route. Unsupported direct URL filters remain rejected by the server, never silently replaced with unfiltered totals.

The map uses district event counts, never participant points or municipality-level counts. Unmatched district names are explicitly disclosed. 777 boundary features are retained unchanged. Grey means unavailable/suppressed, not zero coverage.

Freshness is MAX(latest_sync_time) from the published IP status view. It is explicitly described as the latest partner sync, not proof that every partner is complete. The Management metadata warning is resolved by using the authenticated server data response directly instead of an unavailable prototype metadata fetch.

## QA scope and genuine external limitation

The local production configuration was checked without printing credentials. getBigQueryConfigStatus returned dataMode=bigquery, dataModeConfigurationValid=false, locationPresent=false, authMode=vercel-wif, configured=false. No alternate developer/pipeline identity was used. Therefore this patch has not been authenticated against current live BigQuery results; the numerical anchors 4,663 / 158,382 / 152,252 / 45 / 15 are not freshly certified and are not hard-coded.

The existing Next application browser suite exercises local routes and authentication/error behavior in explicit mock mode. A separate isolated webpack/React browser harness renders the actual production components with clearly labelled offline aggregates and cannot be reached from the production app. Its source is tests/ui-harness; outputs are ignored under .qa-production-ui. This harness tests all ten routes at 1440px and 390px, runtime errors, overflow, 777 map paths, suppressed cells, sorting, pagination, search, CSV content, horizontal table scrolling, geographic cascade and mobile navigation. These are component/contract checks, not live-data certification.

Owner review may proceed on the local code, screenshots and QA evidence. Authenticated live-data/filter/CSV verification remains required before production deployment approval.

## Final local QA results

- lint: PASS (0 errors; 11 pre-existing warnings, including the two pre-existing untracked scripts).
- typecheck: PASS.
- build: PASS, including server-only readiness manifest trace verification.
- npm test: PASS; suppression, query guards, six-view allowlist, auth, WIF, service filters, no-data/error states and pre-UAT guards.
- test:verify: PASS (27 checks plus offline production-readiness integration tests), run as part of npm test.
- test:browser: PASS (11 Next app tests plus the production component harness now included in that command).
- Desktop visual QA: PASS at 1440px, all ten production views inspected with offline aggregates.
- Mobile visual QA: PASS at 390px, all ten production views inspected with offline aggregates. Existing app route tests also covered 375, 768 and 1024px.
- Privacy/suppression and production fallback audit: PASS locally. No production page imports prototype data or disabled overlays; explicit mock-mode pages remain separate. No new production KPI constants.
- Authenticated live QA: BLOCKED by invalid existing local configuration. Not equivalent to a production-data pass.

Visual fixes verified on rerun: compact two-column mobile KPIs; corrected punctuation and sort icons; activity table internal horizontal scrolling; map legend and tooltip event terminology; Executive partner summary fills the former empty area. Screenshot artifacts and machine-readable results are in `.qa-production-ui/`. No page-level overflow or runtime errors were observed.

READY FOR OWNER REVIEW: YES, for the local patch. Deployment is not authorized.

## Files and working tree

Tracked diff (new files listed separately):

```text
 .gitignore                                         |   2 +
 eslint.config.mjs                                  |   3 +-
 package.json                                       |   2 +-
 scripts/test-production-v1.js                      |  38 +++-
 scripts/verify.js                                  |   4 +-
 src/app/dashboard/activity-detail/page.tsx         |  33 +--
 src/app/dashboard/activity-progress/page.tsx       | 178 +---------------
 src/app/dashboard/data-quality/page.tsx            | 148 +------------
 src/app/dashboard/executive-overview/page.tsx      | 232 +-------------------
 src/app/dashboard/gbv-ocmc-summary/page.tsx        | 145 +------------
 src/app/dashboard/geographic-coverage/page.tsx     | 205 +-----------------
 src/app/dashboard/indicator-progress/page.tsx      | 154 +-------------
 src/app/dashboard/ip-performance/page.tsx          | 167 +--------------
 .../dashboard/management-decision-centre/page.tsx  | 164 +-------------
 src/app/dashboard/participant-reach/page.tsx       | 235 +--------------------
 .../dashboard/aggregate-activity-table.tsx         |  63 +++---
 src/components/dashboard/aggregate-bars.tsx        |   2 +-
 src/components/dashboard/bigquery-route-view.tsx   |   4 +-
 .../dashboard/dashboard-filter-provider.tsx        |  26 ++-
 .../dashboard/local-unit-coverage-map.tsx          |  22 +-
 .../dashboard/production-dashboard-view.tsx        | 143 ++++---------
 src/components/layout/top-filter-bar.tsx           |  36 +---
 src/lib/csv-export.ts                              |   2 +-
 src/lib/dashboard-filters.ts                       |   2 +
 src/lib/server/dashboard-page-data-service.ts      |  68 ++++--
 25 files changed, 275 insertions(+), 1803 deletions(-)
```

New patch files:

- `docs/agentic_workflow/PRODUCTION_UI_COMPLETION_REVIEW.md`
- `scripts/test-production-ui.cjs`
- `src/app/dashboard/executive-overview/mock-page.tsx`
- `src/lib/aggregate-contract.ts`
- `tests/ui-harness/entry.tsx`
- `tests/ui-harness/loader.cjs`
- `tests/ui-harness/navigation.tsx`

Git status at review completion:

```text
 M .gitignore
 M eslint.config.mjs
 M package.json
 M scripts/test-production-v1.js
 M scripts/verify.js
 M src/app/dashboard/activity-detail/page.tsx
 M src/app/dashboard/activity-progress/page.tsx
 M src/app/dashboard/data-quality/page.tsx
 M src/app/dashboard/executive-overview/page.tsx
 M src/app/dashboard/gbv-ocmc-summary/page.tsx
 M src/app/dashboard/geographic-coverage/page.tsx
 M src/app/dashboard/indicator-progress/page.tsx
 M src/app/dashboard/ip-performance/page.tsx
 M src/app/dashboard/management-decision-centre/page.tsx
 M src/app/dashboard/participant-reach/page.tsx
 M src/components/dashboard/aggregate-activity-table.tsx
 M src/components/dashboard/aggregate-bars.tsx
 M src/components/dashboard/bigquery-route-view.tsx
 M src/components/dashboard/dashboard-filter-provider.tsx
 M src/components/dashboard/local-unit-coverage-map.tsx
 M src/components/dashboard/production-dashboard-view.tsx
 M src/components/layout/top-filter-bar.tsx
 M src/lib/csv-export.ts
 M src/lib/dashboard-filters.ts
 M src/lib/server/dashboard-page-data-service.ts
?? docs/agentic_workflow/PRODUCTION_UI_COMPLETION_REVIEW.md
?? lint_base.txt
?? lint_current.txt
?? scripts/test-production-ui.cjs
?? src/app/dashboard/executive-overview/mock-page.tsx
?? src/lib/aggregate-contract.ts
?? test_prod.js
?? test_prod2.js
?? tests/ui-harness/
```

The four original untracked files lint_base.txt, lint_current.txt, test_prod.js and test_prod2.js were not modified and are excluded from the review patch. All task edits are unstaged and uncommitted.
