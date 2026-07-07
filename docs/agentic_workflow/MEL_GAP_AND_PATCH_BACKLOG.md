# MEL Gap And Patch Backlog

Date: 2026-06-29
Gate: MEL-001 `indicator_activity_linkage_review_passed_with_caveats`
AI alignment: `provisional_alignment_completed_with_caveats`

## Critical Backlog

| ID | Gap | Affected pages | Required patch | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| MEL-GAP-001 | Displayed CPD/UNSDCF/SP codes do not exact-match approved registry/crosswalk records. | Indicator Progress, Management Decision Centre, Executive Overview chart drillthrough | Replace mock codes with approved registry IDs/codes or create an approved display-code crosswalk. | M&E owner + Codex | Pending |
| MEL-GAP-002 | Synthetic activity rows are not linked to activity registry or crosswalk. | Activity Detail, Activity Progress, Data Quality, Management Decision Centre | Replace `main-data.ts`/hard-coded rows with approved registry/crosswalk records, or label as demo. | M&E owner + Codex | Pending |
| MEL-GAP-003 | Crosswalk not approved: 331 unmatched activities, 83 incomplete-source records, 504 rows requiring M&E review. | Registry-dependent pages | Complete M&E review and source workbook corrections. | M&E owner | Pending |
| MEL-GAP-004 | Metric definitions/calculations/frequency/disaggregation are incomplete for final QA. | All pages | Add a metric dictionary with formula, source, frequency, disaggregation, owner, and caveat status. | M&E owner + Data engineer | Pending |
| MEL-GAP-005 | Hard-coded demo arrays can be mistaken for live values. | Participant Reach, Geographic Coverage, Activity Progress, Indicator Progress, IP Performance, Data Quality | Add visible demo/prototype labeling or replace with approved sources. | Product/Codex | Partially patched with caveat labels |
| MEL-GAP-006 | GBV/OCMC uses mock raw values with client-side display suppression and unsuppressed derived referral rates. | GBV/OCMC Summary | Keep blocked; require server-side suppressed aggregate source and API/browser payload inspection. | Privacy owner + Data engineer | Blocked |
| MEL-GAP-007 | Unsupported narrative/claim risk. | Management Decision Centre, SMT docs | Mark AI insights and donor narrative as illustrative until sourced from approved indicators and activity evidence. | M&E owner + Comms | Partially patched with caveat labels |
| MEL-GAP-008 | Live geography/DP-004 claim risk. | Geographic Coverage, SMT docs | Preserve `demo_ready_with_caveats`; do not claim live geography or DP-004 clearance. | SRE/Product | Pending |
| MEL-GAP-009 | AI provisional matches need programme validation. | Indicator Progress, Management Decision Centre | Validate CPD-13 high-confidence provisional match and CPD-05/06/08/12/19/20 medium-confidence provisional matches. | M&E owner | Pending |

## Before Final API/Browser QA

- Resolve MEL-GAP-001 through MEL-GAP-004, or explicitly scope affected pages out as demo/prototype.
- Keep MEL-GAP-006 blocked for live GBV/OCMC activation.
- Preserve E001 freshness and E002 final API/browser suppression QA as separate gates.
- Treat AI provisional mappings as demo safety aids, not final programme sign-off.

## Recommended Sequence

1. Programme/M&E owner validates provisional AI matches.
2. Data engineer confirms source fields, formulas, frequency, and disaggregation.
3. Codex replaces demo indicators/activities only after approved registry mapping exists.
4. Privacy owner confirms suppression rules for GBV/OCMC and small-cell operational aggregates.
5. Rerun final API/browser QA only after caveats are visible or affected pages are scoped as demo.
