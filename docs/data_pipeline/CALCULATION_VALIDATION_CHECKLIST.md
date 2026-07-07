# Calculation Validation Checklist

This checklist defines the validation steps required to ensure dashboard calculations match BigQuery source data.

## 1. Operational KPI Validation
| Metric | Credential-Free Check Possible? | BigQuery Read-Only Check Required? | M&E Registry Approval Required? |
| :--- | :--- | :--- | :--- |
| Total Events | ❌ No | ✅ Yes | ❌ No |
| Total Participants | ❌ No | ✅ Yes | ❌ No |
| Participants by Sex | ❌ No | ✅ Yes | ❌ No |
| Participants by Disability | ❌ No | ✅ Yes | ❌ No |
| Data Quality Score | ❌ No | ✅ Yes | ❌ No |
| IP Submission Count | ❌ No | ✅ Yes | ❌ No |

## 2. Programmatic Progress Validation
| Metric | Credential-Free Check Possible? | BigQuery Read-Only Check Required? | M&E Registry Approval Required? |
| :--- | :--- | :--- | :--- |
| Activity Progress % | ❌ No | ✅ Yes | ✅ Yes |
| Indicator Achievement % | ❌ No | ✅ Yes | ✅ Yes |
| Completed Activities | ❌ No | ✅ Yes | ✅ Yes |
| Target vs Achievement | ❌ No | ✅ Yes | ✅ Yes |

## 3. Privacy & Security Validation
| Metric | Privacy Review Required? | BigQuery Audit Required? |
| :--- | :--- | :--- |
| GBV Indicator Suppression (n<5) | ✅ Yes | ✅ Yes |
| Participant Level Exposure | ✅ Yes | ✅ Yes |

## 4. Specific Validation Steps
1. **Aggregate Tie-out:** Compare Dashboard `totalEvents` with `SUM(event_count)` from `combined_activity_summary`.
2. **Disaggregation Accuracy:** Compare Dashboard sex-breakdown percentages with calculated percentages from `combined_activity_summary`.
3. **Geo-Mapping Validation:** Verify that Dashboard Palika-level counts match BigQuery counts for a sample of 5 Palikas.
4. **Registry Crosswalk Check:** For one IP, manually verify that reported `activity1` strings correctly map to the canonical `activity_code` in the finalized M&E registry.
5. **Suppression Verification:** Execute `gbv_suppression_validation.sql` and ensure result set is empty.
