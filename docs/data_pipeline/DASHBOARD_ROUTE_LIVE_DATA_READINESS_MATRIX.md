# Dashboard Route Live Data Readiness Matrix

This matrix classifies dashboard routes based on their readiness to connect to live BigQuery data.

## Category A: Ready for Live Aggregate Data
These routes have been validated against live BigQuery aggregate views.

| Route | BigQuery Source Candidate | Status | Readiness Gate |
| :--- | :--- | :--- | :--- |
| `executive-overview` | `combined_activity_summary` | **READY** | Connection Verified |
| `participant-reach` | `combined_activity_summary` | **READY** | Connection Verified |
| `data-quality` | `data_quality_summary` | **READY** | Connection Verified |
| `ip-performance` | `ip_submission_status` | **READY** | Connection Verified |
| `geographic-coverage` | `combined_activity_summary` | **READY** | Connection Verified |

## Category B: Blocked (Registry/Privacy Dependency)
These routes remain blocked even after credentials are provided.

| Route | Blocked By | Dependency | Next Safe Action |
| :--- | :--- | :--- | :--- |
| `indicator-progress` | M&E Registry | Canonical Indicator Codes + Targets | Await M&E Sign-off |
| `activity-progress` | M&E Registry | Canonical Activity Crosswalk | Await M&E Sign-off |
| `gbv-ocmc-summary` | Privacy Review | K-anonymity (n>=5) View Implementation | Privacy/Suppression Audit |
| `management-decision-centre` | Registry + Logic | Combined risk/performance logic | Logic Definition + Registry Sign-off |
| `activity-detail` | M&E Registry | Activity/Indicator mapping | Await M&E Sign-off |

**Next Action:** Prioritize Category A routes for initial live connection test once credentials are provided.
