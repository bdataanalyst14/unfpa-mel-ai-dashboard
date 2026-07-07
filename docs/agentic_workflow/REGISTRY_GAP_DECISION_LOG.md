# Registry Gap Decision Log

Audit date: 2026-06-18  
Status: decision log template populated with known gap classes  
Source of truth: `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`

## Decision Log Summary

The registry is not approved for route import. All gaps below require a human M&E owner decision before registry-dependent routes can move to live data.

| Gap class | Count / scope | Severity | Default route treatment | Owner / decision required |
| --- | ---: | --- | --- | --- |
| Inferred matches | 90 | High | Block use in live calculations until confirmed. | M&E owner confirms, corrects, rejects, or defers each match. |
| Unmatched activities | 331 | Critical | Exclude from live denominators until mapped or formally deferred. | M&E owner maps to indicator/target or approves exclusion/deferment. |
| NRCS/PeaceWin incomplete-source links | 83 | Critical | Block affected IP/indicator route calculations. | M&E owner obtains source details or approves exclusion/deferment. |
| Target gaps | Registry-wide where target fields are missing/mixed | High | Block progress percentages and RAG status. | M&E owner approves target, target type, unit, year, and cadence. |
| Unit gaps | Registry-wide where units are mixed or unclear | High | Block cross-IP aggregation for affected indicators. | M&E owner normalizes or marks as non-comparable. |
| Cadence gaps | Registry-wide where quarterly/annual/cumulative logic is unclear | High | Block time-series progress and overdue status. | M&E owner approves reporting cadence and accumulation rule. |
| Evidence gaps | 878 placeholders | Medium to High | Block evidence scoring; may defer from first preview if route excludes quality scoring. | M&E owner approves evidence type, frequency, and responsible party. |

## Inferred Matches Needing Confirmation

Known count: 90 inferred matches.

| Decision ID | Gap | Severity | Route impact | Required decision | Owner |
| --- | --- | --- | --- | --- | --- |
| INF-001 | Inferred activity-indicator mappings were created without final human confirmation. | High | Activity Progress, Indicator Progress, Management Decision Centre, Data Quality | Confirm, correct, reject, or defer each inferred link. | Human M&E owner |
| INF-002 | Mapping confidence/method must be accepted as sufficient for dashboard calculation use. | High | All registry-dependent calculations | Approve allowed mapping methods and confidence thresholds. | Human M&E owner |
| INF-003 | Any rejected inferred match needs a replacement mapping or explicit exclusion rule. | High | Activity/indicator denominators | Provide corrected crosswalk ID or approved exclusion reason. | Human M&E owner |

Required fields to close each inferred match:

| Field | Required value |
| --- | --- |
| `crosswalk_id` | Existing or corrected ID |
| `mapping_status` | `approved`, `corrected`, `rejected`, or `deferred` |
| `me_corrected_value` | Required when corrected |
| `me_comments` | Required for reject/defer decisions |
| `approved_by` | M&E approver |
| `approved_date` | Approval date |

## Unmatched Activities Needing Mapping

Known count: 331 unmatched activities.

| Decision ID | Gap | Severity | Route impact | Required decision | Owner |
| --- | --- | --- | --- | --- | --- |
| UMA-001 | Activities with no approved indicator linkage. | Critical | Activity Progress, IP Performance, Participant Reach, Activity Detail, Management Decision Centre | Map to indicator/target, classify as operational-only, exclude from denominator, or defer. | Human M&E owner |
| UMA-002 | Unmatched activities may still have aggregate actuals in BigQuery. | Critical | Executive summaries may not reconcile with registry-dependent detail routes. | Approve whether unmatched actuals appear only in safe aggregate totals or are hidden from registry-dependent pages. | Human M&E owner |
| UMA-003 | Unmatched activities need a reason code. | High | Audit and future correction workflow | Assign `missing_indicator`, `source_ambiguous`, `duplicate_activity`, `not_in_scope`, or approved equivalent. | Human M&E owner |

Approved route treatment options:

| Treatment | Meaning |
| --- | --- |
| Map | Add approved activity-indicator-target relationship. |
| Operational-only | Activity may appear in aggregate operational counts but not progress against programme targets. |
| Exclude | Activity is outside dashboard scope and excluded from calculations. |
| Defer | Activity remains unresolved and must not affect protected-preview denominators. |

## NRCS/PeaceWin Incomplete-Source Links

Known count: 83 incomplete-source links.

| Decision ID | Gap | Severity | Route impact | Required decision | Owner |
| --- | --- | --- | --- | --- | --- |
| NP-001 | NRCS/PeaceWin links marked `incomplete_source` due to missing indicator-target registry support. | Critical | Indicator Progress, Activity Progress, IP Performance, Management Decision Centre | Provide missing source registry details or approve route-level exclusion/deferment. | Human M&E owner |
| NP-002 | Source workbooks do not provide enough evidence for authoritative target mapping. | Critical | Target achievement, RAG status, trend and contribution calculations | Supply authoritative target sheet, approve substitute source, or block affected calculations. | Human M&E owner |
| NP-003 | Incomplete-source records may distort cross-IP comparisons. | High | IP Performance and Management Decision Centre | Mark affected IP comparisons as incomplete or exclude affected dimensions. | Human M&E owner |

Minimum close-out data for each link:

| Field | Required decision |
| --- | --- |
| Indicator code/name | Approve or provide corrected value |
| Target ID/value | Approve or provide corrected value |
| Unit of measure | Approve normalized unit |
| Reporting year/quarter | Approve cadence |
| Evidence requirement | Define or defer |
| Source reference | Confirm document/sheet/row or approved alternate source |

## Target, Unit, Cadence, And Evidence Gaps

| Decision ID | Gap | Severity | Route impact | Required decision | Owner |
| --- | --- | --- | --- | --- | --- |
| TGT-001 | Target values are not uniformly ready for calculation use. | High | Progress, RAG status, performance ranking | Approve annual, quarterly, and cumulative target values. | Human M&E owner |
| TGT-002 | Mixed target units may not be comparable across IPs or indicators. | High | Cross-IP aggregation and indicator summary | Normalize units or mark affected measures as non-comparable. | Human M&E owner |
| CAD-001 | Reporting cadence and accumulation rules require approval. | High | Quarterly progress, overdue/behind schedule calculations | Approve cadence and whether targets are cumulative or period-specific. | Human M&E owner |
| EVD-001 | Evidence placeholders exist but are not fully defined. | Medium to High | Data Quality, Management Decision Centre, Activity Detail | Approve evidence requirement, type, frequency, responsible party, and scoring rule. | Human M&E owner |
| EVD-002 | Evidence gaps can be deferred only if excluded from scoring. | Medium | Data Quality and review readiness | Approve deferral list and remove deferred evidence from live quality denominators. | Human M&E owner |

## Severity Definitions

| Severity | Definition |
| --- | --- |
| Critical | Blocks route connection or can materially misstate live dashboard results. |
| High | Blocks a calculation, comparison, or decision flag but may allow limited aggregate display. |
| Medium | Can be deferred from protected preview if explicitly excluded from calculations and assigned an owner. |
| Low | Editorial or usability improvement with no calculation impact. |

