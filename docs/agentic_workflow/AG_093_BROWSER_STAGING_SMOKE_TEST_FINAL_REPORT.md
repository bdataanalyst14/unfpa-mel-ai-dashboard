# AG-093 Browser Staging Smoke Test Final Report

**Date:** 2026-07-07
**Task:** AG-093 — Browser-based staging smoke test using Vercel Shareable Link.

> [!CAUTION]
> **AG-093 STATUS: FAILED**
> The smoke test cannot be marked passed. A mobile responsive layout defect (DEFECT-001) was confirmed. Production approval review (AG-094 / AG-090) must not proceed until this defect is fixed or formally accepted as a caveat by the manager.

---

## 1. Access and Environment

| Item | Value |
|---|---|
| Access method | Vercel Shareable Link used; token redacted. |
| Browser | Google Chrome headless |
| Viewport tested | Desktop and mobile-width |
| Source code changed | No |
| Protected map files touched | No |
| Secrets / .env / credentials accessed | No |
| Logs / env / cookies / transcripts searched | No |
| Vercel / deployment / production action | No |

---

## 2. Screenshots / Evidence Captured

| # | Filename | Description |
|---|---|---|
| 01 | `01_executive_overview.png` | Executive Overview — desktop viewport loaded |
| 02 | `02_geographic_coverage_map.png` | Programme / Geographic Coverage map rendered |
| 03 | `03_activity_detail_log.png` | Activity Detail Log loaded |
| 04 | `04_console_runtime_check_non_blocking_warnings.png` | Console / runtime check — non-blocking warnings only |
| 05 | `05_data_quality_privacy_suppression.png` | Data Quality — privacy / suppression messaging visible |
| 06 | `06_management_decision_copy_narrative.png` | Management Decision Centre — Copy Narrative Draft captured |
| 07 | `07_mobile_responsive_view.png` | Mobile responsive view — **DEFECT: sidebar clips content** |
| 08 | `08_filter_interaction.png` | Filter interaction behavior |
| 09 | `09_navigation_check_summary.png` | Navigation check summary |

Evidence location: `docs/agentic_workflow/evidence/ag_093_browser_smoke/`

---

## 3. Smoke Test Results

| Check | Status | Evidence | Screenshot | Console/Runtime | Remarks |
|---|---|---|---|---|---|
| Staging access via Shareable Link | **PASS** | Dashboard UI loaded without Vercel login/SSO wall | `01_executive_overview.png` | No blocking errors | Executive Overview loaded with dashboard shell, filters, KPI cards, chart panel, and data-source banner. |
| Desktop dashboard load | **PASS** | Dashboard content visible at desktop viewport | `01_executive_overview.png` | No blocking errors | |
| Route rendering (all tested routes) | **PASS** | All 10 desktop routes rendered dashboard content | Multiple screenshots | No blocking errors | Full route list in Section 4. |
| Programme Coverage / Geographic Coverage map | **PASS** | Map rendered with coverage panel and aggregate metadata | `02_geographic_coverage_map.png` | No blocking errors | No external map API calls noted. |
| Data visualizations / charts | **PASS** | Chart panels rendered in Executive Overview and Activity Progress | `01_executive_overview.png`, `09_navigation_check_summary.png` | No blocking errors | |
| Privacy / suppression messaging | **PASS** | Suppression metadata and aggregate privacy view visible | `02_geographic_coverage_map.png`, `05_data_quality_privacy_suppression.png` | No blocking errors | No personal identifiers or survivor-level GBV records observed. |
| Management Decision Centre advisory posture | **PASS** | Advisory / prototype wording and pending status confirmed | `06_management_decision_copy_narrative.png` | No blocking errors | Content is AI-assisted / prototype and advisory; no autonomous approval behavior observed. |
| Copy Narrative Draft behavior | **PASS with caveat** | Narrative draft panel visible; clipboard not confirmable in headless | `06_management_decision_copy_narrative.png` | No blocking errors | OS clipboard confirmation not captured in headless mode; no crash or blocking issue. |
| Filter interaction | **PASS with caveat** | Filter bar visible, page remained usable | `08_filter_interaction.png` | No blocking errors | Dropdown-change visual proof not separately preserved in headless run. |
| Navigation check | **PASS** | Key pages traversed via direct routes | `09_navigation_check_summary.png` | No blocking errors | |
| Console / runtime errors | **PASS (non-blocking only)** | Non-blocking warnings only | `04_console_runtime_check_non_blocking_warnings.png` | Checked — no blocking errors | See Section 5 for warning detail. |
| **Mobile responsive view** | **FAIL** | Mobile viewport screenshot captured | `07_mobile_responsive_view.png` | No blocking errors | Fixed sidebar consumes most of the mobile viewport; main content clipped off-screen. Dashboard not usable at mobile widths. |

---

## 4. Route Coverage (Desktop)

