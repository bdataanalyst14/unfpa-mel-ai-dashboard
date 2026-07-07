# MEL Dashboard Content QA Report

Date: 2026-06-29
Gate: MEL-001 `indicator_activity_linkage_review_passed_with_caveats`
Environment: `H:\My Drive\unfpa-mel-ai-dashboard-clean`

## Commands Not Run

Per instruction, this review did not run `npm run test:verify`, `npm run build`, browser smoke testing, deployment, refresh scripts, BigQuery queries, credential access, `.env` edits, protected map/geography edits, `npm install`, `npm ci`, or node_modules repair.

## Files Reviewed

- `src/data/registry/registry_manifest.json`
- `src/data/registry/registry_data_dictionary.md`
- `src/data/registry/registry_quality_audit.md`
- `src/data/registry/indicator_registry.json`
- `src/data/registry/activity_registry.json`
- `src/data/registry/activity_indicator_crosswalk.json`
- `src/data/registry/target_registry.json`
- `src/data/registry/evidence_requirement_registry.json`
- `docs/registry-validation/REGISTRY_VALIDATION_GUIDE.md`
- `docs/registry-validation/SOURCE_REGISTRY_AUDIT_COUNTS.md`
- `docs/registry-validation/WORKBOOK_QA_VALIDATION.md`
- `docs/data_pipeline/DASHBOARD_CALCULATION_AUDIT.md`
- `docs/data_pipeline/DASHBOARD_ROUTE_LIVE_DATA_READINESS_MATRIX.md`
- `docs/data_pipeline/DASHBOARD_LIVE_CALCULATION_RECONCILIATION.md`
- `docs/data_pipeline/CALCULATION_VALIDATION_CHECKLIST.md`
- `docs/privacy/SUPPRESSION_ACCEPTANCE_CRITERIA.md`
- `docs/privacy/SUPPRESSION_WIRING_HANDOFF_NOTE.md`
- `docs/registry-validation/GBV_SUPPRESSION_PRODUCTION_NOTE.md`
- `docs/agentic_workflow/GBV_OCMC_SUPPRESSION_REQUIREMENTS.md`
- `docs/smt/SMT_ROUTE_STATUS_FOR_PRESENTATION.md`
- `docs/smt/SMT_FINAL_PRESENTATION_READINESS_NOTE.md`
- `docs/smt/SMT_FINAL_TALKING_POINTS.md`
- Dashboard pages under `src/app/dashboard/*/page.tsx`
- Chart components under `src/components/charts`
- `src/components/ActivityDetailTable.tsx`
- `src/components/dashboard/ai-insight-panel.tsx`
- `src/components/dashboard/management-action-table.tsx`
- Mock data under `src/data/mock`
- Calculation/privacy helpers under `src/lib`

## Indicator-to-Dashboard Linkage Findings

1. Executive, participant, IP, data-quality, and geographic pages mostly show operational aggregates. They can be tied to candidate aggregate views in documentation, but they are not direct logframe/result-framework indicators.
2. Indicator Progress is the main logframe-facing page, but its displayed CPD/UNSDCF/SP codes do not exact-match the draft registries or crosswalk. This is the highest M&E content risk.
3. Target-vs-actual chart values are hard-coded and use display labels, not approved registry target IDs.
4. AI insights reference mock CPD IDs such as `CPD-13`, `CPD-19`, `CPD-20`; those IDs are not registry-approved IDs.
5. Several dashboard labels are stronger than the evidence supports, including donor-ready narrative language, live aggregate wording in SMT docs, and geography footprint statements.

## Activity-to-Indicator Linkage Findings

1. `main-data.ts` generates 342 synthetic activity records with generic activity/output/outcome labels. These are not linked to `activity_registry.json` or `activity_indicator_crosswalk.json`.
2. Activity Progress includes hard-coded delayed activities and missing-evidence rows. They are useful demo rows but orphaned for final M&E QA.
3. Management action items are sensible program-management prompts, but they are not connected to approved workplan activity IDs or responsible registry records.
4. The crosswalk itself is not yet ready for dashboard connection: 331 unmatched activities, 83 incomplete-source rows, and 504 rows requiring M&E review.

