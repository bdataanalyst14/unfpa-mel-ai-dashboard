# SMT_READINESS_PATCH_BACKLOG

## Overview

The patch backlog tracks required actions needed to achieve SMT readiness while respecting protected files and operational constraints.

| Category | Description | Priority | Owner | Status |
|----------|-------------|----------|-------|--------|
| **completed_for_smt_demo** | Reconcile Codex local build sandbox technical evidence. | High | Codex/Antigravity | `Technical Build: PASSED` |
| **completed_for_smt_demo** | Reconcile browser smoke evidence. | High | Codex/Antigravity | `Browser Smoke: PASSED WITH DASHBOARD INDEX ROUTE CAVEAT` |
| **must_fix_before_SMT** | Complete DP003B freshness validation and decide whether freshness is acceptable, stale, or unknown. | High | Data Engineer | Pending |
| **must_fix_before_final_QA** | Complete final live API/browser payload QA for wired Executive Overview suppression. | High | Codex/Cline/Data QA | Pending |
| **must_fix_before_final_QA** | Resolve MEL-001 indicator/activity linkage caveats or explicitly scope affected pages as demo/prototype. | High | M&E owner/Codex | `indicator_activity_linkage_review_passed_with_caveats` |
| **blocked_by_DP003B** | Enable DP004 route connection only after DP003B returns ready routes. | High | SRE | Blocked |
| **blocked_by_M&E_registry** | Publish final M&E registry status to allow dependent routes. | High | Technical Writer/M&E owner | Blocked |
| **blocked_by_privacy** | Obtain privacy/suppression sign-off before live sensitive or small-cell payloads are exposed. | High | Data Engineer/Privacy owner | Blocked |
| **do_not_touch** | `src/data/geo/nepal-map-base.ts` and related protected geography files. | N/A | All agents | Locked |
| **documentation** | Maintain final gate, handoff, MEL, and recovery evidence reports. | Medium | Codex/Antigravity | Current with caveats |

## Technical Recovery Status

Dependency recovery and build are reconciled as passed via local build sandbox evidence. The remaining technical caveat is the dashboard index route behavior, accepted for SMT demo with caveat and pending final live API/browser QA review.

## Still Blocked

DP-004, production, GBV/OCMC live activation, final live API/browser QA, and programme M&E validation remain blocked/pending.
