# UNFPA MEL Dashboard - Locked Production Layout

This document serves as the acceptance contract for the UI/UX + visual analytics restoration task (`fix/v1.0.1-locked-ui-restoration`).

## Locked Global Shell
- dark navy collapsible left sidebar
- light grey/white content canvas
- compact top filters
- small KPI cards
- analytical chart/card grid
- management attention panel
- detail table where applicable
- source/freshness/caveat/privacy footer
- UNFPA orange accent only
- blue analytical/chart family
- green/amber/red/grey status system
- no excessive pie/donut charts
- no giant empty whitespace
- no generic admin-template appearance

## Locked Routes
1. Executive Overview
2. Activity Progress
3. Participant & Reach
4. Indicator Progress
5. IP / Partner Performance
6. Geographic Coverage
7. GBV / OCMC Summary
8. Data Quality & Evidence
9. Management Decision Centre
10. Activity Detail

## Route Details

### Executive Overview
**Top**: compact contextual filters
**Row 1**: compact KPI cards
**Main analytical row**:
- Programme Progress
- Indicator Status
- Geographic Coverage mini-map
**Next analytical row**:
- Participant Reach/Profile
- Top IP / Partner attention
- Data Quality / Evidence attention
**Right-side or integrated management panel**: Management Attention / approved decision-support narrative
**Bottom**: source + freshness + validation caveat + privacy

### Geographic Coverage
**Top**: geographic/programme filters
**Row 1**: coverage KPI cards
**Main**:
- LEFT LARGE = custom Nepal Programme Coverage Map
- RIGHT = district activity/reach ranking
**Bottom**:
- LEFT = Project x District coverage matrix
- RIGHT = coverage/gap table

*Map requirements*: Restore existing custom Nepal map (NOT Google Maps). Default map view: Activity density by District. Preserve Nepal silhouette and validated province/district geography. No raw participant-level or sensitive small-geography data. Provide density legend, tooltips, selected geography, drill interaction where supported, aggregated/privacy view indication.

### Activity Progress
KPI row + progress by project + progress by IP + activity type + monthly trend + delayed/evidence table.

### Participant & Reach
KPI row + sex + age + caste/ethnicity + disability + participant type + organization/position + inclusion geography.

### Indicator Progress
Preserve locked visual structure, but do not fabricate target/actual/status. Show unavailable states where approved indicator data is not yet connected.

### IP / Partner Performance
IP KPIs + ranking + participant reach + evidence status + DQ scorecard + follow-up table.

### GBV / OCMC Summary
Maintain privacy-blocked/current safe state unless approved aggregate production data is available. Never expose survivor-level information.

### Data Quality & Evidence
DQ KPI row + IP DQ score + evidence completeness + validation trend + failed checks + correction tracker.

### Management Decision Centre
Restore the locked visual layout, but DO NOT invent generative AI. Use deterministic live-grounded management attention where defensible. Keep unsupported generative functions disabled.

### Activity Detail
Bounded/searchable aggregate/activity records + evidence/validation state. No participant PII.

## Filter UX - Locked
**Primary visible filters**: Year, Quarter, Project, IP / Partner, Province, District, Palika
**Compact More Filters / Advanced Filters**: Outcome, Output, Activity, Indicator, Fund Code, Event Type
**Rules**: Do not permanently fill half the header with grey "Not supported" boxes. Only activate filters supported by current data contracts. Do not fake filter behavior.

## Implementation Rules
- Use ONLY existing approved production BigQuery/server APIs.
- Do not create a second business-logic layer in React.
- Do not alter production metric definitions merely to populate a chart.
- If a locked visual lacks a currently supported metric: render an intentional "Data not yet available" state rather than deleting the visual structure or inventing data.

## QA and Rendering Rules
Inspect actual rendered pages at: 375, 768, 1024, 1440.
Compare side-by-side with locked references.
For each route document:

```text
LOCKED REFERENCE:
CURRENT DIFFERENCE:
IMPLEMENTED FIX:
DATA SOURCE:
RESPONSIVE RESULT:
PRIVACY RESULT:
REMAINING GAP:
```
