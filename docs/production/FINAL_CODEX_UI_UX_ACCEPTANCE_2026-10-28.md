# Independent Codex UI/UX acceptance — 28 October 2026

Baseline: `41bba0cbc63485b4f81a2d1ea911ca0279eff48d`.
Release branch: `release/ui-ux-acceptance-2026-10-28`.

**Decision: GO for a draft review PR; NO-GO for production release until the UAT and layout decisions below are closed.** No merge, manual deployment, production configuration change or additional live BigQuery query was performed. This report supersedes conflicting acceptance claims in the local Antigravity refinement handoff.

## Recovery and scope

Before Git changes, 183 modified/untracked/generated evidence files were copied and SHA-256 verified in the local sibling directory `recovery-ui-ux-20261028-113928`. The backup also contains a binary working-tree patch, status/ref/worktree inventories and a verified complete Git bundle, including the existing stash. It is a local recovery artifact, not a PR attachment.

The original stash remains `3963498b3fdf1d0f0397ac6b1ff12d29e6aa6850`. Main remains at the baseline. The other registered worktrees were not edited. GitHub main was checked read-only and matched the baseline. No reset, clean, stash, discard or replay of historical patches was used.

The initial state had 20 modified tracked entries plus untracked handoff/evidence/scratch files. The October refinements overlap three of the six earlier source files; they are not a replacement for the earlier fixes.

## Exact source files reviewed

| File | Classification and accepted behavior |
|---|---|
| `src/components/dashboard/aggregate-bars.tsx` | APPROVE: measured 16px bars, linear scaling, formatted counts, complete scrollable rankings, no bar for withheld/unavailable values |
| `src/components/dashboard/aggregate-pie.tsx` | FIX → APPROVE: rendered 32px ring, published subtotal, blue analytical palette, matching legends, explicit partial denominator, preserved zero/private legends |
| `src/components/dashboard/reach-scatter.tsx` | FIX → APPROVE: rendered navy/orange points, exact counts and safe ratios in tooltip plus keyboard-accessible values table |
| `src/components/dashboard/analytical-matrix.tsx` | FIX → APPROVE: measure/ratio alignment and numeric sorting; dimension codes preserved; withheld values last; full dimension text available |
| `src/components/dashboard/chart-card.tsx` | APPROVE: flexible content area and consistent card styling |
| `src/components/dashboard/production-dashboard-view.tsx` | APPROVE within the layout exceptions below: four executive headline KPIs with secondary counts retained as context; deterministic management summary; existing fail-closed routes preserved |
| `src/components/dashboard/geographic-explorer.tsx` | FIX → APPROVE: breadcrumbs, measures, Back/Reset including municipality-only scope; mixed province codes/names resolve against validated filter options |
| `src/components/dashboard/local-unit-coverage-map.tsx` | FIX → APPROVE: district selection, legend/caveats, single-string SVG titles and accessible interactive map group; boundary data unchanged |
| `src/components/layout/top-filter-bar.tsx` | APPROVE: supported filter policy preserved, compact styling and native keyboard controls |
| `src/components/dashboard/aggregate-activity-table.tsx` | FIX → APPROVE: usable mobile search width; year and other dimension strings preserved; measure formatting only |
| `src/components/GeographicCoverageMap.tsx` | FIX → APPROVE: isolated mock-map hydration and duplicate-key fixes only; geometry and mock metric definitions unchanged |
| `src/lib/server/activity-detail-query.ts` | APPROVE/PRESERVE earlier exact operational submission-count sort |
| `src/lib/server/activity-detail-service.ts` | APPROVE/PRESERVE earlier explicit operational-count exception and participant suppression |
| `src/lib/server/dashboard-page-data-service.ts` | APPROVE/PRESERVE earlier KPI exposure, sub-activity-code grouping, geographic matrices and missing-DQ-snapshot handling |

The nine original refinement files are the first nine rows. The last three server files were SHA-256 checked against the recovery copy and remained byte-identical throughout this review.

