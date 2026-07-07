# MEL Indicator Activity Linkage Matrix

Date: 2026-06-29
Scope: Clean sandbox content-readiness review only. No build, npm verification, browser smoke test, deployment, refresh, BigQuery query, credential access, `.env` edit, protected map edit, install, ci, or node_modules repair was run.

## Gate Decision

MEL-001: `indicator_activity_linkage_review_passed_with_caveats`

The review is complete, but dashboard content is not ready for final API/browser QA without caveats because the current registry is draft and several dashboard pages use mock, synthetic, or hard-coded content that is not linked to approved indicator/activity records.

## Registry Evidence Base

| Registry item | Evidence |
| --- | --- |
| Registry manifest | `approval_status: not_approved_for_dashboard_connection`; `validation_status: pending_me_validation`. |
| Indicator registry | 217 records; 170 `matched_direct`, 45 `matched_inferred`, 2 `incomplete_source`. |
| Activity registry | 575 records; draft/provisional. |
| Activity-indicator crosswalk | 878 records; 374 `matched_direct`, 90 `matched_inferred`, 331 `unmatched_activity`, 83 `incomplete_source`; 504 require M&E review. |
| Evidence registry | 878 records; all require M&E review. |
| Quality audit | 173 indicators missing output/outcome; 170 target records flagged with missing target value in audit; duplicate activity names and indicator codes exist. |

## Route-Level Linkage Matrix

