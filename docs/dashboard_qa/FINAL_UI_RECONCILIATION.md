# Final UI reconciliation

Baseline and inspected HEAD: `960099e3acce74ce735a7c1b6c04c8d582efa3ff`.
Branch: `fix/v1.0.1-locked-ui-restoration`. No commits after baseline on this branch.
Initial uncommitted restoration: Executive Overview, Geographic Coverage, Participant Reach and top filters; generated next-env change; untracked layout/QA documents, screenshots and scratch scripts. Preserve these working files.

Reference: LOCKED_PRODUCTION_LAYOUT.md, existing route layouts and navy/orange shell. Earlier QA_REPORT.md claims do not establish production rendering: all ten routes return BigQueryRouteView before reaching their prototype layouts.

## Phase 1 — before implementation

| Component | Intended state | Current state | Action |
|---|---|---|---|
| Executive Overview | KPI row, two analytical rows, management panel, source footer | Live branch returns metrics only; uncommitted charts are bypassed | RESTORE |
| Activity Progress | Volume, project/IP progress, type, trend, evidence table | Live metrics only; target/time-series contracts absent | RESTORE structure; explicit unavailable panels |
| Indicator Progress | KPI, target/status charts, indicator detail | Aggregate metrics supported; targets/status unsupported | RESTORE structure without invented achievement |
| Participant Reach | KPI, sex, age, inclusion, disability, type, organization, geography | Sex counts only; existing participant service has suppressed demographics/district reach | RESTORE using existing service; unavailable unsupported dimensions |
| Data Quality | Disabled score, evidence/validation structure | Historical SUM(total_rows) score still active in baseline | FIX: disable unsafe score and historical totals |
| GBV/OCMC | Privacy-blocked until approval | Correctly blocked | PASS; preserve |
| IP Performance | KPI, ranking/reach/evidence/quality/follow-up | KPI aggregates only; other measures unsupported | RESTORE structure |
| Activity Detail | Bounded searchable aggregate table | Up to 200 KPI cards for 100 groups | FIX presentation to searchable table |
| Management Decision Centre | Advisory narrative, review actions, unavailable AI/targets | Entire view disabled | RESTORE deterministic summary from existing overview service; preserve disabled AI API |
| Geographic Coverage | Large custom map, legend, ranking, matrix/gaps | Map bypassed; prototype density is synthetic | RESTORE existing 777-feature asset; approved district reach where available; activity density/matrix unavailable |
| Global filters | Seven supported filters, compact advanced group | Advanced collapse restored; route capability checks present | FIX sizing/accessibility; show unsupported date range |
| Sidebar/navigation | Navy, active route, mobile drawer, collapse | Navigation present; desktop collapse absent | FIX responsive/accessibility |
| Mobile layout | 375/768/1024/1440, no overflow or blank panels | Previous PASS claims unverified | VERIFY rendered current components |

## Boundaries

No auth, RBAC, WIF, connection, view or metric-definition changes. The sole query removal is the explicitly prohibited historical Data Quality calculation. Existing participant service is reused without changing its SQL. Static boundary validation is not approval of a live geography join; district reach is matched by exact normalized district name only, unmatched names are reported, and unavailable/suppressed values never become zero or fabricated density. No local-unit counts or sensitive records are displayed.

Management UI reuses the existing Executive Overview aggregate response after the unchanged page authorization guard. The disabled generative management API remains disabled. No automated decisions, messages, writes, deployment or merge.

## Phase 2 — implemented

The BigQuery route now renders `production-dashboard-view.tsx` rather than the metrics-only screen. Existing prototype branches remain isolated and are not used as fallback. The earlier uncommitted prototype edits were preserved; they are not evidence of production restoration.

