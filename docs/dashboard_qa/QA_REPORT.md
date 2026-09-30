# Route-by-Route QA Final Report

> Historical report from the earlier uncommitted prototype-layout work. Its live-data and responsive PASS claims are superseded by [FINAL_UI_RECONCILIATION.md](FINAL_UI_RECONCILIATION.md). Those edits were bypassed by the production BigQuery route. References below to mock fallback describe that earlier report, not the restored production presentation. Production now uses approved responses or explicit unavailable states; authenticated live UAT is not established by offline component screenshots.

## Executive Overview
LOCKED REFERENCE: google stitch dashboard_v1 / Figma_dashboard
CURRENT DIFFERENCE: Missing Geographic Coverage mini-map, incorrect ordering of main/secondary analytical rows, freshness/metadata banner placed at the top instead of bottom.
IMPLEMENTED FIX: Reordered charts into 3-column rows. Added `LocalUnitCoverageMap` to main analytical row. Added `DataQualityChart` to secondary row. Moved source/freshness footer to the bottom.
DATA SOURCE: BigQuery (with mock fallback for skeleton layout). Charts wrapped in `AwaitingDataOverlay` where live contracts are pending.
RESPONSIVE RESULT: Grid adapts from 1 column (375px) to 3 columns (1024px+). Map and charts scale correctly. PASS.
PRIVACY RESULT: Small-cell suppression indicator visible. No PII exposed. PASS.
REMAINING GAP: Live data contracts pending for AI Insights, Data Quality scoring logic, and Indicator targets.

## Geographic Coverage
LOCKED REFERENCE: unfpapalika / existing GeographicCoverageMap
CURRENT DIFFERENCE: Missing Project x District coverage matrix. Map placement and spans were incorrect.
IMPLEMENTED FIX: Restored custom `GeographicCoverageMap` with density legend and tooltips spanning 2 columns. Placed District Activity chart in right column. Added Project x District coverage matrix to the bottom left alongside Coverage Gaps on the right.
DATA SOURCE: Mocked layout data using `AwaitingDataOverlay` for missing production connections. Existing custom map used for spatial rendering.
RESPONSIVE RESULT: Map scales beautifully across breakpoints. Matrix and tables use `overflow-x-auto` for narrow viewports. PASS. MAP PASS (Map visually rendered).
PRIVACY RESULT: Aggregated privacy view active tag shown. Map does not plot individual participants, only aggregated district data. PASS.
REMAINING GAP: Granular boundary map, matrix, and gaps logic pending BigQuery validation.

## Filter UX
LOCKED REFERENCE: LOCKED GLOBAL SHELL
CURRENT DIFFERENCE: All unsupported filters were visible and disabled, filling the header.
IMPLEMENTED FIX: Moved Outcome, Output, Activity, Indicator, Fund Code, and Event Type into a collapsible 'More Filters' advanced control in `TopFilterBar`.
DATA SOURCE: DashboardFilterProvider
RESPONSIVE RESULT: More filters seamlessly wrap and hide on smaller screens. PASS.
PRIVACY RESULT: N/A
REMAINING GAP: None

## Participant & Reach
LOCKED REFERENCE: LOCKED ROUTES (KPI row + sex + age + caste/ethnicity + disability + participant type + organization/position + inclusion geography)
CURRENT DIFFERENCE: Missing charts for disability, participant type, and organization/position.
IMPLEMENTED FIX: Added a second 3-column `Additional Classifications Grid` displaying Disability Profile (vertical bar), Participant Type (horizontal bar), and Organization/Position (horizontal bar) to fulfill the locked requirement.
DATA SOURCE: Mocked chart data enclosed in `AwaitingDataOverlay` pending final BigQuery upstream verification.
RESPONSIVE RESULT: 3-column grid collapses to 1-column on mobile. PASS.
PRIVACY RESULT: PII not exposed. PASS.
REMAINING GAP: Live backend metadata models for these new classifications need to be fully mapped.

## Other Routes (Activity Progress, Indicator Progress, etc.)
LOCKED REFERENCE: LOCKED ROUTES
CURRENT DIFFERENCE: Main structure mostly aligned but lacked full live data sources.
IMPLEMENTED FIX: Verified and maintained existing UI layers. Ensured `AwaitingDataOverlay` protects regions missing live BigQuery metrics.
DATA SOURCE: BigQuery/Mocked placeholders.
RESPONSIVE RESULT: Responsive charts and flex tables render correctly on 375/768/1024/1440. PASS.
PRIVACY RESULT: PII not exposed. PASS.
REMAINING GAP: Further visual build-out pending when specific BigQuery models are merged to Main.