| Dashboard route/page | Displayed metric/activity group | Current source | Indicator/result-framework linkage verdict | Activity/workplan linkage verdict | Definition/calculation/frequency/disaggregation verdict | Required action |
| --- | --- | --- | --- | --- | --- | --- |
| Executive Overview | Total events, participants, sex split, districts, IPs, data quality, submissions | BigQuery service when configured, otherwise `combined-summary.ts`; charts still use mock components | Operational aggregate metrics can be tied to `combined_activity_summary`, `data_quality_summary`, and `ip_submission_status`; not direct logframe indicators. | Not linked to approved activity crosswalk in page. | Basic formulas documented in data-pipeline docs; reporting frequency and disaggregation require final data contract/API QA. | Keep as aggregate POC with caveats; do not claim indicator-level performance from this page. |
| Activity Progress | Total activities, completed, late submissions, missing evidence, monthly trends, project progress, delayed activity rows | `combined-summary.ts`; hard-coded delayed activity rows; chart hard-coded arrays | Not indicator-linked. | Orphan/synthetic activity IDs such as `ACT-2025-0045`, `ACT-2025-0112`, and hard-coded progress rows are not confirmed against `activity_registry.json`. | Activity completion and evidence formulas are partly defined, but project planned/completed values are hard-coded and not crosswalk-approved. | Replace hard-coded rows/charts with approved activity registry/crosswalk records or label as demo. |
| Participant & Reach | Total reached, beneficiaries, female share, guests, age/caste/district inclusion | `combined-summary.ts`; hard-coded age/caste/district arrays | Participant reach is an operational aggregate, not a specific CPD/SP/UNSDCF indicator in current page. | Not activity-linked. | Sex calculation is clear; age/caste/district values are hard-coded and not source-linked; frequency not defined in page. | Mark as demo/aggregate until live aggregate source and disaggregation contract are verified. |
| Indicator Progress | CPD output indicators, UNSDCF/SP mappings, target vs actual, status distribution | `cpd-indicators.ts`, `unsdcf-sp-indicators.ts`, hard-coded chart arrays | Displayed CPD/UNSDCF/SP codes do not match `indicator_registry.json`, `target_registry.json`, or crosswalk by code. Text-level matches are sparse and not enough for sign-off. | Not linked to activity crosswalk. | Status thresholds are defined in code, but target/actual definitions, frequency, source, and disaggregation are not registry-approved. | Block for final QA until displayed codes are replaced by approved registry IDs/codes and target records. |
| IP Performance | Active partners, quality score, late submissions, pending validations, scorecards | `combined-summary.ts`; hard-coded `ipScorecards`; chart components | Operational reporting metric, not logframe indicator-linked. | Not activity-linked; IP scorecards include inconsistent object keys (`events` vs `value`) and are demo rows. | Timeliness/compliance definitions need source contract. | Keep demo caveat; source from `ip_submission_status`/approved evidence registry before final QA. |
| Geographic Coverage | Provinces/districts/palikas covered, coverage gaps, district activity density | `combined-summary.ts`; hard-coded district/gap arrays; protected map component/mock geography | Geographic coverage is operational footprint, not direct indicator-linked. | Coverage gaps are not linked to approved activity registry/workplan evidence. | Map remains protected prototype; live geography is not proven. | Maintain `demo_ready_with_caveats`; do not claim live geography or DP-004 clearance. |
| GBV / OCMC Summary | Survivors reached, referrals, follow-ups, district/caste disaggregation | `gbv-services.ts` mock data and client-side display suppression | Some GBV text-level indicators exist in registry, but displayed route is not linked to approved suppressed aggregate source or approved indicator IDs. | Not linked to approved activity/crosswalk records. | Client receives raw mock small values before rendering suppression; acceptable only as mock/demo, not production/live. Derived referral rates are not suppressed when components are unsafe. | Keep blocked for live activation; require server-side suppressed aggregate source and API/browser payload QA. |
| Data Quality & Evidence | Data quality score, pending validation, missing evidence, validation rate, disaggregation checks | `combined-summary.ts`; hard-coded validation rows | Operational data-quality metric, not logframe indicator-linked. | Hard-coded activity IDs are not registry-approved. | Evidence/validation formulas partly defined; timeliness is a stub in `data-quality-score.ts`; page has hard-coded `90.9%`. | Define calculation contract and source from approved evidence registry/submission logs. |
| Management Decision Centre | AI insights, action items, donor narrative, off-track indicators | `ai-insights.ts`, `cpd-indicators.ts`, hard-coded action table/narrative | AI insights reference mock CPD IDs, not registry-approved indicator IDs. Donor narrative contains unsupported program claims. | Suggested actions are not linked to approved workplan activities. | Narrative generation is not evidence-backed enough for final QA. | Keep for SMT demo only with caveats; block donor-ready or production claims. |
| Activity Detail | Activity rows, activity IDs, partner, location, reach, evidence/status | synthetic `main-data.ts` generated 342 rows | Not indicator-linked. | Activity IDs, outcome/output labels, activity names, and subactivities are synthetic and not linked to `activity_registry.json` or crosswalk. | Calculation/disaggregation fields exist but are generated demo data. | Replace with approved activity registry/crosswalk before final API/browser QA. |

## Displayed Indicator Code Check

The currently displayed CPD/UNSDCF/SP codes in `cpd-indicators.ts` and `unsdcf-sp-indicators.ts` returned 0 exact matches by code against `indicator_registry.json`, `target_registry.json`, and `activity_indicator_crosswalk.json`.

Text-level matches exist for a small subset of themes, such as CSE, GBV service satisfaction, and referral pathways, but these are not enough to confirm dashboard linkage because they use different registry codes, provisional mapping statuses, or require M&E review.

## Activity-to-Indicator Crosswalk Readiness

| Crosswalk status | Count | Content-readiness implication |
| --- | ---: | --- |
| `matched_direct` | 374 | Potentially usable after M&E validation. |
| `matched_inferred` | 90 | Requires M&E review before dashboard use. |
| `unmatched_activity` | 331 | Orphan activity risk. |
| `incomplete_source` | 83 | Source-workbook gap; cannot support final dashboard linkage. |
| Requires M&E review | 504 | Blocks final registry-dependent dashboard QA. |

## Overall Matrix Verdict

MEL-001 is complete as a review, but content readiness is `passed_with_caveats`, not final. Operational aggregate pages may proceed to technical testing with caveats. Registry-dependent pages must not proceed to final API/browser QA until the indicator/activity linkage patches are completed.
