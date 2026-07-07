# Final Blocker and Manager Decision Register

This register details all unresolved blocking items, technical caveats, and pending approvals for the UNFPA MEL AI Dashboard.

| Blocker / Decision Item | Current Status | Owner Required | Action Required | Risk if Not Addressed | Recommended Decision |
|---|---|---|---|---|---|
| **1. Vercel Preview Protection** | `ACTIVE BLOCKER` | Vercel Project Owner | Disable preview protection or share a secure access bypass mechanism. | Staging smoke test cannot run; launch blocked. | Approve temporary bypass/access unblock. |
| **2. AG-083 Smoke Test Status** | `BLOCKED` | Assigned QA Tester | Execute route-by-route checks once Vercel preview is accessible. | UI errors or payload structure bugs go undetected. | Unblock and execute post-haste. |
| **3. AG-090 Production Approval** | `BLOCKED` | Project Manager | Delay approval until AG-083 smoke test results pass. | Premature launch of untested code. | Keep blocked until AG-083 is fully resolved. |
| **4. Production Deployment** | `NOT APPROVED` | Release Engineer | Strictly suspend pipeline pushes to production branch. | Overwriting production environment with unverified staging code. | Maintain suspension. |
| **5. BigQuery Live Validation** | `NOT APPROVED` | Database Administrator | Authorize live query run checks against BigQuery datasets. | Mock data behavior fails to replicate live schema structure. | Review and approve live queries in staging before production. |
| **6. Google Connectors** | `NOT APPROVED` | Project Manager | Decide if/when Google connectors should be enabled. | Insecure pipeline access to external collaborative documents. | Keep disabled until final security audit passes. |
| **7. npm Audit Vulnerabilities** | `PENDING` | Security Lead | Review and sign off on peer-dependency warnings. | Security vulnerabilities in underlying node modules. | Review vulnerability severity; approve bypass for non-runtime items. |
| **8. Partial Geography Caveat** | `ACTIVE CAVEAT` | GIS Specialist | Review GeoJSON Nepal district coverage. | Users assume full national data coverage. | Retain prominent warning text on geographic coverage views. |
| **9. In-Memory Cache Durability** | `ACTIVE CAVEAT` | Lead Developer | Document memory footprint constraints. | Serverless restarts clear memory cache, reducing query speed. | Accept cache risk for prototype phase; transition to redis if needed later. |
| **10. Rollback Owner Confirmation** | `PENDING` | DevOps Lead | Assign engineer responsible for rollback execution. | Unresolved bugs in production cause prolonged downtime. | Formally designate a rollback owner before launch. |
| **11. Smoke Test Owner Confirmation** | `PENDING` | QA Lead | Formally assign the smoke-test engineer. | Testing is delayed or executed inconsistently. | Designate QA Lead/Lead Tester. |
| **12. Privacy/Safeguarding Sign-off** | `PENDING` | Safeguarding Officer | Audit suppression engine once staging dashboard loads. | Small-cell values (1–4) exposed, violating beneficiary privacy. | Conduct live audit on staging; require explicit safeguarding sign-off. |
## AG-088 Decision Update

- Access method: Vercel Shareable Link used; token redacted.
- Previous blocker: Vercel login/protection wall prevented dashboard UI access.
- Current state: Share-link access allowed direct dashboard content-route HTTP smoke checks.
- Remaining blocker: Full AG-083 browser-based visual and interactive smoke test has not passed.
- Manager decision required: approve a browser-based AG-083 rerun using the secure share-link access method; do not approve AG-090 or production deployment until AG-083 passes with evidence.
## AG-089 Browser Smoke Test Blocker

- Status: Blocked.
- Access method: Vercel Shareable Link used; token redacted.
- Blocker: The AG-089 runtime prompt did not include an actual shareable link, so browser QA could not be executed.
- Manager decision required: provide the actual Vercel Shareable Link in the runtime prompt or approve a secure browser QA handoff.
- Restriction: Do not approve AG-090 or production deployment until browser-based AG-083 evidence passes.

## AG-091 Dependency Restore and Documentation Hygiene Update

