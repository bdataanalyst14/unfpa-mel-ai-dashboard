# KPI & Calculations Logic

This document details the methods used to calculate metrics from activity logs and aggregated summaries.

## Core Metrics Definitions

All calculations are implemented in [kpi-calculations.ts](file:///h:/My%20Drive/unfpa-mel-ai-dashboard/src/lib/kpi-calculations.ts).

### 1. Cumulative Reaches
- **Total Reached (Reportable Participants)**: The sum of all registered attendees in reportable categories across activities.
  $$\text{Total Participants} = \sum \text{femaleParticipants} + \text{maleParticipants} + \text{otherParticipants}$$
- **Direct Beneficiaries**: Reaches excluding guests and national stakeholders.
- **Stakeholders / Guests**: Reaches identified as observers, government coordinators, or non-target groups.

### 2. Implementation Rates
- **Activity Completion Rate**: Percentage of planned activities completed.
- **Average Activity Achievement**: Average of achievement rates reported across logged activities:
  $$\text{Avg Achievement} = \frac{\sum \text{achievementPct}}{\text{Total Activities}}$$

### 3. Data Quality & Compliance Indexes
- **Evidence Upload Rate**: Percentage of logged activities containing approved evidence files.
- **Late Reporting Ratio**: Percentage of activity logs uploaded more than 15 days after the activity completion date.
- **Disaggregation Integrity Rate**: Percentage of activities passing gender, age, and caste sum checks.
  $$\text{Integrity Rate} = \frac{\text{Passed Checks Count}}{\text{Total Activities}} \times 100$$
