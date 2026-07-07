# AG-083 Rerun Execution Note for Tester

This operational note guides the tester through executing the AG-083 staging smoke test once preview deployment access is unblocked.

---

## 1. Precondition
* **Access Restored:** The Vercel project owner has disabled preview protection or provided a secure, approved gateway bypass token. Do not attempt testing until this access is confirmed.

---

## 2. Hard Restrictions (What NOT to Do)
* **Do NOT Redeploy:** Do not run Vercel build, push, or deployment commands.
* **Do NOT Promote to Production:** Do not push code or merge branches to main/production.
* **Do NOT Run BigQuery Live Validation:** Do not trigger live database validations unless explicitly approved.
* **Do NOT Enable Connectors:** Keep Google connectors and API bindings disabled.
* **Do NOT Expose Secrets:** Do not write passwords, bypass cookies, tokens, or credentials into reports or public chat logs.

---

## 3. Step-by-Step Testing Process
1. **Access Site:** Open the preview URL: [https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app](https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app)
2. **Verify Load:** Confirm the dashboard home UI loads completely (no Vercel login card or HTTP 500 error screen).
3. **Execute Checklist:** Go route-by-route and check features according to [AG_083_RERUN_SMOKE_TEST_CHECKLIST.md](file:///h:/My%20Drive/unfpa-mel-ai-dashboard-clean/docs/agentic_workflow/AG_083_RERUN_SMOKE_TEST_CHECKLIST.md).
4. **Log Evidence:** Capture screenshots of each verified page and fill out the fields in [AG_083_EVIDENCE_CAPTURE_TEMPLATE.md](file:///h:/My%20Drive/unfpa-mel-ai-dashboard-clean/docs/agentic_workflow/AG_083_EVIDENCE_CAPTURE_TEMPLATE.md).
5. **Update Report:** Document the final results inside the staging report folder.

---

## 4. Pass/Fail Criteria
* **PASS:** All routes load successfully, data suppression (counts 1–4 suppressed) is visible on reach/OCMC pages, the offline map renders, and the AI Decision Centre displays advisory text.
* **FAIL:** Any route returns an error, the map fails to render, or small-cell counts are exposed raw.
* **BLOCKED:** The Vercel login screen or protection wall still blocks URL loading.

---

## 5. Escalation If Still Blocked
If access is not resolved or credentials do not work, stop immediately. Document the exact error message or capture a screenshot of the block screen, log it in the blocker register, and escalate to the project manager. Do not attempt to guess credentials or bypass Vercel filters autonomously.
