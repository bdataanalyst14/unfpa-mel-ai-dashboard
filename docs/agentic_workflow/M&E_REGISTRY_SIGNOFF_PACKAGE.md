# M&E Registry Sign-Off Package

Audit date: 2026-06-18  
Status: audit-only package for human M&E validation  
Source of truth: `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`

## Current Registry Position

The dashboard has reached the M&E review stage. BigQuery is already connected, the 15-IP aggregate reporting database is already connected, and data is already flowing into the dashboard. The Executive Overview route has already been implemented as a server-side BigQuery proof of concept.

The registry remains `pending_user_validation` and is not yet imported by frontend routes. Registry-dependent route connection remains blocked until M&E approval is recorded.

Confirmed registry facts:

| Item | Count / status |
| --- | ---: |
| Implementing partners | 15 |
| Activities | 575 |
| Indicators | 217 |
| Targets | 170 |
| Activity-indicator crosswalk links | 878 |
| Evidence placeholders | 878 |
| Inferred matches | 90 |
| Unmatched activities | 331 |
| NRCS/PeaceWin incomplete-source links | 83 |
| Registry status | `pending_user_validation` |
| Frontend route imports | None |

## What M&E Must Validate

M&E must validate that the registry is a correct, approved, non-personal programme metadata layer for dashboard use. Validation must cover:

| Validation area | Required M&E decision | Why it matters |
| --- | --- | --- |
| IP identities and aliases | Approve canonical names, abbreviations, and alias handling for all 15 IPs. | Prevents duplicate or split reporting by partner. |
| Activity list | Approve the 575 extracted activities as complete, de-duplicated, and correctly assigned to IPs. | Required before activity progress, activity detail, and management routes can rely on registry mappings. |
| Indicator list | Approve the 217 indicators, including source-derived wording and codes. | Required before indicator progress and decision calculations can move to live data. |
| Target records | Approve the 170 targets, target years, quarterly/annual structure, cumulative logic, and units. | Required before progress percentages, RAG status, and under/over-performance flags are credible. |
| Crosswalk links | Approve, correct, or reject the 878 activity-indicator links. | Required before activity actuals can be interpreted against indicators and targets. |
| Inferred matches | Confirm or correct all 90 inferred mappings. | Machine-assisted links cannot govern live route calculations without human approval. |
| Unmatched activities | Map, defer, or formally exclude all 331 unmatched activities. | Unmapped activities create incomplete route totals and misleading denominators. |
| NRCS/PeaceWin gaps | Resolve the 83 incomplete-source links or approve route-level exclusion/deferment. | These links have missing indicator-target registry support from source workbooks. |
| Evidence requirements | Define or approve the 878 evidence placeholders, evidence type, cadence, and responsibility. | Required for evidence completeness, data quality, and audit readiness. |
| Calculation rules | Approve how progress, achievement, overdue status, and contribution type are calculated. | Required before registry-dependent dashboards can produce decision-grade outputs. |
| Privacy classification | Confirm that registry metadata is non-personal and that any sensitive programme category flags are handled safely. | Required before live route import. |

## Fields Needing Human Approval

The following fields must be reviewed and approved by M&E before any registry-dependent route can connect:

| Field group | Fields requiring approval |
| --- | --- |
| IP identity | `ip_name`, `normalized_ip_name`, aliases, IP grouping, duplicate handling |
| Activity identity | `activity_registry_id`, activity code, normalized activity name, source activity name, IP assignment |
| Indicator identity | `indicator_registry_id`, indicator code, indicator name, output, outcome, CPD/SP/UNSDCF mapping |
| Target definition | `target_registry_id`, reporting year, annual target, quarterly targets, cumulative target, target type, unit of measure |
| Crosswalk | activity-indicator link, mapping method, mapping confidence, mapping status, contribution type, gap reason |
| Evidence | evidence required, evidence type, evidence frequency/cadence, responsible team/person, source document/sheet/row |
| Review workflow | M&E review status, corrected value, comments, approved by, approved date |
| Route logic | inclusion/exclusion rule, numerator/denominator rule, aggregation grain, masking/suppression requirement |

## Items Blocking Route Connection

These items block live-data connection for registry-dependent routes:

| Blocker | Affected routes | Required release condition |
| --- | --- | --- |
| Registry status remains `pending_user_validation`. | Activity Progress, Indicator Progress, IP Performance, Participant Reach, Data Quality, Management Decision Centre, Activity Detail, Geographic Coverage where registry joins are needed. | M&E-approved registry version with approver and date. |
| 90 inferred matches not confirmed. | Activity Progress, Indicator Progress, Management Decision Centre, Data Quality. | Each inferred match approved, corrected, rejected, or deferred with route treatment. |
| 331 unmatched activities. | Activity Progress, Activity Detail, IP Performance, Participant Reach, Management Decision Centre. | Activities mapped, excluded, or marked as deferred outside live denominators. |
| 83 NRCS/PeaceWin incomplete-source links. | Indicator Progress, Activity Progress, IP Performance, Management Decision Centre. | Missing source indicator/target details supplied or route exclusion approved. |
| Target/unit/cadence gaps. | Activity Progress, Indicator Progress, IP Performance, Management Decision Centre. | Target units and cadence normalized and approved. |
| Evidence placeholders not defined. | Data Quality, Management Decision Centre, Activity Detail. | Evidence requirement registry approved, including frequency and owner. |
| GBV/OCMC server-side suppression not contractually approved. | GBV/OCMC Summary and any route with sensitive GBV/OCMC cells. | Approved suppressed aggregate source, server-side masking, and privacy test evidence. |
| Route calculation rules not signed off. | All registry-dependent decision routes. | Route governance matrix approved by M&E/product owner. |

## Items That Can Be Deferred

The following can be deferred if they are explicitly excluded from live route logic and documented in the decision log:

| Deferrable item | Deferral condition |
| --- | --- |
| Low-priority evidence details not used by first protected preview. | Evidence placeholders are marked `deferred`, excluded from quality scoring, and assigned an owner/date. |
| Non-critical activity aliases. | Canonical activity identity is approved and aliases do not affect joins or route totals. |
| Narrative wording polish for indicators/activities. | Codes, mappings, targets, and route calculation semantics are approved. |
| Unmatched activities outside preview scope. | Excluded from denominators and clearly flagged as incomplete coverage. |
| NRCS/PeaceWin incomplete links outside first preview scope. | Routes either exclude affected rows or display approved incomplete-coverage messaging. |
| Advanced disaggregation dimensions. | Base aggregate route remains accurate without the optional dimension. |

## Sign-Off Record To Capture

Before implementation work proceeds, capture:

| Sign-off item | Required value |
| --- | --- |
| Approved registry version | Version ID or file hash |
| Scope approved | Full registry or named subset |
| Approved routes | Route list |
| Exclusions/deferments | Explicit item IDs and route treatment |
| Privacy approval | Required for GBV/OCMC and sensitive categories |
| M&E approver | Name and role |
| Approval date | Date |
| Conditions | Any limitations for protected preview |

