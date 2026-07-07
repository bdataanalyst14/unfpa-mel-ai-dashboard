# AG-090 Production Approval Package (DRAFT - BLOCKED)

> [!CAUTION]
> **CRITICAL GATE BLOCKER:** AG-090 is BLOCKED and cannot be approved until the AG-083 staging smoke test passes. This document serves as a preliminary draft package skeleton only.
> **THIS DRAFT IS NOT AN APPROVAL TO DEPLOY TO PRODUCTION.**

---

## 1. Status
* **Current Status:** **BLOCKED**
* **Primary Blocker:** AG-083 Staging Smoke Test is blocked due to active Vercel preview deployment protection.
* **Impact:** Production promotion, live data connector activation, and production release decisions are strictly suspended.

---

## 2. Evidence Already Available (Staging Readiness Status)
The following review packages and staging audit steps have been completed and accepted:

* **AG-041 Persistence Review:** `ACCEPTED`
* **AG-050 Decision Support Review:** `ACCEPTED`
* **AG-051 Dashboard Widgets Review:** `ACCEPTED`
* **AG-060/061/062 LLM Security Audit:** `ACCEPTED`
* **AG-070/071 MCP/Connector Hardening:** `ACCEPTED` (with minor coverage caveat)
* **AG-MAP-008 Geographic Map QA:** `ACCEPTED` (with minor issues regarding partial coverage)
* **AG-080 Staging Preparation Plan:** `ACCEPTED` (planning only)
* **AG-081 Staging Approval Package:** `ACCEPTED` (approval package only)
* **AG-082 Controlled Staging Execution:** `CLOSED` (preview deployed, hashes validated, no production or credential leakage occurred)
* **AG-083A Preview Access Unblock Plan:** `COMPLETED`

---

## 3. Missing Evidence (Pre-production Checklist)
The following key evidence points must be collected and verified before this package can be signed off:
- [ ] **Accessible Preview Smoke Test:** Verifiable confirmation that the staging URL renders the dashboard UI instead of the Vercel protection screen.
- [ ] **Route-by-Route UI Verification:** Complete pass on all routes as defined in [AG_083_RERUN_SMOKE_TEST_CHECKLIST.md](file:///h:/My%20Drive/unfpa-mel-ai-dashboard-clean/docs/agentic_workflow/AG_083_RERUN_SMOKE_TEST_CHECKLIST.md).
- [ ] **Privacy/Suppression Verification on Preview:** Active validation of the `<5` suppression logic on OCMC summary and Reach views.
- [ ] **Management Decision Centre Preview Verification:** Live verification of the advisory language and narrative-generating button in the staging sandbox.
- [ ] **Geographic Coverage Map Preview Verification:** Render check of the district SVG map directly in the staging preview.
- [ ] **Production Owner Approval:** Formal authorization from the designated production release authority.
- [ ] **Rollback Owner Assignment:** Clear assignment of a rollback engineer with access to Vercel/Git rollback mechanisms.
- [ ] **Final Security Decision on npm Audit Vulnerabilities:** Manager decision on whether to proceed with current peer-dependencies or patch dependencies further.
- [ ] **BigQuery Live Validation Decision:** Approval to activate and validate the live BigQuery queries/views in the production runtime, if desired.

---

## 4. Production Blockers
The following gates remain locked and must be cleared prior to deployment:
1. **AG-083 Smoke Test Status:** Not passed.
2. **Vercel Preview Protection:** Must be resolved by the authorized project owner.
3. **Production Approval:** Final sign-off is not granted.
4. **Live BigQuery Activation:** Not approved.
5. **Google Connectors:** Integration remains disabled and unapproved.
6. **npm audit Vulnerabilities:** Decision pending on peer-dependency alignments.
7. **Geographic Coverage:** The partial geography caveat remains active.

---

## 5. Production Go/No-Go Decision Form
*To be filled out by the Manager/Authorized Signatory once the AG-083 smoke test has successfully passed.*

**Release Choice (Select One):**
- [ ] **Approve Production Deployment**
- [ ] **Approve with Caveats** (List caveats in notes)
- [ ] **Request Fixes before Production** (List requirements in notes)
- [ ] **Do Not Approve Production** (List reasons in notes)

**Signatory Name:** `_______________________`
**Role:** `_______________________`
**Signature Date:** `_______________________`

**Notes & Directives:**
```text


```
