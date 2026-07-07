-- Proposal / Not Executed
-- Expected Output: Validates that no GBV-related record is shown with a count < 5 (k-anonymity check).

SELECT
  district1,
  palika1,
  event_type,
  SUM(total_reportable_participants) AS count_participants
FROM `YOUR_PROJECT.YOUR_DATASET.combined_activity_summary`
WHERE is_gbv_sensitive = TRUE
GROUP BY district1, palika1, event_type
HAVING count_participants < 5;
-- This query should return ZERO rows if suppression is correctly applied.
