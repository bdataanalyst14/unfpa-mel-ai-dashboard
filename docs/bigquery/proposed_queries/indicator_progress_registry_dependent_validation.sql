-- Proposal / Not Executed
-- Expected Output: Progress vs Target for Indicators. 
-- NOTE: Blocked by M&E registry crosswalk. This query assumes mapping is complete.

SELECT
  indicator_code,
  indicator_name,
  SUM(actual_value) AS total_actual,
  MAX(target_value) AS total_target,
  SAFE_DIVIDE(SUM(actual_value), MAX(target_value)) AS progress_percentage
FROM `YOUR_PROJECT.YOUR_DATASET.indicator_progress_summary`
GROUP BY indicator_code, indicator_name;
