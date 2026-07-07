import pandas as pd
import os

filepath = r'H:\My Drive\unfpa-mel-ai-dashboard\docs\data_pipeline\DASHBOARD_BIGQUERY_DATA_CONTRACT_MATRIX.xlsx'

with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
    pd.DataFrame({'Route': ['executive-overview', 'activity-progress', 'indicator-progress', 'gbv-ocmc-summary'], 'Contract_Status': ['Draft', 'Blocked', 'Blocked', 'Requires Privacy Review']}).to_excel(writer, sheet_name='1. Route Contract Summary', index=False)
    pd.DataFrame({'Dashboard_Field': ['total_events', 'reportable_participants'], 'KPI_Metric': ['Events', 'Participants']}).to_excel(writer, sheet_name='2. KPI Field Mapping', index=False)
    pd.DataFrame({'Dashboard_Field': ['total_events'], 'BigQuery_Source': ['combined_activity_summary.event_count']}).to_excel(writer, sheet_name='3. BigQuery Source Mapping', index=False)
    pd.DataFrame({'Metric': ['Data Quality Score'], 'Rule': ['(total_rows - records_with_quality_issue) / total_rows']}).to_excel(writer, sheet_name='4. Calculation Rules', index=False)
    pd.DataFrame({'Table': ['combined_activity_summary'], 'Suppression_Rule': ['Suppress if count < 5']}).to_excel(writer, sheet_name='5. Privacy Suppression Requirements', index=False)
    pd.DataFrame({'Route': ['indicator-progress'], 'Dependency': ['Canonical Indicator Codes mapping']}).to_excel(writer, sheet_name='6. M&E Registry Dependency', index=False)
    pd.DataFrame({'Missing_Field': ['canonical_activity_code'], 'Blocker_Impact': ['High']}).to_excel(writer, sheet_name='7. Missing Fields and Blockers', index=False)
    pd.DataFrame({'Proposed_View': ['gbv_aggregate_safe_view'], 'Purpose': ['Safe dashboard consumption']}).to_excel(writer, sheet_name='8. Proposed Reporting Views', index=False)
    pd.DataFrame({'Query_Name': ['executive_overview_validation.sql'], 'Target': ['combined_activity_summary']}).to_excel(writer, sheet_name='9. Validation Queries', index=False)
    pd.DataFrame({'Gate': ['M&E Sign-off'], 'Status': ['Pending']}).to_excel(writer, sheet_name='10. Readiness Gate', index=False)
