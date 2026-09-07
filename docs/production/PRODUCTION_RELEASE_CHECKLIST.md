# Production V1 Release Checklist

Evidence date: 7 September 2026. Branch: release/production-v1-hardening. Base/HEAD: 1d46a3cdb4ff0773563428d419e9970e6c44eb17.

## Local checks

- [x] Read resume notes and existing release scope before edits; reviewed inherited dirty state.
- [x] Preserved existing valid changes and stash (next-env.d.ts, dashboard.html, exec.html). No branch switch, reset, stash pop, staging, commit or push.
- [x] Separate SUM(total_participants) and SUM(total_reportable_participants); aggregate row count is only a no-data check.
- [x] Three unverified participant definitions documented and deferred without raw-table access.
- [x] Five parameterized live filters tested individually and in combination with live-only fixture values; unsupported filters fail explicitly.
- [x] Every operational page guarded before prototype rendering; eight mock pages preserved.
- [x] Four-view runtime boundary and adversarial query cases tested; no live BigQuery/KoBo reads or writes in this continuation.
- [x] Configuration/read failures have no silent mock fallback; disabled and no-data states are explicit.
- [x] OAuth verified-email/exact-email RBAC tests pass; invalid/live modes cannot disable authentication; unauthorized API data calls = 0 in offline tests.
- [x] npm ci --legacy-peer-deps passed after Windows sandbox spawn retry.
- [x] npm run lint passed: 0 errors, 4 pre-existing warnings in activation/rollback scripts.
- [x] npm run typecheck passed.
- [x] npm test passed, including new test:production-v1 and existing suppression, readonly, WIF, manifest and auth suites.
- [x] npm run test:dashboard-readiness passed.
- [x] npm run build passed with Next.js 16.2.11 and mock/NONE manifest; bundled server-only manifest trace verified.
- [x] Registry-backed npm audit completed: exit 1, 4 high + 3 moderate + 1 low = 8. No audit fix or dependency version changes.
- [x] Build-only next-env.d.ts edits removed after checking the exact generated diff; no release diff for excluded artifacts.

## Remaining gates

- [ ] Dependency advisory remediation/risk review: brace-expansion, browserslist, js-yaml, nanoid (high); next, postcss, tailwindcss (moderate); postcss-selector-parser (low).
- [ ] Active approved-view schema/read-only WIF validation and aggregate reconciliation for Total/Reportable Participants.
- [ ] Warehouse evidence for COUNT(repeatdata), filtered COUNT(repeatdata), and SUM(activity_summary.gender_total), with approved-view mappings before exposing those three KPIs.
- [ ] Authenticated browser UAT of five filters, all ten routes, login callback, no-data and failure states; no browser UAT executed in this continuation.
- [ ] Programme approval of reduced route scope, demographic semantics and API live payload change.
- [ ] Generation refresh/expiry review before UAT; existing risk around 12 September 2026, unchanged.
- [ ] Main branch protection configuration and public-repository operational review (resume-note status, not remotely reverified).
- [ ] Separately authorized production DATA_MODE/WIF activation and final Production UAT. No production environment, OAuth configuration, IAM, DNS, KoBo or BigQuery state changed.

Decision: local implementation checks pass; NOT READY for live UAT sign-off or production readiness certification. The deferred three metrics cannot be certified from repository schema names alone. Explicitly labeled mock review remains possible.

## Final Deployment Status
- [x] Vercel CLI Authenticated as: bdataanalyst14
- [x] Deployed commit SHA: fe72b42c8b6da46bd7bc11e0561db07c040bfb72
- [x] Production URL: https://unfpa-mel-ai-dashboard.vercel.app
- [ ] Authenticated UAT: Pending interactively by user due to Google OAuth.
