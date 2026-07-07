# BigQuery Admin Provisioning Checklist

This checklist tracks the technical steps for provisioning and validating BigQuery access for the dashboard.

## 1. Configuration & Readiness
- [ ] **Confirm GCP Project:** Verify `GOOGLE_CLOUD_PROJECT_ID`.
- [ ] **Confirm Dataset:** Verify `BIGQUERY_DATASET_ID`.
- [ ] **Confirm Location:** Verify `BIGQUERY_LOCATION` (asia-south1).
- [ ] **Verify Safe Views:** Confirm `combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, and `ip_submission_status` exist and are populated.

## 2. Access Provisioning
- [ ] **Service Account Creation:** Create a service account with a non-descriptive name (e.g., `unfpa-mel-dashboard-svc`).
- [ ] **Grant Roles:** Assign `roles/bigquery.jobUser` to the project.
- [ ] **Grant Dataset Access:** Assign `roles/bigquery.dataViewer` to the reporting dataset.
- [ ] **Restrict Raw Tables:** Explicitly verify the service account *cannot* query `participants_flat`.

## 3. Local Environment Setup (Admin Controlled)
- [ ] **Template Preparation:** Use `docs/data_pipeline/BIGQUERY_LOCAL_ENV_TEMPLATE.md` to build a local `.env.local`.
- [ ] **Secret Configuration:** Securely fetch service account key and add to `.env.local`.
- [ ] **Validation Mode:** Set `DATA_MODE=bigquery`.
- [ ] **Guardrails:** Set `BIGQUERY_MAX_BYTES_BILLED` to a conservative limit (e.g., 1GB).

## 4. Live Validation (DP-003)
- [ ] **Run Connectivity Audit:** Execute `python scripts/audit/bigquery_readiness_audit.py`.
- [ ] **Execute Validation SQL:** Run aggregate validation queries in `docs/bigquery/proposed_queries/`.
- [ ] **Verify Suppression:** Confirm `gbv_suppression_validation.sql` returns zero rows.
- [ ] **Sign-off:** Document findings in `docs/data_pipeline/BIGQUERY_ADMIN_VALIDATION_DECISION_LOG.md`.

## 5. Post-Validation
- [ ] **Cleanup:** Remove sensitive `.env.local` or rotate keys if compromised.
- [ ] **Mock Mode:** Revert `DATA_MODE=mock` if further frontend development is needed before production connection.
