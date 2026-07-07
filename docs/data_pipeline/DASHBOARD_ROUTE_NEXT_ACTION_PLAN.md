# Dashboard Route Next-Action Plan

This document outlines the transition plan for dashboard routes from mock to live data.

## 1. Category A: Immediate Transition (Post-DP-003)
These routes can move to live data as soon as DP-003 validation passes.

| Route | Next Safe Action | Required Data Source | Approval Gate |
| :--- | :--- | :--- | :--- |
| `executive-overview` | Connect aggregate counters | `combined_activity_summary` | DP-003 Success |
| `participant-reach` | Connect disaggregation charts | `combined_activity_summary` | DP-003 Success |
| `data-quality` | Connect quality score gauge | `data_quality_summary` | DP-003 Success |
| `ip-performance` | Connect submission timeline | `ip_submission_status` | DP-003 Success |
| `geographic-coverage` | Connect palika activity dots | `combined_activity_summary` | DP-003 Success |

## 2. Category B: Blocked Transition
These routes require additional approvals or logic finalized before connection.

| Route | Blocked By | Required Source | Next Technical Step |
| :--- | :--- | :--- | :--- |
| `indicator-progress` | M&E Registry Approval | `indicator_progress_summary` | Finalize Indicator Crosswalk |
| `activity-progress` | M&E Registry Approval | `combined_activity_summary` | Finalize Activity Crosswalk |
| `gbv-ocmc-summary` | Privacy Review | `combined_activity_summary` | Audit Suppression Logic |
| `management-decision-centre` | Risk Logic Definition | Multi-view | Define Risk Weighting |
| `activity-detail` | M&E Registry Approval | `combined_activity_summary` | Finalize M&E Mapping |

## 3. Implementation Workflow
1. **Validation:** Execute DP-003 read-only checks.
2. **Switching:** Update `src/lib/server/bigquery-dashboard-service.ts` to fetch from live views if `DATA_MODE=bigquery`.
3. **Verification:** User QA to compare dashboard UI with manual BigQuery query exports.
4. **Sign-off:** Data Engineer and M&E Lead technical sign-off.
