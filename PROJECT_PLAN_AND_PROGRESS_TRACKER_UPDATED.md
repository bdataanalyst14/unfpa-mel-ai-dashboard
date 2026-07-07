# UNFPA MEL Intelligence Dashboard – Project Plan & Progress Tracker

**Repository:** `H:\My Drive\unfpa-mel-ai-dashboard`  
**Primary local build folder:** `C:\agfinal`  
**Project:** UNFPA Nepal MEL Intelligence Dashboard Prototype  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, lucide-react, date-fns  
**Current phase:** Final build confirmation, Vercel preview readiness, sync-back, and deployment
**Last updated:** 2026-06-01 18:18

---

## 1. Purpose of this tracker

This file is the single shared coordination document for all agents working on the UNFPA MEL dashboard repository.

All agents must read this file before starting work and update it after completing work.

The tracker is designed to avoid:
- duplicate work,
- two agents editing the same files at the same time,
- dependency conflicts,
- unsafe installation inside Google Drive,
- unverified deployment,
- privacy or GBV data-governance mistakes.

---

## 2. Agent coordination rules

### 2.1 Active roles

| Agent | Role | Allowed to edit? | Folder |
|---|---|---:|---|
| Antigravity | Main editor, build verifier, deployer | Yes | `C:\agfinal` |
| Cline | Read-only QA reviewer | No, unless reassigned | Main repo and/or `C:\agfinal` |
| Gemini CLI | Paused / read-only observer | No | None |
| Codex | Optional isolated reviewer only | No main edit unless reassigned | Separate isolated copy only |

### 2.2 Golden rule

Only **one agent** may edit the active working folder at a time.

Current active editor:

```text
Antigravity
```

Current active working folder:

```text
C:\agfinal
```

### 2.3 Google Drive rule

Do **not** run these commands inside:

```text
H:\My Drive\unfpa-mel-ai-dashboard
```

Blocked commands in Google Drive folder:
- `npm install`
- `npm audit fix`
- `npm run lint`
- `npm run build`
- `npm run dev`
- `vercel`
- `shadcn` commands

Reason: dependency installation inside Google Drive previously failed with repeated TAR write errors.

Use `C:\agfinal` for installation, build, dev testing, and Vercel preview.

---

## 3. Project objective

Build and deploy a working static prototype of the **UNFPA Nepal MEL Intelligence Dashboard**.

The dashboard should support senior management review of:
- activity progress,
- participant reach,
- indicator progress,
- IP/partner performance,
- geographic coverage,
- GBV/OCMC aggregated service summary,
- data quality and evidence,
- management decision-making,
- controlled activity drill-through.

No real APIs are connected at this stage. The prototype uses mock data only.

---

## 4. Required dashboard routes

| Route | Status | Notes |
|---|---:|---|
| `/dashboard/executive-overview` | ✅ Present | Needs final smoke test |
| `/dashboard/activity-progress` | ✅ Present | Needs final smoke test |
| `/dashboard/participant-reach` | ✅ Present | Needs final smoke test |
| `/dashboard/indicator-progress` | ✅ Present | Needs final smoke test |
| `/dashboard/ip-performance` | ✅ Present | Needs final smoke test |
| `/dashboard/geographic-coverage` | ✅ Present | Needs final smoke test |
| `/dashboard/gbv-ocmc-summary` | ✅ Present | Needs privacy smoke test |
| `/dashboard/data-quality` | ✅ Present | Needs final smoke test |
| `/dashboard/management-decision-centre` | ✅ Present | Needs final smoke test |
| `/dashboard/activity-detail` | ✅ Present | Needs final smoke test after `ActivityDetailTable` |

---

## 5. Required components tracker

