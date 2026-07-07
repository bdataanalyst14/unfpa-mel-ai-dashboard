# Expected Aggregate Schema Contract

This document defines the schema contract for BigQuery reporting views consumed by the UNFPA MEL Dashboard.

## 1. General Principles
- **No PII:** Raw person-level data, names, phone numbers, or exact coordinates must not be present.
- **Aggregation:** All data must be pre-aggregated at the Event, Activity, or Geo (Palika/District) level.
- **Suppression:** Sensitive GBV indicators must enforce a suppression rule (count >= 5).

## 2. Safe View Contracts

### `combined_activity_summary`
| Field | Type | Grain | Purpose |
| :--- | :--- | :--- | :--- |
| `event_count` | INT64 | Event/Activity | Count of unique events/activities. |
| `total_reportable_participants` | INT64 | Event/Activity | Aggregated participant count. |
| `female` / `male` / `other` | INT64 | Event/Activity | Sex-disaggregated counts. |
| `combined_age` | STRING | Age Group | Aggregate age bracket (e.g., "10-14"). |
| `province1` / `district1` / `palika1` | STRING | Geography | Geographic markers. |
| `ip_name` | STRING | Partner | Implementing Partner name. |
| `is_gbv_sensitive` | BOOLEAN | Indicator Flag | Identifies records subject to suppression. |

### `indicator_progress_summary`
| Field | Type | Grain | Purpose |
| :--- | :--- | :--- | :--- |
| `indicator_code` | STRING | Indicator | Canonical M&E indicator ID. |
| `actual_value` | FLOAT64 | Indicator | Aggregated achievement. |
| `target_value` | FLOAT64 | Indicator | Planned target. |

### `data_quality_summary`
| Field | Type | Grain | Purpose |
| :--- | :--- | :--- | :--- |
| `total_rows` | INT64 | Dataset | Total records processed. |
| `records_with_quality_issue` | INT64 | Dataset | Count of problematic records. |
| `score` | FLOAT64 | Dataset | Calculated percentage (0-100). |

### `ip_submission_status`
| Field | Type | Grain | Purpose |
| :--- | :--- | :--- | :--- |
| `ip_name` | STRING | Partner | Name of the IP. |
| `latest_sync_time` | TIMESTAMP | Partner | Timestamp of last Kobo sync. |
| `submission_status` | STRING | Partner | Status (e.g., "On Time", "Late"). |

## 3. Forbidden Fields
The following fields must **NOT** appear in any dashboard-connected view:
- `participant_id` (unless anonymized and non-traceable)
- `name`, `phone`, `address`, `contact`
- `submission_uuid` (raw kobo ID)
- `case_notes`, `free_text_complaints`
- `survivor_name`, `survivor_details`

## 4. Contract Enforcement
Any change to these views in the `unfpa_mel` repository must be reviewed for dashboard compatibility and privacy compliance.
