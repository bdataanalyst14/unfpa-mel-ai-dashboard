# DP-003 Live Read-Only Validation Runbook

This runbook describes the step-by-step process for performing the first live data validation after credentials are provisioned.

## 1. Prerequisites
- BigQuery Service Account credentials configured.
- `DATA_MODE=bigquery` set in the environment.
- Python environment with `google-cloud-bigquery` installed.

## 2. Sequence of Execution

### Step 1: Connectivity Audit
Run the connectivity audit script to verify table presence without fetching data.
```bash
python scripts/audit/bigquery_readiness_audit.py
```
Review the results in `docs/data_pipeline/BIGQUERY_READINESS_AUDIT_RESULTS.md`.

### Step 2: Privacy Control Validation
Execute the suppression audit query to ensure k-anonymity is active.
- **SQL File:** `docs/bigquery/proposed_queries/gbv_suppression_validation.sql`
- **Requirement:** The query must return **ZERO** rows for any cell with count < 5.

### Step 3: Aggregate Metric Tie-out
Execute the following validation queries and compare results against M&E expectations:
- `executive_overview_validation.sql`
- `participant_reach_validation.sql`
- `data_quality_validation.sql`

### Step 4: Metadata & Status Check
- `ip_submission_status_validation.sql`

## 3. Allowed and Forbidden Scope
- **ALLOWED:** SELECT from views in the `SAFE_VIEWS` list.
- **FORBIDDEN:** SELECT from tables in the `FORBIDDEN_TABLES` list.
- **NO MODIFICATION:** No `INSERT`, `UPDATE`, `DELETE`, or `CREATE`.

## 4. Failure Handling
- **Authentication Failure:** Check `GOOGLE_PRIVATE_KEY` formatting and Service Account IAM roles.
- **Access Denied:** Verify `BIGQUERY_DATASET_ID` and ensure the view is in the dataset.
- **Privacy Failure:** If sensitive records < 5 are returned, **STOP IMMEDIATELY**. Report view logic issue to Data Engineer.

## 5. Validation Report Template
Upon completion, provide a report with:
- Connection Status (Pass/Fail)
- Privacy suppression verified (Yes/No)
- Sample counts (Total Events, Total Participants)
- Readiness status for Category A routes.
