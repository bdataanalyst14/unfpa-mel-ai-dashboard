# AG-083 Evidence Capture Template

This template is to be used by the QA engineer or tester when executing the smoke test on the staging preview deployment.

---

## 1. Test Session Information
* **Tester Name / Role:** `[Enter Name / Role - e.g., Quality Assurance Lead]`
* **Date & Time of Test:** `[Enter Date & Time - e.g., 2026-07-06 14:00 UTC]`
* **Staging Preview URL:** https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app
* **Testing Browser & Version:** `[Enter Browser - e.g., Chrome 124.0.0]`
* **Device / Operating System:** `[Enter Device/OS - e.g., Windows 11 Enterprise]`

---

## 2. Route Verification Evidence
For each route, document the result and reference a screenshot file demonstrating correct rendering.

### Route: `/` (Redirect to Executive Overview)
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_root_redirect.png]`
* **Issues Observed:** `[None / Describe Issues]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/executive-overview`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_executive_overview.png]`
* **Privacy/Safeguarding Observation:** `[Confirming no sensitive individual data displayed]`
* **Governance/Advisory-Only Observation:** `[Confirming mock data indicators and general disclaimers visible]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/activity-progress`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_activity_progress.png]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/indicator-progress`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_indicator_progress.png]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/participant-reach`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_participant_reach.png]`
* **Privacy/Safeguarding Observation:** `[Confirming cell counts <5 are suppressed if applicable]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/data-quality`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_data_quality.png]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/gbv-ocmc-summary`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_gbv_ocmc_summary.png]`
* **Privacy/Safeguarding Observation:** `[Verify small cell suppression: counts 1–4 are shown as "<5", and negative/null are "N/A"]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/ip-performance`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_ip_performance.png]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/activity-detail`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_activity_detail.png]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/management-decision-centre`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_management_decision_centre.png]`
* **Governance/Advisory-Only Observation:** `[Verify advisory-only disclaimer language is present and clear]`
* **Notes:** `[Enter Notes]`

### Route: `/dashboard/geographic-coverage`
* **Result (Pass/Fail):** `[ ]`
* **Screenshot Filename Reference:** `[evidence/route_geographic_coverage.png]`
* **Geographic Map Observation:** `[Confirming custom Nepal map renders, no external Google/Mapbox/Leaflet API calls loaded]`
* **Notes:** `[Enter Notes]`

---

## 3. General Evidence Capture

### API Checks
* **Endpoint:** `/api/dashboard/executive-overview`
  * **Result:** `[Pass/Fail]`
  * **Response Shape Status:** `[e.g., Status 200 OK, valid JSON structural shape]`
* **Endpoint:** `/api/dashboard/page-data`
  * **Result:** `[Pass/Fail]`
  * **Response Shape Status:** `[e.g., Status 200 OK, valid JSON structural shape]`

### UI / Element Interactivity
* **Sidebar Navigation Flow:** `[Pass/Fail]`
* **Copy Narrative Draft Action:** `[Pass/Fail]`
* **Advisory Disclaimer Placement:** `[Pass/Fail]`

---

## 4. Privacy & Governance Observations
* **Survivor/Beneficiary Names Checked?** `[Yes/No]`
* **Case-level Data Scanned?** `[Yes/No]`
* **Small-cell Suppression Active?** `[Yes/No]`
* **Decision Support Advisory Confirmed?** `[Yes/No]`

* **Safeguarding Observations Summary:**
  `[Write any specific privacy or safeguarding notes here]`

* **Governance Observations Summary:**
  `[Write any specific governance or advisory-only notes here]`

---

## 5. Session Verdict
* **Final Verdict:** `[Choose: PASS / FAIL / BLOCKED]`
* **Issues/Blocker Log:**
  `[List any issues, including Severity (Low, Medium, High, Blocker)]`
## AG-088 Corrected Access Evidence Entry

- Tester: Codex controlled QA run
- Date/time: 2026-07-06
- Preview access: Access method: Vercel Shareable Link used; token redacted.
- Browser/device: HTTP content smoke checks only; browser visual QA still required.
- Route tested: AG-083 route set
- Result: Direct dashboard content routes returned HTTP 200 and did not show Vercel login/SSO wall.
- Screenshot/evidence note: No screenshot captured in this run; token was not saved in any screenshot or file.
- Issue severity: Major caveat
- Privacy/safeguarding observation: Privacy/suppression wording detected on GBV and management/geographic pages; full visual confirmation still required.
- Governance/advisory-only observation: Management Decision Centre content route returned dashboard content; full advisory-only interaction review still required.
- Notes: BigQuery live validation, connector checks, deployment, and production actions were not performed.
## AG-089 Browser Smoke Test Attempt

