# DP-004 Safe Aggregate Route Connection

**Mode:** Dashboard Implementation
**Goal:** Connect Category A routes to live BigQuery aggregate data.

## 1. Scope
Connect the following routes only:
- `executive-overview`
- `participant-reach`
- `data-quality`
- `ip-performance`
- `geographic-coverage`

## 2. Technical Requirements
- Update `src/lib/server/bigquery-dashboard-service.ts` to use `unfpadatabase.unfpadatabase` views.
- Ensure `DATA_MODE=bigquery` is correctly handled.
- Implement column mapping for `combined_activity_summary` (Sex, Age, Geo).
- Maintain mock fallback for Category B routes.

## 3. Blocked Routes (DO NOT CONNECT)
- `indicator-progress`
- `activity-progress`
- `gbv-ocmc-summary`
- `management-decision-centre`
- `activity-detail`
Reason: Awaiting M&E Registry Approval and Privacy Suppression Audit.

## 4. Verification
- Verify aggregate counts match `DASHBOARD_LIVE_CALCULATION_RECONCILIATION.md`.
- Ensure no raw participant data is fetched or logged.
