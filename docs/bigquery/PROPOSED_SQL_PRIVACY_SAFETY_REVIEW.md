# Proposed SQL Privacy Safety Review

**Review Date:** 2026-06-14
**Reviewer:** UNFPA Data Contract Reviewer

This document reviews the proposed SQL queries for privacy safety and data contract compliance.

## 1. Summary of Findings
| SQL File | Source View/Table | Safe to Execute? | Privacy Concerns |
| :--- | :--- | :--- | :--- |
| `executive_overview_validation.sql` | `combined_activity_summary` | ✅ Yes | None (Aggregate only) |
| `participant_reach_validation.sql` | `combined_activity_summary` | ✅ Yes | None (Aggregate only) |
| `activity_progress_validation.sql` | `combined_activity_summary` | ✅ Yes | None (Aggregate only) |
| `ip_submission_status_validation.sql` | `ip_submission_status` | ✅ Yes | None (Metadata/Log only) |
| `data_quality_validation.sql` | `data_quality_summary` | ✅ Yes | None (Aggregate only) |
| `geographic_coverage_validation.sql` | `combined_activity_summary` | ✅ Yes | None (Aggregate only) |
| `indicator_progress_registry_dependent_validation.sql` | `indicator_progress_summary` | ✅ Yes | None (Aggregate only) |
| `gbv_suppression_validation.sql` | `combined_activity_summary` | ✅ Yes | None (Audit query for k-anonymity) |

## 2. Detailed Review

### `executive_overview_validation.sql`
- **Purpose:** Validate top-level operational KPIs.
- **Source:** `combined_activity_summary` (Approved Aggregate).
- **Compliance:** Uses `SUM` and `COUNT(DISTINCT)` on aggregated columns. No person-level data exposed.

### `participant_reach_validation.sql`
- **Purpose:** Validate sex/age/disability breakdown.
- **Source:** `combined_activity_summary` (Approved Aggregate).
- **Compliance:** Groups by high-level categories. Safe for dashboard validation.

### `activity_progress_validation.sql`
- **Purpose:** Validate activity counts.
- **Source:** `combined_activity_summary` (Approved Aggregate).
- **Compliance:** Groups by activity name. No PII.

### `ip_submission_status_validation.sql`
- **Purpose:** Validate IP submission metadata.
- **Source:** `ip_submission_status` (Approved Aggregate).
- **Compliance:** Reporting on logs/status only. Safe.

### `data_quality_validation.sql`
- **Purpose:** Validate DQA scores.
- **Source:** `data_quality_summary` (Approved Aggregate).
- **Compliance:** Uses system-wide aggregates. Safe.

### `geographic_coverage_validation.sql`
- **Purpose:** Validate province/district reach.
- **Source:** `combined_activity_summary` (Approved Aggregate).
- **Compliance:** High-level geo aggregation. Safe.

### `indicator_progress_registry_dependent_validation.sql`
- **Purpose:** Validate indicator progress vs targets.
- **Source:** `indicator_progress_summary` (Approved Aggregate).
- **Compliance:** Aggregate level only. Safe.

### `gbv_suppression_validation.sql`
- **Purpose:** Audit for k-anonymity (n<5) on sensitive indicators.
- **Source:** `combined_activity_summary` (Approved Aggregate).
- **Compliance:** This is a diagnostic query to *confirm* suppression. Safe to run to verify privacy controls.

## 3. General Safety Affirmation
- No query references `participants_flat` or `participants_flat_staging`.
- No query references PII fields (name, phone, specific IDs).
- All queries include `SUM` or `COUNT` aggregation logic.
- **Verdict:** All queries are safe for read-only execution once credentials are provided.
