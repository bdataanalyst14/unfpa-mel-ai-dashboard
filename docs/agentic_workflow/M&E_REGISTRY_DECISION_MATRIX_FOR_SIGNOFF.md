# M&E Registry Decision Matrix For Sign-Off

Audit date: 2026-06-18  
Status: prepared for human M&E review  
Scope: registry and route-governance decisions only  
Source documents:

- `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`
- `docs/agentic_workflow/M&E_REGISTRY_SIGNOFF_PACKAGE.md`
- `docs/agentic_workflow/REGISTRY_GAP_DECISION_LOG.md`
- `docs/agentic_workflow/ROUTE_GOVERNANCE_MATRIX.md`
- `docs/agentic_workflow/GBV_OCMC_SUPPRESSION_REQUIREMENTS.md`
- `docs/agentic_workflow/NEXT_PATCH_PLAN_FOR_APPROVAL.md`

## 1. Purpose And Decision Status

This file is the practical M&E decision worksheet for approving, correcting, deferring, or blocking registry items before any registry-dependent dashboard route moves to live data.

Current decision status:

| Area | Status |
| --- | --- |
| BigQuery connection | Already connected; do not reconnect |
| 15-IP aggregate coverage | Verified |
| Executive Overview | Only confirmed server-side BigQuery proof of concept |
| Registry status | `pending_user_validation` |
| Registry frontend import | Not imported by dashboard routes |
| Registry-dependent routes | Blocked pending M&E sign-off |
| Antigravity implementation | Must wait for approved route rules |
| GBV/OCMC live activation | Blocked pending server-side suppression sign-off |

M&E decision options:

| Decision | Meaning |
| --- | --- |
| Approve | Item is acceptable for the named route/calculation scope. |
| Correct | Item can proceed only after the required correction is applied and recorded. |
| Defer | Item is excluded from protected-preview/live calculations for now and assigned an owner. |
| Block | Item prevents route activation until resolved. |

## 2. What Is Already Safe/Verified

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SAFE-001 | All | BigQuery aggregate connection | Verified | None for connection itself | Approve as existing baseline |  | None | M&E/Product owner |  | Do not reconnect BigQuery. |
| SAFE-002 | All 15 IPs | Aggregate reporting coverage | Verified | None for aggregate coverage | Approve as verified baseline |  | None | M&E/Product owner |  | 15-IP aggregate coverage already verified. |
| SAFE-003 | All | Executive Overview aggregate POC | Implemented | Only current confirmed server-side BigQuery route | Approve current limited POC scope |  | None unless expanding to registry-derived metrics | M&E/Product owner |  | Target-enriched metrics still require registry approval. |
| SAFE-004 | All | Safe aggregate tables/views | Identified | Route contracts still required | Approve as allowable aggregate sources |  | Confirm route-specific field allowlists | Codex + M&E owner |  | `combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`. |

## 3. What Needs M&E Decision Before Route Connection

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-001 | All | 15 IP identities and aliases | Pending validation | Canonical naming must be approved | Approve/correct canonical IP list |  | Correct aliases or duplicates | Human M&E owner |  | Required for IP Performance and partner filters. |
| DEC-002 | All | 575 activities | Pending validation | Activity list must be validated | Approve/correct/defer activity records |  | Correct source names, codes, IP assignment, duplicates | Human M&E owner |  | Required before activity routes connect. |
| DEC-003 | All | 217 indicators | Pending validation | Indicator list must be validated | Approve/correct indicator records |  | Correct codes, names, output/outcome mappings | Human M&E owner |  | Required before indicator routes connect. |
| DEC-004 | All | 170 targets | Pending validation | Target semantics must be approved | Approve/correct/defer target records |  | Correct target value, unit, cadence, year | Human M&E owner |  | Required before progress percentages and RAG status. |
| DEC-005 | All | 878 crosswalk links | Pending validation | Links must be approved or excluded | Approve/correct/defer/block crosswalks |  | Correct activity-indicator-target mapping | Human M&E owner |  | Required before registry joins. |
| DEC-006 | All | 878 evidence placeholders | Pending validation | Evidence requirements need definition | Approve/correct/defer evidence requirements |  | Define type, frequency, owner, scoring use | Human M&E owner |  | Can be deferred only if excluded from scoring. |
| DEC-007 | All | Route calculation rules | Pending validation | Numerator/denominator and exclusion rules not signed off | Approve route calculation rules |  | Define calculations and unresolved-gap handling | Human M&E owner + Codex |  | Required before Antigravity implementation. |
| DEC-008 | GBV/OCMC scope | Suppression contract | Pending validation | Live sensitive aggregate route not approved | Block until privacy sign-off |  | Approve server-side suppression, thresholds, tests | Human M&E/privacy owner |  | No raw small cells may reach browser. |