| Component | Status | Current note |
|---|---:|---|
| `DashboardShell` | ✅ Done | Present |
| `SidebarNav` | ✅ Done | Present |
| `TopFilterBar` | ✅ Done | Present |
| `PageHeader` | ✅ Done | Present |
| `KpiCard` | ✅ Done | Present |
| `ChartCard` | ✅ Done | Present |
| `StatusBadge` | ✅ Done | Present |
| `AIInsightPanel` | ✅ Done | Present |
| `ManagementSummaryPanel` | ⚠️ Pending/Needs confirmation | Reported missing in Cline QA |
| `PrivacyBanner` | ✅ Done | Present; verify GBV page rendering |
| `DataFreshnessFooter` | ✅ Done | Present; verify all pages via layout/shell |
| `ManagementActionTable` | ✅ Done | Present |
| `ActivityDetailTable` | ✅ Created in local copy | Created at `C:\agfinal\src\components\ActivityDetailTable.tsx`; needs final build + sync-back |

---

## 6. Required utility files tracker

| File | Status |
|---|---:|
| `src/lib/types.ts` | ✅ Present |
| `src/lib/kpi-calculations.ts` | ✅ Present |
| `src/lib/indicator-status.ts` | ✅ Present |
| `src/lib/data-quality-score.ts` | ✅ Present |
| `src/lib/privacy-rules.ts` | ✅ Present |
| `src/lib/role-access.ts` | ✅ Present |
| `src/lib/utils.ts` | ✅ Present |

---

## 7. Required KPI functions tracker

All required KPI functions were previously reported as exported.

| Function | Status |
|---|---:|
| `getTotalEvents` | ✅ |
| `getReportableParticipants` | ✅ |
| `getFemaleParticipants` | ✅ |
| `getMaleParticipants` | ✅ |
| `getOtherSexParticipants` | ✅ |
| `getBeneficiaries` | ✅ |
| `getGuests` | ✅ |
| `getDistrictsCovered` | ✅ |
| `getIPsReporting` | ✅ |
| `getEvidenceCompletionRate` | ✅ |
| `getActivityAchievementRate` | ✅ |
| `getIndicatorAchievementRate` | ✅ |
| `getDataQualityScore` | ✅ |
| `getMissingEvidenceCount` | ✅ |
| `getValidationPendingCount` | ✅ |
| `getGenderCheckFailedCount` | ✅ |
| `getAgeCheckFailedCount` | ✅ |
| `getCasteCheckFailedCount` | ✅ |

---

## 8. Mock data tracker

Required mock data location:

```text
src/data/mock/
```

| Mock data source | Status |
|---|---:|
| `combined-summary` | ✅ Present |
| `main-data` | ✅ Present |
| `cpd-indicator` | ✅ Present |
| `unsdcf-indicator` | ✅ Present |
| `gbv-service` | ✅ Present |
| `ai-insights` | ✅ Present |

---

## 9. Privacy and governance tracker

| Requirement | Status | Verification needed |
|---|---:|---|
| No participant names displayed | ✅ Reported | Final source/render check |
| No phone numbers displayed | ✅ Reported | Final source/render check |
| No email addresses displayed | ✅ Reported | Final source/render check |
| No personal identifiers displayed | ✅ Reported | Final source/render check |
| No survivor-level GBV records | ✅ Reported | Final source/render check |
| Aggregated GBV data only | ✅ Reported | Final GBV page check |
| Suppress GBV counts 1–4 as `<5` | ✅ Implemented | Confirm rendered use |
| GBV privacy banner | ✅ Present | Confirm exact text |
| Footer privacy caveat on every page | ✅ Present via shell/layout | Confirm route smoke test |

Required GBV banner text:

```text
Aggregated GBV service data only. No individual survivor records are displayed.
```

Required footer meaning:

```text
Data as of {{date}} NPT – refreshed daily. Figures are provisional where validation, evidence, or data quality checks are pending. No personal identifiers or survivor-level GBV records are displayed.
```

---

## 10. Dependency and security tracker

