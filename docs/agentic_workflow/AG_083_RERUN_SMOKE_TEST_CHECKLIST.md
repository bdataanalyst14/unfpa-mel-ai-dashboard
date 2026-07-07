# AG-083 Rerun Smoke Test Checklist

## 1. Preview URL
The preview deployment is available at the following URL for testing:
* **Preview URL:** [https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app](https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app)

## 2. Access Prerequisite
> [!IMPORTANT]
> * **Access Blocker:** Vercel preview deployment protection is currently enabled. This protection must be resolved or configured by an authorized Vercel project owner before testing can begin.
> * **Security Policy:** Do NOT paste bypass tokens, password strings, secret links, or credentials into reports, repositories, or chat transcripts.
> * **Method:** The tester must access the preview through approved, secure channels established by the system administrator.

## 3. Route Checklist
Verify each of the following routes in the staging environment:

| Route | Expected Page / Content | Pass/Fail | Screenshot / Evidence Note | Privacy / Governance Note | Issues Observed |
|---|---|---|---|---|---|
| `/` | Redirects to `/dashboard/executive-overview` | `[ ]` | | | |
| `/dashboard` | Redirects to `/dashboard/executive-overview` | `[ ]` | | | |
| `/dashboard/executive-overview` | Executive Overview containing high-level project KPIs, progress charts, and summary metrics. | `[ ]` | | | |
| `/dashboard/activity-progress` | Activity Progress tracking showing key activity execution status. | `[ ]` | | | |
| `/dashboard/indicator-progress` | Indicator Progress tracking showing achievements against defined targets. | `[ ]` | | | |
| `/dashboard/participant-reach` | Participant Reach analysis showing demographics and target counts. | `[ ]` | | | |
| `/dashboard/data-quality` | Data Quality metrics showing completeness, validation flags, and metadata health. | `[ ]` | | | |
| `/dashboard/gbv-ocmc-summary` | Gender-Based Violence (GBV) One-stop Crisis Management Centre (OCMC) summary (requires data suppression check). | `[ ]` | | | |
| `/dashboard/ip-performance` | Implementing Partner (IP) performance dashboard showing partner-wise progress. | `[ ]` | | | |
| `/dashboard/activity-detail` | Granular drill-down into specific indicators and activity logs. | `[ ]` | | | |
| `/dashboard/management-decision-centre` | Management Decision Centre containing AI-assisted narrative drafting and decision support. | `[ ]` | | | |
| `/dashboard/geographic-coverage` | Geographic Coverage page displaying the custom GeoJSON map of Nepal districts. | `[ ]` | | | |

## 4. API Checklist
Verify backend API endpoints respond correctly and return structured mock data safely:

| Endpoint | Expected Behavior | Pass/Fail | Evidence / Notes |
|---|---|---|---|
| `/api/dashboard/executive-overview` | Returns valid JSON payload for the executive overview dashboard | `[ ]` | |
| `/api/dashboard/page-data` | Returns status 200 and safe JSON response matching expected schema | `[ ]` | |

> [!NOTE]
> * API checks are limited to HTTP status codes and safe response-shape checks only.
> * BigQuery live validation is NOT performed as part of this checklist unless separately and explicitly approved.

## 5. UI Checklist
Verify the presence and behavior of core UI components and interactive elements:
- [ ] **Sidebar Navigation:** Smooth transition between all dashboard pages, highlighting the active route.
- [ ] **KPI Cards:** Core metric summaries displaying correct calculated values with styling.
- [ ] **Charts and Tables:** React/Recharts rendering correctly without overlap or layout shifting.
- [ ] **Data Source / Freshness Caveats:** Informational footnotes displaying the date of data extraction and current mode (e.g., Mock Mode).
- [ ] **Privacy/Suppression Messaging:** Clear display of small-cell suppression rules (counts 1–4 suppressed).
- [ ] **Management Decision Centre Advisory Language:** Explicit text highlighting that AI output is advisory-only and human-led.
- [ ] **Copy Narrative Draft Behavior:** Copy-to-clipboard button functioning properly on AI-generated text.
- [ ] **Geographic Coverage Map Rendering:** Inline SVG-based rendering of the custom Nepal map.
- [ ] **Partial Geography Caveat:** Warning/footnote stating that geographic data coverage is currently partial and for demo purposes.
- [ ] **No External Map Dependencies:** Confirm that no external map dependencies (e.g., Google Maps API, Mapbox, Leaflet, ArcGIS JS SDK) are loaded or visible.

## 6. Privacy Checklist
Confirm adherence to the project's strict data privacy standards:
- [ ] **No Survivor Names:** Zero exposure of GBV survivor names.
- [ ] **No Complainant Names:** Zero exposure of complainant names.
- [ ] **No Beneficiary Names:** Zero exposure of individual beneficiary names.
- [ ] **No Case-Level Data:** All data must be aggregated; no raw individual files or row-level case data.
- [ ] **No Unnecessary Personal Identifiers:** Zero exposure of phone numbers, precise addresses, or emails.
- [ ] **No Visible Small-Cell Exposure:** Verify that any metric displaying counts between 1 and 4 is successfully suppressed to `<5`.
- [ ] **Suppression & Privacy Caveats:** Confirm that warning/confidentiality banners are visible on pages rendering sensitive data (specifically OCMC and Reach pages).

## 7. Governance Checklist
Ensure AI and system governance guardrails are in place:
- [ ] **Human-led, AI-assisted:** Interface clearly marks AI suggestions as drafts that require human review and authorization.
- [ ] **Advisory Only:** Clear indication that recommendations generated by the system are not decision-authoritative.
- [ ] **No Autonomous Decision-Making:** System has no writeback capabilities or autonomous actions affecting programming.
- [ ] **No Live BigQuery Claim:** Staging UI does not claim to run against live BigQuery production unless separately validated and enabled.
- [ ] **No Connector-Enabled Claim:** Staging UI does not claim live Google workspace or database connections unless separately approved.
- [ ] **No Production-Readiness Claim:** Staging environment explicitly carries a "Draft/Staging Prototype" badge.

## 8. AG-083 Pass Criteria
Testing is considered a **PASS** only if all the following conditions are met:
1. All key routes listed in the Route Checklist render the correct dashboard UI.
2. No critical runtime errors or console failures are detected.
3. Privacy/suppression messaging is present and working on all sensitive views.
4. Decision-support elements remain strictly advisory with proper labels.
5. The custom Geographic map renders safely without loading external libraries.
6. The production branch and production databases remain entirely untouched.

## 9. AG-083 Fail/Block Criteria
Testing is considered a **FAIL** or **BLOCKED** if any of the following occur:
1. Vercel login protection or preview bypass prompt prevents accessing the dashboard.
2. Any route returns a 500 server error or fails to render basic layouts.
3. Any sensitive raw data (cell count 1–4, survivor name, beneficiary name) is exposed.
4. UI displays misleading claims about live connectors or production readiness.
5. Geographic Coverage map fails to render or attempts to call external map APIs.
6. Decision support features prompt autonomous system actions.
