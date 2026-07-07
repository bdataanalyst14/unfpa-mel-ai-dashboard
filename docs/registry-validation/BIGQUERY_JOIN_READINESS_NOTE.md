# BigQuery Join Readiness Note

## Available aggregate tables
- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

## Join keys status
- `registry_activity_id`: present, but some activities lack stable IDs (see NRCS/PeaceWin gaps).
- `registry_indicator_id`: present, but `indicator_progress_summary` lacks IP identity.
- Weak keys: many mappings rely on `activity_code` + `normalized_activity_name` which can be ambiguous.

## Recommended canonical join fields (to be added after M&E approval)
- `registry_activity_id`
- `registry_indicator_id`
- `normalized_ip_name`
- `activity_code`
- `normalized_activity_name`
- `reporting_year`
- `reporting_quarter`
- `province`
- `district`
- `palika`

## Recommendation
Create an enrichment view that merges the above tables using the canonical keys once the registry is finalized and approved. Do **not** create or run any BigQuery views at this stage.
