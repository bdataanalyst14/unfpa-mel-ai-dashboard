# Final Analytical Filter Audit & Implementation Report

## combined_activity_summary Field Inventory
The `combined_activity_summary` view serves as the foundation for the dashboard.
Available analytical fields mapped and verified:
- **Reporting**: year, quarter, project, partner
- **Geography**: province, district, municipality (palika)
- **Results Hierarchy**: outcome, output, activity code, activity name
- **Implementation**: reported activities (events), start date, end date, event type, reporting mode, source type, fund code
- **Participants**: total participants, reportable participants, repeat reporting groups
- **Demographics**: sex (female, male, other), age bands (overlapping groups), social inclusion (caste/ethnicity groups), disability.

## Route / Filter Capability Matrix
All live global filters apply natively via `dashboard-page-data-service.ts` to all BigQuery routes:
- **Global Filters**: Year, Quarter, Project, IP/Partner, Province, District, Municipality.
- **Analytical Filters**: Outcome, Output, Activity, Event Type, Reporting Mode, Fund Code.
- Every dropdown parameter propagates directly to BigQuery `WHERE` clauses for KPIs, charts, maps, and tables.

## Executive Component Matrix
The Executive Overview answers: "What is the overall scale, participant profile, implementation composition, and geographic footprint of the programme?"
- **KPIs**: Reported activities, Total participants, Districts covered, Implementing partners.
- **Geographic Coverage**: Event-location map aggregated by district.
- **Participant Profile by Sex**: Pie chart of attendance counts.
- **Age Profile**: Bar chart of overlapping age bands (compact).
- **Social Inclusion Profile**: Caste/Ethnicity bar chart.
- **Disability Profile**: Pie chart.
- **Activity / Event Type**: Implementation contributions by published event type.
- **Top volume tables**: Largest activity volumes by project and partner.

## Activity Progress Hierarchy
The Activity Progress page focuses on implementation hierarchy using validated cascading filters:
- Project → Outcome → Output → Activity.
- Event Type filter is available.
- **Unvalidated Indicator Linkage**: Kept intentionally disabled. Activity totals are not equated to indicator achievement.

## Participant Reach Classification Contract
The Participant & Reach page analyzes participant population types safely:
- Supported reporting classification: All, Reportable, Non-reportable.
- Participant/Beneficiary type and Event Type use actual source categories only.
- Selecting a population filter updates the base denominator for *all* demographic profiles (Sex, Age, Social Inclusion, Disability) ensuring consistent population analysis. No arbitrary subtraction is used.

## Operational vs Sensitive Suppression Rules
Measure-aware suppression differentiates between sensitive survivor/participant data and operational program metrics:
- **Operational Counts** (e.g., Reported activities, Districts covered, Implementing partners, Validation rows, etc): Show EXACT numbers (1, 2, 3, etc.).
- **Sensitive Counts** (Demographics, participants): Continue small-cell suppression; any value between 1 and 4 is replaced with `<5`.

## Geographic Coverage Filter Contract
Geographic Coverage strictly analyzes **EVENT / ACTIVITY LOCATION**:
- Local-unit map and geographic components represent reported activities by event location.
- Does NOT imply participant residence.
- Project filter correctly updates KPIs, map density, and province/district breakdowns.

## Data Quality Latest-Snapshot Contract
Data Quality uses only validated live measures:
- Avoids the unsafe historical composite score.
- Exposes actual gaps: Geographic gaps, Project gaps, Partner gaps.
- Strictly isolates the validation score to the **latest snapshot** (`MAX(snapshot_timestamp)`) to prevent double-counting historical snap shots.

## GBV Activity vs Survivor/Service Distinction
- **GBV-related programme activities**: Safely available through the approved aggregate activity contract via Activity Progress and Activity Detail.
- **Survivor/Service reporting**: The specific `gbv-ocmc` dashboard route remains safely **fail-closed**, blocked pending an approved aggregate privacy-safe contract. No individual survivor records are exposed.

## Freshness Root Cause
- **Observed Behavior**: The dashboard freshness reads approximately `August 13, 2026`.
- **Root Cause**: Freshness is determined by `MAX(latest_sync_time)` in the `ip_submission_status` table. While `combined_activity_summary` contains newer data (e.g. up to August 23), the `ip_submission_status` sync/refresh process has stopped updating its metadata timestamp. The timezone conversion (Asia/Kathmandu) correctly translates the UTC value. The UI now accurately surfaces the actual pipeline's documented freshness timestamp rather than faking the current page render time.

## Admin Refresh Architecture/Status
**ADMIN REFRESH NOT IMPLEMENTED — SAFE UPSTREAM REFRESH CONTRACT REQUIRED.**
- There is currently no safe upstream refresh/sync API endpoint in the dashboard architecture to mutate BigQuery. 
- Creating an unvalidated mutation endpoint is an unacceptable security risk. 
- **Required Integration**: A secure server-side authenticated webhook or pub/sub trigger to an approved data pipeline workflow is needed before an admin-only UI button can be safely added.

## Genuine Unsupported Features
- True "beneficiary" classification outside of KoBo source arrays.
- Historical Data Quality trendlines (pending temporal DQ views).
- Validated Indicator Progress linkage (requires registry completion).
- GBV/OCMC specific survivor aggregates (requires safe table contract).
- Safe UI-triggered data pipeline refresh.
