# Event Count Uniqueness Audit

## Trace and Formula
Currently, the "Total Events" metric (e.g. `4,663`) is calculated in the Next.js `dashboard-page-data-service.ts` using the SQL formula:
```sql
COALESCE(SUM(event_count), 0) AS total_events
```
This is pulled directly from the BigQuery view `combined_activity_summary`.
This query represents a sum of aggregated counts over grouped rows, not a strict unique ID count.

## Canonical Grain & Unique Key
Based on the approved BigQuery contract (which exposes only 6 approved objects), the dashboard receives *already aggregated* tabular data. 
There is NO stable canonical primary key (such as `_uuid`, `submission_id`, or `event_id`) passed through `combined_activity_summary`.
The grain of `combined_activity_summary` is typically the intersection of `(province, district, palika, project, ip, reporting_year, report_quarter)`.

## Semantic Conclusion
`event_count` represents occurrences/implementation events of activities, but because the dashboard queries a pre-aggregated summary table rather than raw submission records, we cannot run a `COUNT(DISTINCT event_id)` validation.

If an upstream activity inherently targets multiple demographic disaggregations or municipalities, its underlying `event_count` might have been grouped or counted in multiple rows depending on how `combined_activity_summary` was constructed.
For example, one activity type implemented 100 times must not be described as 100 unique activities.

Because the number is an aggregate volume of implementation occurrences rather than a verified distinct list of physical implementations, labelling it "Total Events" or "Unique Activities" is misleading.
The metric MUST be renamed to **"Reported Activities"** to accurately reflect its semantic reality: an aggregate tally provided by the source view, rather than a deduplicated unique activity log.

## Verification
- **Production Correction Required**: YES (Terminology updated system-wide).
- **Final Metric Name**: `Reported Activities`.
- **Unique count claim removed**: YES.
