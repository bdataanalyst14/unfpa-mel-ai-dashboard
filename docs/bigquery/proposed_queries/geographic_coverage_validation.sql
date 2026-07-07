-- Proposal / Not Executed
-- Expected Output: Participant and event aggregation grouped by province and district for mapping.

SELECT
  province1,
  district1,
  COALESCE(SUM(event_count), 0) AS total_events,
  COALESCE(SUM(total_reportable_participants), 0) AS participants_reached
FROM `YOUR_PROJECT.YOUR_DATASET.combined_activity_summary`
GROUP BY province1, district1
ORDER BY province1, district1;