## 4. Decision Table For 90 Inferred Matches

Known count: 90 inferred matches. Each inferred match must be confirmed, corrected, deferred, or blocked before it can drive live route calculations.

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INF-ALL-090 | All affected IPs | 90 inferred activity-indicator links | Inferred; pending M&E validation | Machine-assisted mapping not yet human approved | Review each inferred link and approve/correct/defer/block |  | Add corrected indicator/target mapping where needed | Human M&E owner |  | Blocks affected live calculations. |
| INF-RULE-001 | All affected IPs | Mapping method/confidence | Pending validation | Acceptable confidence threshold not approved | Approve allowed inferred-match threshold or require manual confirmation for all |  | Document threshold and route treatment | Human M&E owner |  | Recommended: manual confirmation for preview scope. |
| INF-ROUTE-001 | All affected IPs | Activity Progress, Indicator Progress, Management Decision Centre, Data Quality | Pending validation | Inferred links may affect route denominators and status flags | Block inferred links from live use until decided |  | Mark each link approved/corrected/deferred/blocked | Human M&E owner |  | Defer items must be excluded from live denominators. |
| INF-SAMPLE-001 | To be completed by reviewer | Crosswalk ID / activity / indicator / target | Inferred | Specific inferred match requires decision | Approve/correct/defer/block |  |  | Human M&E owner |  | Use this row pattern for item-level review. |

## 5. Decision Table For 331 Unmatched Activities

Known count: 331 unmatched activities. Unmatched activities must not be included in registry-dependent denominators until mapped or formally excluded/deferred.

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UMA-ALL-331 | All affected IPs | 331 activities without approved indicator linkage | Unmatched; pending M&E decision | No approved crosswalk to indicator/target | Map, classify operational-only, exclude, defer, or block |  | Provide indicator/target mapping or exclusion reason | Human M&E owner |  | Critical before protected preview if affected routes are in scope. |
| UMA-TREAT-001 | All affected IPs | Route denominator treatment | Pending validation | Unmatched activities can distort totals and progress | Exclude unresolved unmatched activities from live denominators |  | Record item-level route treatment | Human M&E owner + Codex |  | Aggregate-only reporting may still show safe totals if approved. |
| UMA-REASON-001 | All affected IPs | Gap reason codes | Pending validation | Missing reason codes limit audit trail | Assign approved reason code |  | Use reason such as missing indicator, source ambiguous, duplicate, out of scope, deferred | Human M&E owner |  | Required for transparent review. |
| UMA-SAMPLE-001 | To be completed by reviewer | Activity ID / activity code / source activity | Unmatched | Specific activity requires mapping decision | Approve/correct/defer/block |  |  | Human M&E owner |  | Use this row pattern for item-level review. |

## 6. Decision Table For 83 NRCS/PeaceWin Incomplete-Source Links

Known count: 83 NRCS/PeaceWin incomplete-source links. These records have missing indicator-target registry support from source workbooks and must not drive live calculations until resolved or formally deferred/excluded.

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NP-ALL-083 | NRCS, PeaceWin | 83 incomplete-source links | `incomplete_source`; requires M&E review | Missing authoritative indicator-target support | Provide source details or defer/exclude affected links |  | Supply indicator, target, unit, year, cadence, source reference | Human M&E owner |  | Critical blocker for affected IP calculations. |
| NP-NRCS-001 | NRCS | NRCS incomplete-source registry links | `incomplete_source` | Indicator/target support incomplete | Correct from authoritative source or defer affected scope |  | Add approved source document/sheet/row and target mapping | Human M&E owner |  | Blocks affected NRCS route calculations. |
| NP-PEACEWIN-001 | PeaceWin | PeaceWin incomplete-source registry links | `incomplete_source` | Indicator/target support incomplete | Correct from authoritative source or defer affected scope |  | Add approved source document/sheet/row and target mapping | Human M&E owner |  | Blocks affected PeaceWin route calculations. |
| NP-ROUTE-001 | NRCS, PeaceWin | IP Performance, Indicator Progress, Activity Progress, Management Decision Centre | Pending validation | Incomplete sources may distort cross-IP comparisons | Mark affected comparisons incomplete or exclude until resolved |  | Add route-level limitation or exclusion rule | Human M&E owner + Codex |  | Required before SMT-facing comparisons. |