Other changed files reviewed/prepared: `package.json`, `package-lock.json`, `next.config.js`, `playwright.config.ts`, `scripts/test-activity-detail.cjs`, `scripts/test-analytical-browser.cjs`, `scripts/test-final-analytical.cjs`, `scripts/test-production-ui.cjs`, `scripts/test-production-v1.js`, `tests/ui-harness/entry.tsx`, and the reusable `scripts/test-closing-live.cjs` verifier. The verifier was inspected, not executed.

Read-only boundary review also covered the aggregate registry, CSV route/serializer, suppression and management helpers, participant population/breakdown services, browser runner/specification, locked-layout/reconciliation documents, closing-review records and both UAT runners. Those UAT runners remain historical scratch material and are excluded from the release commits.

### Exact six earlier source files and fixes retained

1. `dashboard-page-data-service.ts`: expose Executive project/province and geographic reportable counts; include sub-activity code; add project/partner district matrices; preserve independently available completeness when the DQ snapshot is missing.
2. `activity-detail-service.ts`: publish operational `events`/`submission_count` exactly; retain participant masking.
3. `activity-detail-query.ts`: align submission-count sorting with that display contract.
4. `production-dashboard-view.tsx`: retain the above counts in executive context, hierarchy codes and geographic matrices.
5. `geographic-explorer.tsx`: retain municipality-only Back/Reset behavior.
6. `local-unit-coverage-map.tsx`: retain measure-aware captions and corrected suppression explanations.

The earlier server changes add validated groupings/queries but do not redefine `SUM(event_count)` or participant measures. Claiming that the entire diff contains no SQL changes would be incorrect.

## Defects independently discovered and resolved

