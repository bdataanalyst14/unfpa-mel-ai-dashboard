# BIGQUERY_REFRESH_FRESHNESS_GATE

## Freshness Gate Assessment (DP-003B)

- **Latest documented sync date**: `2026-05-15 18:49:44.146481+00:00` (from `ip_submission_status.sql`).
- **Classification**: `stale_needs_pipeline_check`
- **Rationale**:
  - The sync date is older than the current reporting period (June 2026).
  - No automated refresh log confirms a successful refresh after the sync date.
  - No evidence of a recent pipeline run that would update the aggregate views.
- **Impact**: DP-004 route connection must remain blocked until a fresh pipeline run is verified.
- **Next Action**: Trigger an incremental refresh of the pipeline and verify the new `run_timestamp` in `ip_submission_status`.

---
*File location: `docs/data_pipeline/BIGQUERY_REFRESH_FRESHNESS_GATE.md`*
