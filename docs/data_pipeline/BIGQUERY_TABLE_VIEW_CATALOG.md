# BigQuery Table / View Catalog

Based on the pipeline repository SQL definitions (`H:\My Drive\unfpa_mel\sql`), the following tables/views exist or are configured:

| Table/View Name | Purpose | Grain | Safe for Dashboard | Required Suppression | Recommended Route Use | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `participants_flat_staging` | Raw data load | Participant / Repeating Group | **No** | Yes | None | raw_or_staging_do_not_use |
| `participants_flat` | Cleansed flat participant data | Participant / Repeating Group | **No** | Yes | None | restricted_gbv_sensitive |
| `activity_summary_flat_staging` | Raw summary load | Submission / Event | **No** | Conditional | None | raw_or_staging_do_not_use |
| `activity_summary_flat` | Cleansed flat summary | Submission / Event | **No** | Conditional | None | raw_or_staging_do_not_use |
| `combined_activity_summary` | Aggregated activity metrics | Aggregate (Activity/Geo) | **Yes** | Yes (GBV aggregate suppression if count < 5) | `executive-overview`, `activity-progress` | approved_dashboard_aggregate |
| `indicator_progress_summary` | Aggregate progress against targets | Aggregate (Indicator) | **Yes** | No (assuming targets are aggregated) | `indicator-progress` | approved_dashboard_aggregate |
| `data_quality_summary` | DQA checks and scores | Aggregate (Quality metrics) | **Yes** | No | `data-quality`, `executive-overview` | approved_dashboard_aggregate |
| `ip_submission_status` | IP report timelines and logs | IP / Submission log | **Yes** | No | `ip-performance`, `executive-overview` | approved_dashboard_aggregate |

**Important Restrictions:**
- Direct queries to `participants_flat` are strictly prohibited due to survivor-level data and PII risks.
- Dashboard queries must only target approved `_summary` aggregate views.
