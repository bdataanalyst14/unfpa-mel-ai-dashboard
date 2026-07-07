# Data Contract Technical Sign-Off Checklist

This checklist must be completed before the dashboard is officially transitioned to live BigQuery data.

## 1. Data Source Sign-Off
- [ ] **BigQuery Admin:** Confirms Service Account has read-only access limited to approved views.
- [ ] **Data Engineer:** Confirms reporting views match the required dashboard aggregate schema.
- [ ] **M&E Lead:** Confirms indicator and activity mapping logic in BigQuery is accurate.

## 2. Privacy & Security Sign-Off
- [ ] **Privacy Officer / Security Reviewer:** Confirms no PII or survivor-level data is exposed.
- [ ] **Suppression Audit:** Verified that sensitive counts < 5 are suppressed in all views.
- [ ] **IAM Verification:** Service account confirmed to have no access to raw staging/participant tables.

## 3. Dashboard Readiness Sign-Off
- [ ] **QA Tester:** Category A routes verified to show correct data matching BigQuery aggregates.
- [ ] **Project Manager:** Approved transition for Category A routes.
- [ ] **Registry Approval:** M&E Registry finalized and approved for Category B routes.

## 4. Final Deployment Sign-Off
- [ ] **Environment Check:** Secrets configured correctly in Vercel.
- [ ] **Monitoring:** Error tracking (e.g., Sentry) active for BigQuery connection failures.
- [ ] **No Deployment Until Approval:** Confirmed that no production deployment will occur without this signed document.

---
**Technical Lead Signature:** ____________________  **Date:** __________
**M&E Lead Signature:** ____________________  **Date:** __________
