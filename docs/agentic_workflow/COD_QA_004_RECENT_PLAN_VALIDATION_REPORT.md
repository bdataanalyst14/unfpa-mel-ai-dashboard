# COD-QA-004 Recent Plan Validation Report

QA date/time: 2026-06-20 00:16:15 +05:45

## 1. Overall QA Decision

Final decision: **A. Plan Valid - Proceed to DP-003B Gate** and **D. DP-004 Blocked - Freshness/Suppression/M&E Gate Still Open**.

The 2026-06-20 remaining-work plan is valid as a gated execution plan. It correctly prevents DP-004 route connection until DP-003B verifies freshness and suppression. No production deployment is authorized.

## 2. Files Reviewed

- `UNFPA_MEL_DASHBOARD_REMAINING_WORK_PLAN_2026-06-20.md`
- `PROJECT_PLAN_AND_PROGRESS_TRACKER.md`
- `README.md`
- `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`
- `docs/agentic_workflow/M&E_REGISTRY_DECISION_MATRIX_FOR_SIGNOFF.md`
- `docs/agentic_workflow/ROUTE_GOVERNANCE_MATRIX.md`
- `docs/agentic_workflow/GBV_OCMC_SUPPRESSION_REQUIREMENTS.md`
- `docs/data_pipeline/BIGQUERY_15IP_AUTOMATIC_REFRESH_VERIFICATION.md`
- `docs/data_pipeline/BIGQUERY_CONNECTION_AUDIT.md`
- `docs/data_pipeline/BIGQUERY_PRIVACY_SUPPRESSION_VALIDATION.md`
- `docs/data_pipeline/BIGQUERY_TABLE_VIEW_CATALOG.md`
- `docs/data_pipeline/DASHBOARD_LIVE_ROUTE_CONNECTION_DECISION.md`
- `docs/data_pipeline/DASHBOARD_ROUTE_LIVE_DATA_READINESS_MATRIX.md`
- `docs/data_pipeline/DP_003_LIVE_READ_ONLY_VALIDATION_PROMPT.md`
- `docs/data_pipeline/DP_003_LIVE_READ_ONLY_VALIDATION_RUNBOOK.md`
- `docs/data_pipeline/DP_004_SAFE_AGGREGATE_ROUTE_CONNECTION_PROMPT.md`
- `docs/registry-validation/GBV_SUPPRESSION_PRODUCTION_NOTE.md`
- `docs/registry-validation/SOURCE_REGISTRY_AUDIT_COUNTS.md`
- `docs/IMPLEMENTATION_REPORT.md`
- `docs/TESTING_CHECKLIST.md`
- `src/lib/server/bigquery-client.ts`
- `src/lib/server/bigquery-dashboard-service.ts`
- `src/lib/privacy-rules.ts`
- Dashboard route files under `src/app/dashboard`
- Data pipeline SQL definitions under `H:\My Drive\unfpa_mel\sql`

## 3. Achieved Work Validation

| Claim | QA status | Evidence / note |
| --- | --- | --- |
| BigQuery connected | Verified by documentation | `BIGQUERY_CONNECTION_AUDIT.md` says credentials were available and safe aggregate views were accessible on 2026-06-14. This QA did not reconnect or query BigQuery. |
| 15 IPs represented | Verified by documentation | `BIGQUERY_15IP_AUTOMATIC_REFRESH_VERIFICATION.md` lists 15 IPs and 1,798 total activity records. |
| Aggregate views identified | Verified | Safe/approved aggregate candidates are documented: `combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`. |
| Executive Overview POC | Verified in code | `getExecutiveOverviewData()` queries only aggregate tables when `DATA_MODE=bigquery`; other target/status/AI content remains prototype-labelled. |
| Geography map protection | Verified | Protected hashes currently match both before/after hash files. No protected geography file was edited. |
| GBV/privacy safeguards | Partially verified | Client/mock display suppression exists, but server/API suppression for live data is not implemented or proven. |
| Build/lint status | Previously verified only | Historical docs show build/lint passed in a temp copy. This QA did not rerun npm/build/lint to avoid H-drive performance and because no code was changed. |
| No production deployment | Verified by current review scope | No deployment command was run in this QA. Historical docs note preview-only controls and a removed accidental production-target deployment. |

## 4. Plan Validation

Status: **Valid**.

The recent plan correctly supersedes older DP-004 wording that marked Category A routes as immediately READY. The newer plan is more conservative and aligns with privacy/governance requirements by requiring DP-003B before any DP-004 route connection.