| Item | Main repo status | Local `C:\agfinal` status | Final decision |
|---|---|---|---|
| Next.js | `14.2.3` reported | Upgraded to `14.2.35` reported | Use `14.2.35` |
| ESLint | `9.9.0` reported | Downgraded to `^8.57.0` reported | Use ESLint 8 for Next 14 compatibility |
| `eslint-config-next` | Present | Aligned to `14.2.35` reported | Keep |
| `react-day-picker` | Not in main earlier | Added locally | Keep if required by shadcn calendar |
| `embla-carousel-react` | Not in main earlier | Added locally | Keep if required by carousel |
| `tailwindcss` | Needed | Restored locally | Keep |
| `@types/react-dom` | Needed | Added locally | Keep |
| `glob` vulnerability | Needs review | Needs review | Remove if unused; otherwise document |
| PostCSS/Tailwind major upgrade | Deferred | Deferred | Do not upgrade to Tailwind 4 today |

Rules:
- Do not run `npm audit fix --force`.
- Do not make breaking Tailwind/PostCSS upgrades before deployment.
- Do not upgrade Recharts unless lint/build requires it.

---

## 11. Design/reference folder handling

Folders reported as potentially unrelated to Next dashboard deployment:

```text
figmaprototype/
Figma_dashboard/
```

Current local status:
- `tsconfig.json` in `C:\agfinal` reportedly excludes these folders.
- This is correct if they are design/reference artifacts and not imported by dashboard code.

Required final check:
- Confirm these folders are not imported by `src/app`, `src/components`, or `src/lib`.
- Keep them excluded from build/lint if unrelated.

---

## 12. Current progress summary

| Workstream | Progress | Status |
|---|---:|---|
| Dashboard routes | 95% | All present; smoke test pending |
| Components | 90% | `ActivityDetailTable` created; `ManagementSummaryPanel` pending/needs confirmation |
| Mock data | 100% | Present |
| KPI utilities | 100% | Present |
| Privacy/governance | 90% | Implemented; final render checks pending |
| Dependency/security alignment | 85% | Local fixes applied; sync-back pending |
| Build verification | 90–95% | Latest Embla carousel callback type error fixed; build rerun finished, final pass output still needs to be recorded |
| Documentation | 70% | Needs latest update |
| Sync-back to main repo | Pending | Must happen after verified local build |
| Vercel preview | Ready once final build pass is recorded | Antigravity indicates build should now succeed after carousel callback fix |
| Production deployment | Pending | Only after preview URL is approved |

Estimated overall readiness:

```text
85–90%
```

---

## 13. Remaining work tracker

| # | Work item | Status | Owner | Next action |
|---:|---|---:|---|---|
| 1 | Confirm final `npm run build` in `C:\agfinal` | ❌ Failed (type error in carousel.tsx) | Antigravity | Record final build result in docs |
| 2 | Confirm final `npm run lint` | ✅ Passed | Antigravity | Record lint result |
| 3 | Confirm `ManagementSummaryPanel` | ⚠️ Pending | Antigravity | Create or confirm missing component |
| 4 | Confirm `ActivityDetailTable` build passes | ✅ Created / verify | Antigravity | Ensure build success and sync back |
| 4a | Embla carousel callback type fix | ✅ Fixed locally | Antigravity | Callback refactored to match Embla API `CallbackType`; include in implementation report |
| 5 | Confirm all Recharts files have `"use client"` | ✅ Reported | Antigravity/Cline QA | Final read-only check |
| 6 | Confirm GBV privacy banner rendered | ✅ Reported | Antigravity/Cline QA | Smoke test GBV page |
| 7 | Confirm footer on all pages | ✅ Reported | Antigravity/Cline QA | Smoke test routes |
| 8 | Update implementation docs | Pending | Antigravity | Update implementation/testing docs |
| 9 | Sync verified files to main repo | Pending | Antigravity | Copy `src`, `docs`, package files |
| 10 | Vercel preview deployment | Pending | Antigravity/User | Run `vercel` from `C:\agfinal` |
| 11 | User review preview URL | Pending | User | Check routes and visuals |
| 12 | Vercel production deployment | Pending | Antigravity/User | Run only after preview approval |
| 13 | Confirm GBV privacy banner and footer rendering after sync-back | Pending | Cline | Run smoke tests on GBV page and footer post‑sync |
| 14 | Final Cline read-only QA | Pending | Cline | Review entire main repo after sync-back |


