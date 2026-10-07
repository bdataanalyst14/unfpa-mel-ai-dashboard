# Activity Detail combined_summary Audit and Data Contract Expansion

## 1. Complete `combined_summary` Schema & Privacy Classification

The dashboard queries `combined_activity_summary` for aggregate activity reporting.

**Available Fields and Privacy Classification:**

*   **Reporting & Organization:**
    *   `reporting_year1` (Year), `report_quarter1` (Quarter), `project1` (Project), `ip_name` (Partner)
    *   *Classification:* Non-sensitive aggregate dimensions. Safe for UI exposure.
*   **Geography:**
    *   `province1` (Province), `district1` (District), `palika1` (Municipality)
    *   *Classification:* Non-sensitive aggregate dimensions. Safe for UI exposure.
*   **Results Hierarchy & Implementation:**
    *   `outcome1` (Outcome), `output1` (Output), `indicator1` (Indicator), `subactcode1` (Activity Code), `subact1` (Activity Category), `activity1` (Activity Name), `actdetails1` (Activity Details), `fundcode1` (Fund Code), `eventtype1` (Event Type), `participant_entry_mode` (Reporting Mode), `source_type` (Source Type), `start_date1` (Start Date), `end_date1` (End Date)
    *   *Classification:* Non-sensitive aggregate dimensions. Safe for UI exposure.
*   **Aggregate Measures (Small-cell suppressed where applicable):**
    *   **Volume:** `event_count` (Reported Activities)
    *   **Participants Base:** `total_participants`, `total_reportable_participants`, `repeat_reportable_total`, `repeat_nonreportable_total`, `repeat_guest_total`, `repeat_beneficiary_total`
    *   **Sex:** `female`, `male`, `other` (Renamed to `other_sex` to avoid keyword conflicts)
    *   **Age:** `below_15`, `age_15_19`, `age_16_24`, `age_20_24`, `age_25_49`, `age_25_54`, `age_50_and_above`, `age_55_and_above`
    *   **Social Inclusion:** `hilldalit`, `teraidalit`, `hilljanajati`, `teraijanajati`, `madhesi`, `muslim`, `bc`, `other_cast`
    *   **Disability:** `pwd_total`, `withdisability`, `nodisability`
    *   *Classification:* Privacy-safe aggregate counts. The dashboard server implements small-cell suppression (counts 1-4 are masked as `<5`). Safe for UI exposure.

## 2. Fields Exposed in UI

**Default Visible Fields:**
Year, Quarter, Project, IP / Partner, Province, District, Municipality / LG, Outcome, Output, Activity Code, Activity Name, Reported Activities, Total Participants, Reportable Participants

**Optional Fields (via Column Customization):**
*   **Results Hierarchy:** Indicator, Activity Category
*   **Implementation:** Start Date, End Date, Event Type, Reporting Mode, Source Type, Fund Code, Activity Details
*   **Participants:** Repeat Reportable, Repeat Non-Reportable, Repeat Guest, Repeat Beneficiary
*   **Sex:** Female, Male, Other Sex
*   **Age:** Below 15, 15-19, 16-24, 20-24, 25-49, 25-54, 50+, 55+
*   **Social Inclusion:** Hill Dalit, Terai Dalit, Hill Janajati, Terai Janajati, Madhesi, Muslim, Brahmin/Chhetri, Other Caste
*   **Disability:** Disability Total, With Disability, No Disability

## 3. Excluded Fields and Reason

*   Row identifiers like `event_row_key` and calculation checksums like `gender_disagg_sum`, `gender_check`, `age_disagg_sum`, `age_check`, `caste_disagg_sum`, `caste_check`, `gender_total`, `age_total`, `caste_total` were excluded.
*   *Reason:* These are either internal BigQuery identifiers (meaningless to business users) or intermediate validation logic fields. The UI displays the primary categories themselves. 
*   **No PII exists** in the `combined_activity_summary` schema (no names, phone numbers, free-text survivor details, or case IDs). The data is pre-aggregated and thus intrinsically lacks individual PII.

## 4. Filter Mapping

Existing global filters correctly apply to the data. 
The Activity Detail UI provides an additional search box that acts locally on the retrieved dataset. It filters on Activity Code (`subactcode1`), Activity Name (`activity1`), Project, Partner, Outcome, Output, District, and Municipality.

## 5. CSV Mapping

The UI now provides two separate CSV export options for the Activity Detail grid:
1.  **Visible columns only:** Exports only the columns that the user has selected to view on the screen.
2.  **Full filtered dataset:** Exports all ~50 approved dimensions and demographic attributes from `combined_summary` for the matching rows.

Both exports strictly reflect the active global filters, the search text, and the server-applied small-cell suppression (counts `<5` remain `<5` in the CSV). 

## 6. Aggregate Grain

Each row in the Activity Detail data corresponds to an exact unique combination of:
`reporting_year1, report_quarter1, project1, ip_name, province1, district1, palika1, outcome1, output1, indicator1, subactcode1, subact1, activity1, actdetails1, fundcode1, eventtype1, participant_entry_mode, source_type, start_date1, end_date1`

This ensures that demographic sums appropriately tie back to the specific programmatic and geographic scope without duplicating totals.

## 7. Remaining Limitations

*   **Browser Memory:** BigQuery is queried via server-side aggregation. We impose a strict limit of 10,000 aggregate rows per query to avoid memory explosions or excessive bandwidth usage on the client side. A warning is raised if the filtered data exceeds 10,000 grouped records.
*   **Participants Semantics:** "Total Participants" measures the sum of reported attendances. It must not be confused with unique individual people. We have added a Data Definitions dialog to clarify this distinction to end users.