DP-003B must run before DP-004 because:

- latest sync is documented as 2026-05-15 and has not been revalidated as fresh or acceptable;
- `combined_activity_summary` contains raw aggregate counts;
- server/API suppression is not implemented for candidate route payloads;
- M&E registry remains `pending_user_validation`;
- GBV/OCMC is separately blocked pending privacy sign-off and suppressed aggregate source approval.

## 5. Route Readiness Matrix

| Route | QA classification | Reason |
| --- | --- | --- |
| `/dashboard/executive-overview` | conditional_after_freshness_gate + conditional_after_suppression_gate | Current limited aggregate POC exists, but live exact counts from `combined_activity_summary` are not proven suppression-safe under filters. Target/status additions remain blocked by registry. |
| `/dashboard/participant-reach` | conditional_after_freshness_gate + conditional_after_suppression_gate | Currently mock/client route. Live reach disaggregations require aggregate contract, allowed dimensions, and server/API suppression before browser payloads. |
| `/dashboard/data-quality` | conditional_after_freshness_gate + conditional_after_suppression_gate | Currently mock/client route. Aggregate facts may be candidates, but evidence scoring remains registry-dependent and blocked. |
| `/dashboard/ip-performance` | conditional_after_freshness_gate + conditional_after_suppression_gate | Currently mock/client route. IP submission status can be aggregate-safe after freshness gate; rankings/target comparisons remain blocked by registry/target rules. |
| `/dashboard/geographic-coverage` | conditional_after_freshness_gate + conditional_after_suppression_gate | Existing protected map route is present and must be preserved. Live geography aggregates require suppression and no unapproved registry/geography joins. |
| `/dashboard/indicator-progress` | blocked_by_registry | Requires approved indicator registry, crosswalks, targets, units, cadence, and NRCS/PeaceWin decisions. |
| `/dashboard/activity-progress` | blocked_by_registry | Requires approved activity registry, crosswalks, target treatment, unmatched activity treatment, and calculation rules. |
| `/dashboard/gbv-ocmc-summary` | blocked_by_privacy + blocked_by_registry | Requires pre-suppressed aggregate source, server-side/API suppression, privacy sign-off, tests, and approved service route contract. |
| `/dashboard/management-decision-centre` | blocked_by_registry | Requires approved decision rules, thresholds, evidence rules, unresolved-gap treatment, and target logic. |
| `/dashboard/activity-detail` | blocked_by_registry + blocked_by_privacy | Requires approved activity registry, field allowlist, PII/internal-ID exclusion, and unmatched activity treatment. |

No route should be classified `ready_for_connection` at this time.

## 6. Privacy/Suppression Gate Status

Status: **Open / not passed**.

Findings:

- `src/lib/privacy-rules.ts` provides display formatting for small counts, but it returns strings for frontend display and does not prevent raw values from existing in client data or API JSON.
- `src/app/dashboard/gbv-ocmc-summary/page.tsx` uses mock `gbvServiceData` and client-side formatting; this is not acceptable for live sensitive data.
- `src/lib/server/bigquery-dashboard-service.ts` returns exact aggregate counts for Executive Overview and participant sex data.
- The pipeline SQL reviewed for aggregate summaries does not show k-anonymity suppression fields such as `display_value`, `suppressed`, or `suppression_reason`.
- `BIGQUERY_PRIVACY_SUPPRESSION_VALIDATION.md` explicitly states `combined_activity_summary` appears to contain raw aggregate counts and recommends view/API suppression before frontend exposure.

Minimum required gate before DP-004:

- suppress non-zero counts from 1 to 4 server-side/API-side before browser rendering;
- return safe display fields/flags only for suppressed values;
- suppress derived metrics when numerator or denominator is unsafe;
- verify no exact small values appear in JSON payloads, chart datasets, exports, logs, or cache;
- keep GBV/OCMC disconnected until separate privacy sign-off.

## 7. Freshness Gate Status

Status: **Open / not passed**.

The latest documented sync date is `2026-05-15 18:49:44.146481+00:00` across all 15 IPs in `ip_submission_status`. This may be acceptable only if no newer submissions exist, but that has not been validated in this QA.

DP-003B should classify freshness as:

- `fresh`
- `acceptable_with_note`
- `stale_needs_pipeline_check`
- `unknown_needs_admin_review`

Until that classification exists, DP-004 remains blocked.

## 8. Agent Assignment Matrix

