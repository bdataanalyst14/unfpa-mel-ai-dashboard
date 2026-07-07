-- Proposal / Not Executed
-- Expected Output: Overall data quality score and breakdown of issue types.

SELECT
  SAFE_MULTIPLY(
    100,
    SAFE_DIVIDE(SUM(total_rows - records_with_quality_issue), NULLIF(SUM(total_rows), 0))
  ) AS overall_data_quality_score,
  SUM(missing_fields_count) AS total_missing_fields,
  SUM(duplicate_records_count) AS total_duplicates
FROM `YOUR_PROJECT.YOUR_DATASET.data_quality_summary`;
