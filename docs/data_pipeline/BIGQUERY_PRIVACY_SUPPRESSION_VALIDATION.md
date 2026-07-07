# BigQuery Privacy and Suppression Validation

**Verification Date:** 2026-06-14

## 1. Participant-Level Data Isolation
- **Status:** VERIFIED.
- Restricted tables (`participants_flat`, `activity_summary_flat`) are excluded from the dashboard reporting allowlist.
- Dashboard views (`combined_activity_summary`) only contain aggregate counts.

## 2. K-Anonymity Suppression (k=5)
- **Requirement:** Sensitive indicators (GBV) must suppress cell counts < 5.
- **Current Observation:** The `combined_activity_summary` view contains raw aggregate counts (e.g., `female`, `male`). It does **not** currently appear to have an auto-suppression layer in the SQL definition observed.
- **Risk:** High if GBV-sensitive activities are filtered by small geographies (Palikas).
- **Recommendation:** Implement suppression logic in the BigQuery view or the API layer (`runSafeBigQuery`) before exposing to the frontend.

## 3. GBV Route Status
- **Status:** **BLOCKED**.
- The `gbv-ocmc-summary` route remains blocked until k=5 suppression is explicitly verified in the live data output.

## 4. Privacy Audit Decision
- **Participant names/IDs:** Not present in aggregate views. ✅
- **Survivor-level fields:** Not present in aggregate views. ✅
- **Small count risk:** Present for sensitive indicators. ⚠️ (Requires DP-004 logic hardening).
