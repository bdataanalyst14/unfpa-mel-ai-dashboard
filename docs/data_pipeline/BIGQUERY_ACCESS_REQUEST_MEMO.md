# BigQuery Access Request Memo

**To:** ITSO / BigQuery Administrator / Data Engineer
**From:** UNFPA MEL Dashboard Project Team
**Date:** 2026-06-14
**Subject:** BigQuery Read-Only Access Request for UNFPA MEL Dashboard

## 1. Purpose of Access
The UNFPA MEL Dashboard requires read-only access to specific BigQuery reporting views to visualize aggregated program metrics, participant reach, and data quality indicators. This access is critical for transitioning from mock data to live operational reporting.

## 2. Dashboard Use Case
The dashboard provides high-level visualizations for management decision-making. It does not allow raw record browsing and is built to consume only pre-aggregated, privacy-safe data.

## 3. Access Requirements
- **Access Level:** Read-Only (`roles/bigquery.dataViewer`, `roles/bigquery.jobUser`).
- **Location:** `asia-south1`.
- **Project/Dataset:** [PLACEHOLDER: Project ID] / [PLACEHOLDER: Dataset ID].

## 4. Approved Aggregate/Reporting Views (Allowlist)
The Service Account should be granted access **ONLY** to the following views:
- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

## 5. Restricted Tables (Forbidden)
Access to the following raw or participant-level tables is **STRICTLY PROHIBITED**:
- `participants_flat_staging` / `participants_flat` (Contains PII/Survivor data)
- `activity_summary_flat_staging` / `activity_summary_flat` (Raw submission data)

## 6. Privacy & Security Requirements
- **Small-Cell Suppression:** Reporting views must implement k-anonymity (suppression of counts < 5) for sensitive indicators (e.g., GBV-related data).
- **No Raw Data:** No survivor-level, person-level, or PII fields (name, phone, specific IDs) shall be exposed to the dashboard service account.
- **Audit Logging:** All queries performed by the service account will be logged by BigQuery.

## 7. Configuration Details (Env Vars)
The dashboard application expects the following environment variables (values should not be shared in insecure channels):
- `GOOGLE_CLOUD_PROJECT_ID`
- `BIGQUERY_DATASET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

## 8. Approvals
- **ITSO Review:** Pending.
- **M&E Lead:** Pending.
- **Project Manager:** Pending.