- Tester: Codex controlled QA run
- Date/time: 2026-07-06
- Preview access: Access method: Vercel Shareable Link used; token redacted.
- Browser/device: Not opened; runtime shareable link was not provided.
- Route tested: Not tested.
- Result: Blocked.
- Screenshot/evidence note: No screenshots captured.
- Issue severity: Blocker.
- Privacy/safeguarding observation: Not assessed in browser.
- Governance/advisory-only observation: Not assessed in browser.
- Notes: The prompt contained a placeholder instead of an actual runtime shareable link. No token search was performed.
## AG-093 Browser Smoke Evidence Entry (Final)

- Tester: Antigravity / controlled browser QA run
- Date/time: 2026-07-07
- Preview access: Vercel Shareable Link used; token redacted.
- Browser/device: Google Chrome headless; desktop viewport and mobile-width (~390px) viewport.
- Routes tested: All 10 dashboard routes (desktop); mobile viewport on Executive Overview.
- Result: **Failed.**
- Screenshot/evidence files:
  - `01_executive_overview.png` — Executive Overview desktop load
  - `02_geographic_coverage_map.png` — Programme / Geographic Coverage map
  - `03_activity_detail_log.png` — Activity Detail Log
  - `04_console_runtime_check_non_blocking_warnings.png` — Console non-blocking warnings
  - `05_data_quality_privacy_suppression.png` — Data Quality privacy/suppression messaging
  - `06_management_decision_copy_narrative.png` — Management Decision Centre / Copy Narrative Draft
  - `07_mobile_responsive_view.png` — Mobile responsive view (DEFECT-001)
  - `08_filter_interaction.png` — Filter interaction
  - `09_navigation_check_summary.png` — Navigation check summary
- Evidence location: `docs/agentic_workflow/evidence/ag_093_browser_smoke/`
- Issue severity: Major.
- Defect: DEFECT-001 — Fixed sidebar consumes most of the mobile viewport and clips dashboard content at mobile widths. Dashboard not usable on mobile.
- Privacy/safeguarding observation: Suppression metadata and aggregate privacy view were visible; no personal identifiers or survivor-level GBV records observed.
- Governance/advisory-only observation: Management Decision Centre remained advisory/prototype; no autonomous approval behavior observed.
- Console: Non-blocking warnings only — favicon.ico 404, browser extension ZERO_PHISHING/content_script message, Chrome policy/GCM noise. No blocking application errors.
- Notes: All desktop checks passed. Mobile responsive view failed. Test cannot be marked passed until DEFECT-001 is fixed or formally accepted as a manager caveat.

## AG-094 Responsive Layout Fix — Rerun Evidence Entry

- Task: AG-094 — DEFECT-001 fix and QA rerun.
- Date/time: 2026-07-07
- Fix implemented: Mobile off-canvas sidebar drawer with hamburger button. Sidebar hidden by default at mobile widths; slides in on button press with backdrop overlay. Nav link tap closes drawer. Desktop layout unchanged.
- Files changed: `src/components/layout/dashboard-shell.tsx`, `src/components/layout/sidebar-nav.tsx`, `tsconfig.json`.
- `npm run build`: **PASSED** — 16 pages, BUILD_EXIT: 0.
- `npm run lint`: **PASSED** — No ESLint warnings or errors, LINT_EXIT: 0.
- `npm run test:verify`: **PASSED** — 19/19 checks.
- Browser rerun screenshots (pending QA tester with active Vercel Shareable Link after staging rebuild):
  - `10_mobile_responsive_fixed_overview.png` — PENDING
  - `11_mobile_responsive_fixed_navigation.png` — PENDING
  - `12_mobile_responsive_fixed_geographic_coverage.png` — PENDING
  - `13_mobile_responsive_fixed_activity_detail.png` — PENDING (if table overflow relevant)
- DEFECT-001 status: **Fixed in source code. Browser visual confirmation pending.**
- Notes: Staging must be rebuilt from updated source before QA tester can capture mobile evidence screenshots.
