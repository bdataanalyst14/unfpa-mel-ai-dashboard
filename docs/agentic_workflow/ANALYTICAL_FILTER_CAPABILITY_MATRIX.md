# Analytical data and filter capability audit

Inspected live read-only BigQuery metadata and aggregate category profiles on 2026-10-05T04:04:56.047Z. Production baseline: 5695869bf1e49bcc167f6a21ca17767ce9cb0f61. Local evidence: test-results/analytical-pass/schema.json and profiles.json. No warehouse changes or deployment.

## Sources and grain

- combined_summary is NOT AVAILABLE; approved name: combined_activity_summary. One summary contribution per summary repeat; one name-list implementation group per submission and reported programme/location dimensions. event_count is 1 per published contribution, not deduplicated physical events.
- activity_summary: summary repeat grain, counts and event context; excludes individual participant classification.
- repeat_data is NOT AVAILABLE; approved name: repeatdata. Participant attendance grain. Server-owned aggregate SELECT only; never return rows, organization_position, identifiers or activity_detail.
- indicator_progress_summary: published programme/result/location aggregates. Indicator linkage is not validated; keep progress reporting disabled.
- data_quality_summary: snapshot, source table, IP. No year/quarter/project/geography; do not pretend those filters apply.
- ip_submission_status: partner grain, all reporting periods. Only IP filter applies to submission metrics.
- Live views reference immutable generation tables. Backing metadata inspected only; application queries continue using approved views exclusively.

## Field / filter capability matrix

| Field | Source | Grain / meaning | Filterable | Applicable routes | Privacy / suppression |
|---|---|---|---|---|---|
| Year, quarter | combined reporting_year1/report_quarter1; repeatdata reporting_year/report_quarter | Reporting period, not date derived | Yes | Executive, Activity Progress/Detail, Reach, Geography, Management | Counts 1?4 withheld |
| Project, IP | combined project1/ip_name; repeatdata project/ip_name | Reported programme/partner | Yes | Same; IP also Partner | Aggregate-only |
| Province, district, municipality/LG | combined province1/district1/palika1; repeatdata province/district/palika | Event/activity implementation context | Yes | All combined routes and Reach | Never describe as residence; counts 1?4 withheld |
| Participant residence | pprovince/pdistrict/ppalika in backing metadata ONLY | Separate participant concept | NOT AVAILABLE in approved views | None | Do not query or expose |
| Outcome, output, activity | outcome1/output1/activity1 (repeatdata aliases without 1) | Reported hierarchy, not achievement | Yes, cascade by observed combinations | Activity Progress/Detail | No indicator inference |
| Activity code / name | subactcode1 / activity1; subact1 is subactivity | Reported labels | Search/sort; activity filter | Activity Detail/Progress | Exclude free-text actdetails1 |
| Activity/event type | eventtype1; repeatdata event_type | Published classifications, retain source spelling | Yes | Progress/Detail/Reach; composition on Executive | Aggregate-only |
| Reporting mode | participant_entry_mode | name_list or summary | Yes | Activity Detail/Reach | Summary has no individual classification |
| Reporting classification | repeatdata report_eligible | reportable/non-reportable | Yes through aggregate counts | Reach | Summary participants are reportable by published formula; never subtract arbitrary totals |
| Participant/beneficiary type | repeatdata participant_type_name | beneficiary, guest; null for non-reportable in inspected data | Yes, classified name-list population only | Reach | Summary type NOT AVAILABLE; explicitly exclude it when selected |
| Sex | combined female/male/other; repeatdata sex_name | Combined is reportable profile; repeatdata supports selected population | Aggregate composition | Executive/Reach/Detail | Withhold 1?4; no suppressed slice/percentage |
| Age | eight combined bands; repeatdata age_group_name | Mixed source bands overlap | Aggregate composition | Executive/Reach/Detail | Keep band labels, no inferred single-age distribution |
| Caste/ethnicity | eight combined categories; repeatdata caste_ethnicity_name | Source social inclusion categories | Aggregate composition | Executive/Reach/Detail | Withhold 1?4 |
| Disability | combined withdisability/nodisability/pwd_total; repeatdata disability_name | Published disability aggregates | Aggregate composition | Executive/Reach/Detail | Withhold 1?4 |
| event_count | combined | Published implementation contributions | SUM within filtered scope | Executive/Activity/Geography/Management | Not unique events; withhold 1?4 |
| Repeat reportable/non-reportable/guest/beneficiary counts | combined repeat_*_total | Aggregate contributions; guest/beneficiary are reportable only | Measures, not row-level classification filters | Detail | Do not use as demographic denominators for another population |

## Geographic lineage

Live repeatdata SQL aliases province1/district1/palika1. In the pipeline's flatten_participants.py these resolve group_activity_progress/province, district and palika, independently of pprovince/pdistrict/ppalika. Summary SQL retains the same activity-context fields. Map uses SUM(event_count) grouped by district1 after all seven global predicates. Local-unit polygons are boundary rendering only: colour is a district aggregate, not a municipality count or participant residence. Year/quarter/project/IP/province/district/municipality must all constrain the map query before district aggregation.

