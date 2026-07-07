# BigQuery Access Request Checklist

This checklist outlines the requirements for provisioning BigQuery access for the UNFPA MEL Dashboard.

## 1. Environment Variables (Required)
The following keys must be provided (e.g., via Vercel Dashboard or a secure `.env.local` for development):
- `GOOGLE_CLOUD_PROJECT_ID`: The ID of the GCP project.
- `BIGQUERY_DATASET_ID`: The ID of the dataset containing reporting views.
- `GOOGLE_CLIENT_EMAIL`: Service account email.
- `GOOGLE_PRIVATE_KEY`: Service account private key (ensure correct formatting for Base64 or newline characters).
- `BIGQUERY_LOCATION`: `asia-south1` (Default).

## 2. Service Account Roles
The service account should follow the principle of least privilege:
- `roles/bigquery.jobUser` (Required to run queries).
- `roles/bigquery.dataViewer` (Limited to the specific dataset).

## 3. Data Access Boundary
Access must be restricted to **Reporting Views / Aggregate Tables** only.
### ✅ Approved (Dashboard Aggregate Views):
- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

### ❌ Restricted (Do Not Grant Access):
- `participants_flat_staging` / `participants_flat` (Contains PII/Survivor data)
- `activity_summary_flat_staging` / `activity_summary_flat` (Raw submission data)

## 4. Cost and Performance Guardrails
- **Max Bytes Billed:** Recommended limit (e.g., `1000000000` / 1GB per query) to prevent unexpected costs.
- **Cache TTL:** `BIGQUERY_CACHE_TTL_SECONDS` default `300` (5 minutes).

## 5. Security & Privacy
- **Credential Storage:** Never commit service account JSON files. Use environment variables.
- **ITSO Review:** Access must be reviewed by the UNFPA Information Technology and Solutions Office (ITSO) before production deployment.
- **Privacy Suppression:** Ensure k-anonymity (n>=5) is enforced at the view level for sensitive GBV indicators.

## 6. Local Development Checklist
- [ ] Create `H:\My Drive\unfpa-mel-ai-dashboard\.env.local` (local only, ignored by git).
- [ ] Populate with values from ITSO/Data Engineer.
- [ ] Verify `DATA_MODE=bigquery`.