---

## 13A. Latest Antigravity build update – 2026-06-01 18:18

Antigravity reported the following latest progress:

```text
Build verification was running and build tasks finished.
The carousel callback was refactored so that the listener signature now matches the Embla API CallbackType.
A new updateScroll function is used for the reInit and select events.
The previous carousel type error was eliminated.
With this change, the Next.js build should now succeed and the project can proceed toward Vercel preview deployment.
```

### Interpretation

| Item | Status | Tracker decision |
|---|---:|---|
| `ActivityDetailTable` | ✅ Created | Keep as completed |
| Carousel / Embla callback type error | ✅ Fixed locally | Add to implementation report |
| `npm run build` | 🟡 Build rerun finished, final pass text not yet recorded | Antigravity must record exact final result |
| `npm run lint` | ⚠️ Needs final recorded result | Run or confirm latest pass |
| Dev route smoke test | ⚠️ Pending/needs recorded evidence | Test all 10 dashboard routes |
| Vercel preview | ⏳ Next gate | Proceed only after build/lint/dev checks are recorded |

### Updated immediate next action for Antigravity

```text
1. Record the exact final npm run build result.
2. If build passed, run/confirm npm run lint.
3. Run npm run dev and smoke-test all 10 routes.
4. Update IMPLEMENTATION_REPORT.md, TESTING_CHECKLIST.md, and this tracker.
5. Sync verified files back to H:\My Drive\unfpa-mel-ai-dashboard.
6. Run Vercel preview from C:\agfinal.
7. Stop before production deployment until user approves the preview URL.
```

---

## 14. Verification checklist

Before Vercel preview, the active editor must confirm:

```text
cd /d C:\agfinal
npm run lint
npm run build
npm run dev
```

Smoke-test routes:

```text
/dashboard/executive-overview
/dashboard/activity-progress
/dashboard/participant-reach
/dashboard/indicator-progress
/dashboard/ip-performance
/dashboard/geographic-coverage
/dashboard/gbv-ocmc-summary
/dashboard/data-quality
/dashboard/management-decision-centre
/dashboard/activity-detail
```

Minimum route checks:
- Executive overview loads.
- GBV/OCMC page displays privacy banner.
- Activity detail page loads with `ActivityDetailTable`.
- Sidebar navigation works.
- Footer appears.
- Charts render.
- No personal/survivor-level data displayed.

---

## 15. Sync-back checklist

Only after local verification passes, sync from:

```text
C:\agfinal
```

to:

```text
H:\My Drive\unfpa-mel-ai-dashboard
```

Allowed sync-back:

```text
src/
docs/
README.md
package.json
package-lock.json
tsconfig.json
eslint config if changed
next config if changed
tailwind config if changed
components.json if changed
```

Do not sync:

```text
node_modules/
.next/
.vercel/
out/
dist/
coverage/
temporary files
```

Recommended commands:

```cmd
robocopy "C:\agfinal\src" "H:\My Drive\unfpa-mel-ai-dashboard\src" /E
robocopy "C:\agfinal\docs" "H:\My Drive\unfpa-mel-ai-dashboard\docs" /E
copy /Y "C:\agfinal\package.json" "H:\My Drive\unfpa-mel-ai-dashboard\package.json"
copy /Y "C:\agfinal\package-lock.json" "H:\My Drive\unfpa-mel-ai-dashboard\package-lock.json"
copy /Y "C:\agfinal\README.md" "H:\My Drive\unfpa-mel-ai-dashboard\README.md"
copy /Y "C:\agfinal\tsconfig.json" "H:\My Drive\unfpa-mel-ai-dashboard\tsconfig.json"
```

---

## 16. Deployment checklist

Deploy only from:

```text
C:\agfinal
```

Preview deployment:

```cmd
cd /d "C:\agfinal"
vercel
```

