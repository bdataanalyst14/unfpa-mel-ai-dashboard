# Independent Codex UI/UX acceptance — 28 October 2026

> **Superseded on 29 October 2026.** Disclosure acceptance and release decisions in this historical report are withdrawn. See [PR11_FINAL_DISCLOSURE_ACCEPTANCE.md](PR11_FINAL_DISCLOSURE_ACCEPTANCE.md) for the corrected policy, tested revision, evidence and remaining risks. Historical test results and hashes below retain their original scope; they do not certify the revised code or Production UAT.

Baseline: `41bba0cbc63485b4f81a2d1ea911ca0279eff48d`.
Release branch: `release/ui-ux-acceptance-2026-10-28`.
PR: #11 (`https://github.com/bdataanalyst14/unfpa-mel-ai-dashboard/pull/11`).

**Decision: GO for PR #11 review and approval; NO-GO for direct production merge until the production UAT gates below are executed with live credentials.** No merge, manual deployment, production configuration change or additional live BigQuery query was performed.

## Recovery and scope

Before Git changes, 183 modified/untracked/generated evidence files were copied and SHA-256 verified in the local sibling directory `recovery-ui-ux-20261028-113928`. The backup also contains a binary working-tree patch, status/ref/worktree inventories and a verified complete Git bundle, including the existing stash. It is a local recovery artifact, not a PR attachment.

The original stash remains `3963498b3fdf1d0f0397ac6b1ff12d29e6aa6850`. Main remains at the baseline. The other registered worktrees were not edited. GitHub main was checked read-only and matched the baseline. No reset, clean, stash, discard or replay of historical patches was used.

## Final UI/UX review findings resolved

1. **Executive sex-profile population & reconciliation:**
   - **Population verification:** In BigQuery `combined_activity_summary`, published sex columns (`female`, `male`, `other`) disaggregate **Total attendance** across all reported activities (`SUM(female) + SUM(male) + SUM(other) = SUM(total_participants)`). Reportable attendance is tracked separately (`total_reportable_participants`).
   - **Misleading caption corrected:** Replaced conflicting subtitle (`Reportable attendance profile; total attendance also includes non-reportable records`) with clear, exact wording: `Total attendance by sex across reported activities. Reflects total attendance (reportable and non-reportable records); counts below five are withheld.`
   - **Synthetic fixtures reconciled:** In `tests/ui-harness/entry.tsx` and `dashboard-page-data-service.ts`, sex counts (Female 5,200 + Male 4,597 + Other <5 = 9,800) and demographic profiles now reconcile cleanly to Total Attendance (9,800), with Reportable Attendance (8,820) and Non-reportable Attendance (980) explicitly distinguished.
   - **Approved source definitions preserved:** No underlying BigQuery column names, SQL aggregations, or privacy suppression rules were altered.

2. **Locked Executive Overview hierarchy restored:**
   - Restored exact structural hierarchy from `docs/dashboard_qa/LOCKED_PRODUCTION_LAYOUT.md`:
     1. **Compact KPI cards:** Reported activities, Total participants (with secondary reportable note), Districts covered (with province count), Implementing partners.
     2. **Programme Progress region:** Activity / Event Type distribution and Implementation by Project using supported aggregates, accompanied by an intentional unavailable notice for periodic progress trends and workplan baseline targets.
     3. **Indicator Status region:** Structured fail-closed indicator panel with intentional unavailable state explaining that activity-to-indicator linkages and target registries remain in progress.
     4. **Geographic Coverage region:** Mini-map with district activity density across Nepal local units.
     5. **Participant profiles region:** Two-column grid of Participant Profile by Sex, Age Profile, Social Inclusion Profile, and Disability Profile.
     6. **Partner & Data Quality attention region:** Two-column grid of Top Implementing Partners ranking and Data Quality Attention (reporting completeness status + unavailable notice for automated DQ scorecards).
     7. **Management Decision Summary:** Deterministic portfolio observations (Partner Concentration, Geographic Focus, Portfolio Scale) with drillthrough to Management Decision Centre.