## Orphan Indicators Or Activities

| Type | Finding | Impact |
| --- | --- | --- |
| Orphan displayed indicators | All displayed CPD/UNSDCF/SP codes checked had 0 exact matches in indicator, target, and crosswalk registries. | Blocks final indicator-progress QA. |
| Orphan activity rows | Synthetic `ACT-2025-*` rows in Activity Detail/Activity Progress/Data Quality are not registry records. | Blocks final activity/workplan linkage QA. |
| Unmatched crosswalk records | 331 `unmatched_activity` records. | M&E owner must resolve before route connection. |
| Incomplete-source crosswalk records | 83 `incomplete_source` records. | Requires source workbook correction. |
| Evidence records | 878 evidence records require M&E review. | Evidence status pages cannot be final without approval. |

## Calculation And Disaggregation Risks

- Indicator achievement status thresholds are coded, but target/actual source definitions are not registry-approved.
- Data quality timeliness is a placeholder/stub value in `data-quality-score.ts`.
- Participant age, caste/ethnicity, district inclusion, district density, coverage gaps, IP scorecards, monthly trend, programme progress, and target-vs-actual arrays are hard-coded demo data.
- Reporting frequency is not consistently available in registry records or page metadata.
- Disaggregation requirements appear in some indicator text but are not normalized into reliable fields for dashboard use.
- GBV derived referral rates are displayed from raw mock components and are not suppressed based on numerator/denominator safety.

## SMT Demo Caveats

- SMT demo may proceed only as `demo_ready_with_caveats` for mock/prototype pages.
- Executive Overview may be described as aggregate POC only with freshness, suppression, and final API/browser QA caveats.
- Geographic Coverage must remain prototype/mock; no live geography or final DP-004 clearance should be claimed.
- GBV/OCMC must remain mock/disconnected; client-side masking of mock data is not production privacy control.
- Management Decision Centre narrative and AI insights are illustrative and should not be described as donor-ready evidence.

## Required Fixes Before Final API/Browser QA

1. Replace displayed CPD/UNSDCF/SP mock indicator codes with approved registry IDs/codes or add an approved crosswalk from mock display codes to registry indicators.
2. Resolve the 331 unmatched activities, 83 incomplete-source rows, and 504 crosswalk rows requiring M&E review, or exclude them from final dashboard claims.
3. Replace synthetic `main-data.ts` activity rows and hard-coded activity tables with approved `activity_registry` and `activity_indicator_crosswalk` records.
4. Define calculation contracts for every dashboard metric: definition, numerator, denominator, source table/view/file, reporting frequency, and disaggregation fields.
5. Add explicit demo/prototype labels to pages using mock or hard-coded data before browser QA treats them as final.
6. Remove or qualify unsupported claims: donor-ready narrative, live geography, final DP-004 readiness, and unverified 100% coverage language.
7. Keep GBV/OCMC blocked until server-side suppressed aggregate data and API/browser payload QA are complete.

## Final Recommendation

Proceed with caveats.

The project may proceed to technical test runs after this M&E review is documented, but final API/browser QA should not be used as a production readiness sign-off until the M&E linkage backlog is resolved or the affected pages are explicitly labeled as demo/prototype.

## AI-Assisted Provisional Alignment Addendum

Date: 2026-06-29
Status: `provisional_alignment_completed_with_caveats`

- Exact registry matches found for displayed dashboard indicators: 0.
- Normalized code matches found for displayed dashboard indicators: 0.
- High-confidence AI provisional match: CPD-13 male engagement, based on men/boys positive masculinity and intergenerational dialogue evidence in registry/crosswalk records.
- Medium-confidence AI provisional matches: CPD-05 CSE, CPD-06 GBV service support, CPD-08 social norms, CPD-12 youth/peer education, CPD-19 referral pathways, CPD-20 CSE schools.
- Remaining displayed CPD/UNSDCF/SP items are `demo_sample_only_not_for_mel_signoff` or `low_confidence_or_unmatched`.
- Synthetic `ACT-2025-*` rows remain sample/demo only.

Recommendation remains: proceed to technical test with MEL caveats; do not treat test/browser QA as production or final M&E sign-off.
