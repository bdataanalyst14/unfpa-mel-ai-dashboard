-- Proposal / Not Executed
-- Expected Output: Aggregated counts of events and participants per activity. 
-- Will require joining with M&E registry for canonical activity mapping later.

SELECT
  activity1 AS reported_activity_name,
  COUNT(1) AS number_of_reports,
  COALESCE(SUM(event_count), 0) AS events,
  COALESCE(SUM(total_reportable_participants), 0) AS participants
FROM `YOUR_PROJECT.YOUR_DATASET.combined_activity_summary`
GROUP BY reported_activity_name
ORDER BY events DESC;
