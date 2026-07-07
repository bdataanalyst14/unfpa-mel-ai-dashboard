# Data Pipeline Fix Candidates

## A. Safe Documentation/Config Fixes That Can Be Applied Now
- Document exact required schema for `.env` credentials in `README.md`.
- Explicitly configure BigQuery timeout limitations in `.env.example`.
- Add explicit labels/tags in BigQuery dataset to delineate safe vs. raw tables.

## B. Read-Only Validation Scripts
- `scripts/audit/bigquery_readiness_audit.py` **COMPLETED**. Live connection and 15-IP coverage verified.


## C. Calculation Fixes Requiring M&E Registry Sign-off
- Dashboard `activity-progress` needs to map string activity fields to M&E canonical `activity_code`.
- `indicator-progress` needs the M&E crosswalk to match reported indicators to targets.
- M&E sign-off required to use the final registry files instead of dummy/mock mappings.

## D. BigQuery View Changes Requiring Approval
- Create a dedicated `gbv_aggregate_safe_view` to strictly enforce k-anonymity (count >= 5) before exposing to the dashboard.
- Create an `indicator_progress_view` that incorporates the canonical M&E targets.

## E. Dashboard Route Connection Work Blocked Until Approval
- `indicator-progress/page.tsx`
- `activity-progress/page.tsx`
- `gbv-ocmc-summary/page.tsx`
- `management-decision-centre/page.tsx`

## F. Security/Privacy Fixes Requiring Immediate Attention
- Enforce strict IAM policies on `participants_flat` to prevent accidental direct queries.
- Ensure the Service Account provided to the Dashboard only has access to views explicitly marked safe (e.g., `combined_activity_summary`).
