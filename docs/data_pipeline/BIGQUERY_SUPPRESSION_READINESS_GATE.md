# BIGQUERY_SUPPRESSION_READINESS_GATE

## Suppression Gate Assessment (DP-003B)

- **Server/API suppression**: Currently **not implemented**. `src/lib/privacy-rules.ts` only formats small counts for frontend display; raw aggregate values are returned unchanged by `src/lib/server/bigquery-dashboard-service.ts`.
- **Frontend‑only masking**: Exists via `suppressSmallCount` in UI, but this does **not** prevent exact small values from appearing in JSON payloads.
- **BigQuery view suppression fields**: None of the aggregate view definitions (`combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`) contain explicit suppression columns (e.g., `display_value`, `suppressed`).
- **Evidence Register update**: **E002** status set to `pending_suppression_check`.
- **Impact**: DP‑004 route connection must remain blocked until server‑side/API suppression is added and verified.

---
*File location: `docs/data_pipeline/BIGQUERY_SUPPRESSION_READINESS_GATE.md`*
