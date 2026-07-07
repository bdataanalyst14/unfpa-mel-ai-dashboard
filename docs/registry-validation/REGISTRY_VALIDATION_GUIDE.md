# Registry Validation Guide

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
