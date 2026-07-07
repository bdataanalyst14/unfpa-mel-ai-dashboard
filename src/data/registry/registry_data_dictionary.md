# Registry Data Dictionary

## Status

- Classification: `dashboard_registry_non_personal`
- Validation: `pending_user_validation`
- Source: external 15-IP activity/indicator workbooks
- Not sourced from BigQuery raw participant data
- Must not drive dashboard routes until M&E approval

Every JSON file contains an envelope with `generated_at`, `source_folder`, `source_documents`,
`validation_status`, `data_classification`, `notes`, `record_count`, and `records`.

## Registries

### `ip_registry.json`

Canonical implementing-partner names and source-workbook provenance.

Core fields: `registry_id`, `ip_name`, `normalized_ip_name`, `source_document`,
`mapping_status`, `mapping_confidence`, and `validation_status`.

### `activity_registry.json`

One provisional record per extracted activity/subactivity source row.

Core fields: `registry_id`, IP fields, source provenance, `activity_code`, `activity_name`,
`normalized_activity_name`, programme hierarchy, geography placeholders, reporting period,
implementation period, remarks, mapping status/confidence, project, fund code, event type, and
parent activity name.

### `indicator_registry.json`

One provisional record per structured indicator row or source-derived activity linkage.

Core fields: `registry_id`, IP fields, provenance, indicator code/name, normalized name,
project/CPD/SP/UNSDCF mappings, programme hierarchy, frequency, unit, disaggregation, remarks,
mapping status/confidence, and validation status.

`matched_inferred` records preserve indicator text present in activity sheets when no structured
indicator record could be matched. They require M&E review.

### `target_registry.json`

Wide provisional target records retaining annual and Q1-Q4 source values.

Core fields: indicator identity, reporting year, annual and quarterly targets, cumulative target,
target type/unit, provenance, mapping status, and validation status.

Targets may be numeric, percentage, boolean, compound text, formula-derived, or narrative. No
automatic summation or conflict resolution has been applied.

### `activity_indicator_crosswalk.json`

Links every activity to a structured/inferred indicator where source linkage exists, otherwise
creates an `unmatched_activity` record.

Mapping statuses:

- `matched_direct`
- `matched_inferred`
- `unmatched_activity`
- `unmatched_indicator`
- `incomplete_source`
- `requires_me_review`

Core fields include both registry IDs, source codes/names, programme hierarchy, framework
mappings, period, target registry ID, evidence status, provenance, mapping method/confidence, and
validation status.

### `evidence_requirement_registry.json`

Evidence requirements are generally absent from the source workbooks. Records therefore retain
the activity/indicator linkage and use:

```text
evidence_required: unknown
evidence_type: unknown
evidence_frequency: unknown
responsible_team_or_person: unknown
validation_status: requires_me_review
```

## Normalization Rules

- Preserve original display text and source workbook/sheet/row.
- Normalize names by lowercasing, removing punctuation, and collapsing whitespace.
- Keep blank source values as `null`; do not convert them to zero.
- Do not fabricate missing authoritative codes.
- Deterministic provisional IDs use source identity and a stable hash.
- `matched_inferred` confidence remains below direct coded mappings.
- NRCS and PeaceWin indicator/target gaps are explicitly marked.
- Registry records contain no participant, survivor, contact, credential, or submission data.

## Required M&E Decisions

- Official IP names, aliases, and codes
- Canonical activity/subactivity codes
- Duplicate and conflicting codes
- Indicator framework and unit definitions
- Annual versus quarterly/cumulative target interpretation
- Direct versus indirect contribution
- CPD/SP/UNSDCF mappings
- Evidence types, frequency, ownership, and privacy classification
- Status thresholds and direction of success
- Registry/crosswalk version approval
