# BigQuery Reporting View Requirements

## Purpose

Define approved, aggregate-safe contracts required before connecting additional dashboard routes.
The ingestion pipeline is out of scope. These requirements describe reporting assets and the hybrid
crosswalk between BigQuery actuals and the external 15-IP indicator framework.

## Source Boundaries

### BigQuery actuals

- `combined_activity_summary`: event/activity actuals, reach, IP, programme, timing, and geography.
- `indicator_progress_summary`: activity-associated aggregate events/reach; not an approved target registry.
- `data_quality_summary`: duplicate/missing/quality issue counts.
- `ip_submission_status`: partner submission/event totals and freshness.

### External registry

The 15 IP workbooks supply activity definitions, indicator definitions, targets, CPD mappings, and
some SP/UNSDCF context. They require normalization and governance before dashboard use.

### Restricted sources

Do not expose `participants_flat`, participant staging tables, raw KoBo submissions, internal
submission keys/UUIDs, names, contacts, participant IDs, row-level sensitive disaggregation, or
survivor-level GBV data.

## Crosswalk Requirement

Create a reviewed registry/crosswalk with at least:

```text
ip_name
normalized_ip_name
activity_code
activity_id
normalized_activity_name
indicator_code
indicator_name
output
outcome
cpd_indicator
sp_indicator
unsdcf_indicator
reporting_year
reporting_quarter
target_value
evidence_required
source_document
mapping_confidence
mapping_status
```

Add source sheet/row, target unit, frequency, effective dates, direct/indirect attribution, reviewer,
approval date, version, and notes where available.

## Required Reporting Contracts

### `dashboard_executive_overview`

- Grain: one row per approved filter combination or query-time aggregate.
- Inputs: BigQuery actuals, quality, freshness; approved targets later.
- Required fields: events, reportable participants, sex totals, districts, IPs, quality score,
  freshness, filter dimensions.
- Privacy: aggregate only; no internal submission identifiers.

### `dashboard_activity_progress`

- Grain: IP + activity + reporting period, optionally project/output.
- Required: canonical activity ID/code/name, planned target, actual events/completions, progress,
  status rule, project/outcome/output, IP, year/quarter.
- Sources: BigQuery actuals + external activity/target registry.

### `dashboard_participant_reach`

- Grain: approved programme/geography/time aggregate.
- Required: total/reportable reach and approved sex/age/caste/disability buckets.
- Privacy: suppression thresholds and prohibited intersection rules must be explicit.

### `dashboard_indicator_progress`

- Grain: canonical indicator + IP + reporting period.
- Required: indicator code/name, framework, CPD/SP/UNSDCF linkage, annual/quarterly target, actual,
  achievement percentage, status, activity contribution, source/version.
- Sources: external registry + BigQuery actuals through approved crosswalk.
- Blocker: NRCS and PeaceWin indicator-target gaps; inconsistent codes across other workbooks.

### `dashboard_ip_performance`

- Grain: IP + reporting period.
- Required: submissions, events, reach, target achievement, evidence completeness, timeliness,
  quality score, coverage, freshness.
- Sources: BigQuery summary tables + external IP targets/evidence registry.

### `dashboard_geographic_coverage`

- Grain: canonical province/district/palika code + period.
- Required: canonical codes/names, aggregate events/reach, IP count, project/output.
- UI boundary: protected ArcGIS/Nepal map remains static and unchanged; only metric overlays may
  consume this contract after approval.

### `dashboard_gbv_ocmc_suppressed`

- Grain: governance-approved aggregate only.
- Required: pre-suppressed display values or suppression flags, geography/time at approved level,
  service metrics, disclosure-control metadata.
- Must never send exact small-cell values to client code. Existing mock data currently contains
  exact small cells in the browser bundle and must not be used as a production pattern.

### `dashboard_data_quality`

- Grain: run timestamp + approved table/IP/period aggregate.
- Required: total records, duplicates, missing fields, issue count/rate, evidence completeness,
  rule version, freshness.

### `dashboard_management_decision_centre`

- Grain: governed issue/recommendation record.
- Required: issue type, severity rule, affected indicator/activity/IP/geography, actual vs target,
  evidence/timeliness/quality context, recommendation, calculation version, generated/reviewed dates.
- Outputs must be auditable and based on approved aggregate sources.

### `dashboard_activity_detail`

- Grain: approved event/activity aggregate, not participant.
- Required: canonical activity, IP, programme hierarchy, dates, approved geography, aggregate reach,
  validation/evidence status.
- Exclude event keys, submission IDs/UUIDs, names, contacts, participant IDs, and sensitive row-level data.

## Ownership and Approval

Each reporting contract must document:

- data owner
- technical owner
- privacy classification
- row grain
- approved columns
- suppression rules
- refresh schedule
- target/status calculation version
- source registry version
- approver and approval date

## Implementation Sequence

1. Normalize the 15-IP activity and indicator workbooks into draft registries.
2. Resolve NRCS and PeaceWin indicator/target gaps.
3. Review activity and indicator codes with programme/M&E owners.
4. Approve crosswalk and status/evidence rules.
5. Materialize approved reporting views or a governed dashboard registry.
6. Validate against BigQuery actuals.
7. Connect Indicator Progress only after approval.

## Draft Registry Output

The normalized draft now exists under `src/data/registry/`. It is a review artifact, not an
approved reporting source.

Before materializing reporting views:

- approve the 15 IP identities and aliases
- validate 575 extracted activities
- validate 217 structured or source-derived indicators
- validate 170 target records and mixed target units
- review 90 inferred and 331 unmatched activity links
- resolve 83 NRCS/PeaceWin incomplete-source links
- define all 878 evidence requirements
- version and approve the registry/crosswalk
