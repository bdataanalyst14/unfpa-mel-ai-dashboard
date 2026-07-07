# Suppression Acceptance Criteria

## Required Before E002 Can Be Marked Implemented

E002 must not be marked implemented until all criteria below pass.

| Criterion | Required result |
| --- | --- |
| Utility behavior | `suppressCount`, `suppressPercentage`, and `suppressRecord` pass all utility-level tests. |
| Server/API wiring | BigQuery dashboard service applies suppression before caching or returning payloads. |
| Small-cell payload safety | Exact non-zero counts `1`, `2`, `3`, or `4` are absent from returned display fields. Numeric compatibility fields may use `0` for suppressed values and require final API/browser QA. |
| Zero handling | True zero remains unsuppressed. |
| Derived percentages | Percentages are suppressed when numerator or denominator is unsafe. |
| Metadata | Suppression metadata includes display value and suppression status without raw small values. |
| Backward compatibility | Existing Executive Overview route/page does not require edits for the payload to render. |
| GBV/OCMC | GBV/OCMC remains disconnected from live data until separate privacy sign-off. |
| Freshness | E001 freshness gate is closed separately; this patch does not close freshness. |
| Build/test evidence | A configured test/build command passes in a complete dependency environment. |
| Final QA | Browser/API payload inspection confirms no raw small values are exposed. |

## Current COD-HEAVY-TECH-CLOSEOUT-009 Status

Server/API suppression is wired into the existing Executive Overview BigQuery service and documented. `scripts/verify.js` now provides a lightweight local suppression verification runner through `npm run test:verify`. Local verification passed on 2026-06-29. E002 status is therefore `suppression_tests_passed_pending_final_API_browser_QA`.

DP004 remains blocked until E001 freshness recovery and final suppression API/browser QA both pass.
