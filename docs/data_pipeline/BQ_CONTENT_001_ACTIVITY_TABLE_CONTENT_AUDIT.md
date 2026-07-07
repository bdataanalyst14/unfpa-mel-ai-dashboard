# BQ_CONTENT_001 Activity Table Content Audit

Date: 2026-07-01

Status: `bigquery_activity_data_official_registry_like`

## Tables Audited

- `unfpadatabase.unfpadatabase.activity_summary_flat`
- `unfpadatabase.unfpadatabase.activity_summary_flat_staging`
- `unfpadatabase.unfpadatabase.combined_activity_summary`

## Schema Finding

The audited tables contain operational activity fields including partner, reporting period, project, outcome, output, activity, subactivity, activity details, dates, geography, participant totals, and disaggregations.

Key fields present:

- `ip_name`
- `reporting_year1`
- `report_quarter1`
- `project1`
- `outcome1`
- `output1`
- `activity1`
- `subact1`
- `actdetails1`
- `subactcode1`
- `eventtype1`
- `province1`
- `district1`
- `palika1`

## Aggregate Content Results

| Table | Rows | Distinct activity IDs/keys | `ACT-2025-*` pattern count | Generic `Activity N` count | Description present | Partners present | Geography present | Year range | Latest freshness |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `activity_summary_flat` | 682 | 682 | 0 | 0 | 676 | 682 | 682 | 2025-2026 | 2026-05-14 12:11:16+00 |
| `activity_summary_flat_staging` | 682 | 682 | 0 | 0 | 676 | 682 | 682 | 2025-2026 | 2026-05-14 12:11:16+00 |
| `combined_activity_summary` | 1798 | 1798 | 0 | 0 | 1672 | 1798 | 1798 | 2025-2026 | Not stored in table |

## Pattern Finding

- No audited table showed `ACT-2025-*` IDs.
- No audited table showed generic `Activity 1`, `Activity 2`, etc. labels.
- Most rows contain descriptive activity labels or activity details.
- Partner/IP and province/district fields are present across all rows.
- Records appear operational/registry-like, not synthetic seed rows.

## Conclusion

The visible `ACT-2025-*` and `Activity N` content came from frontend mock/sample data, not from the audited BigQuery activity tables.
