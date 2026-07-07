# BigQuery Local .env Template

**FOR ADMIN USE ONLY**

This template defines the environment variables required for BigQuery connectivity. 
**DO NOT PASTE REAL SECRETS INTO THIS FILE.**
**DO NOT COMMIT YOUR `.env.local` FILE.**

```bash
# --- Mode ---
DATA_MODE=bigquery

# --- BigQuery Connection ---
GOOGLE_CLOUD_PROJECT_ID=<YOUR_GCP_PROJECT_ID>
BIGQUERY_DATASET_ID=<YOUR_DATASET_ID>
BIGQUERY_LOCATION=asia-south1

# --- Service Account Credentials ---
# Note: Ensure the private key is properly formatted with \n for line breaks if used in a single line.
GOOGLE_CLIENT_EMAIL=<SERVICE_ACCOUNT_EMAIL>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# --- Guardrails & Caching ---
BIGQUERY_MAX_BYTES_BILLED=1000000000
BIGQUERY_CACHE_TTL_SECONDS=300

# --- Privacy ---
ENABLE_GBV_SUPPRESSION=true
```

### Safety Instructions:
1. Copy this template to a file named `.env.local` in the project root.
2. Replace placeholders with actual values from the Google Cloud Console.
3. Ensure the service account has only `roles/bigquery.dataViewer` on the specific dataset.
4. Never share your `.env.local` or Service Account JSON key in chat or tickets.
