# DP_004_ROUTE_CONNECTION_GO_NO_GO

## Route Go/No‑Go Classification (DP‑004)

| Route | Classification | Reason |
|-------|----------------|--------|
| `/dashboard/executive-overview` | blocked | Freshness gate not passed (stale) and suppression gate not implemented. |
| `/dashboard/participant-reach` | blocked | Freshness gate not passed and suppression gate not implemented. |
| `/dashboard/data-quality` | blocked | Freshness gate not passed and suppression gate not implemented. |
| `/dashboard/ip-performance` | blocked | Freshness gate not passed and suppression gate not implemented. |
| `/dashboard/geographic-coverage` | blocked | Requires fresh data and server‑side suppression; both gates open. |

**Blocked routes (per policy)**: `indicator-progress`, `activity-progress`, `gbv-ocmc-summary`, `management-decision-centre`, `activity-detail` – remain blocked regardless of gates.

---
*File location: `docs/agentic_workflow/DP_004_ROUTE_CONNECTION_GO_NO_GO.md`*