## Combined field inventory

All 61 live columns reviewed. Detail exposes registry-approved dimensions and measures; identifiers, narrative and unvalidated indicator linkage are excluded. Published validation diagnostics are reviewed separately below. No SELECT * in the dashboard.

| Field | Type | Detail treatment |
|---|---|---|
| event_row_key | STRING | Exclude internal identifier/index |
| source_type | STRING | Implementation / Source Type |
| participant_entry_mode | STRING | Implementation / Reporting Mode |
| ip_name | STRING | Reporting / IP / Partner |
| repeat_index | INTEGER | Exclude internal identifier/index |
| submission_count | INTEGER | Implementation / Submission contributions / suppress 1?4 |
| reporting_year1 | STRING | Reporting / Year |
| report_quarter1 | STRING | Reporting / Quarter |
| project1 | STRING | Reporting / Project |
| outcome1 | STRING | Results Hierarchy / Outcome |
| output1 | STRING | Results Hierarchy / Output |
| activity1 | STRING | Results Hierarchy / Activity Name |
| subact1 | STRING | Results Hierarchy / Subactivity |
| actdetails1 | STRING | Exclude unreviewed free text; potential PII |
| subactcode1 | STRING | Results Hierarchy / Activity Code |
| indicator1 | STRING | Exclude pending indicator linkage validation |
| fundcode1 | STRING | Implementation / Fund Code |
| eventtype1 | STRING | Implementation / Event Type |
| start_date1 | DATE | Implementation / Start Date |
| end_date1 | DATE | Implementation / End Date |
| province1 | STRING | Geography / Province |
| district1 | STRING | Geography / District |
| palika1 | STRING | Geography / Municipality / LG |
| event_count | INTEGER | Implementation / Reported activities / suppress 1?4 |
| total_participants | INTEGER | Participants / Total Participants / suppress 1?4 |
| total_reportable_participants | INTEGER | Participants / Reportable Participants / suppress 1?4 |
| gender_total | INTEGER | Sex / Published sex total / suppress 1?4 |
| male | INTEGER | Sex / Male / suppress 1?4 |
| female | INTEGER | Sex / Female / suppress 1?4 |
| other | INTEGER | Sex / Other Sex / suppress 1?4 |
| age_total | INTEGER | Age / Published age total / suppress 1?4 |
| below_15 | INTEGER | Age / Below 15 / suppress 1?4 |
| age_15_19 | INTEGER | Age / 15-19 / suppress 1?4 |
| age_16_24 | INTEGER | Age / 16-24 / suppress 1?4 |
| age_20_24 | INTEGER | Age / 20-24 / suppress 1?4 |
| age_25_49 | INTEGER | Age / 25-49 / suppress 1?4 |
| age_25_54 | INTEGER | Age / 25-54 / suppress 1?4 |
| age_50_and_above | INTEGER | Age / 50+ / suppress 1?4 |
| age_55_and_above | INTEGER | Age / 55+ / suppress 1?4 |
| caste_total | INTEGER | Social Inclusion / Published social inclusion total / suppress 1?4 |
| hilldalit | INTEGER | Social Inclusion / Hill Dalit / suppress 1?4 |
| teraidalit | INTEGER | Social Inclusion / Terai Dalit / suppress 1?4 |
| hilljanajati | INTEGER | Social Inclusion / Hill Janajati / suppress 1?4 |
| teraijanajati | INTEGER | Social Inclusion / Terai Janajati / suppress 1?4 |
| madhesi | INTEGER | Social Inclusion / Madhesi / suppress 1?4 |
| muslim | INTEGER | Social Inclusion / Muslim / suppress 1?4 |
| bc | INTEGER | Social Inclusion / Brahmin/Chhetri / suppress 1?4 |
| other_cast | INTEGER | Social Inclusion / Other Caste / suppress 1?4 |
| pwd_total | INTEGER | Disability / Published disability total / suppress 1?4 |
| nodisability | INTEGER | Disability / No Disability / suppress 1?4 |
| withdisability | INTEGER | Disability / With Disability / suppress 1?4 |
| repeat_reportable_total | INTEGER | Participants / Repeat Reportable / suppress 1?4 |
| repeat_nonreportable_total | INTEGER | Participants / Repeat Non-Reportable / suppress 1?4 |
| repeat_guest_total | INTEGER | Participants / Repeat Guest / suppress 1?4 |
| repeat_beneficiary_total | INTEGER | Participants / Repeat Beneficiary / suppress 1?4 |
| gender_disagg_sum | INTEGER | Validation diagnostic; not participant totals |
| gender_check | STRING | Validation diagnostic; not participant totals |
| age_disagg_sum | INTEGER | Validation diagnostic; not participant totals |
| age_check | STRING | Validation diagnostic; not participant totals |
| caste_disagg_sum | INTEGER | Validation diagnostic; not participant totals |
| caste_check | STRING | Validation diagnostic; not participant totals |

## History reviewed

Reviewed production commits 5695869 and 171c25c, original executive mock-page layout and existing production visualization components. Preserve compact two-column sections and existing visual language; no prototype targets or narrative KPIs are carried into live reporting.
