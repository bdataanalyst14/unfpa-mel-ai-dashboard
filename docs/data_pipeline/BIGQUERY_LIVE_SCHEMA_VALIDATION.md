# BigQuery Live Schema Validation

## View: `combined_activity_summary`
- **Row Count:** 1798
| Column | Type |
| :--- | :--- |
| event_row_key | STRING |
| source_type | STRING |
| participant_entry_mode | STRING |
| ip_name | STRING |
| parent_submission_id | STRING |
| repeat_index | INTEGER |
| reporting_year1 | STRING |
| report_quarter1 | STRING |
| project1 | STRING |
| outcome1 | STRING |
| output1 | STRING |
| activity1 | STRING |
| subact1 | STRING |
| actdetails1 | STRING |
| subactcode1 | STRING |
| indicator1 | STRING |
| fundcode1 | STRING |
| eventtype1 | STRING |
| start_date1 | DATE |
| end_date1 | DATE |
| province1 | STRING |
| district1 | STRING |
| palika1 | STRING |
| event_count | INTEGER |
| total_participants | INTEGER |
| total_reportable_participants | INTEGER |
| gender_total | INTEGER |
| male | INTEGER |
| female | INTEGER |
| other | INTEGER |
| age_total | INTEGER |
| below_15 | INTEGER |
| age_15_19 | INTEGER |
| age_16_24 | INTEGER |
| age_20_24 | INTEGER |
| age_25_49 | INTEGER |
| age_25_54 | INTEGER |
| age_50_and_above | INTEGER |
| age_55_and_above | INTEGER |
| caste_total | INTEGER |
| hilldalit | INTEGER |
| teraidalit | INTEGER |
| hilljanajati | INTEGER |
| teraijanajati | INTEGER |
| madhesi | INTEGER |
| muslim | INTEGER |
| bc | INTEGER |
| other_cast | INTEGER |
| pwd_total | INTEGER |
| nodisability | INTEGER |
| withdisability | INTEGER |
| repeat_reportable_total | INTEGER |
| repeat_nonreportable_total | INTEGER |
| repeat_guest_total | INTEGER |
| repeat_beneficiary_total | INTEGER |
| gender_disagg_sum | INTEGER |
| gender_check | STRING |
| age_disagg_sum | INTEGER |
| age_check | STRING |
| caste_disagg_sum | INTEGER |
| caste_check | STRING |

## View: `indicator_progress_summary`
- **Row Count:** 723
| Column | Type |
| :--- | :--- |
| reporting_year1 | STRING |
| report_quarter1 | STRING |
| project1 | STRING |
| outcome1 | STRING |
| output1 | STRING |
| activity1 | STRING |
| subact1 | STRING |
| subactcode1 | STRING |
| indicator1 | STRING |
| fundcode1 | STRING |
| eventtype1 | STRING |
| province1 | STRING |
| district1 | STRING |
| palika1 | STRING |
| total_events | INTEGER |
| total_participants | INTEGER |
| total_reportable_participants | INTEGER |
| male | INTEGER |
| female | INTEGER |
| other | INTEGER |
| below_15 | INTEGER |
| age_15_19 | INTEGER |
| age_16_24 | INTEGER |
| age_20_24 | INTEGER |
| age_25_49 | INTEGER |
| age_25_54 | INTEGER |
| age_50_and_above | INTEGER |
| age_55_and_above | INTEGER |
| hilldalit | INTEGER |
| teraidalit | INTEGER |
| hilljanajati | INTEGER |
| teraijanajati | INTEGER |
| madhesi | INTEGER |
| muslim | INTEGER |
| bc | INTEGER |
| other_cast | INTEGER |
| nodisability | INTEGER |
| withdisability | INTEGER |

## View: `data_quality_summary`
- **Row Count:** 2
| Column | Type |
| :--- | :--- |
| run_timestamp | TIMESTAMP |
| table_name | STRING |
| total_rows | INTEGER |
| duplicate_unique_keys | INTEGER |
| missing_province | INTEGER |
| missing_sex | INTEGER |
| missing_report_eligible | INTEGER |
| missing_indicator | INTEGER |
| records_with_quality_issue | INTEGER |

## View: `ip_submission_status`
- **Row Count:** 15
| Column | Type |
| :--- | :--- |
| ip_name | STRING |
| total_submissions | INTEGER |
| total_events | INTEGER |
| total_participant_rows | INTEGER |
| total_summary_participants | INTEGER |
| latest_sync_time | TIMESTAMP |

