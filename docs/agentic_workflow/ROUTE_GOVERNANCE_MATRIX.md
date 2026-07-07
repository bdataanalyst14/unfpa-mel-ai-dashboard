# Route Governance Matrix

Audit date: 2026-06-18  
Status: audit-only governance matrix  
Source of truth: `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`

## Route Categories

| Category | Meaning |
| --- | --- |
| Safe aggregate route | Can use approved aggregate BigQuery tables/views without registry joins, provided route contract and privacy rules are satisfied. |
| Registry-dependent route | Requires approved M&E registry, crosswalk, target, evidence, or calculation rules before live data connection. |
| Blocked route | Must not be connected to live data until a named governance, privacy, or registry blocker is closed. |

Approved safe aggregate tables/views already identified:

| Table/view | Use |
| --- | --- |
| `combined_activity_summary` | Aggregate activity reporting |
| `indicator_progress_summary` | Aggregate indicator progress facts; not a standalone approved target registry |
| `data_quality_summary` | Aggregate data-quality facts |
| `ip_submission_status` | Aggregate IP submission status |

## Route Readiness Matrix

| Route | Current readiness | Safe aggregate route? | Registry-dependent? | Blocked? | Required sign-off before live data |
| --- | --- | --- | --- | --- | --- |
| `/dashboard/executive-overview` | Implemented as server-side BigQuery proof of concept | Yes | Partially, for target-enriched metrics only | No for existing aggregate POC; yes for target-enriched additions | Product/M&E acceptance of current aggregate contract; M&E approval before adding registry-derived target or progress logic |
| `/dashboard/activity-progress` | Not approved for live registry use | Partial aggregate source available | Yes | Yes | Approved activity registry, crosswalk, target definitions, unmatched activity treatment, route calculation rules |
| `/dashboard/indicator-progress` | Not approved for live registry use | Partial aggregate source available | Yes | Yes | Approved indicator registry, 878 crosswalk decisions, target/unit/cadence approval, NRCS/PeaceWin resolution |
| `/dashboard/ip-performance` | Not approved for live registry use | Partial aggregate source available | Yes | Yes | Approved IP aliases, registry coverage rules, target normalization, incomplete-source treatment |
| `/dashboard/participant-reach` | Not approved for live registry use | Partial aggregate source possible | Yes, if reach is interpreted against activity/indicator/target registry | Yes for registry-derived reach | Approved participant/reach aggregation contract, activity mapping, disaggregation privacy rules |
| `/dashboard/geographic-coverage` | Existing map route present; live registry joins not approved | Partial aggregate source possible | Yes for registry-coded geography and target coverage | Yes for registry-dependent live data | Approved geography-code crosswalk, route contract, and confirmation that protected map base remains unchanged |
| `/dashboard/data-quality` | Not approved for evidence scoring live use | Yes for aggregate data-quality summary | Yes for evidence requirement scoring | Blocked for evidence scoring; aggregate-only view can be prepared after contract review | Approved evidence requirement registry, scoring rules, and exclusion/deferment list |
| `/dashboard/management-decision-centre` | Not approved for live registry use | Partial aggregate source possible | Yes | Yes | Approved calculation rules, target thresholds, evidence rules, unresolved-gap treatment, and M&E owner acceptance |
| `/dashboard/activity-detail` | Not approved for live registry use | Partial aggregate detail possible if field allowlist is approved | Yes | Yes | Approved activity registry, field allowlist, exclusion of internal IDs/PII, unmatched activity treatment |
| `/dashboard/gbv-ocmc-summary` | Mock/prototype controls present; live GBV/OCMC not approved | Only if using pre-suppressed aggregate source | Yes for service indicator registry | Yes | Approved GBV/OCMC suppressed aggregate view, server-side suppression contract, privacy sign-off, suppression tests |

## Route Connection Rules

| Rule | Applies to | Requirement |
| --- | --- | --- |
| No direct registry import while pending validation | All registry-dependent routes | Registry must be versioned and approved before route import. |
| No raw or individual-level data in browser | All routes | API responses must expose only approved aggregate fields. |
| No client-side-only suppression for GBV/OCMC | GBV/OCMC and sensitive intersections | Small cells must be suppressed before response leaves server/API. |
| No target calculations from unapproved targets | Progress and management routes | Target/unit/cadence approval required. |
| No inferred mapping in live calculation without M&E approval | Crosswalk-dependent routes | All inferred links must be approved, corrected, rejected, or deferred. |
| No unresolved unmatched activity in live denominator | Activity and performance routes | Unmatched activity must be mapped, excluded, or deferred. |

## Sign-Off Required By Route

| Route | Minimum sign-off package |
| --- | --- |
| Executive Overview | Aggregate API contract, safe table/view approval, product/M&E acceptance of current limitations |
| Activity Progress | Activity registry, crosswalk, target definitions, calculation rules, unmatched treatment |
| Indicator Progress | Indicator registry, crosswalk, target/unit/cadence, NRCS/PeaceWin decision |
| IP Performance | IP identity/alias approval, target comparability, incomplete-source treatment |
| Participant Reach | Reach aggregation contract, allowed disaggregations, privacy review |
| Geographic Coverage | Geography crosswalk, map-base preservation, aggregate source contract |
| Data Quality | Evidence registry, data-quality scoring rules, deferred evidence treatment |
| Management Decision Centre | Full decision-rule approval, threshold governance, unresolved-gap treatment |
| Activity Detail | Activity registry, approved field allowlist, PII/internal-ID exclusion |
| GBV/OCMC Summary | Suppressed aggregate source, privacy approval, server-side masking tests |

## Live-Data Movement Decision

Category A safe aggregate routes may move forward only where their data contract is aggregate-safe and does not depend on unapproved registry fields. Registry-dependent routes remain blocked until M&E signs off the registry/crosswalk and route calculation rules. GBV/OCMC remains separately blocked until the suppression requirements in `GBV_OCMC_SUPPRESSION_REQUIREMENTS.md` are met.

