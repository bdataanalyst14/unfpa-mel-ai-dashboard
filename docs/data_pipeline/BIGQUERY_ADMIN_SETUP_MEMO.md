# BigQuery Admin Setup Memo

**To:** Project Lead / Data Engineering Team
**From:** BigQuery Administrator
**Date:** 2026-06-14
**Subject:** Provisioning and Access Control Plan for MEL Dashboard

## 1. Context
As the BigQuery Administrator, I am overseeing the secure provisioning of a Service Account for the UNFPA MEL Dashboard. This memo outlines the least-privilege access model designed to enable dashboard reporting while strictly protecting sensitive participant and survivor data.

## 2. Service Account Purpose
- **Primary Use Case:** Enable the MEL Dashboard to fetch aggregated operational metrics.
- **Validation Phase:** Support read-only validation (DP-003) of reporting views against BigQuery datasets.
- **Production Phase:** Serve as the identity for the Next.js backend to perform safe, cached aggregate queries.

## 3. Least-Privilege Access Model
Access will be restricted to the following boundaries:
- **Roles:** `roles/bigquery.jobUser` (Project level) and `roles/bigquery.dataViewer` (Dataset level).
- **Scope:** Restricted to specific **Reporting Views** only.
- **Location:** All data resides in `asia-south1`.

## 4. Dataset Boundaries

### ✅ Approved Aggregate/Reporting Views:
- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

### ❌ Restricted (No Dashboard Service Account Access):
- `participants_flat` / `participants_flat_staging` (PII/Sensitive Participant Data)
- `activity_summary_flat` / `activity_summary_flat_staging` (Raw Event Data)
- Any GBV case-level or survivor-level identifiers.

## 5. Security Controls
- **Small-Cell Suppression:** The reporting views must enforce k-anonymity (suppression of counts < 5) for all sensitive indicators.
- **Environment Boundary:** Credentials will be managed via secure environment variables. No service account keys are to be committed to source control.
- **Rollback:** The dashboard can be instantly reverted to `mock` mode by changing the `DATA_MODE` environment variable.

## 6. Implementation Notes
- **Local Validation:** Admin will configure `.env.local` temporarily to execute DP-003 validation scripts.
- **Hosted Secrets:** Vercel environment secrets will be configured only after successful DP-003 sign-off.
