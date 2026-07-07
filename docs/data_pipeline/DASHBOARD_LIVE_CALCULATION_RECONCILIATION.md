# Dashboard Live Calculation Reconciliation

**Verification Date:** 2026-06-14
**Source Dataset:** `unfpadatabase.unfpadatabase`

## 1. Executive Overview
- **Metric:** Total Events
- **Current Mock Source:** `combined-summary.ts` -> 1200 (approx)
- **Live BigQuery Source:** `combined_activity_summary.event_count` (Sum) -> 1798
- **Readiness:** READY.
- **Mismatch:** Live data shows higher volume than mock.

- **Metric:** Total Participants
- **Current Mock Source:** `combined-summary.ts` -> 45000 (approx)
- **Live BigQuery Source:** `combined_activity_summary.total_reportable_participants` (Sum)
- **Readiness:** READY.

## 2. Participant Reach
- **Metric:** Sex Disaggregation
- **Live BigQuery Source:** `combined_activity_summary` columns: `male`, `female`, `other`.
- **Readiness:** READY.

- **Metric:** Age Disaggregation
- **Live BigQuery Source:** `combined_activity_summary` age columns (e.g., `age_15_19`, `age_25_49`).
- **Readiness:** READY.

## 3. Data Quality
- **Metric:** Quality Score
- **Live BigQuery Source:** `data_quality_summary` -> `records_with_quality_issue` / `total_rows`.
- **Readiness:** READY.

## 4. IP Performance
- **Metric:** Submission Timeliness
- **Live BigQuery Source:** `ip_submission_status` -> `latest_sync_time`.
- **Readiness:** READY.

## 5. Geographic Coverage
- **Metric:** Events per Palika
- **Live BigQuery Source:** `combined_activity_summary` -> `province1`, `district1`, `palika1`.
- **Readiness:** READY (requires mapping palika names to geojson keys).

## 6. Blocked Routes (Registry Dependent)
| Route | Reason for Blocking |
| :--- | :--- |
| `indicator-progress` | Depends on draft M&E registry for Target vs Actual mapping. |
| `activity-progress` | Activity names in BQ (`activity1`) are strings and need canonical mapping. |
| `gbv-ocmc-summary` | Requires privacy suppression audit (k=5). |
| `management-decision-centre` | Requires cross-view logic not yet finalized. |
| `activity-detail` | Requires M&E registry crosswalk. |
