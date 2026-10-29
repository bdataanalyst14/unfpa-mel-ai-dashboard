# PR #11 — Final Disclosure Acceptance

Date: 29 October 2026. [Existing PR #11](https://github.com/bdataanalyst14/unfpa-mel-ai-dashboard/pull/11), branch `release/ui-ux-acceptance-2026-10-28`.

**Decision: targeted fail-closed corrections ready for review. Production release remains NO-GO pending owner acceptance of the reduced publication policy and authorized Production UAT. This is bounded offline evidence, not complete disclosure-safety certification. No merge, deployment, authentication change or warehouse mutation was performed.**

## Revision and evidence identity

- Initial local revision and independently queried GitHub PR head both matched the expected `b04db3a47a86b0ad08fe98c9b22f27aad6650aac`; PR #11 was open on the expected branch.
- Final tested implementation: `8047bbf839b8801a7e139ea5e9b9df3b534bf09d` (`fix: fail closed on jointly unsafe participant disclosures`). All implementation and regression changes are in this commit. Tests executed against these exact file contents; committing them did not change the files.
- The following acceptance commit contains documentation and evidence only. Its own SHA cannot be embedded in its content. The final pushed PR head is checked against local `git rev-parse HEAD` after publication and recorded in the PR description and completion response. Compare that head with the tested implementation: only `docs/production/` paths may differ.
- [Machine-readable evidence](pr11-disclosure-2026-10-29/evidence.json) retains SHA-256 hashes for 29 implementation/test/contract files: expected-head Git blobs, tested Git blobs and tested worktree bytes. Both new screenshot hashes are retained. Existing historical screenshot hashes were preserved.
- Existing unrelated untracked work was left in place and excluded from these commits. The branch's existing `vercel.json` rule disables automatic deployments for this review branch; it was unchanged.

## Confirmed defects and correction

The original `[8,1,1]` case is reconstructable: exact total 10 minus visible 8 leaves 2; two positive counts each in 1–4 must both equal 1. The previous assertion that two or more withheld categories are inherently safe is false. Even `[5,1]`, total 6, can remain uniquely solvable when a complementary label implies the larger cell is at least five.

Local complementary suppression also cannot certify arbitrary combinations of district, partner, project and reporting-period queries. Independently acceptable tables may jointly provide equations that reveal a cell. This implementation does not maintain a global release ledger or a verified system of equations covering all historical releases.

The publication policy therefore fails closed: all person counts, related totals/subtotals and demographic categories use the same `Suppressed` representation, `value: null`, with no primary-cell bounds. Person percentages are withheld. Zero, small, large and missing person values produce the same publication marker, so the marker itself does not identify small cells. The approved primary threshold remains unchanged in `suppressCount`: positive 1–4 is `<5`; zero and five retain their prior primitive behavior. Primary primitives are not a compositional publication guarantee.

`applyComplementarySuppression` now removes all category values and bounds when any category is withheld; a single withheld category with an exact supplied margin throws rather than returning an unsafe result. This helper's bounded partition protection is separate from the stronger uniform publication functions used by every current server publication caller.

Operational activity/submission counts, reporting dimensions, filters, pagination, column choices, table structure, both CSV buttons and existing UI components remain. Person charts and ratios enter their existing withheld/unavailable states. This intentionally reduces published analytical information; restoring person measures requires a reviewed joint disclosure policy, not simply reverting this guard.

## Caller and output review

| Surface | Verified behavior |
|---|---|
| `suppression.ts` callers | Activity Detail, dashboard page service, participant metrics, participant analysis and GBV mock transport use publication guards. No production caller publishes primary-only results. `suppressRecord` has no application callers; its primary-only recursive behavior is not certified for joint outputs. |
| Complete partitions | Sex, disability and caste categories use uniform withheld values; person margins are also withheld. |
| Partial/overlapping partitions | Age bands, incomplete categories, repeat/reportable classifications and person breakdowns are withheld without assuming exhaustive or disjoint membership. |
| Row/column/grand totals | Activity and geographic/partner/project person totals, published sex/age/caste/disability totals, and disaggregation sums are withheld. Checks that could disclose relationships (`*_check`) are also withheld. |
| Subtotals and denominators | No person component reaches browser subtotal/percentage arithmetic. Operational-only published subtotals remain. GBV percentage transport also fails closed; live GBV remains disabled. |
| Cross-filter queries | Publication is independent of person magnitudes in every scope. Participant breakdown order is alphabetical; Activity Detail ordering ignores withheld measures/checks, including tie-breakers. Search remains limited to approved reporting dimensions. |
| Activity Detail JSON/table | All 57 approved fields retain their allowlist. Person measures and related checks are sanitized before publication; operational contributions remain available. Raw intermediate aggregates stay server-side. |
| Both CSV exports | Full and selected-column modes use the same sanitized service rows and existing formula protection. Actual export handlers were exercised with synthetic warehouse/auth responses, rather than only checking a CSV formatter. |
| Tooltips/accessibility | Safe person transport contains no raw values; suppressed GBV chart coordinates are zero placeholders, never original counts. Browser fixtures check serialized HTML, accessible DOM and absence of person pie/scatter geometry. Existing tooltip/keyboard-value tests also pass. |
| Other routes | The legacy overview refuses live BigQuery mode. Indicator/GBV activation guards and Google authentication were unchanged. Synthetic prototype data and UI harnesses are not evidence of live data safety. |

## Adversarial evidence and assumptions

`npm run test:disclosure` runs in `npm test` without adding a test framework. It exercises the actual TypeScript modules using the existing loader. The legacy `.test.ts` file was updated for consistency but is not claimed as an independently executed Jest suite.

1. Enumerates all nonnegative integer assignments for fixed exact totals in `[8,1,1]`, `[5,1]`, `[0,1,1]`, `[8,4,4]` and `[8,1,0,1]`. For all nine primary-small positions, multiple assignments produce identical jointly published category results and the same total. The observer knows the algorithm, including its suppression decisions.
2. Checks a 2×2 grid `[8,1;1,8]` with row, column and grand margins, partial/overlapping categories, a subtotal and percentage output. All 1,330 nonnegative integer grids with fixed grand total 18 have identical protected transcripts; both small cells have alternative assignments.
3. Changes person values across 1–4 and a large sentinel while comparing jointly queried district, partner, project, year/quarter and intersected scopes. Participant profile JSON and breakdown order remain identical. Activity row/CSV tests additionally cover zero, missing and negative inputs.
4. Runs real page-data and both CSV route handlers with synthetic warehouse/auth responses. Raw changes do not change the serialized outputs. Server-sanitized browser fixtures check the person sentinel does not occur in HTML or accessible text and creates no person chart geometry.

The claims assume fixed reporting rows, dimension/category availability and operational measures, nonnegative integer person counts, and no historical/external person margins. These are bounded reconstruction/noninterference tests, not a proof for arbitrary changing datasets or all outside knowledge.

## Executed checks

| Command | Result |
|---|---|
| `npm run lint` | PASS, exit 0; zero errors, 13 existing warnings, including unrelated scratch files. |
| `npm run typecheck` | PASS, exit 0. |
| `npm test` | PASS, exit 0; new disclosure regressions, 28 verification checks, auth/config/read-only/WIF/manifest, service, Activity Detail and analytical tests. Recorded-schema coverage explicitly SKIP: snapshot unavailable. |
| `npm run test:browser` | PASS, exit 0; 11 application tests in 2.9m, 40 route/viewport component checks, two additional sanitized disclosure screens; zero component runtime errors. |
| `npm run build` | PASS, exit 0; Next.js 16.4.3 webpack, mock/NONE readiness manifest and server-only bundle trace verified. |
| `npm audit` | PASS, exit 0; zero reported vulnerabilities. |
| `git diff --check` | PASS. |

Screenshots: [Executive withheld state](pr11-disclosure-2026-10-29/disclosure-executive-overview.png), [Activity Detail withheld state](pr11-disclosure-2026-10-29/disclosure-activity-detail.png). These are synthetic component fixtures. General chart geometry and CSV interaction tests also use synthetic fixtures; their success does not certify production downloads.

The earlier UI/UX acceptance and privacy closeout reports are explicitly superseded for disclosure acceptance. Their original test results and source/screenshot provenance remain historical. Stale production decision metadata no longer treats the previous secondary-disclosure claim as resolved.

## Remaining risks and release gates

- Historical exports, cached prior releases and externally known person totals cannot be recalled by this patch. Those may allow inference independently of the new outputs.
- Row existence, category availability, geography, dates and operational counts remain visible. A known relationship between submissions/events and attendance, or background knowledge about an event, may reveal people. The synthetic tests hold that structure fixed; they do not establish protection against membership inference, temporal changes or correlated operational measures.
- An institutional owner must accept the reduced publication policy and assess those remaining structural channels before release. No claim is made that retaining operational exceptions proves universal disclosure safety.
- Real Google OAuth/RBAC, deployed WIF/BigQuery reads in `asia-south1`, current warehouse/pipeline reconciliation, all seven live filters, both actual production CSV downloads, freshness and human screen-reader/keyboard review still require authorized Production UAT.

No live warehouse queries were executed for this review. No live warehouse data, Google authentication, source definitions or primary threshold were changed. No merge or deployment is authorized by this report.