| Remaining task | Assigned agent/tool | Rationale |
| --- | --- | --- |
| DP-003B freshness and suppression gate | Gemini CLI | Best fit for read-only BigQuery metadata, aggregate freshness, schema, and suppression validation. |
| Route governance and data-contract review | Codex | Best fit for repository QA, route contracts, server/API integration planning, and guardrails. |
| Minimal server/API suppression implementation, if DP-003B says needed | Cline or Codex, one agent only | Should be a small targeted implementation with explicit file allowlist and tests. |
| Visual dashboard QA after gates/build pass | Antigravity | Best fit for preview screenshot/UX consistency checks. Must not touch protected map files. |
| Human M&E decision briefing | NotebookLM or human review workflow | Best fit for summarizing decision pack and registry approval questions. |

## 9. Documentation Gaps / Contradictions

Contradictions found:

- Older `DASHBOARD_LIVE_ROUTE_CONNECTION_DECISION.md` and `DASHBOARD_ROUTE_LIVE_DATA_READINESS_MATRIX.md` mark Category A routes as READY.
- The newer 2026-06-20 plan correctly downgrades these routes to conditional pending DP-003B freshness and suppression gates.
- `DP_004_SAFE_AGGREGATE_ROUTE_CONNECTION_PROMPT.md` still says to connect five Category A routes and does not explicitly require DP-003B output before connection.
- Some docs treat "aggregate" as sufficient for safety, while suppression docs correctly state raw small aggregate cells can still be unsafe.

Recommended documentation fixes after DP-003B:

- Update DP-004 prompt to consume only explicit `go_for_DP004` routes from DP-003B.
- Update readiness matrices so Category A routes are not labelled READY until freshness and suppression gates pass.
- Add a suppression implementation plan if DP-003B confirms API/view suppression is missing.

## 10. Code / Build / Repo Safety Status

- No build/lint was run in this QA pass.
- Historical reports show `npm run build` and `npm run lint` passed in temp copies.
- No `.env.local` was read or modified.
- No credential values were printed.
- No hardcoded private key or service account secret was found in the scanned repo files, excluding `node_modules`, lockfile, CSV, and XLSX.
- BigQuery imports are server-only; no client route imports `@google-cloud/bigquery`.
- `DATA_MODE` defaults to `mock`, and BigQuery failures return labelled mock fallback.
- The dashboard folder is not currently a Git repository, so local `git status` could not be used for source-diff validation.
- The data pipeline repo is a Git repository; status command returned no visible short-status changes.

## 11. Protected Geography Status

Status: **Protected / unchanged**.

Current protected file hashes match the recorded before/after hash files:

- `src/data/geo/nepal-map-base.ts`
- `src/components/GeographicCoverageMap.tsx`
- `src/data/mock/geographic-map-metrics.ts`
- `scripts/generate-nepal-map-base.py`
- `src/app/dashboard/geographic-coverage/page.tsx`

No map/ArcGIS/shapefile/GeoJSON/TopoJSON file was edited.

## 12. Exact Next Prompt To Run

```powershell
cd "H:\My Drive\unfpa-mel-ai-dashboard"
gemini -p "@docs\data_pipeline\DP_003B_FRESHNESS_SUPPRESSION_ROUTE_GATE_PROMPT.md"
```

If the prompt file does not exist, create it from the DP-003B prompt embedded in `UNFPA_MEL_DASHBOARD_REMAINING_WORK_PLAN_2026-06-20.md`, then run the same command.

Required DP-003B final status must be one of:

- `Ready for DP-004 Safe Aggregate Route Connection`
- `Conditional: Suppression Needed Before DP-004`
- `Conditional: Freshness Confirmation Needed Before DP-004`
- `Blocked by Privacy/Freshness Gate`

## 13. Confirmation No Unsafe Actions Were Performed

- Did not run `vercel --prod`.
- Did not deploy.
- Did not reconnect BigQuery.
- Did not create, replace, or modify BigQuery tables/views.
- Did not query raw/staging/person-level/survivor-level rows.
- Did not print credentials.
- Did not modify `.env.local`.
- Did not connect any dashboard route.
- Did not approve the M&E registry.
- Did not modify protected geography/map files.
- Did not copy over or overwrite the main repo.

## 14. Final Go/No-Go Status

Go for: **DP-003B freshness and suppression validation only**.

No-go for: **DP-004 route connection**, **GBV/OCMC live activation**, **registry-dependent routes**, and **production deployment**.

