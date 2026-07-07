-- Proposal / Not Executed
-- Expected Output: Breakdown of participants by age group and disability status to validate reach accuracy.

SELECT
  combined_age AS age_group,
  disability_status,
  COALESCE(SUM(total_reportable_participants), 0) AS participants_reached
FROM `YOUR_PROJECT.YOUR_DATASET.combined_activity_summary`
GROUP BY age_group, disability_status
ORDER BY participants_reached DESC;
