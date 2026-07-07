# MEL AI Provisional Alignment Matrix

Date: 2026-06-29
Environment: clean sandbox only, `H:\My Drive\unfpa-mel-ai-dashboard-clean`
Status: `provisional_alignment_completed_with_caveats`

## Scope And Limits

This is an AI-assisted provisional alignment layer for SMT demo safety. It is not official M&E sign-off, does not replace the registry, and does not authorize live data, live geography, DP-004 clearance, GBV/OCMC activation, or production readiness.

Existing caveats preserved: `demo_ready_with_caveats`, `SMT Demo GO WITH CAVEATS`, `prototype/mock`, `pending final M&E validation`, and `pending final API/browser QA`.

## Classification Key

- `exact_registry_match`: Displayed code/name exactly matches approved registry evidence.
- `normalized_code_match`: Displayed code matches after normalization.
- `high_confidence_ai_provisional_match`: Strong thematic/name/output evidence, but not official sign-off.
- `medium_confidence_ai_provisional_match`: Plausible thematic match, requires programme validation.
- `low_confidence_or_unmatched`: Weak evidence; do not use for M&E sign-off.
- `demo_sample_only_not_for_mel_signoff`: Retain for SMT prototype only.

## Displayed Indicator Alignment

| Dashboard item | Display code | Display label | Match status | Provisional registry/crosswalk evidence | Treatment |
| --- | --- | --- | --- | --- | --- |
| CPD-01 | `CPD.O1.1` | Skilled birth attendance | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final M&E sign-off scope. |
| CPD-02 | `CPD.O1.2` | Modern contraceptive prevalence | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final M&E sign-off scope. |
| CPD-03 | `CPD.O1.3` | Unmet need for family planning | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final M&E sign-off scope. |
| CPD-04 | `CPD.O2.1` | Adolescent birth rate | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final M&E sign-off scope. |
| CPD-05 | `CPD.O2.2` | Youth accessing comprehensive sexuality education | `medium_confidence_ai_provisional_match` | Text-level thematic evidence: registry includes `SAFE-Girls9`, `3.1.1: Number of school children accessing quality comprehensive sexuality education in schools`; pending user validation. | A. Keep as demo; flag for programme validation. |
| CPD-06 | `CPD.O3.1` | GBV survivors receiving multisectoral services | `medium_confidence_ai_provisional_match` | Text-level thematic evidence: `SAFE-Girls5` and inferred `Output 2.1.1` on female GBV survivors receiving health/psychosocial support satisfaction in OCMCs; requires M&E review. | A/D. Keep demo; exclude from final sign-off until privacy/M&E approval. |
| CPD-07 | `CPD.O3.2` | Functional OCMC health facilities | `low_confidence_or_unmatched` | OCMC service theme exists, but no direct facility-functionality registry match was confirmed. | C. Move to backlog. |
| CPD-08 | `CPD.O3.3` | Women participating in social norm change programmes | `medium_confidence_ai_provisional_match` | The registry contains GEWE/social norms outputs and activities, but no exact displayed indicator match. | A. Keep demo; validate with programme team. |
| CPD-09 | `CPD.O4.1` | Population data systems using disaggregated census data | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final sign-off scope. |
| CPD-10 | `CPD.O4.2` | Evidence-based policy briefs produced | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final sign-off scope. |
| CPD-11 | `CPD.O1.4` | Health facilities providing EmONC services | `low_confidence_or_unmatched` | No exact/normalized registry or target match found. | C/D. Backlog or demo only. |
| CPD-12 | `CPD.O2.3` | Peer educators trained and active | `medium_confidence_ai_provisional_match` | Adolescent/youth safe-space training themes exist in registry, but not exact displayed code. | A. Keep demo; validate. |
| CPD-13 | `CPD.O3.4` | Male engagement sessions conducted | `high_confidence_ai_provisional_match` | Registry/crosswalk includes men and boys/intergenerational dialogue outputs and indicators, including men/boys positive masculinity/social norms language. | A. Keep as provisional; cite registry/crosswalk evidence; programme validation required. |
| CPD-14 | `CPD.O1.5` | Midwives deployed in underserved areas | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final sign-off scope. |
| CPD-15 | `CPD.O3.5` | Community mediation centres addressing GBV | `low_confidence_or_unmatched` | GBV/community themes exist, but no safe direct registry match confirmed. | C. Move to backlog. |
| CPD-16 | `CPD.O2.4` | Youth-friendly SRH service points established | `low_confidence_or_unmatched` | Youth/SRH themes exist; no direct registry evidence confirmed. | C/D. Demo only pending validation. |
| CPD-17 | `CPD.O4.3` | Local governments using population data | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final sign-off scope. |
| CPD-18 | `CPD.O1.6` | Post-partum family planning uptake rate | `demo_sample_only_not_for_mel_signoff` | No exact/normalized registry or target match found. | D. Exclude from final sign-off scope. |
| CPD-19 | `CPD.O3.6` | Referral pathways for GBV services functional | `medium_confidence_ai_provisional_match` | Registry contains `gbvpr3` on government-owned referral pathways and separate employment/enterprise referral pathway records; not exact to GBV service functionality. | A/C. Keep demo; validate before any sign-off. |
| CPD-20 | `CPD.O2.5` | Schools integrating CSE in curriculum | `medium_confidence_ai_provisional_match` | Registry includes CSE school/teacher delivery indicators, including `SAFE-Girls9` and `Output 3.1.2 # of teachers trained to deliver CSE sessions`; not exact. | A. Keep demo; validate. |
| UNSDCF/SP matrix | `UNSDCF.*`, `CP9.*`, `SP.*` | Strategic contribution examples | `demo_sample_only_not_for_mel_signoff` | No exact registry/crosswalk matches found for displayed framework codes. | D. Keep only as prototype examples. |

## Activity Alignment

| Dashboard activity source | Status | Treatment |
| --- | --- | --- |
| `main-data.ts` generated `ACT-2025-*` rows | `demo_sample_only_not_for_mel_signoff` | Do not present as official activity registry. |
| Activity Progress delayed rows | `demo_sample_only_not_for_mel_signoff` | Retain only as sample rows. |
| Data Quality disaggregation rows | `demo_sample_only_not_for_mel_signoff` | Retain only as demo QA examples. |
| Management actions | `medium_confidence_ai_provisional_match` at theme level only | Keep as illustrative management prompts pending activity/workplan linkage. |

## Summary

Exact registry matches: 0.
Normalized code matches: 0.
High-confidence provisional matches: CPD-13 only.
Medium-confidence provisional matches: CPD-05, CPD-06, CPD-08, CPD-12, CPD-19, CPD-20.
Low/unmatched or demo-only: remaining displayed indicators and all displayed UNSDCF/SP framework examples.
