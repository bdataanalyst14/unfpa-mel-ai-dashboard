# Vercel Preview to Google Cloud authentication

This is the approved future keyless runtime path:

`Vercel Preview request -> Vercel OIDC token -> Google Workload Identity Provider -> service-account impersonation -> read-only BigQuery identity -> four stable aggregate views`

The dashboard obtains the Vercel OIDC token only inside server request execution. Google Auth Library exchanges it through STS and service-account impersonation. No service-account JSON is uploaded to Vercel, and no PEM is required for Vercel WIF.

Configure all four server-only WIF variables together: `GCP_PROJECT_NUMBER`, `GCP_SERVICE_ACCOUNT_EMAIL`, `GCP_WORKLOAD_IDENTITY_POOL_ID`, and `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`. Never expose them through `NEXT_PUBLIC_*`. Configure BigQuery resource variables separately as documented in `.env.production.example`.

Local ADC through an approved external `GOOGLE_APPLICATION_CREDENTIALS` file and the protected PEM mode remain available for controlled local/server validation. Credential modes are mutually exclusive and incomplete or conflicting configuration fails closed.

Pool/provider creation, IAM binding, and Vercel Preview/UAT environment configuration are separate post-merge checkpoints. Production remains mock-backed until separately approved. The dashboard identity must be read-only and limited operationally to the four allowlisted aggregate views; participant and staging objects remain prohibited.