| Route | Result |
|---|---|
| `/` → redirect | PASS |
| `/dashboard/executive-overview` | PASS |
| `/dashboard/activity-progress` | PASS |
| `/dashboard/indicator-progress` | PASS |
| `/dashboard/participant-reach` | PASS |
| `/dashboard/data-quality` | PASS |
| `/dashboard/gbv-ocmc-summary` | PASS |
| `/dashboard/ip-performance` | PASS |
| `/dashboard/activity-detail` | PASS |
| `/dashboard/management-decision-centre` | PASS |
| `/dashboard/geographic-coverage` | PASS |

---

## 5. Console Warning Detail

| Warning | Severity | Classification |
|---|---|---|
| `favicon.ico` 404 | Non-blocking | Cosmetic — no application impact |
| Browser / extension content_script / ZERO_PHISHING message | Non-blocking | Browser extension artifact — not an application defect |
| Chrome policy / GCM / web-app messages | Non-blocking | Browser/headless environment noise — not an application defect |

---

## 6. Privacy and Governance Observations

| Item | Status | Detail |
|---|---|---|
| Survivor / beneficiary names present | Not observed | No personal identifiers visible in any tested view |
| Case-level data exposed | Not observed | Only aggregate / suppressed data visible |
| Small-cell suppression active | Confirmed | Suppression metadata and aggregate privacy view visible |
| Management Decision Centre advisory posture | Confirmed | Prototype / advisory-only; no autonomous decision output |

---

## 7. Defects Found

### DEFECT-001 — Mobile Responsive Layout (Severity: Major)

| Field | Detail |
|---|---|
| Severity | **Major** |
| Status | **Open** |
| Page / Feature | Mobile-width dashboard layout |
| Expected | Dashboard remains readable and navigable at mobile widths; no major content clipping. |
| Observed | Fixed sidebar consumes most of the ~390px viewport. Main dashboard content is pushed off-screen and clipped, blocking normal reading. |
| Evidence | `07_mobile_responsive_view.png` |
| Impact | Dashboard is not usable on mobile devices or small-viewport screens. |
| Recommended fix | Add collapsed drawer navigation or top menu at mobile breakpoints. Ensure dashboard content fills available mobile width without horizontal clipping. |
| Owner | Developer (source code change required) **OR** Manager (formal caveat acceptance). |

---

## 8. Session Verdict

**FAILED**

All desktop checks passed. The mobile responsive view failed due to DEFECT-001. The overall smoke test cannot be marked passed.

---

## 9. Passed Checks Summary

- ✅ Staging access via Vercel Shareable Link
- ✅ Desktop dashboard load (Executive Overview and all routes)
- ✅ All tested desktop route rendering (10 routes)
- ✅ Programme Coverage / Geographic Coverage map display
- ✅ Data visualizations / charts
- ✅ Privacy / suppression messaging (aggregate only; no personal data visible)
- ✅ Management Decision Centre advisory posture
- ✅ Copy Narrative Draft behavior (with headless clipboard caveat)
- ✅ Filter interaction (with headless visual caveat)
- ✅ Navigation traversal
- ✅ No blocking dashboard runtime errors

---

## 10. Failed Checks

- ❌ **Mobile responsive view — DEFECT-001**: fixed sidebar clips dashboard content at mobile widths

---

## 11. Remaining Production Blockers

| Blocker | Status | Required Action | Owner |
|---|---|---|---|
| DEFECT-001 mobile responsive layout | **Open** | Fix sidebar at mobile breakpoints, or manager formally accepts as caveat | Developer / Manager |
| AG-083 full smoke test pass | **Not yet passed** | After DEFECT-001 resolved: rerun mobile smoke check, confirm full pass | QA tester |
| `npm run build` | **Blocked** | Resolve Google Drive file-lock; run `npm ci --legacy-peer-deps` | Local environment owner |
| `npm run lint` | **Blocked** | Same root cause as build | Local environment owner |
| Manager production sign-off (AG-090) | **Not approved** | All gate conditions must be met first | Manager |

---

## 12. Final Recommendation

**Do not proceed to AG-094 / AG-090 production readiness review.**

Steps required in order:
1. **Resolve DEFECT-001**: Fix responsive sidebar behavior at mobile breakpoints **OR** manager formally accepts this as a documented caveat with a written decision.
2. **Rerun affected smoke checks**: After fix or caveat acceptance, rerun the mobile responsive check and update the AG-083 evidence capture template.
3. **Confirm full AG-083 pass**: All checklist items must be PASS (or formally accepted caveat) before proceeding.
4. **Resolve build/lint blockers** (can run in parallel with step 1).
5. **Proceed to AG-094 / AG-090**: Only after all above are cleared.

---

## 13. Safety Confirmation

| Safety Check | Result |
|---|---|
| Source code changed | **No** |
| Protected map files touched | **No** |
| `.env`, secrets, credentials, cookies, Vercel tokens accessed | **No** |
| Logs, environment variables, browser cookies, transcripts searched | **No** |
| Deployment / production action taken | **No** |
| Vercel commands run | **No** |
| `git init` or git repair attempted | **No** |
| `npm install` run | **No** |
