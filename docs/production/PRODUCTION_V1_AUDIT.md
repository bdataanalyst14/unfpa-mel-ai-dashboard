# Production V1 Local Audit

7 September 2026. Existing work resumed on release/production-v1-hardening at 1d46a3cdb4ff0773563428d419e9970e6c44eb17 (same local origin/main). Stash retained, including all three excluded artifacts. No remote state was read or changed. No commit, push, deployment, environment activation, or BigQuery/KoBo/IAM/DNS change.

## Findings resolved

1. Added Total Participants as a distinct aggregate SUM; Reportable Participants remains a different SUM. COUNT(1) is only matched-row detection, never participant reach. Demographic cards consume SUM fields without row-count substitutions. No live trends, charts, detail tables, maps or AI narratives reuse prototype numbers.
2. Replaced the legacy live overview API path with the shared page-data contract. Removed duplicate live SQL, mock-based filter validation and unsupported zero-valued operational fields from the old overview service. Its mock payload remains mock-only.
3. Guarded all ten operational routes before prototype dependencies are accessed. Eight original prototype pages were compared against HEAD and preserved exactly except line endings in sibling files.
4. Fixed municipality schema reference (palika1), disabled unsupported District/Municipality live filters, made five live dimension filters parameterized, preserved redirect filters, and rejected unsupported/repeated selections. IP page supports only IP; quality and deferred pages disable filters rather than imply support.
5. Awaited quality/IP reads inside error handling, propagated API failure statuses, and removed fallback labels. Live invalid/configuration/read failures return no substitute metrics.
6. Fixed inherited auth-disable bypass for BigQuery/invalid modes. Retained OAuth, verified-email checks, exact-email RBAC and proxy callback behavior. API regression fixtures prove zero service calls for 401/403. Live page data access has its own guard in addition to the layout guard.
7. Tightened SELECT-only source validation (unapproved sources, staging, participant tables, wildcard references, comma sources, qualified CTE bypass and external operations). Preflight required columns now include Total Participants, disability and palika, and no longer require or query undocumented IP columns on quality/indicator views. Partner coverage is unavailable (null) for views without that dimension.
8. Updated release scope and route matrix to remove stale silent-fallback claims. Defined all five requested participant formulas explicitly; the three without verified warehouse lineage remain disabled.

## Evidence and limits

npm ci --legacy-peer-deps, lint (0 errors / 4 existing warnings), typecheck, npm test, dashboard-readiness and build all passed. The final production build used Next.js 16.2.11, mock/NONE and verified the server-only readiness-manifest bundle. Test CLI activation/rollback messages refer exclusively to temporary fixtures, not production.

New offline tests exercise different aggregate row/event/total/reportable values (2 / 9 / 137 / 111), both SUM expressions, suppression, five independent/combined live-only filters, alias mapping, disabled/no-data/configuration/read-error states, API status propagation, unauthorized reads and actual route guard execution. Existing suites cover OAuth/RBAC and callback preservation. SQL was inspected and exercised through mocked clients, not executed against BigQuery; these tests do not validate upstream SUM definitions or live generation contents.

Registry-backed npm audit: 8 vulnerabilities (4 high, 3 moderate, 1 low; 0 critical), exit 1. npm ci initially reported 7; a sandboxed audit inconsistently reported zero. The unrestricted registry-backed result is the reported result; no dependency upgrades or forced fixes were performed.

NOT READY for live UAT sign-off. Remaining blockers: active view/schema and WIF read validation; warehouse reconciliation and the three deferred metric mappings; authenticated browser UAT; programme/privacy scope approval; dependency advisory review. Generation expiry around 12 September 2026, branch protection and public repository review remain operational gates from the resume notes, not newly verified remote facts. Production mode was not queried or changed; the resume says it remains mock.

## File inventory

The inventory distinguishes edits made in this continuation from inherited changes retained as-is. New mock-page files contain the original prototype implementations, not newly invented metrics.

