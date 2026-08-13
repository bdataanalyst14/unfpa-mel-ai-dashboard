# UNFPA MEL Dashboard Route Data Mode Matrix

**Updated:** 2026-07-24
**Scope:** Local pre-Ubuntu readiness

All routes use synthetic mock rows by default. `DATA_MODE=bigquery` or `DASHBOARD_DATA_MODE=bigquery` enables only the read-only aggregate contracts identified below. A BigQuery error or missing configuration falls back to an explicitly labelled mock response. No route writes to BigQuery or KoBo.

| Dashboard route | Mock mode | Read-only live mode | Disabled or restricted behavior |
|---|---|---|---|
| `/dashboard/executive-overview` | Full prototype summary, charts, and filter behavior | Approved aggregate summary query is implemented; environment and schema validation remain required | No writeback |
| `/dashboard/activity-progress` | Full prototype visuals; global filters show validated synthetic activity rows | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | Live visual activation requires programme and IT approval |
| `/dashboard/participant-reach` | Full prototype visuals; filtered participant aggregates are available | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | No person-level data |
| `/dashboard/indicator-progress` | Full prototype visuals and filtered activity contribution view | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | Registry and programme validation required |
| `/dashboard/ip-performance` | Full prototype visuals and filtered partner aggregates | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | Partner scope approval required |
| `/dashboard/geographic-coverage` | Full prototype visuals with filtered activity, chart, table, KPI, and map states | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | Geography validation required before live activation |
| `/dashboard/data-quality` | Full prototype visuals and filtered evidence/validation aggregates | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | No source-record mutation |
| `/dashboard/management-decision-centre` | Full prototype visuals and filtered activity view | Read-only aggregate metadata API contract is implemented; page visuals remain mock-backed | AI text remains prototype-only |
| `/dashboard/activity-detail` | Filtered synthetic table and CSV export | Read-only aggregate metadata API contract is implemented; live detail rows are not enabled | CSV contains only the current synthetic filtered rows |
| `/dashboard/gbv-ocmc-summary` | Server-only sanitized GBV mock aggregates with small-cell and complementary suppression | None | Live GBV remains disabled pending privacy, access-control, API, export-policy, and programme approval |
| `/dashboard/gbv-ocmc` | Redirect alias preserving supported filter query state | None | Same live GBV restriction as the summary route |

## Global filter contract

Year, Quarter, Project, Implementing Partner, and Province values are allow-listed from the synthetic activity contract. Supported values are serialized in the URL and preserved across dashboard navigation. Unsupported values are ignored rather than executed or forwarded as live query fragments. Combined filters use intersection semantics.

The GBV mock contract supports Province only. Year, Quarter, Project, or Implementing Partner selections produce a privacy-safe empty state on the GBV summary instead of attempting to infer or expose unsupported GBV detail.

## Empty-state and export contract

When a supported filter combination returns no rows, KPI, chart, map, table, and CSV controls each show an explicit no-data state. CSV export is disabled for an empty result and contains only the current filtered synthetic rows otherwise. Spreadsheet formula prefixes are neutralized.

## Approval boundary

This matrix documents implemented local behavior; it does not approve a route for live use. UNFPA IT, programme owners, and privacy owners must approve authentication or restricted-UAT access, exact route scope, live data contracts, and the Ubuntu target host. Live GBV remains disabled.
