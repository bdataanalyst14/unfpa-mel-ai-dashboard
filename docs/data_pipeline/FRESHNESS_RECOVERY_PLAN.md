# FRESHNESS_RECOVERY_PLAN

## Goal
Recover a fresh data pipeline state for DP‑003B so the freshness gate can be satisfied.

## Step 1 – Identify safe refresh command
- The pipeline is orchestrated via the `npm run refresh-pipeline` script located in `H:\My Drive\unfpa_mel\scripts\refresh_pipeline.sh` (Windows‑compatible wrapper `refresh_pipeline.bat`).
- The command **only** runs a series‑of **SELECT‑INSERT** statements that rebuild the four aggregate views (`combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`).
- It **does not** modify any source tables (`participants_flat`, `activity_summary_flat`) nor any BigQuery credentials.
- The script logs a timestamp to `logs/pipeline_refresh.log` and includes a sanity‑check that the number of distinct IPs after the run matches the expected 15 IPs.

## Step 2 – Approval requirement
If the team is comfortable that the script is non‑destructive, the manager can approve the execution. **Otherwise** mark the refresh as `requires_data_engineer_admin`.

## Step 3 – Evidence required after refresh
| Evidence | Required condition |
|----------|--------------------|
| `latest_sync_time` in `ip_submission_status` view | `>= 2026‑06‑01` |
| Distinct IP count in `ip_submission_status` | `= 15` |
| Row counts in aggregate views (`combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`) | Must reflect the newest source data (no decrease > 5 % of previous run) |
| No raw/sensitive fields exposed | Confirm that the SQL scripts only reference aggregate columns and never select PII fields |

## Step 4 – Verification steps
1. Run the refresh command (after approval).
2. Query `SELECT latest_sync_time FROM `${GCP_PROJECT_ID}.${BQ_DATASET}.ip_submission_status`;` and compare.
3. Run `SELECT COUNT(DISTINCT ip_name) FROM `${GCP_PROJECT_ID}.${BQ_DATASET}.ip_submission_status`;` – expect 15.
4. Review the pipeline log for any errors.
5. Update `E001` status in `SMT_READINESS_EVIDENCE_REGISTER.md` to `fresh`.

---
*File location: `docs/data_pipeline/FRESHNESS_RECOVERY_PLAN.md`*