3. **Geographic Coverage desktop layout improved:**
   - **Side-by-side desktop view (`lg:grid-cols-12`):** Large Nepal Programme Coverage Map on the left (`lg:col-span-7 xl:col-span-8`) and interactive scrollable District Ranking on the right (`lg:col-span-5 xl:col-span-4`) with province summary.
   - **Paired geographic comparison matrices below:** Project by event-location district (`projectGeography`) and Partner by event-location district (`partnerGeography`) paired side-by-side, followed by paired summary footprint matrices (Project and Partner footprints) and District footprint.
   - **Responsive stacking:** Gracefully stacks vertically on mobile/tablet viewports (< 1024px) without horizontal scrolling or overflow.

4. **Technical category labels improved:**
   - Created clean user-facing label mapping in `src/lib/format-labels.ts` covering all demographic groups (`Hill Dalit`, `Terai Dalit`, `Hill Janajati`, `Terai Janajati`, `Madhesi`, `Muslim`, `Brahmin / Chhetri`, `Other Caste`, `With Disability`, `Without Disability`, `Below 15`, `15–19`, etc.) and sex categories (`Female`, `Male`, `Other Sex`).
   - Applied labels to demographic cards, legends, and tables without changing any BigQuery database field names.

## Exact source files reviewed

| File | Classification and accepted behavior |
|---|---|
| `src/lib/format-labels.ts` | NEW → APPROVE: user-facing title-cased labels for demographic categories, sex, matrices, and codes |
| `src/components/dashboard/production-dashboard-view.tsx` | FIX → APPROVE: restored 7-region locked Executive hierarchy, paired geographic matrices, reconciled captions |
| `src/components/dashboard/geographic-explorer.tsx` | FIX → APPROVE: large Nepal map left, interactive district ranking right, breadcrumbs, measures, responsive stacking |
| `src/lib/server/dashboard-page-data-service.ts` | FIX → APPROVE: reconciled Executive mock data with total/reportable participants and sex counts |
| `tests/ui-harness/entry.tsx` | FIX → APPROVE: reconciled synthetic demographic fixtures to 9,800 total attendance; clean user-facing labels |
| `src/components/dashboard/aggregate-bars.tsx` | APPROVE: measured 16px bars, linear scaling, formatted counts, complete scrollable rankings, no bar for withheld/unavailable values |
| `src/components/dashboard/aggregate-pie.tsx` | APPROVE: rendered 32px ring, published subtotal, blue analytical palette, matching legends, explicit partial denominator, preserved zero/private legends |
| `src/components/dashboard/reach-scatter.tsx` | APPROVE: rendered navy/orange points, exact counts and safe ratios in tooltip plus keyboard-accessible values table |
| `src/components/dashboard/analytical-matrix.tsx` | APPROVE: measure/ratio alignment and numeric sorting; dimension codes preserved; withheld values last; full dimension text available |
| `src/components/dashboard/chart-card.tsx` | APPROVE: flexible content area and consistent card styling |
| `src/components/dashboard/local-unit-coverage-map.tsx` | APPROVE: district selection, legend/caveats, single-string SVG titles and accessible interactive map group; boundary data unchanged |
| `src/components/layout/top-filter-bar.tsx` | APPROVE: supported filter policy preserved, compact styling and native keyboard controls |
| `src/components/dashboard/aggregate-activity-table.tsx` | APPROVE: usable mobile search width; year and other dimension strings preserved; measure formatting only |
| `src/components/GeographicCoverageMap.tsx` | APPROVE: isolated mock-map hydration and duplicate-key fixes only; geometry and mock metric definitions unchanged |
| `src/lib/server/activity-detail-query.ts` | APPROVE: exact operational submission-count sort preserved |
| `src/lib/server/activity-detail-service.ts` | APPROVE: explicit operational-count exception and participant suppression preserved |

## Actual independent verification

| Command | Final result | Actual evidence / limit |
|---|---|---|
| `npm run lint` | PASS, exit 0 | 0 errors, 13 existing warnings; scratch warnings not concealed |
| `npm run typecheck` | PASS, exit 0 | TypeScript no-emit check after production build |
| `npm test` | PASS, exit 0 | Security, configuration, auth, service, Activity Detail and analytical regressions; recorded-schema check explicitly SKIP because its snapshot is absent |
| `npm run test:browser` | PASS, exit 0 | 11 application tests passed (2.7m); 40 production-component route/viewport checks across 1440, 1024, 768, 375px passed with 0 runtime errors |
| `npm run build` | PASS, exit 0 | Next.js 16.4.3 webpack build, type validation and server-only readiness-manifest postbuild trace; mock/NONE configuration |
| `npm audit` | PASS, exit 0 | Final network-enabled registry audit: `found 0 vulnerabilities` |
| `git diff --check` | PASS | Reviewed index has no whitespace errors |

