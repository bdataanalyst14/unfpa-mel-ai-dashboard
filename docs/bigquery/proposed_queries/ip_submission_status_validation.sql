-- Proposal / Not Executed
-- Expected Output: Status of submissions per IP, including sync times and total forms submitted.

SELECT
  ip_name,
  submission_status,
  COUNT(1) AS forms_submitted,
  MAX(latest_sync_time) AS last_sync
FROM `YOUR_PROJECT.YOUR_DATASET.ip_submission_status`
GROUP BY ip_name, submission_status
ORDER BY last_sync DESC;
