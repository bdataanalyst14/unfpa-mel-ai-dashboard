# DP-003 BigQuery Admin Live Validation Runbook

**Goal:** Perform a secure, read-only validation of reporting views using live credentials.

## 1. Prerequisite Checklist
- [ ] Service Account provisioned with least-privilege.
- [ ] `.env.local` configured with real credentials (not committed).
- [ ] Python environment ready with `google-cloud-bigquery`.

## 2. Validation Sequence

### Step 1: Connectivity Verification
Confirm the environment variables are loaded and the service account can reach the project.
```powershell
# Verify env existence (names only)
Get-ChildItem Env: | Where-Object { $_.Name -like "BIGQUERY*" -or $_.Name -eq "GOOGLE_CLOUD_PROJECT_ID" }
```
Execute the audit script:
```bash
python scripts/audit/bigquery_readiness_audit.py
```
Review `docs/data_pipeline/BIGQUERY_READINESS_AUDIT_RESULTS.md`.

### Step 2: Privacy Control Check (Critical)
Execute the suppression audit query.
- **SQL File:** `docs/bigquery/proposed_queries/gbv_suppression_validation.sql`
- **Success Criteria:** The query must return 0 rows. This confirms k-anonymity (n<5) is being enforced at the view level.

### Step 3: Aggregate Metric Validation
Run the following queries to ensure the dashboard can fetch the expected operational counts:
- `executive_overview_validation.sql`
- `participant_reach_validation.sql`
- `data_quality_validation.sql`

## 3. Scope Controls
- **Allowlist:** Only views defined in `SAFE_VIEWS` in `bigquery_readiness_audit.py`.
- **Denylist:** No queries against `participants_flat` or `activity_summary_flat`.
- **Read-Only:** No modification of data or schema.

## 4. Failure Handling
- **Auth Error:** Verify service account email and private key formatting.
- **Forbidden Error:** Check IAM roles; ensure service account is not trying to access restricted tables.
- **Privacy Leak:** If counts < 5 are returned in sensitive cells, notify the Data Engineer and do not connect the dashboard.

## 5. Output
Document all results in `docs/data_pipeline/BIGQUERY_ADMIN_VALIDATION_DECISION_LOG.md`.
Do not connect routes or deploy code.