| File | Review/change classification |
|---|---|
| `.antigravity-production-v1-resume.txt` | Inherited; reviewed and retained unchanged this continuation |
| `docs/agentic_workflow/UNFPA_ROUTE_DATA_MODE_MATRIX.md` | Changed/added in this continuation |
| `docs/production/PRODUCTION_RELEASE_CHECKLIST.md` | Changed/added in this continuation |
| `docs/production/PRODUCTION_V1_AUDIT.md` | Changed/added in this continuation |
| `docs/production/PRODUCTION_V1_RELEASE_SCOPE.md` | Inherited partial work; reviewed and corrected/extended |
| `package.json` | Changed/added in this continuation |
| `proxy.ts` | Inherited; reviewed and retained unchanged this continuation |
| `scripts/dashboard/bigquery-readonly.js` | Changed/added in this continuation |
| `scripts/dashboard/production-preflight.js` | Changed/added in this continuation |
| `scripts/test-dashboard-bigquery-readonly.js` | Changed/added in this continuation |
| `scripts/test-dashboard-readiness.js` | Changed/added in this continuation |
| `scripts/test-google-auth.js` | Changed/added in this continuation |
| `scripts/test-production-smoke.js` | Changed/added in this continuation |
| `scripts/test-production-v1.js` | Changed/added in this continuation |
| `scripts/test-vercel-gcp-wif.js` | Changed/added in this continuation |
| `scripts/test-vercel-readiness-manifest.js` | Changed/added in this continuation |
| `scripts/verify.js` | Changed/added in this continuation |
| `src/app/api/dashboard/executive-overview/route.ts` | Changed/added in this continuation |
| `src/app/api/dashboard/page-data/route.ts` | Changed/added in this continuation |
| `src/app/dashboard/activity-detail/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/activity-detail/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/activity-progress/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/activity-progress/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/data-quality/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/data-quality/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/executive-overview/page.tsx` | Inherited partial work; reviewed and corrected/extended |
| `src/app/dashboard/gbv-ocmc-summary/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/gbv-ocmc/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/geographic-coverage/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/geographic-coverage/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/indicator-progress/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/indicator-progress/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/ip-performance/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/ip-performance/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/layout.tsx` | Inherited; reviewed and retained unchanged this continuation |
| `src/app/dashboard/management-decision-centre/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/management-decision-centre/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/page.tsx` | Changed/added in this continuation |
| `src/app/dashboard/participant-reach/mock-page.tsx` | Preserved original prototype content; new sibling file |
| `src/app/dashboard/participant-reach/page.tsx` | Changed/added in this continuation |
| `src/app/page.tsx` | Changed/added in this continuation |
| `src/components/dashboard/bigquery-route-view.tsx` | Inherited partial work; reviewed and corrected/extended |
| `src/components/dashboard/dashboard-filter-provider.tsx` | Inherited partial work; reviewed and corrected/extended |
| `src/components/dashboard/data-freshness-footer.tsx` | Inherited; reviewed and retained unchanged this continuation |
| `src/components/dashboard/data-source-status-panel.tsx` | Changed/added in this continuation |
| `src/components/dashboard/filtered-dashboard-scope.tsx` | Inherited; reviewed and retained unchanged this continuation |
| `src/components/layout/dashboard-shell.tsx` | Inherited; reviewed and retained unchanged this continuation |
| `src/components/layout/top-filter-bar.tsx` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/dashboard-filters.ts` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/dashboard-mode.ts` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/server/auth-policy.ts` | Inherited; reviewed and retained unchanged this continuation |
| `src/lib/server/bigquery-client.ts` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/server/bigquery-dashboard-service.ts` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/server/dashboard-page-data-service.ts` | Inherited partial work; reviewed and corrected/extended |
| `src/lib/server/dashboard-runtime.ts` | Inherited; reviewed and retained unchanged this continuation |
| `src/lib/types.ts` | Inherited; reviewed and retained unchanged this continuation |

Additional read-only review: `AGENTS.md`, `package-lock.json`, `docs/data_pipeline/BIGQUERY_LIVE_SCHEMA_VALIDATION.md`, `src/lib/server/auth-guard.ts`, `src/auth.ts`, `src/app/auth/signin/page.tsx`, `src/app/api/health/route.ts`, `src/components/dashboard/kpi-card.tsx`, `src/components/layout/sidebar-nav.tsx`, `src/data/mock/main-data.ts`, `src/data/mock/combined-summary.ts`, `scripts/run-browser-qa.js`, `playwright.config.ts`, `eslint.config.mjs`.

Route review covers the BigQuery rendering boundary for every KPI/chart/table on all ten operational pages. Retained mock-only numbers are synthetic examples, not certified programme figures. The four-view contract does not authorize direct repeatdata/activity_summary access for the three deferred definitions.

## Handoff

See PRODUCTION_RELEASE_CHECKLIST.md for evidence and uncompleted gates. No production-ready classification is asserted. No PR/remote CI operation was attempted under the user's local-only instruction. Build-generated next-env.d.ts changes were removed only after verifying their exact generated content; stash and user artifacts were not restored, popped, or modified.
