# Suppression Test Cases

## Unit Test File

`src/lib/server/suppression.test.ts`

## Utility-Level Cases

| Case | Expected result |
| --- | --- |
| `suppressCount(0)` | Not suppressed; display value `0` |
| `suppressCount(1)` | Suppressed; display value `<5`; raw small value omitted |
| `suppressCount(4)` | Suppressed; display value `<5`; raw small value omitted |
| `suppressCount(5)` | Not suppressed; display value `5` |
| `suppressCount(null)` | Suppressed invalid value; display value `N/A` |
| `suppressCount(undefined)` | Suppressed invalid value; display value `N/A` |
| `suppressCount(NaN)` | Suppressed invalid value; display value `N/A` |
| `suppressCount(-1)` | Suppressed invalid value; display value `N/A` |
| `suppressCount("3")` | Suppressed invalid value; display value `N/A` |
| `suppressPercentage(4, 20)` | Suppressed because numerator is unsafe |
| `suppressPercentage(20, 4)` | Suppressed because denominator is unsafe |
| `suppressPercentage(20, 0)` | Suppressed invalid denominator; display value `N/A` |
| `suppressPercentage(10, 20)` | Not suppressed; display value `50.0%` |
| Raw display values `1`, `2`, `3`, `4` | Must never appear as `displayValue` |
| Nested record with small numeric fields | Small numeric fields replaced with suppression result objects |
| Top-level numeric record payload | Small numeric payload replaced with suppression result object |

## Service-Level Cases For Final QA

These require a working test runner or a controlled API payload inspection.

| Case | Expected result |
| --- | --- |
| BigQuery aggregate count equals `1`, `2`, `3`, or `4` | API summary numeric compatibility field is `0`; metadata display value is `<5`; raw exact count absent |
| BigQuery aggregate count equals `0` | API summary field is `0`; metadata display value is `0`; not suppressed |
| BigQuery aggregate count equals `5+` | API summary field keeps exact count; metadata not suppressed |
| Participant share numerator or denominator is `1-4` | Percentage metadata display value is `<5`; raw derived percentage absent |
| Participant share numerator and denominator are safe | Percentage metadata contains safe percentage display value |
| Mock mode | Continues to return mock payload without BigQuery route expansion |

## Current Test Execution Status

`scripts/verify.js` now runs the same core contract without Jest/Vitest or live services. Local result on 2026-06-29:

```powershell
npm run test:verify
```

Result: passed.
