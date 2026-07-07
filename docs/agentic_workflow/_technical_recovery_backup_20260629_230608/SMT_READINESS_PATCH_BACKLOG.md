# SMT_READINESS_PATCH_BACKLOG

## Overview

The patch backlog tracks required code changes, documentation updates, and other actions needed to achieve SMT readiness while respecting protected files and operational constraints.

| Category | Description | Priority | Owner | Status |
|----------|-------------|----------|-------|--------|
| **must_fix_before_SMT** | Complete DP003B freshness validation and decide whether freshness is acceptable, stale, or unknown. | High | Data Engineer | Pending |
| **completed_pending_QA** | Add approved lightweight suppression verification runner and run `nnpm run test:verify`. | High | Codex | suppression_tests_passed_pending_final_API_browser_QA |
| **must_fix_before_SMT** | Run sandbox build/type-check with complete dependencies after suppression test runner closeout. | High | Antigravity A | Pending |
| **must_fix_before_SMT** | Complete final API/browser payload QA for wired Executive Overview suppression. | High | Codex/Cline | Pending |
| **must_fix_before_final_QA** | Resolve MEL-001 indicator/activity linkage caveats or explicitly scope affected pages as demo/prototype. | High | M&E owner/Codex | indicator_activity_linkage_review_passed_with_caveats |
| **completed_pending_QA** | Wire server/API suppression into `src/lib/server/bigquery-dashboard-service.ts` without route/page edits. | High | Codex | suppression_tests_passed_pending_final_API_browser_QA |
| **blocked_by_DP003B** | Enable DP004 route connection only after DP003B returns ready routes. | High | SRE | Blocked |
| **blocked_by_M&E_registry** | Publish final M&E registry status to allow dependent routes. | High | Technical Writer | Blocked |
| **blocked_by_privacy** | Obtain privacy/suppression sign-off before live sensitive or small-cell payloads are exposed. | High | Data Engineer | Blocked |
| **do_not_touch** | `src/data/geo/nepal-map-base.ts` and related protected geography files. | N/A | All agents | Locked |
| **documentation** | Update SMT final docs and issue register. | Medium | Antigravity | Completed |
## Notes

- Isolated suppression files exist at `src/lib/server/suppression.ts` and `src/lib/server/suppression.test.ts`.
- Suppression is wired into the existing Executive Overview BigQuery service only.
- The circular suppression record type alias has been replaced and `nnpm run test:verify` now passes locally.
- E001 is `refresh_script_candidate_ready_pending_admin`.
- E002 must not be marked implemented until sandbox build, final API/browser payload QA, and privacy review pass.
- No changes to `.env.local`, BigQuery connections, deployment settings, or protected map files are allowed.

---

This backlog is maintained in `docs/agentic_workflow/SMT_READINESS_PATCH_BACKLOG.md`.

## MEL-001 Content Linkage Gate

MEL-001 status: indicator_activity_linkage_review_passed_with_caveats.
Required backlog details are maintained in docs/agentic_workflow/MEL_GAP_AND_PATCH_BACKLOG.md.


## MEL-AI Provisional Alignment

MEL-AI status: provisional_alignment_completed_with_caveats. Exact registry matches remain 0; one high-confidence and six medium-confidence provisional matches require programme validation. Technical testing may proceed with MEL caveats, but production remains blocked.


## MEL AI Alignment Technical Test Summary

- 
npm run test:verify: passed, 19 checks.
- 
npm run build: failed before compilation because 
ext is not recognized in the clean sandbox; 
ode_modules is absent and package-lock.json is 1 byte.
- Browser smoke testing: not run because build did not pass.
- No install, ci, node_modules repair, deployment, refresh script, BigQuery query, credential access, .env edit, protected map/geography edit, live data claim, live geography claim, DP-004 clearance, or production readiness claim was made.


