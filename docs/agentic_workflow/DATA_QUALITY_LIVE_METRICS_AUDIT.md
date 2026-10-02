# Data Quality Live Metrics Audit

## Background
The previous historical 82.4% Data Quality score was derived from an unsafe aggregation over historical snapshots, which the production patch disabled. This audit identifies new production-safe Data Quality metrics that can be derived transparently from the existing read-only reporting objects. A composite Data Quality Score is NOT USED, as the weighting and formula for an overall score have not been independently validated.

## Data Source
The dashboard has access to:
1. `combined_activity_summary`: Contains aggregated metrics with fields such as `event_count`, `total_participants`, `project1`, `province1`, `district1`, `ip_name`.
2. `data_quality_summary`: Contains metadata such as `total_rows`, `records_with_quality_issue`, and `run_timestamp`.

## Implemented Completeness Formulas

### 1. Data Quality Validated Row Rate (Latest-Snapshot Isolation)
- **Metric**: Validated Rows Percentage
- **Numerator**: `SUM(total_rows) - SUM(records_with_quality_issue)`
- **Denominator**: `SUM(total_rows)`
- **Source**: `data_quality_summary`
- **Grain**: Latest/current snapshot only.
- **Null Handling**: Checked `> 0` to prevent division by zero.
- **Applicability**: System-wide metadata snapshot.
- **Snapshot Isolation Logic**:
  ```sql
  WHERE run_timestamp = (SELECT MAX(run_timestamp) FROM data_quality_summary)
  ```
  *This explicitly proves historical snapshots cannot be included in the current score.*

### 2. Geographic Completeness
- **Metric**: Geographic gaps (Activities missing province or district)
- **Numerator**: `COUNT(CASE WHEN NULLIF(TRIM(province1), '') IS NULL OR NULLIF(TRIM(district1), '') IS NULL THEN 1 END)`
- **Denominator**: `COUNT(1)` (Total matched rows/activity groupings)
- **Source**: `combined_activity_summary`
- **Grain**: Pre-aggregated reporting groupings.
- **Null Handling**: Combines province and district checks with `OR` into a single `CASE` to prevent double-counting a single row. Ensures percentages cannot exceed 100%.
- **Applicability**: Geography is a fundamental programmatic dimension; a missing geography legitimately flags a programmatic reporting gap.

### 3. Project Completeness
- **Metric**: Project gaps (Activities missing project association)
- **Numerator**: `COUNT(CASE WHEN NULLIF(TRIM(project1), '') IS NULL THEN 1 END)`
- **Denominator**: `COUNT(1)`
- **Source**: `combined_activity_summary`
- **Grain**: Pre-aggregated reporting groupings.
- **Null Handling**: Standard `NULLIF(TRIM())` check.
- **Applicability**: Legitimate programmatic reporting gap.

### 4. Partner Completeness
- **Metric**: Partner gaps (Activities missing implementing partner)
- **Numerator**: `COUNT(CASE WHEN NULLIF(TRIM(ip_name), '') IS NULL THEN 1 END)`
- **Denominator**: `COUNT(1)`
- **Source**: `combined_activity_summary`
- **Grain**: Pre-aggregated reporting groupings.
- **Null Handling**: Standard `NULLIF(TRIM())` check.
- **Applicability**: Legitimate programmatic reporting gap.

## Conclusion
All formulas correctly handle nulls, prevent double counting, explicitly isolate latest snapshots, and do not conflate participant-level grains with activity-level summaries.