- `npm ci --legacy-peer-deps` failed with EPERM error (code -4048) on `node_modules\@typescript-eslint\scope-manager\dist\referencer\Reference.d.ts.map`.
- Root cause: Google Drive for Desktop sync process holds file locks during npm ci, preventing unlink of existing package files.
- This is an environmental constraint, not a code defect.
- Impact: `npm run build` and `npm run lint` remain blocked; `next` binary still missing from `node_modules\.bin`.
- `npm run test:verify`: **PASSED — 19/19 checks.**
- Documentation hygiene: **CLEAN** — no actual `_vercel_share` token values confirmed in docs; 2 placeholder/example patterns sanitized.
- Git metadata: Unavailable/corrupted in clean workspace; no repair attempted.
- Manager decision required: pause Google Drive sync, then retry `npm ci --legacy-peer-deps`; or approve installation in a local non-Drive path.
- Restriction: Do not approve AG-090 or production deployment until build and lint pass.
## AG-092 Local QA Decision Update

- Status: Local QA passed in temporary workspace outside Google Drive.
- Temporary QA path: `C:\work\unfpa-mel-ai-dashboard-qa-AG092`
- Resolved local blocker: Google Drive `node_modules` file-lock/build shim issue was bypassed by using a clean temporary QA copy.
- Remaining blocker: AG-083/AG-089R browser staging smoke test has not passed with complete evidence.
- Production decision: blocked.
- Manager decision required: complete and approve browser staging smoke evidence before AG-090 production review; decide separately on npm audit vulnerabilities.
## AG-093 Browser Smoke Test Decision Update (Final)

- Status: **Failed.**
- Access method: Vercel Shareable Link used; token redacted.
- Browser: Google Chrome headless; desktop and mobile-width viewports.
- Screenshots captured: 9 files (01–09; see `docs/agentic_workflow/evidence/ag_093_browser_smoke/`).
- Resolved item: Staging dashboard UI was reachable without the Vercel login/SSO wall.
- Passed checks: staging access, desktop dashboard load, all 10 desktop route renderings, programme coverage map, charts/visualizations, privacy/suppression messaging, Management Decision Centre advisory posture, Copy Narrative Draft behavior, filter interaction, navigation check, console/runtime (non-blocking warnings only).
- **DEFECT-001 — Mobile Responsive Layout (Severity: Major)**:
  - Description: Fixed sidebar consumes most of the mobile viewport (~390px width). Main dashboard content is clipped off-screen and not readable.
  - Evidence: `07_mobile_responsive_view.png`
  - Impact: Dashboard not usable on mobile devices or small-viewport screens.
  - Required resolution: Developer fixes sidebar collapse/hide at mobile breakpoints, **OR** manager formally accepts as a documented caveat.
- Manager decision required — choose one:
  - **Option A (Recommended):** Request responsive layout fix; rerun mobile smoke check; advance to AG-094/AG-090 only after confirmed pass.
  - **Option B:** Formally accept DEFECT-001 as a documented limitation (mobile not supported for this release). Record caveat in AG-090 production package. Proceed to AG-094/AG-090 with caveat noted.
- Restriction: Do not approve production deployment until one of the above options is formally actioned and recorded.

## AG-094 Responsive Layout Fix — Decision Resolution

- Manager decision actioned: **Option A selected** — responsive layout fix implemented.
- DEFECT-001 status: **FIXED in source code.**
- Fix: `dashboard-shell.tsx` converted to client component with `sidebarOpen` state. Sidebar is off-canvas on mobile, toggled by hamburger `<Menu>` button in a sticky mobile top bar. Backdrop overlay and `<X>` close button dismiss the drawer. `sidebar-nav.tsx` accepts `onNavigate` callback to close drawer on link tap. Desktop layout (`md:` breakpoint and above) is unchanged.
- `tsconfig.json`: Added `node_modules_old`, `clean_install`, `unfpapalika` to exclude list — pre-existing non-app directories not previously excluded.
- `npm run build`: PASSED — BUILD_EXIT: 0, 16 pages.
- `npm run lint`: PASSED — LINT_EXIT: 0.
- `npm run test:verify`: PASSED — 19/19 checks.
- Remaining action: Manager triggers staging rebuild from updated source. QA tester captures screenshots 10–13 using active Vercel Shareable Link to visually confirm mobile fix.
- If browser rerun passes: mark AG-083 as PASSED; prepare AG-095/AG-090 production approval package.
- Production remains locked until browser rerun confirms pass and manager signs AG-090 Go/No-Go form.
