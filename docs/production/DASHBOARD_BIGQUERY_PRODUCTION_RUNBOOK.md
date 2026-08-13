# UNFPA Nepal MEL Dashboard - BigQuery Production Runbook

This runbook provides the instructions for configuring, managing, and troubleshooting the GCP BigQuery production connection for the UNFPA MEL Dashboard.

## 1. System Architecture
The dashboard connects to Google Cloud BigQuery using a service account credentials key file and aggregates reporting data from four approved tables/views:
- `combined_activity_summary` (main event and participant indicators)
- `indicator_progress_summary` (indicator target completions)
- `data_quality_summary` (submission checking rules)
- `ip_submission_status` (partner submissions metadata)

No raw patient-level, beneficiary-level, or PII table (such as `participants_flat`) is queried by the dashboard runtime.

## 2. Environment Configuration
The application reads its environment variables from `/etc/unfpa-mel/dashboard.env`.

| Variable Name | Approved Production Value | Description |
|---|---|---|
| `DATA_MODE` | `bigquery` | Primary runtime data driver |
| `DASHBOARD_DATA_MODE` | `bigquery` | Dashboard runtime data driver |
| `BIGQUERY_PROJECT_ID` | `unfpadatabase` | Google Cloud project ID (must match exactly) |
| `BIGQUERY_DATASET_ID` | `reporting` | Target dataset ID |
| `BIGQUERY_LOCATION` | `asia-south1` | Processing location (must match exactly) |
| `GOOGLE_CLIENT_EMAIL` | `<readonly-service-account-email>` | Service account client email |
| `GOOGLE_PRIVATE_KEY_FILE` | `/etc/unfpa-mel/secrets/google-private-key.pem` | Path to private key file |
| `GOOGLE_APPLICATION_CREDENTIALS` | `<external-service-account-json-path>` | Alternative server-only ADC path; mutually exclusive with the PEM variables |
| `ENABLE_GBV_SUPPRESSION` | `true` | Enables small-cell count suppression |
| `BIGQUERY_MAX_BYTES_BILLED` | `10000000` | Query bytes billing limit (optional) |
| `BIGQUERY_CACHE_TTL_SECONDS`| `300` | Results cache duration (seconds) |

## 3. Deployment Directory Structure
- Application Root: `/opt/unfpa-mel-dashboard`
- Active Release Link: `/opt/unfpa-mel-dashboard/current`
- Configuration Directory: `/etc/unfpa-mel`
- Secrets Directory: `/etc/unfpa-mel/secrets`
- Backups Directory: `/var/backups/unfpa-mel-dashboard`
- Evidence Directory: `/var/lib/unfpa-mel-dashboard`

## 4. Run-Time Verification Commands

### Check Configuration Offline
Validate the local environment variables and pre-requisites:
```bash
npm run production:preflight
```

### Validate BigQuery Schema & Constraints (Live)
Run read-only schema checks, column verifications, and PII protection tests (requires authorization):
```bash
npm run production:bigquery-preflight
```

### Activate BigQuery Mode
Switch the dashboard from mock mode to BigQuery (requires evidence file and approval reference):
```bash
npm run production:activate-bigquery -- --approval <ref> --apply
```

### Rollback to Mock Mode
In case of database failure or schema corruption, revert to safe mock mode:
```bash
npm run production:rollback-mock -- --apply --reason "Database connection timeout"
```

## 5. Troubleshooting & FAQ
- **Error: Access to table prohibited**: Ensure your query only references the four approved aggregate tables. The query wrapper blocks any other tables (specifically `participants_flat` and staging tables).
- **Error: Invalid location configured**: Ensure `BIGQUERY_LOCATION` is set exactly to `asia-south1`. Direct queries will reject any other location.
- **Mock Fallback is active**: If `configured: false` appears in page-data metadata, check that the preflight evidence file exists at `/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json` and matches the environment hash.
