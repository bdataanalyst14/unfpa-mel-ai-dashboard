# Next Patch Plan For Approval

Audit date: 2026-06-18  
Status: approval plan only; no production code changes authorized in this pass  
Source of truth: `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`

## Critical Before Protected Preview

| Priority | Item | Why it is critical | Recommended owner |
| --- | --- | --- | --- |
| Critical | M&E approve registry/crosswalk scope for preview routes. | Registry-dependent routes cannot move to live data while status is `pending_user_validation`. | Human M&E owner |
| Critical | Decide all 90 inferred matches for preview scope. | Inferred links cannot drive live calculations without approval. | Human M&E owner |
| Critical | Map, exclude, or defer 331 unmatched activities. | Unmatched activities can distort denominators and activity totals. | Human M&E owner |
| Critical | Resolve or explicitly defer 83 NRCS/PeaceWin incomplete-source links. | Affected IP/indicator calculations are not authoritative. | Human M&E owner |
| Critical | Approve target/unit/cadence rules for any live progress route. | Progress, RAG status, and rankings depend on target semantics. | Human M&E owner |
| Critical | Approve route governance matrix. | Implementation agents need clear route-level permission boundaries. | Human M&E owner + Codex |
| Critical | Approve GBV/OCMC server-side suppression contract before any live GBV/OCMC work. | Raw small sensitive cells must never reach the browser. | Human M&E owner + Codex |
| Critical | Keep Executive Overview as the only current server-side BigQuery POC unless route approval expands. | Prevents accidental connection of blocked routes. | Codex |

## Important Before SMT/M&E Review

| Priority | Item | Why it matters | Recommended owner |
| --- | --- | --- | --- |
| Important | Produce a reviewed registry version summary with approved/deferred/excluded counts. | SMT/M&E need a concise evidence trail for what is live and what is incomplete. | Codex |
| Important | Prepare route-specific calculation notes for approved preview routes. | Reviewers need to understand denominators, exclusions, and limitations. | Codex |
| Important | Create M&E correction workbook or review-pack handoff if not already accepted. | Human reviewers need a structured way to return approvals/corrections. | Copilot CLI or Cline for document/data-prep support; human M&E owner for decisions |
| Important | Confirm safe aggregate API contracts for Category A routes. | Protects implementation from reaching into unapproved tables or fields. | Codex |
| Important | Verify protected-preview QA checklist reflects route readiness and blockers. | Prevents review of pages as final when they are blocked or mock-only. | Antigravity after approval; Codex audits |
| Important | Document known limitations in reviewer-facing release notes. | Avoids overclaiming completeness during SMT/M&E review. | Codex |

## Nice To Improve After First Publish

| Priority | Item | Why it helps | Recommended owner |
| --- | --- | --- | --- |
| Nice | Improve registry review UX with filters for inferred, unmatched, incomplete-source, and evidence gaps. | Speeds future M&E maintenance. | Antigravity |
| Nice | Add automated registry consistency checks in CI. | Reduces future regression risk. | Copilot CLI or Codex |
| Nice | Add route-level data freshness badges after contracts are stable. | Helps users interpret live aggregate data. | Antigravity |
| Nice | Add downloadable approved registry summary, excluding sensitive/raw data. | Supports transparent review without exposing unsafe data. | Antigravity + Codex audit |
| Nice | Add richer evidence workflow once evidence requirements are approved. | Strengthens accountability after first publish. | Cline or Antigravity, depending on UI scope |

## Recommended Agent Sequence

| Sequence | Agent | Work package | Start condition |
| ---: | --- | --- | --- |
| 1 | Human M&E owner | Approve/correct/defer registry gaps, targets, units, cadence, evidence, and route calculation rules. | Starts now using this audit package. |
| 2 | Codex | Audit returned M&E decisions, update governance docs, and prepare implementation instructions. | Starts after M&E decisions are returned. |
| 3 | Codex | Draft exact safe route connection contract and test checklist for approved routes only. | Starts after route sign-off is explicit. |
| 4 | Antigravity | Implement approved frontend route wiring and UX states for approved routes only. | Must wait for Codex implementation instructions and M&E sign-off. |
| 5 | Copilot CLI | Add focused tests, consistency checks, or mechanical registry validation helpers. | Starts after approved data contracts are stable. |
| 6 | Cline | Prepare structured documentation/review-pack updates or bounded non-route support tasks. | Starts when Codex assigns a narrow doc/data-prep scope. |
| 7 | Codex | Final audit of code diff, privacy boundaries, route readiness, and no-deploy status. | Starts after implementation/test patches. |

## Antigravity Start Decision

Antigravity implementation must wait for registry-dependent routes.

Antigravity may start only on explicitly approved, non-connecting UI polish or documentation-linked review UX tasks that do not import the registry, change dashboard routes, connect BigQuery, or touch GBV/OCMC live data. Live-data implementation for Activity Progress, Indicator Progress, IP Performance, Participant Reach, Geographic Coverage registry joins, Data Quality evidence scoring, Management Decision Centre, Activity Detail, and GBV/OCMC must wait for human M&E sign-off and Codex route-contract instructions.

