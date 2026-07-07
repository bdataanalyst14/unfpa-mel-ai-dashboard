# KPI Logic Reference

This document outlines the definitions and calculation logic for each KPI used in the dashboard. The actual implementation should reside in utility modules under `src/utils/` and should not be hard‑coded in page files.

## Core KPIs

| KPI | Definition | Calculation Notes |
|-----|------------|-------------------|
| **Total Events** | Number of distinct event records logged. | Count unique event IDs.
| **Reportable Participants** | Participants who meet reporting criteria. | Filter participants by `reportable: true` flag.
| **Female Participants** | Reportable participants identified as female. | `sex === 'F'`.
| **Male Participants** | Reportable participants identified as male. | `sex === 'M'`.
| **Other Sex Participants** | Reportable participants with non‑binary or unspecified sex. | `sex === 'O'` or null.
| **Beneficiaries** | Participants who received a benefit. | `beneficiary: true`.
| **Guests** | Participants who attended but did not receive a benefit. | `beneficiary: false`.
| **Districts Covered** | Unique districts represented in the data. | Count distinct `district` values.
| **IPs Reporting** | Independent partners that have submitted data. | Count distinct `ip_id` where `reported: true`.
| **Evidence Completion Rate** | % of events with attached evidence. | `evidenceCount / totalEvents * 100`.
| **Activity Achievement Rate** | % of activities meeting target metrics. | `achievedCount / targetCount * 100`.
| **Indicator Achievement Rate** | % of indicators meeting target values. | `indicatorAchieved / indicatorTarget * 100`.
| **Data Quality Score** | Composite score based on validation checks. | Weighted average of individual check scores.
| **Missing Evidence** | Events lacking required evidence. | `totalEvents - evidenceCount`.
| **Validation Pending** | Events awaiting validation. | `status === 'pending'`.
| **Gender Check Failed** | Events where gender data is inconsistent. | `genderCheck === false`.
| **Age Check Failed** | Events where age data is inconsistent. | `ageCheck === false`.
| **Caste Check Failed** | Events where caste data is inconsistent. | `casteCheck === false`.

## Implementation Notes
* All KPI calculations should be pure functions.
* Use memoisation where appropriate to avoid recomputation.
* Expose a single `getKPI` function that accepts a KPI key and returns the value.
* Ensure that the logic is testable with unit tests.
