# Dashboard Live Route Connection Decision

**Status Date:** 2026-06-14

## Category A: Ready for Safe Aggregate Connection
These routes can proceed to live data connection as they rely on verified aggregate views.

| Route | Decision | Source | Next Agent Task |
| :--- | :--- | :--- | :--- |
| `executive-overview` | **READY** | `combined_activity_summary` | Connect via `bigquery-dashboard-service.ts` |
| `participant-reach` | **READY** | `combined_activity_summary` | Map disaggregation columns |
| `data-quality` | **READY** | `data_quality_summary` | Connect quality score gauge |
| `ip-performance` | **READY** | `ip_submission_status` | Connect submission timeline |
| `geographic-coverage` | **READY** | `combined_activity_summary` | Map Palika counts to map points |

## Category B: Blocked / Pending Sign-off
These routes remain blocked due to external dependencies.

| Route | Status | Dependency |
| :--- | :--- | :--- |
| `indicator-progress` | **BLOCKED** | M&E Registry Sign-off (Targets vs Actuals) |
| `activity-progress` | **BLOCKED** | M&E Registry Sign-off (Canonical Activity Mapping) |
| `gbv-ocmc-summary` | **BLOCKED** | Privacy Suppression Audit (k=5) |
| `management-decision-centre` | **BLOCKED** | Registry + Logic Finalization |
| `activity-detail` | **BLOCKED** | M&E Registry Sign-off |

**Decision Conclusion:** Proceed with safe aggregate connection for Category A routes. Maintain Category B on mock data until registry approval.
