# DATA_ENGINEER_SQL_PIPELINE_EVIDENCE_REVIEW

## Aggregate Views Reviewed

| View | Source Table(s) | IP Identifier | Reporting Period Columns | Update / Sync Timestamp | Aggregate Count Fields | Suppression Fields | Freshness / Status |
|------|----------------|---------------|------------------------|------------------------|-----------------------|--------------------|--------------------|
| `combined_activity_summary` | `participants_flat` (raw) & `activity_summary_flat` (summary) | None (aggregated) | `reporting_year1`, `report_quarter1` | No explicit timestamp column – relies on source table freshness | `event_count`, `total_participants`, `total_reportable_participants`, gender & age breakdowns | **None** – raw counts are exposed | Depends on underlying source tables; latest sync date from `ip_submission_status` (see below) |
| `indicator_progress_summary` | `combined_activity_summary` | None | `reporting_year1`, `report_quarter1` | No explicit timestamp – inherits from source view | Various summed metrics (event count, participants, gender, age, caste, etc.) | **None** | Freshness same as `combined_activity_summary` |
| `data_quality_summary` | `participants_flat` | None | No explicit period – single‑snapshot table | Contains `run_timestamp` column (populated at query run) | Duplicate key count, missing fields, quality‑issue count | **None** | Freshness indicated by `run_timestamp` – not currently refreshed daily |
| `ip_submission_status` | `participants_flat` | `ip_name` | No period columns – per‑IP aggregation | `latest_sync_time` column (populated with `CURRENT_TIMESTAMP()` at run) | **None** | Latest sync recorded as `2026-05-15 18:49:44.146481+00:00` (stale) |

### Findings
- None of the four aggregate views contain built‑in suppression columns (e.g., `display_value`, `suppressed`).
- Only `data_quality_summary` and `ip_submission_status` expose a timestamp (`run_timestamp` / `latest_sync_time`).
- The freshness of the pipeline is currently **stale** (see freshness gate doc).
- No explicit IP identifier is stored in the aggregate views; they are derived aggregates.
- No server‑side API suppression logic is present; suppression is only applied in the UI (`src/lib/privacy-rules.ts`).

---
*File location: `docs/data_pipeline/DATA_ENGINEER_SQL_PIPELINE_EVIDENCE_REVIEW.md`*
