# GBV/OCMC Suppression Requirements

Audit date: 2026-06-18  
Status: audit-only privacy and suppression requirements  
Source of truth: `docs/agentic_workflow/UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`

## Activation Status

The GBV/OCMC route must not be connected to live data until an approved suppressed aggregate source exists and suppression has been verified server-side. Existing prototype or mock display suppression is not sufficient for production/live GBV or OCMC data.

## Server-Side Suppression Requirements

Suppression must happen before any response reaches the browser. The server/API layer must return disclosure-controlled display values or suppression flags only.

| Requirement | Rule |
| --- | --- |
| Suppress small non-zero cells | Counts from 1 to 4 must not be returned as exact values. Display value should be `<5` or an approved equivalent. |
| Preserve true zero only where safe | Count `0` may be displayed only when the approved privacy contract permits true zero at that aggregation level. |
| Suppress derived rates where denominators are unsafe | Percentages, averages, and rates must be suppressed or masked when they reveal a small numerator or denominator. |
| Prevent differencing | Totals and subtotals must be checked so suppressed values cannot be reconstructed by subtraction. |
| Apply complementary suppression | Additional related cells may need masking when row/column totals reveal small cells. |
| Enforce approved aggregation grain | Geography, time, age, sex, disability, service type, and facility dimensions must not combine into cells below approved thresholds. |
| Return suppression metadata | API may return safe flags such as `suppressed: true`, `display_value: "<5"`, and `reason: "small_cell"`; it must not return the raw small value. |
| Audit every query contract | All query paths must use the same suppression function/view and approved field allowlist. |

## What Must Never Reach The Browser

The browser must never receive:

| Prohibited browser payload | Reason |
| --- | --- |
| Individual-level GBV survivor or service-user records | Direct privacy and safety risk |
| Names, phone numbers, case IDs, facility record IDs, addresses, or personal identifiers | Re-identification risk |
| Exact small GBV/OCMC counts from 1 to 4 | Re-identification risk in low-caseload cells |
| Unsuppressed row-level exports or drilldowns | Bypasses dashboard masking |
| Raw age, location, service, facility, disability, or other intersections that create small cells | Linkage/reconstruction risk |
| Hidden JSON fields containing exact suppressed values | Browser tools can inspect payloads |
| Client-side raw values used only for chart masking | Client-side masking is not privacy protection |
| Debug payloads, logs, or error messages exposing raw query results | Accidental disclosure risk |

## Minimum Cell-Size And Masking Rules

| Rule | Minimum requirement |
| --- | --- |
| Primary small-cell threshold | Mask non-zero counts less than 5. |
| Display text | Use `<5` or another approved label for masked non-zero small cells. |
| Raw value handling | Do not return raw values for masked cells. |
| Derived metrics | Suppress derived metrics when numerator, denominator, or any contributing component is masked. |
| Complementary suppression | Apply where totals/subtotals can reveal masked cells. |
| Low-denominator percentages | Suppress percentages when denominators are below approved threshold or can expose small counts. |
| Export handling | Exports must follow the same or stricter suppression rules as the browser. |
| Cache/log handling | Cache, telemetry, and logs must not store raw small cells. |

Final thresholds and intersection rules require privacy owner approval before route activation. The current audit assumes the documented minimum rule: non-zero counts from 1 to 4 display as `<5` and exact raw values never leave the server/API.

## Required Tests Before GBV/OCMC Activation

| Test | Required evidence |
| --- | --- |
| API payload inspection | Confirm exact small values from 1 to 4 are absent from JSON responses. |
| Browser inspection | Confirm rendered page and devtools-visible payloads contain only masked display values. |
| Chart data inspection | Confirm chart datasets do not include raw small values. |
| Derived metric test | Confirm rates/percentages are masked when built from suppressed cells. |
| Complementary suppression test | Confirm row/column totals cannot reconstruct masked values. |
| Geography/time intersection test | Confirm district, province, period, and service-type intersections meet approved grain. |
| Role/access test | Confirm no unauthorized role can access GBV/OCMC raw or suppressed source endpoints. |
| Export test | Confirm exports follow the same suppression and field allowlist. |
| Logging/cache test | Confirm server logs, client logs, and caches do not contain raw small cells. |
| Regression test | Confirm suppression cannot be bypassed by filters, query params, sorting, or drilldowns. |

## GBV/OCMC Activation Blockers

| Blocker | Status | Required closure |
| --- | --- | --- |
| Approved suppressed aggregate source | Not confirmed in tracker | Create/approve server-side suppressed aggregate view or API contract. |
| Privacy owner sign-off | Pending | Privacy/M&E owner approves threshold, grain, and route display rules. |
| Raw small-cell exclusion from payload | Pending verification | Automated and manual tests confirm no exact 1-4 values reach browser. |
| Complementary suppression | Pending rule approval | Define and test total/subtotal masking. |
| Export/log/cache controls | Pending verification | Confirm no route, export, log, or cache exposes raw sensitive cells. |
| Route calculation contract | Pending | Approve allowed dimensions, filters, and disaggregations. |

