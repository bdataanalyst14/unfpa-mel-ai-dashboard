# -*- coding: utf-8 -*-
"""generate_registry_validation_package.py
Generates the M&E validation package files.
"""
import json, csv, os, datetime, collections, sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
REGISTRY_DIR = os.path.join(BASE_DIR, 'src', 'data', 'registry')
DOCS_DIR = os.path.join(BASE_DIR, 'docs', 'registry-validation')
os.makedirs(DOCS_DIR, exist_ok=True)

def load_records(file_name):
    path = os.path.join(REGISTRY_DIR, file_name)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # If the JSON is a dict with a "records" key, use that list
        if isinstance(data, dict) and 'records' in data:
            return data['records']
        return data

# Load registries (list of records)
ip_reg = load_records('ip_registry.json')
activity_reg = load_records('activity_registry.json')
indicator_reg = load_records('indicator_registry.json')
target_reg = load_records('target_registry.json')
crosswalk = load_records('activity_indicator_crosswalk.json')
evidence_reg = load_records('evidence_requirement_registry.json')

def count_duplicates(items, key_func):
    seen = set()
    dup = 0
    for item in items:
        k = key_func(item)
        if k in seen:
            dup += 1
        else:
            seen.add(k)
    return dup

# Duplicate ID checks
dup_ip_ids = count_duplicates(ip_reg, lambda x: x.get('registry_id'))
dup_activity_ids = count_duplicates(activity_reg, lambda x: x.get('registry_id'))
dup_indicator_ids = count_duplicates(indicator_reg, lambda x: x.get('registry_id'))
dup_target_ids = count_duplicates(target_reg, lambda x: x.get('registry_id'))

# Duplicate activity names within same IP
activity_name_pairs = [(item.get('ip_name'), item.get('activity_name')) for item in activity_reg]
dup_activity_names = count_duplicates(activity_name_pairs, lambda x: tuple(x))

# Duplicate indicator codes within same IP
indicator_pairs = [(item.get('ip_name'), item.get('indicator_code')) for item in indicator_reg]
dup_indicator_codes = count_duplicates(indicator_pairs, lambda x: tuple(x))

# Missing mandatory fields
missing_ip_name = sum(1 for i in ip_reg if not i.get('ip_name'))
missing_activity_name = sum(1 for a in activity_reg if not a.get('activity_name'))
missing_indicator_name = sum(1 for ind in indicator_reg if not ind.get('indicator_name'))
missing_output = sum(1 for ind in indicator_reg if not ind.get('output'))
missing_outcome = sum(1 for ind in indicator_reg if not ind.get('outcome'))
missing_target_value = sum(1 for tgt in target_reg if not tgt.get('target_value'))
missing_source_doc = sum(1 for src in evidence_reg if not src.get('source_document'))
missing_source_row = sum(1 for src in evidence_reg if not src.get('source_row'))

# Mapping status distribution
mapping_status_counts = collections.Counter(item.get('mapping_status','') for item in crosswalk)
validation_status_counts = collections.Counter(item.get('validation_status','') for item in crosswalk)

# Evidence placeholders needing review
evidence_needs_review = sum(1 for e in evidence_reg if not e.get('source_document'))

# Write QA audit markdown
audit_md = f"""# Registry Quality Audit

## Record Counts
- IP registry: {len(ip_reg)}
- Activity registry: {len(activity_reg)}
- Indicator registry: {len(indicator_reg)}
- Target registry: {len(target_reg)}
- Crosswalk links: {len(crosswalk)}
- Evidence records: {len(evidence_reg)}

## Duplicate Issues
- Duplicate IP IDs: {dup_ip_ids}
- Duplicate Activity IDs: {dup_activity_ids}
- Duplicate Indicator IDs: {dup_indicator_ids}
- Duplicate Target IDs: {dup_target_ids}
- Duplicate activity names within same IP: {dup_activity_names}
- Duplicate indicator codes within same IP: {dup_indicator_codes}

## Missing Required Fields
- Missing IP name: {missing_ip_name}
- Missing Activity name: {missing_activity_name}
- Missing Indicator name: {missing_indicator_name}
- Missing output (indicator): {missing_output}
- Missing outcome (indicator): {missing_outcome}
- Missing target value: {missing_target_value}
- Missing evidence source document: {missing_source_doc}
- Missing evidence source row: {missing_source_row}

## Distribution Summary
- Mapping status distribution: {dict(mapping_status_counts)}
- Validation status distribution: {dict(validation_status_counts)}

## Records Requiring M&E Review
- Evidence records lacking source info: {evidence_needs_review}
- NRCS/PeaceWin incomplete_source links: {mapping_status_counts.get('incomplete_source',0)}

## Suggested Correction Priority
- Critical: duplicate IDs, missing mandatory fields.
- Warning: duplicate names/codes, incomplete mappings.
"""
with open(os.path.join(REGISTRY_DIR, 'registry_quality_audit.md'), 'w', encoding='utf-8') as f:
    f.write(audit_md)

# Helper to write CSVs
def write_csv(name, records, extra_fields=None):
    if extra_fields is None:
        extra_fields = []
    if not records:
        return
    # Compute the union of all keys across records to ensure all fields are captured
    all_keys = set()
    for rec in records:
        all_keys.update(rec.keys())
    # Preserve order: start with keys from the first record, then any additional keys, then extra_fields
    base_keys = list(records[0].keys())
    additional_keys = [k for k in all_keys if k not in base_keys]
    fieldnames = base_keys + additional_keys + extra_fields
    csv_path = os.path.join(DOCS_DIR, f"{name}.csv")
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for rec in records:
            row = dict(rec)
            for ef in extra_fields:
                row[ef] = ''
            writer.writerow(row)

