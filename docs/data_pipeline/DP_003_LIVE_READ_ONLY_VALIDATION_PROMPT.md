# DP-003 Live Read-Only BigQuery Validation (Admin Mode)

**Target Agent:** BigQuery Administrator / Data Engineer

**Context:**
You are the BigQuery Admin. You have provisioned a read-only service account and are now ready to validate the reporting views before enabling dashboard connectivity.

**Task:**
Perform a live, read-only validation of the dashboard reporting views.

**Instructions:**
1. **Audit Check:** Execute `python scripts/audit/bigquery_readiness_audit.py` to verify the service account can "see" the safe aggregate views.
2. **Privacy Audit:** Execute `docs/bigquery/proposed_queries/gbv_suppression_validation.sql`. Confirm zero records are returned for sensitive cells with counts < 5.
3. **Aggregate Validation:** Execute the operational validation queries (Executive Overview, Participant Reach, Data Quality) to confirm counts match expectations.
4. **Report Findings:** Summarize the aggregate counts and status in the Decision Log.

**Safety Mandates:**
- **READ-ONLY:** No data or schema modification.
- **NO RAW DATA:** Do not query `participants_flat` or any table marked restricted.
- **NO ROUTE CONNECTION:** Do not modify `src/` to connect routes or change mock-to-live logic yet.
- **NO DEPLOYMENT:** No production or preview deployments.

**Final Report Requirements:**
- Connectivity test status.
- Table accessibility verification.
- Privacy suppression confirmation.
- Readiness status for Category A routes.
- Updated Decision Log entry.