- **Blank charts:** supplied before/after images showed nonzero legends without donut rings. Recharts used `react-is` 18.3.1 with React 19.2.8; its element detector returned false for a valid React element. A scoped override now uses 19.2.8; detector and actual SVG sectors/points pass. [Recharts installation guidance](https://github.com/recharts/recharts#installation) requires matching React and react-is versions.
- **Hydration:** initial application run had 7 passes/4 failures; a later run had 10 passes/1 hydration failure. Development diagnostics traced the mismatch to multiple SVG `<title>` children in the mock geographic map. Single-string titles and stable unique keys fix the failure without changing the asset. Production map titles received the same compatible serialization.
- **Numeric dimensions:** matrices converted `001` to `1`; Activity Detail displayed `2026` as `2,026`. Formatting now applies to measures. Ratio columns sort numerically, retain their percentage/decimal display, align right and keep withheld/unavailable rows last.
- **Donut edge states:** all-zero/all-private inputs previously discarded their legends. Zero and withheld categories remain visible without slices; a zero denominator yields no percentages. Percentages explicitly mean a share of publishable categories, not all attendance. The original handoff said 32px but used radii 54/84, a 30px difference; final radii are 52/84.
- **Keyboard access:** scatter ratios had been mouse-tooltip-only; a native disclosure/table supplies the same safe values. Interactive SVG maps use a group role rather than hiding controls behind an image role.
- **Province navigation:** the boundary asset contains both province codes and names. Name-only entries could skip province focus. Both forms now match existing validated options; no geographic association is guessed.
- **Mobile Activity Detail:** search shrank into a narrow strip at 375px. Its form now occupies a full mobile row; browser checks require a usable input width.
- **Dependencies:** initial audit found 13 vulnerabilities (1 critical, 9 high, 3 moderate). Next/ESLint Next were moved to 16.4.3, with compatible patched PostCSS, sharp, Zod and affected transitive packages. No forced audit downgrade or OAuth/WIF policy edit was used. [The reviewed Next.js advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36) independently confirms the old version's Windows-server exposure. Final online audit is required in the verification table below.
- **Evidence integrity:** Playwright now writes under `test-results/browser`, preserving other evidence directories. The pre-existing 28 October closing record was restored hash-exact from recovery after the original runner cleared its parent directory. The analytical test now explicitly reports a missing recorded-schema check as SKIP, rather than printing an unconditional schema PASS. The Next dev server's generated AGENTS addition was removed; `agentRules: false` prevents recurrence, and the original guide is unchanged.

## Privacy, formulas and evidence limits

**APPROVE within the existing primary suppression contract.** Withheld counts produce no bar, donut slice, scatter point or inferred ratio; they remain `<5` in legends/tables/CSV. Tests cover zero denominators, withheld operands, code preservation, parameterization, authorization-before-reads and formula-safe CSV cells. A comprehensive defense against arbitrary cross-filter differencing is not established by these tests.

Reported activities remain `COALESCE(SUM(event_count), 0)`. The historical value 4,663 is not a new UI constant, unique physical-event count or unique-person count. It happens to equal the recorded native row count; that coincidence must not redefine the KPI. Attendance remains attendance. Management observations use the existing concentration/ratio helpers and do not claim effectiveness or target achievement. “Active projects” was corrected to “reported projects.”

OAuth/RBAC guards, BigQuery client/WIF policy, proxy, protected geographic data and map asset have no diff from baseline. Indicator Progress and GBV/OCMC retain unavailable/fail-closed presentation; no service/survivor analytics were enabled.

The existing closing evidence at `test-results/closing-review/live.json` was captured `2026-10-28T05:21:49.735Z` and records 40 queries, 61 source/57 approved fields, 4,663 native/full-export rows and 15 partners. Its verifier uses the read-only query guard, `asia-south1` and a 1,000,000,000-byte per-query limit. This is a reviewed prior-run artifact, not a new independent warehouse verification. The portable document copy is older, dated 7 October. The detailed analytical schema/reconciliation snapshots from the earlier review were already absent at this audit's start; their old PASS claims are not promoted to fresh acceptance.

No additional live BigQuery query was authorized or executed. A local build uses mock/NONE readiness configuration and does not prove production WIF or real OAuth login.

## Actual independent verification

| Command | Final result | Actual evidence / limit |
|---|---|---|
| `npm run lint` | PASS, exit 0 | 0 errors, 13 existing warnings; scratch warnings were not concealed |
| `npm run typecheck` | PASS, exit 0 | TypeScript no-emit check after the final production build |
| `npm test` | PASS, exit 0 | Security, configuration, auth, service, Activity Detail and analytical regressions; recorded-schema check explicitly SKIP because its snapshot is absent |
| `npm run test:browser` | PASS, exit 0 | 11 application tests passed (2.7m); then 40 production-component route/viewport checks and all new chart/matrix/navigation assertions passed |
| `npm run build` | PASS, exit 0 | Next.js 16.4.3 webpack build, type validation and server-only readiness-manifest postbuild trace; mock/NONE configuration |
| `npm audit` | PASS, exit 0 | Final network-enabled registry audit: `found 0 vulnerabilities`; contradictory earlier cache-only zero results were not used as security clearance |
| `git diff --cached --check` | PASS | Reviewed code index has no whitespace errors |

Sanitized reproducible summary and selected synthetic screenshots are in [ui-ux-acceptance-2026-10-28](ui-ux-acceptance-2026-10-28/acceptance.json). Full local component screenshots are generated under `.qa-production-ui/`; the application completion marker is `test-results/browser/.last-run.json`. Raw traces/session material remain excluded.

Initial failures are retained in this report rather than hidden by reruns. One intermediate `npm test` run overlapped a build and failed because preflight requires `.next/BUILD_ID` while the build was regenerating it. Running tests after the build resolves that sequencing issue; no production activation was performed (activation tests use disposable fixtures).

Responsive coverage: application tests use 375×812, 768×1024, 1024×768 and 1440×900; the isolated production-component harness checks ten routes at all four widths (900px height), no page overflow, bounded table/ranking scrolling and 777 map features. Fixtures are explicitly marked OFFLINE and are not application fallback data. The harness CSV endpoint is a fixture; its download PASS does not establish authenticated production CSV correctness.

Visual inspection included supplied before/after Executive screenshots and independent Executive, Activity Progress, Participant Reach, IP, geography, management, DQ, Activity Detail, Indicator and GBV images across the requested widths, plus chart edge cases. Automated keyboard checks cover native sorting, chart-value disclosure, map focus/Back/Reset and existing application navigation/focus behavior. A manual screen-reader and full contrast audit remain outside this verification.

## Locked-layout reconciliation

Reference: `docs/dashboard_qa/LOCKED_PRODUCTION_LAYOUT.md`. The retained navy shell, light canvas, compact KPIs/filters, blue analytics, orange accent, management observations and source/privacy footer follow its visual language. Four Executive headline cards are acceptable; the locked text does not actually prescribe an exact card count.

**REJECT the handoff's claim of complete locked-layout compliance.** Several deviations already exist in the committed baseline and are not new backend work to recreate in this review:

| Route | Locked reference / current difference | Data basis, responsive/privacy result and remaining gap |
|---|---|---|
| Executive | Programme Progress, Indicator Status and DQ/evidence attention regions are not retained as distinct regions | Aggregate footprint/profiles/rankings and advisory summary render; secondary counts retained. Unsupported metrics were not invented. Obtain layout acceptance or separately restore intentional unavailable regions. |
| Geographic | Map and rankings stack inside a panel; matrices stack rather than matching the prescribed large-left-map/right-ranking and paired bottom layout | District event scope and suppression retained; all four widths fit. Obtain layout acceptance or separately arrange the existing regions. |
| Activity Progress | Hierarchy/rankings/scatter replace locked monthly-trend and delayed/evidence regions | Published volume only; no target/evidence contract invented. Missing-region decision remains. |
| Participant & Reach | Approved population profiles/breakdowns are used; organization/position and inclusion-geography regions are absent | Counts remain suppressed attendance, not unique people. Missing-region decision remains. |
| Indicator | A single pending-linkage panel replaces the fuller locked unavailable structure | Correctly fail-closed at every width; no target/status fabrication. Layout acceptance remains. |
| IP / Partner | Ranking/reach/matrix present; evidence/DQ score/follow-up regions absent | Submission and implementation bases disclosed; participant cells withheld. Missing-region decision remains. |
| GBV / OCMC | Safe blocked state retained | APPROVE; no survivor/service values displayed. |
| Data Quality | Completeness/latest-snapshot counts and limitations replace evidence/trend/check/correction regions | No invented score or historical snapshot sum. Missing-region decision remains. |
| Management | Deterministic advisory attention, scatter, matrices and reliability retained | APPROVE for defensible aggregate observations; no generative/automatic decision flow. |
| Activity Detail | Aggregate search/columns/export/pagination retained; mobile search/year formatting corrected | APPROVE locally; real filtered CSV and authorization remain UAT gates. |

These exceptions block an unconditional design/production acceptance. They do not authorize fabricated metrics or a repeat of completed dashboard implementation.

## Release contents and exclusions

Prepare separate commits: **(1) code/tests/dependency fixes**, including the six preserved files and verified refinement fixes; **(2) this sanitized acceptance report, summary and selected synthetic QA images**. A draft PR should state the remaining gates and must not be merged or promoted by this review.

Exclude `next-env.d.ts`, environment/credential files, raw warehouse data/metadata, browser traces/session material, build outputs, scratch scripts, lint dumps, historical patch files, original sign-in screenshots and unverified handoff reports. Existing unrelated modified audit documents and untracked recovery material remain local and are not silently discarded. Do not use `git add .`.

## Remaining production UAT gates

1. Owner decision on the locked-layout deviations above, or a separate narrowly scoped layout-only correction with explicit unavailable regions where required.
2. Authorized Google login, deny-by-default users/roles, session expiry and unauthorized API/CSV requests on the exact deployed commit.
3. Separately authorized read-only production BigQuery/WIF verification, current sums/native rows/schema and seven-filter reconciliation; no assumption that historical 4,663 must remain the current total.
4. Real full and visible-column CSV downloads: scope/search/hierarchy, 57-field allowlist, suppression, formula safety, complete rows and error responses.
5. Accept or resolve published freshness: recorded pipeline/DQ timestamps are 13 August and latest activity date 23 August. The UI does not repair upstream publication.
6. Human responsive/accessibility review with representative authorized production data and an explicit disclosure-control decision for arbitrary slicing.

Indicator linkage and the GBV aggregate contract remain separate data-approval gates. They must stay unavailable until approved. Production release remains **NO-GO**; reviewed code and sanitized offline evidence may proceed to draft PR review.
