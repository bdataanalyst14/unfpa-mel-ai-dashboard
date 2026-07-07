-- Proposal / Not Executed
-- Expected Output: Single row with aggregated totals for events, participants by sex, guests, and beneficiaries.

SELECT
  COALESCE(SUM(event_count), 0) AS total_events,
  COALESCE(SUM(total_reportable_participants), 0) AS reportable_participants,
  COALESCE(SUM(female), 0) AS female_participants,
  COALESCE(SUM(male), 0) AS male_participants,
  COALESCE(SUM(other), 0) AS other_participants,
  COALESCE(SUM(repeat_beneficiary_total), 0) AS beneficiaries,
  COALESCE(SUM(repeat_guest_total), 0) AS guests,
  COALESCE(SUM(repeat_nonreportable_total), 0) AS non_reportable_participants,
  COUNT(DISTINCT NULLIF(district1, '')) AS districts_covered,
  COUNT(DISTINCT NULLIF(ip_name, '')) AS ips_reporting
FROM `YOUR_PROJECT.YOUR_DATASET.combined_activity_summary`;
