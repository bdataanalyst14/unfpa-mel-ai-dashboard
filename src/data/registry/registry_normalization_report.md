# Registry Normalization Report

## Result

Fifteen IP workbooks were processed into a provisional, non-personal dashboard registry.

Generated counts:

| Registry | Records |
|---|---:|
| IPs | 15 |
| Activities | 575 |
| Indicators | 217 |
| Targets | 170 |
| Activity-indicator crosswalk | 878 |
| Evidence requirements | 878 |

These counts reflect automated extraction, deduplication, and inferred linkage. They are not
approved programme totals.

Crosswalk status:

- 374 direct source matches
- 90 inferred matches requiring review
- 331 unmatched activities
- 83 incomplete-source links for NRCS and PeaceWin

## Source Coverage

Processed:

- Aasaman Nepal
- ADRA Nepal
- CMC Nepal
- SAATHI
- FPAN
- Good Neighbors International Nepal
- JURI Nepal
- KIDS
- Nepal Red Cross Society
- PeaceWin
- Plan International Nepal
- SOSEC Nepal
- TPO Nepal
- SPN
- WOREC

## Key Gaps

### NRCS

The workbook provides project/outcome/output/activity/subactivity hierarchy but no usable indicator
or target registry. Placeholder indicator/target records are marked:

```text
mapping_status: incomplete_source
validation_status: requires_me_review
gap_reason: missing_indicator_target_registry
```

### PeaceWin

The workbook provides activities and programme hierarchy but no indicator codes, indicator
registry, or targets. The same incomplete-source status applies.

### Cross-workbook gaps

- Indicator and activity codes are inconsistent, missing, or IP-local.
- SP/UNSDCF mappings are mainly narrative rather than coded fields.
- Evidence requirements, reporting frequency, and responsible team are generally absent.
- Targets mix events, participants, percentages, reports, policies, boolean milestones, and formulas.
- Some annual and quarterly targets conflict.
- Some source rows contain repeated headers, placeholders, or duplicated codes.
- Automated mappings require review before use in target/status calculations.

## BigQuery Join Readiness

### Strongest available keys

- `normalized_ip_name + activity_code + reporting_year`
- `normalized_ip_name + normalized_activity_name + reporting_year`
- approved registry foreign keys after governance review

### Conditional keys

- BigQuery `subactcode1` to approved activity/subactivity code
- BigQuery `indicator1` to approved indicator code
- project + outcome + output + IP + reporting period
- activity code + year + quarter
- approved geography code + activity + reporting period

### Weak keys

- activity or indicator name alone
- fuzzy normalized names
- narrative output/outcome text
- workbook row number
- geography names without canonical codes

### Missing or ambiguous keys

- `indicator_progress_summary` does not include `ip_name`, so IP-specific target attribution is unsafe.
- BigQuery summary tables do not contain canonical registry IDs.
- BigQuery geography uses names rather than approved canonical codes.
- Pipeline metadata currently aliases `indicator1` from `subactcode1`, making indicator semantics ambiguous.

### Recommended reporting-layer additions

Add through approved reporting views or governed enrichment tables, not by exposing raw ingestion:

```text
ip_registry_id
activity_registry_id
indicator_registry_id
canonical_activity_code
canonical_indicator_code
province_code
district_code
palika_code
registry_version
crosswalk_version
mapping_status
```

## Evidence Registry

Evidence information was not consistently available. All generated evidence records are placeholders
requiring M&E review. Required decisions include evidence type, means of verification, frequency,
responsible owner, minimum documents, approval requirement, retention classification, and whether
evidence contains personal data.

## GBV Mock Safety

Existing GBV mock data contains exact values from 1-4 in client-side source. Visual `<5`
formatting does not prevent inspection in the browser bundle.

Production requirements:

- suppress exact small cells server-side before browser delivery
- use `display_count`, `suppressed`, `suppression_reason`, and `display_label`
- apply complementary suppression where needed
- avoid percentages that permit back-calculation
- do not connect GBV/OCMC until an approved disclosure-controlled aggregate view exists

## Validation Status

The entire registry remains `pending_user_validation`. Inferred mappings, missing evidence, NRCS and
PeaceWin gaps, conflicting targets, and weak code matches require M&E review.

No frontend route is connected to these files.