## 7. Target/Unit/Cadence Decision Table

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TGT-ALL-170 | All affected IPs | 170 target records | Pending validation | Target values and semantics require approval | Approve/correct/defer target records |  | Correct annual, quarterly, cumulative target values | Human M&E owner |  | Blocks progress percentages and RAG status. |
| UNIT-001 | All affected IPs | Unit of measure | Pending validation | Mixed or unclear units may not be comparable | Normalize units or mark non-comparable |  | Define approved unit and conversion/non-comparable rule | Human M&E owner |  | Required before cross-IP aggregation. |
| CAD-001 | All affected IPs | Reporting cadence | Pending validation | Quarterly/annual/cumulative logic unclear for some records | Approve cadence and accumulation rule |  | Define period-specific vs cumulative treatment | Human M&E owner |  | Required for trend and overdue status. |
| TGT-ROUTE-001 | All affected IPs | Activity Progress, Indicator Progress, IP Performance, Management Decision Centre | Pending validation | Routes depend on target semantics | Block target-derived route features until approved |  | Add approved calculation rule per route | Human M&E owner + Codex |  | Safe aggregate counts can remain separate from target calculations. |

## 8. Evidence Requirement Decision Table

Known count: 878 evidence placeholders. Evidence requirements must be approved before evidence completeness or data-quality scoring can be treated as decision-grade.

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EVD-ALL-878 | All affected IPs | 878 evidence placeholders | Placeholder; pending M&E validation | Evidence type/frequency/owner not fully defined | Approve/correct/defer evidence requirements |  | Define evidence required, type, frequency, responsible team/person | Human M&E owner |  | Required before evidence scoring. |
| EVD-SCORE-001 | All affected IPs | Data Quality scoring | Pending validation | Scoring rules not approved | Block evidence scoring until rules approved |  | Define completeness score and exclusion rules | Human M&E owner + Codex |  | Aggregate data-quality facts may be used only within approved contract. |
| EVD-DEFER-001 | All affected IPs | Deferred evidence requirements | Pending validation | Deferrals need explicit treatment | Approve deferral list and exclude from scoring denominators |  | Record deferral owner and follow-up date | Human M&E owner |  | Deferral is acceptable only if not counted as missing in preview scoring. |
| EVD-SAMPLE-001 | To be completed by reviewer | Evidence ID / activity / indicator | Placeholder | Specific evidence requirement needs decision | Approve/correct/defer/block |  |  | Human M&E owner |  | Use this row pattern for item-level review. |

## 9. Route Activation Decision Table

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ROUTE-EXEC | All | `/dashboard/executive-overview` | Server-side BigQuery POC implemented | Current POC is safe aggregate; target-enriched additions need approval | Approve current POC scope; block registry-derived additions until sign-off |  | Define any additional approved metrics | M&E/Product owner |  | Only confirmed live BigQuery POC. |
| ROUTE-ACT-PROG | All | `/dashboard/activity-progress` | Blocked | Requires approved activity registry, crosswalk, targets, unmatched treatment | Block until registry decisions complete |  | Approve route calculation rules and gap treatment | Human M&E owner + Codex |  | Antigravity must wait. |
| ROUTE-IND-PROG | All | `/dashboard/indicator-progress` | Blocked | Requires approved indicator registry, targets, units, cadence, NRCS/PeaceWin decisions | Block until registry decisions complete |  | Approve indicator/target/crosswalk rules | Human M&E owner + Codex |  | Antigravity must wait. |
| ROUTE-IP-PERF | All | `/dashboard/ip-performance` | Blocked | Requires IP aliases, target comparability, incomplete-source treatment | Block until registry decisions complete |  | Approve comparison and exclusion rules | Human M&E owner + Codex |  | Avoid misleading cross-IP ranking. |
| ROUTE-REACH | All | `/dashboard/participant-reach` | Blocked for registry-derived reach | Requires reach aggregation contract and privacy-safe disaggregations | Block registry-derived reach until approved |  | Approve allowed dimensions and calculations | Human M&E owner + Codex |  | Aggregate-safe display may require separate contract. |
| ROUTE-GEO | All | `/dashboard/geographic-coverage` | Blocked for registry joins | Requires geography-code crosswalk and map-base preservation | Block registry-derived geography until approved |  | Approve geography crosswalk and route contract | Human M&E owner + Codex |  | Do not alter protected map base. |
| ROUTE-DQ | All | `/dashboard/data-quality` | Blocked for evidence scoring | Requires evidence registry and scoring rules | Block evidence scoring until approved |  | Approve evidence requirements and deferred treatment | Human M&E owner + Codex |  | Safe aggregate-only contract may be reviewed separately. |
| ROUTE-MDC | All | `/dashboard/management-decision-centre` | Blocked | Requires approved decision rules, thresholds, targets, evidence and gaps | Block until full route governance approved |  | Approve numerator/denominator, thresholds, unresolved-gap handling | Human M&E owner + Codex |  | High-risk decision route. |
| ROUTE-ACT-DETAIL | All | `/dashboard/activity-detail` | Blocked | Requires activity registry and field allowlist | Block until registry and privacy allowlist approved |  | Approve fields and exclude PII/internal IDs | Human M&E owner + Codex |  | Aggregate-safe detail only. |
| ROUTE-GBV-OCMC | GBV/OCMC scope | `/dashboard/gbv-ocmc-summary` | Blocked | Requires approved suppressed aggregate source and privacy tests | Block until GBV/OCMC suppression sign-off complete |  | Approve thresholds, aggregation grain, API payload tests | Human M&E/privacy owner + Codex |  | No exact small cells in browser. |

