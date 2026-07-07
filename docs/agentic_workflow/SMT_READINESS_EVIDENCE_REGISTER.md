# SMT_READINESS_EVIDENCE_REGISTER

## Overview

The Evidence Register captures artefacts that demonstrate compliance with SMT readiness criteria. Each entry includes a brief description, location, type, and validation status.

| Evidence ID | Description | Location | Type | Validation Status |
|-------------|-------------|----------|------|--------------------|
| **E001** | DP003B freshness recovery script candidate | `docs/data_pipeline/FRESHNESS_RECOVERY_EXECUTION_LOG.md` | Admin-pending runbook/evidence | `refresh_script_candidate_ready_pending_admin` |
| **E002** | Server/API suppression utility, local verification runner, tests, Executive Overview service wiring, and circular type fix | `scripts/verify.js`; `src/lib/server/suppression.ts`; `src/lib/server/suppression.test.ts`; `src/lib/server/bigquery-dashboard-service.ts` | Source/Test Files | `suppression_tests_passed_pending_final_API_browser_QA` |
| **MEL-001** | Indicator/activity linkage content-readiness review | `docs/agentic_workflow/MEL_INDICATOR_ACTIVITY_LINKAGE_MATRIX.md`; `docs/agentic_workflow/MEL_DASHBOARD_CONTENT_QA_REPORT.md` | M&E Review | `indicator_activity_linkage_review_passed_with_caveats` |
| **MEL-AI** | AI-assisted provisional MEL alignment | `docs/agentic_workflow/MEL_AI_PROVISIONAL_ALIGNMENT_MATRIX.md`; `docs/agentic_workflow/MEL_AI_ALIGNMENT_DECISION_LOG.md`; `docs/agentic_workflow/MEL_DEMO_SCOPE_AND_CAVEAT_NOTE.md` | M&E Review | `provisional_alignment_completed_with_caveats` |
| **E003** | Geographic coverage map hash verification | `src/components/GeographicCoverageMap.tsx` (protected) | Code Hash | Verified/locked |
| **E004** | Privacy compliance checklist | `docs/privacy/privacy_checklist.md` | Document | Verified as required gate reference |
| **E005** | M&E registry status report | `docs/data_pipeline/m&e_registry_status.md` | Document | Draft, awaiting approval |
| **E006** | Codex local build evidence | `docs/agentic_workflow/CODEX_FINAL_TECHNICAL_EVIDENCE_VERIFICATION.md` | Technical Evidence | `Technical Build: PASSED` |
| **E007** | Browser smoke route table | `docs/agentic_workflow/FINAL_BROWSER_SMOKE_ROUTE_TABLE.md` | Browser Smoke Evidence | `Browser Smoke: PASSED WITH DASHBOARD INDEX ROUTE CAVEAT` |
| **E008** | Protected map file hashes | `src/data/geo/nepal-map-base.ts` and related files | SHA-256 Hashes | Verified/locked; no edit authorized |
| **E009** | Local build sandbox dependency recovery | `docs/agentic_workflow/LOCAL_BUILD_DEPENDENCY_RECOVERY_NOTE.md` | Technical Recovery Evidence | `dependency_recovery_passed` |

## Current SMT Readiness Summary

- Technical Build: `PASSED`.
- Browser Smoke: `PASSED WITH DASHBOARD INDEX ROUTE CAVEAT`.
- SMT Demo: `GO WITH CAVEATS`.
- E001 remains admin-pending.
- E002 final live API/browser suppression QA remains pending.
- DP-004 remains blocked.
- GBV/OCMC remains blocked for live activation.
- Production remains blocked.
- Programme M&E validation remains pending.

---

This register is maintained in `docs/agentic_workflow/SMT_READINESS_EVIDENCE_REGISTER.md`.