If prompted:
- Framework: Next.js
- Project name: `unfpa-mel-ai-dashboard`
- Build command: `npm run build`
- Install command: `npm install --legacy-peer-deps`
- Output directory: default
- Root directory: current folder

Stop and report exact prompt if Vercel asks for:
- login,
- team/scope,
- project linking uncertainty,
- credentials.

Production deployment:

```cmd
vercel --prod
```

Only run production after:
1. preview deploy succeeds,
2. preview URL is reviewed,
3. user approves production.

---

## 17. Agent update protocol

Every agent must update this section after completing work.

Use this format:

```markdown
### Update – YYYY-MM-DD HH:mm – Agent Name

**Folder used:**  
`C:\agfinal` or other folder

**Actions completed:**
- ...

**Files changed:**
- ...

**Verification run:**
- `npm run lint`: Pass/Fail/Not run
- `npm run build`: Pass/Fail/Not run
- `npm run dev`: Pass/Fail/Not run
- Route smoke test: Pass/Fail/Not run

**Privacy verification:**
- GBV banner: Pass/Fail/Not checked
- Small-cell suppression: Pass/Fail/Not checked
- Footer: Pass/Fail/Not checked
- PII check: Pass/Fail/Not checked

**Blockers:**
- ...

**Next recommended action:**
- ...
```

---

## 18. Change log

### Update – 2026-06-01 – Tracker created

**Folder used:**  
Not applicable

**Actions completed:**
- Created shared project plan and progress tracker.
- Consolidated Cline QA, Antigravity progress, and final deployment plan.

**Files changed:**
- Proposed file: `PROJECT_PLAN_AND_PROGRESS_TRACKER.md`

**Verification run:**
- `npm run lint`: Not run
- `npm run build`: Not run
- `npm run dev`: Not run
- Route smoke test: Not run

**Privacy verification:**
- GBV banner: Reported implemented
- Small-cell suppression: Reported implemented
- Footer: Reported implemented
- PII check: Reported clean by earlier QA

**Blockers:**
- Need final Antigravity verification evidence and sync-back.
- Need `ManagementSummaryPanel` confirmation.
- Need Vercel preview URL.

**Next recommended action:**
- Antigravity should update this tracker after final local build/lint/dev verification and before Vercel preview.


### Update – 2026-06-01 18:18 – Antigravity progress reported by user

**Folder used:**  
`C:\agfinal`

**Actions completed:**
- `ActivityDetailTable` was already created at `C:\agfinal\src\components\ActivityDetailTable.tsx`.
- Build verification continued through multiple `npm run build` reruns.
- Missing dependency issues were addressed earlier.
- Embla carousel callback type issue was fixed.
- Carousel listener signature was refactored to match the Embla API `CallbackType`.
- New `updateScroll` function is used for `reInit` and `select` events.

**Files changed:**
- `src/components/ActivityDetailTable.tsx`
- Carousel-related component file requiring Embla callback refactor. Exact file path should be recorded by Antigravity in the final implementation report.
- Dependency/config files may have changed earlier during local build stabilization; exact list pending Antigravity final report.

**Verification run:**
- `npm run lint`: Pending final recorded result
- `npm run build`: Build rerun finished; final pass/fail output must be explicitly recorded
- `npm run dev`: Pending final recorded result
- Route smoke test: Pending final recorded result

**Privacy verification:**
- GBV banner: Previously reported pass; needs route smoke-test confirmation
- Small-cell suppression: Previously reported pass
- Footer: Previously reported implemented; needs route smoke-test confirmation
- PII check: Previously reported clean by read-only QA

**Blockers:**
- Final build pass output has not yet been explicitly recorded in this tracker.
- Vercel preview has not yet been completed.
- Sync-back to `H:\My Drive\unfpa-mel-ai-dashboard` still needs confirmation.

**Next recommended action:**
- Antigravity should record the exact final build result, run/confirm lint, run dev route smoke-test, update docs and this tracker, sync verified files back to main, and then proceed to Vercel preview from `C:\agfinal`.