| Component | Result | Remaining data limitation |
|---|---|---|
| Executive Overview | Four compact KPIs, programme/indicator regions, compact Nepal map, participant sex bars, partner attention, quality attention, advisory summary, source footer | Project plans, target status and quality scores remain explicitly unavailable |
| Geographic Coverage | Local 777-feature SVG renders; district reach shading, numeric density legend, district tooltips, selected-district outline, privacy text, coverage KPIs and top-ten reach chart | Activity density, project/district matrix and intervention gaps unavailable; reach colouring requires the existing participant service to succeed; unmatched district names are not assigned inferred locations |
| Participant Reach | Existing participant KPIs, sex bars, existing age/caste/disability aggregates and district reach; overlapping age-band caveat | Participant type, organization/position and inclusion-by-district unavailable; supplementary service failure leaves primary KPIs intact and supplemental panels unavailable |
| Activity Progress | Volume visualization and intended project/IP/type/trend/evidence regions | Approved planned/completed, event-type, monthly event and evidence data absent |
| Indicator Progress | Existing totals and target/status/detail regions | No invented targets, achievement percentages or status |
| IP Performance | Existing partner totals and ranking/reach/evidence/quality/follow-up regions | No inferred partner rankings or risk scores |
| Data Quality | Four disabled KPI positions plus evidence/validation/check/correction regions | No score or historical totals queried/calculated; safe latest-snapshot contract remains required |
| GBV/OCMC | Explicit privacy-blocked summary and safeguards | Activation remains blocked; no survivor data requested |
| Activity Detail | Searchable table of the existing bounded 100 activity groups; event/participant counts remain suppressed strings | Search is local to loaded groups; evidence, validation, individual records and exports remain unavailable |
| Management Decision Centre | Deterministic aggregate summary, programme review draft and human review priorities | AI generation, automatic actions, target-risk and assigned-action records remain disabled |
| Filters | Province, District, Municipality/LG, IP, Year, Quarter and Project retained; responsive widths; accessible More Filters | Outcome, Output, Activity, Indicator, Fund Code, Event Type and date ranges disabled; reporting scope supported through Year/Quarter |
| Navigation/mobile | Navy shell, desktop collapse, active-page semantics, full navigation labels, skip link; existing shadcn Sheet provides mobile focus trap, Escape and return focus | No security/auth changes |

Filter scope follows existing query capabilities: seven fields for combined routes and the management overview summary; Indicator Progress excludes IP; IP Performance supports IP only; Data Quality and GBV controls remain disabled. Invalid preserved URL selections are still rejected by the service rather than silently showing unfiltered data. No new filter SQL or geography lookups were added.

## Validation and evidence

- `npm test`: PASS, including suppression, read-only query guard, WIF, manifest, Google auth/RBAC, production contracts and pre-UAT checks. One intermediate activation-fixture run failed; the complete sequential rerun passed. No production activation was performed; that test exercises temporary fixture files only.
- `npm run test:production-v1`: PASS after adding regressions for removal of the historical quality query, authorization before supplementary reads, no supplementary reads for unavailable/empty/disabled states, and management summary reuse.
- `npm run typecheck`: PASS; production build also runs TypeScript checks.
- `npm run lint`: PASS with 11 pre-existing warnings in operational/scratch scripts, no errors.
- `npm run build`: PASS, including readiness bundle verification. Local build configuration reports mock/NONE; this is a compile/bundle check, not live BigQuery readiness proof. No environment settings were changed.
- `node scripts/validate-local-unit-map.js`: PASS, 777 features. Asset unchanged; no external map dependency added.
- `node scripts/test-ui-reconciliation.js`: actual production presentation, filter provider, shell and map components rendered in an isolated browser harness. All ten routes checked at 375, 768, 1024 and 1440 pixels with no page overflow. Interaction checks cover filter URL updates/clear, unsupported controls, mobile Escape/focus restoration, desktop collapse and activity search. Privacy checks cover suppressed bars, suppressed district colours, missing supplementary data and fail-closed presentation.

Browser evidence: `test-results/ui-reconciliation/results.json` and route/width PNGs in the same directory (generated/ignored). Fixtures are explicitly labelled OFFLINE COMPONENT QA; the harness is not an application route and cannot serve fallback data to the dashboard. Authentication and navigation adapters exist only in that isolated test bundle. Browser launch required sandbox escalation; no production browser session or credentials were used.

Screenshots were reviewed against the locked layout for page hierarchy, map prominence, compact filter spacing, advisory copy and readable unavailable states. The overview map has a compact variant to avoid stretching adjacent panels; full legend/caveats remain on Geographic Coverage.

Authenticated live UAT remains unverified in this local task. In particular, actual supplementary participant-service availability and district-name match rates must be observed in that session; the UI fails closed if those data are unavailable. Unsupported regions are restored as explicit unavailable components, not fabricated charts. This work remains uncommitted on the restoration branch; nothing was merged or deployed.