## 10. GBV/OCMC Suppression Sign-Off Checklist

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GBV-001 | GBV/OCMC scope | Suppressed aggregate source | Pending approval | Approved source not confirmed | Block live activation until source approved |  | Approve server-side suppressed aggregate view/API contract | Human M&E/privacy owner |  | Existing mock/prototype suppression is not enough. |
| GBV-002 | GBV/OCMC scope | Small-cell threshold | Pending approval | Threshold must be explicit | Approve minimum rule: mask non-zero counts 1-4 as `<5` |  | Confirm threshold and display label | Human M&E/privacy owner |  | Final threshold may be stricter if required. |
| GBV-003 | GBV/OCMC scope | Browser payload | Pending verification | Raw small cells must never reach browser | Block until payload inspection passes |  | Verify JSON/chart/export payloads contain no exact 1-4 values | Codex + privacy owner |  | Client-side-only masking is not acceptable. |
| GBV-004 | GBV/OCMC scope | Derived metrics | Pending approval | Rates/percentages may reveal small cells | Suppress derived metrics when components are unsafe |  | Approve derived metric masking rules | Human M&E/privacy owner |  | Includes numerator and denominator safety. |
| GBV-005 | GBV/OCMC scope | Complementary suppression | Pending approval | Totals/subtotals can reveal masked values | Approve complementary suppression rule |  | Define row/column total masking | Human M&E/privacy owner |  | Prevent differencing. |
| GBV-006 | GBV/OCMC scope | Dimensions and filters | Pending approval | Fine-grain geography/time/service intersections may create unsafe cells | Approve allowed aggregation grain |  | Define allowed dimensions, filters, and drilldown limits | Human M&E/privacy owner |  | Applies to all route filters and exports. |
| GBV-007 | GBV/OCMC scope | Logs, cache, exports | Pending verification | Raw values may leak outside UI | Block until logs/cache/export controls pass |  | Verify no raw small cells stored or exported | Codex + privacy owner |  | Includes server logs and client telemetry. |

## 11. Final Sign-Off Section

Complete this section only after M&E has reviewed the relevant rows above.

| Sign-off field | Value |
| --- | --- |
| Registry decision | Approve / Correct / Defer / Block |
| Approved registry version or file hash |  |
| Approved route scope |  |
| Deferred items and owners |  |
| Blocked items and required closure |  |
| GBV/OCMC live activation decision | Approve / Correct / Defer / Block |
| Conditions for protected preview |  |
| Conditions for live route connection |  |
| M&E approver name and role |  |
| Privacy approver name and role, if applicable |  |
| Sign-off date |  |
| Implementation agent authorized | None / Codex / Antigravity / Cline / Copilot CLI |
| Implementation notes |  |

Final decision statement:

| Item ID or group | IP | Activity/indicator/target reference | Current registry status | Issue or gap | Proposed decision | M&E decision: Approve / Correct / Defer / Block | Required correction | Decision owner | Sign-off date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FINAL-001 | All | Registry-dependent route activation | `pending_user_validation` until signed | Registry-dependent routes are blocked without completed sign-off | Block until M&E completes this matrix |  | Complete required decisions above and record approved scope | Human M&E owner |  | Antigravity live implementation must wait for approved route rules. |

