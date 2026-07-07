# Suppression Test Runner Note

Date: 2026-06-29

## Runner

`scripts/verify.js` is a lightweight Node verification runner exposed through:

```powershell
npm run test:verify
```

It loads the implementation block from `src/lib/server/suppression.ts` in memory using only Node built-ins and does not use Jest, Vitest, TypeScript runtime loading, BigQuery, live routes, refresh scripts, credentials, or `.env` files.

## Covered Contract

- `suppressCount(0)` remains visible.
- `suppressCount(1)`, `2`, `3`, and `4` return `<5` with `suppressed: true`.
- `suppressCount(5)` remains visible.
- `null`, `undefined`, `NaN`, non-numeric strings, and negative values are invalid and suppressed safely.
- `suppressPercentage` suppresses unsafe numerator or denominator values.
- Invalid zero denominator is suppressed safely.
- Safe numerator and denominator values return a percentage.
- Suppressed display values do not expose raw `1`, `2`, `3`, or `4`.
- `suppressRecord` handles nested payloads and top-level numeric payloads.
- `bigquery-dashboard-service.ts` imports/uses suppression utilities and includes suppression metadata.

## Result

Local result: passed on 2026-06-29.

E002 remains `suppression_tests_passed_pending_final_API_browser_QA` because final API/browser payload QA has not been completed.