review_cols = ['me_review_status','me_corrected_value','me_comments','approved_by','approved_date']
write_csv('ip_registry_validation', ip_reg, review_cols)
write_csv('activity_registry_validation', activity_reg, review_cols)
write_csv('indicator_registry_validation', indicator_reg, review_cols)
write_csv('target_registry_validation', target_reg, review_cols)
write_csv('activity_indicator_crosswalk_validation', crosswalk, review_cols)
write_csv('evidence_requirement_validation', evidence_reg, review_cols)
# NRCS/PeaceWin gap review
gap_records = [c for c in crosswalk if c.get('mapping_status') == 'incomplete_source']
write_csv('nrcs_peacewin_gap_review', gap_records, review_cols)
# Unresolved mapping review
unresolved = [c for c in crosswalk if c.get('validation_status') == 'requires_me_review']
write_csv('unresolved_mapping_review', unresolved, review_cols)
# BigQuery join readiness placeholder
join_readiness = [
    {'table':'combined_activity_summary','join_key':'registry_activity_id','status':'weak' if mapping_status_counts.get('incomplete_source') else 'ready'},
    {'table':'indicator_progress_summary','join_key':'registry_indicator_id','status':'missing_ip_identity' if any(v.get('ip_name') is None for v in indicator_reg) else 'ready'}
]
write_csv('bigquery_join_readiness_review', join_readiness, review_cols)

# Manifest JSON
manifest = {
    "registry_version": "0.1.0-draft",
    "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
    "generated_by": "Codex registry normalization",
    "source_documents_count": 0,
    "ip_count": len(ip_reg),
    "activity_count": len(activity_reg),
    "indicator_count": len(indicator_reg),
    "target_count": len(target_reg),
    "crosswalk_count": len(crosswalk),
    "evidence_count": len(evidence_reg),
    "validation_status": "pending_me_validation",
    "approval_status": "not_approved_for_dashboard_connection",
    "approved_by": None,
    "approved_date": None,
    "next_required_action": "M&E validation and approval"
}
with open(os.path.join(REGISTRY_DIR, 'registry_manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

# Guidance notes
registry_guide = """# Registry Validation Guide

## Purpose of each registry file
- **ip_registry.json** – List of implementing partners (IPs) with identifiers.
- **activity_registry.json** – Activities performed by each IP.
- **indicator_registry.json** – Indicators linked to activities/outputs.
- **target_registry.json** – Target values for each indicator.
- **activity_indicator_crosswalk.json** – Mapping between activities and indicators.
- **evidence_requirement_registry.json** – Source documentation required for each indicator.

## How M&E should review
1. Open the corresponding CSV under `docs/registry-validation/`.
2. Fill the `me_review_status` (e.g., **OK**, **Needs Correction**).
3. Provide any corrected values in `me_corrected_value`.
4. Add comments in `me_comments`.
5. Sign off using `approved_by` and `approved_date`.

## Fields that often need correction
- Duplicate IDs or names.
- Missing `output` / `outcome` fields for indicators.
- Missing source document or row for evidence.
- Incomplete NRCS/PeaceWin mappings (`mapping_status: incomplete_source`).

## NRCS/PeaceWin gaps
See `NRCS_PEACEWIN_GAP_NOTE.md` for a summary of incomplete links and required data.

## Approval workflow
- Once all CSVs have `me_review_status = OK` and are signed, update `registry_manifest.json` with `approval_status: approved` and fill `approved_by` / `approved_date`.
- Only after approval may dashboard routes be connected.
"""
with open(os.path.join(DOCS_DIR, 'REGISTRY_VALIDATION_GUIDE.md'), 'w', encoding='utf-8') as f:
    f.write(registry_guide)

# NRCS/PeaceWin note
nrcs_note = f"""# NRCS / PeaceWin Gap Note

- Number of `incomplete_source` links: {mapping_status_counts.get('incomplete_source',0)}
- Documents used for mapping: (list placeholder – review crosswalk CSV).
- Missing information: source document/row for these links.
- M&E action required: provide the missing source references or confirm placeholders.
- Recommendation: Do **not** use these incomplete mappings for Indicator Progress until resolved or formally approved.
"""
with open(os.path.join(DOCS_DIR, 'NRCS_PEACEWIN_GAP_NOTE.md'), 'w', encoding='utf-8') as f:
    f.write(nrcs_note)

# BigQuery join readiness note
bq_note = f"""# BigQuery Join Readiness Note

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
"""
with open(os.path.join(DOCS_DIR, 'BIGQUERY_JOIN_READINESS_NOTE.md'), 'w', encoding='utf-8') as f:
    f.write(bq_note)

# GBV suppression note
gbv_note = f"""# GBV Production Suppression Note

- Exact small‑cell counts must never be sent to the browser in production.
- Suppression must happen **server‑side** (e.g., in a BigQuery aggregate view) before the data reaches the front‑end.
- The front‑end should receive only `display_count` (rounded or bucketed) for cells that are below the disclosure threshold.
- Raw counts may be stored in a restricted backend layer for authorized analysts only.
- The GBV/OCMC route must remain disconnected from real data until the approved suppression view is in place.
"""
with open(os.path.join(DOCS_DIR, 'GBV_SUPPRESSION_PRODUCTION_NOTE.md'), 'w', encoding='utf-8') as f:
    f.write(gbv_note)

print('Package generation complete')
