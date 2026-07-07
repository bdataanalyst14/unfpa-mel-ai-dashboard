# BigQuery Credential Setup Checklist

This checklist provides technical guidance for setting up BigQuery credentials for the UNFPA MEL Dashboard.

## 1. Service Account Configuration
- [ ] Create a dedicated Service Account (e.g., `mel-dashboard-sa@[PROJECT_ID].iam.gserviceaccount.com`).
- [ ] Assign `roles/bigquery.jobUser` at the project level.
- [ ] Assign `roles/bigquery.dataViewer` limited to the specific reporting dataset.
- [ ] Generate a JSON key (Store securely, do not commit).

## 2. Local Development Environment (`.env.local`)
- [ ] Create or update `.env.local` in the project root.
- [ ] Add `GOOGLE_CLOUD_PROJECT_ID`.
- [ ] Add `BIGQUERY_DATASET_ID`.
- [ ] Add `GOOGLE_CLIENT_EMAIL`.
- [ ] Add `GOOGLE_PRIVATE_KEY` (Ensure newline characters are correctly escaped: `\n`).
- [ ] Set `DATA_MODE=bigquery`.
- [ ] **Warning:** Ensure `.env.local` is listed in `.gitignore`. **NEVER COMMIT SECRETS.**

## 3. Hosting / Production Environment (Vercel)
- [ ] Configure Environment Variables in the Vercel Dashboard.
- [ ] Use the same keys as local development.
- [ ] Set `BIGQUERY_LOCATION=asia-south1`.
- [ ] Set `BIGQUERY_MAX_BYTES_BILLED` (e.g., `1000000000` for 1GB limit).
- [ ] Set `BIGQUERY_CACHE_TTL_SECONDS=300` (5 minutes default).

## 4. Operation & Rollback
- [ ] **Data Mode Switch:** To revert to mock data, set `DATA_MODE=mock`.
- [ ] **Rotation:** Establish a 90-day credential rotation policy.
- [ ] **Failure Handling:** If BigQuery connection fails, the dashboard is configured to fall back to mock data with a warning label.

## 5. Security Posture
- [ ] Verify the service account *cannot* query `participants_flat`.
- [ ] Verify the service account *cannot* delete or modify tables.
