# Dashboard Calculation Audit

## 1. Executive Overview
- **Current Source:** Mock Data via `combined-summary.ts`, AI Insights via `ai-insights.ts`. BigQuery logic exists in `src/lib/server/bigquery-dashboard-service.ts`.
- **Current Formula:** Sum of events, reportable participants, females, males, others, guests, beneficiaries from `combined_activity_summary`.
- **Expected BigQuery Source:** `combined_activity_summary` for counts, `data_quality_summary` for quality score, `ip_submission_status` for freshness.
- **Calculation Risk:** High if `district1` and `ip_name` mapping are inconsistent between M&E and Kobo Forms.
- **Readiness for Live Data:** Ready for aggregate operational counts, but indicator statuses are blocked.
- **M&E Registry Approval Required:** Yes, for final activity/indicator crosswalking logic.
- **Validation Query Needed:** `executive_overview_validation.sql`

## 2. Activity Progress
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `combined_activity_summary`.
- **Calculation Risk:** Medium. Activities need to map to canonical M&E activity codes.
- **Readiness:** Blocked pending M&E registry crosswalk.
- **M&E Registry Approval Required:** Yes.
- **Validation Query Needed:** `activity_progress_validation.sql`

## 3. Participant Reach
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `combined_activity_summary`.
- **Calculation Risk:** Low. Basic aggregations of sex, age, and disability.
- **Readiness:** Ready for aggregate reporting.
- **M&E Registry Approval Required:** No.
- **Validation Query Needed:** `participant_reach_validation.sql`

## 4. Indicator Progress
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `indicator_progress_summary`.
- **Calculation Risk:** High. Target vs Actuals calculation requires exact canonical indicator keys.
- **Readiness:** Blocked pending M&E registry.
- **M&E Registry Approval Required:** Yes.
- **Validation Query Needed:** `indicator_progress_registry_dependent_validation.sql`

## 5. IP Performance
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `ip_submission_status`, `data_quality_summary`.
- **Calculation Risk:** Low. Based on submission logs.
- **Readiness:** Ready.
- **M&E Registry Approval Required:** No.
- **Validation Query Needed:** `ip_submission_status_validation.sql`

## 6. Geographic Coverage
- **Current Source:** Mock Data, static geography files (`nepal-map-base.ts`).
- **Expected BigQuery Source:** `combined_activity_summary` grouped by `district1` / `palika1`.
- **Calculation Risk:** Low, but map keys must match palika spelling exactly.
- **Readiness:** Ready.
- **M&E Registry Approval Required:** No.
- **Validation Query Needed:** `geographic_coverage_validation.sql`

## 7. GBV OCMC Summary
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `combined_activity_summary` (suppressed versions).
- **Calculation Risk:** **CRITICAL**. Requires k-anonymity / suppression rule enforcement (k=5).
- **Readiness:** Blocked pending privacy review and final suppression implementation in BigQuery.
- **M&E Registry Approval Required:** Yes.
- **Validation Query Needed:** `gbv_suppression_validation.sql`

## 8. Data Quality
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `data_quality_summary`.
- **Calculation Risk:** Low.
- **Readiness:** Ready.
- **M&E Registry Approval Required:** No.
- **Validation Query Needed:** `data_quality_validation.sql`

## 9. Management Decision Centre
- **Current Source:** Mock data.
- **Expected BigQuery Source:** Multi-view aggregation (Quality, Progress, Submission).
- **Calculation Risk:** Medium.
- **Readiness:** Blocked.
- **M&E Registry Approval Required:** Yes.

## 10. Activity Detail
- **Current Source:** Mock data.
- **Expected BigQuery Source:** `combined_activity_summary`.
- **Calculation Risk:** Medium.
- **Readiness:** Blocked pending M&E registry mappings.
- **M&E Registry Approval Required:** Yes.