Sanitized reproducible summary and updated synthetic screenshots are in [ui-ux-acceptance-2026-10-28](ui-ux-acceptance-2026-10-28/acceptance.json). Full local component screenshots are generated under `.qa-production-ui/`.

Responsive coverage: application tests use 375×812, 768×1024, 1024×768 and 1440×900; the isolated production-component harness checks ten routes at all four widths (900px height), no page overflow, bounded table/ranking scrolling and 777 map features.

## Locked-layout reconciliation status

| Route | Locked reference / revised status | Result and evidence |
|---|---|---|
| Executive | RESOLVED: 7-region locked hierarchy restored | KPI cards → Programme Progress → Indicator Status → Geographic Coverage → Participant profiles → Partner & DQ attention → Management Decision Summary. Intentional unavailable states used for missing periodic targets/trends. |
| Geographic | RESOLVED: Large Nepal map left, district ranking right, paired matrices below | Side-by-side desktop layout (`lg:grid-cols-12`); paired Project x District and Partner x District matrices below; stacks cleanly on small screens. |
| Activity Progress | Published volume only; no target/evidence contract invented | Approved footprint/rankings/scatter retained; missing-region decision remains. |
| Participant & Reach | Approved population profiles/breakdowns used | Suppressed attendance counts; total/reportable breakdown retained. |
| Indicator | Single pending-linkage panel; correctly fail-closed | No fabricated progress/targets; layout acceptance remains. |
| IP / Partner | Ranking, reach, comparison matrix present | Submission and implementation bases disclosed; participant cells withheld. |
| GBV / OCMC | Safe blocked state retained | APPROVE; no survivor/service values displayed. |
| Data Quality | Completeness/latest-snapshot counts and limitations | Single latest snapshot only; no historical sum or invented scores. |
| Management | Deterministic advisory attention, scatter, matrices | Defensible aggregate portfolio observations; no generative flow. |
| Activity Detail | Search, columns, CSV export, pagination | Native grain, sort allowlist, mobile search width corrected. |

## Remaining production UAT gates

The following items cannot be validated offline and MUST be tested with real, authenticated Production credentials before deployment:

1. **Authorized Google OAuth & RBAC:**
   - Real sign-in via UNFPA Google Workspace domain.
   - Verification of deny-by-default behavior for unauthorized accounts.
   - Verification of session expiry, token renewal, and authorization guards on API endpoints (`/api/dashboard/page-data`, `/api/dashboard/activity-detail/export`).

2. **Separately authorized live BigQuery / WIF connectivity:**
   - Workload Identity Federation (WIF) authentication against Google Cloud from deployed environment.
   - Live query execution in `asia-south1` against dataset `unfpadatabase.unfpadatabase`.
   - Verification that live BigQuery queries conform to read-only limits (< 1,000,000,000 bytes billed).

3. **Current production data & 7-filter reconciliation:**
   - Reconcile current live aggregate sums, distinct counts, and native row counts against the latest upstream pipeline sync (do not assume historical 4,663 constant).
   - Verify filter cascading and cross-filtering across Year, Quarter, Project, Partner, Province, District, and Palika with real warehouse rows.

4. **Real CSV export downloads:**
   - Download full combined summary CSV (57-field allowlist) and visible-column CSV with active production filters.
   - Verify formula sanitization (`=`, `+`, `-`, `@` prefixes escaped), small-cell suppression (<5), and complete row delivery without truncation.

5. **Published freshness validation:**
   - Stakeholder acceptance of pipeline sync timestamps (`latest_sync_time`, `run_timestamp`) and latest activity dates.

6. **Human accessibility and disclosure review:**
   - Screen-reader testing and keyboard tab order verification with authorized users.
   - Explicit institutional disclosure-control decision on small-number differencing across arbitrary filter intersections.

Production release remains **NO-GO** until the above UAT gates are signed off by the project owner; PR #11 is **GO** for draft review and code approval.
