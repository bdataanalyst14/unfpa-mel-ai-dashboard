# GBV/OCMC Activity Data Audit

## Data Availability
The dashboard's production SQL reads from 6 approved BigQuery objects:
- `repeatdata`
- `activity_summary`
- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

## Trace and Semantics
A search of the fields exposed in the `combined_activity_summary` and `activity_summary` tables (the sources for activity reporting) reveals no direct OCMC service statistics (e.g., `ocmcServicesProvided`, `totalSurvivors`, `byPregnancyStatus`). 
The `combined_activity_summary` provides total participants and some demographics (`female`, `withdisability`), but does not contain a classification for GBV survivors, case types, or Safe House/OCMC specific metrics that can be cleanly isolated in a privacy-safe manner.

Because the underlying BigQuery contract does NOT expose a dedicated `gbv_service_summary` aggregate table, there is NO valid aggregate survivor/service data available to the dashboard at this time.

## Conclusion
- **Aggregate GBV/OCMC data found**: NO.
- **Production Usability**: Since there are no approved fields for survivor volume or service provision, we cannot fabricate these charts.
- **Decision**: The GBV/OCMC Summary page MUST remain in its intentional no-data / pending state. 
- **Missing Contract**: An approved aggregate view (e.g., `gbv_service_summary`) that pre-calculates safe k-anonymized service volumes (with cells < 5 suppressed upstream) is required before this dashboard route can be enabled.
