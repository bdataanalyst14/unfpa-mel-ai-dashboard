# UNFPA MEL Dashboard Route Data Mode Matrix

Updated 7 September 2026. Local Production V1 hardening; no production activation.

All routes use labeled synthetic data in mock mode. BigQuery mode fails closed and never substitutes mock data. All live values use approved aggregate views. Live GBV remains disabled.

| Dashboard route | BigQuery mode | Supported filters |
|---|---|---|
| /dashboard/executive-overview | Aggregate total/reportable participants, events, partners, districts, sex counts | Year, Quarter, Project, Implementing Partner, Province |
| /dashboard/activity-progress | Aggregate volumes; planned/completed charts disabled | Same five |
| /dashboard/participant-reach | Aggregate total/reportable and sex/disability counts | Same five |
| /dashboard/geographic-coverage | Aggregate geographic/event counts; prototype map disabled | Same five |
| /dashboard/ip-performance | Submission/event/partner counts | Implementing Partner only |
| /dashboard/data-quality | Quality counts and derived quality percentage | None |
| /dashboard/indicator-progress | Disabled pending validated target/status rule | None |
| /dashboard/management-decision-centre | Disabled; no prototype/AI narratives | None |
| /dashboard/activity-detail | Disabled; no live record detail or export | None |
| /dashboard/gbv-ocmc-summary | Disabled pending privacy/reporting approval | None |
| /dashboard/gbv-ocmc | Redirect to summary, preserving filter parameters | Same restriction |

Live filter options come from combined_activity_summary. Predicates use parameters and intersection semantics. Unsupported values, repeated values and unsupported route combinations fail explicitly; District and Municipality live filters are disabled. No-data responses contain no replacement KPIs. Mock-only filtered charts/tables/maps/CSV remain available with clear demo labels; CSV formula prefixes are neutralized.

Detailed formula definitions, four-view scope, API payload/status behavior and uncompleted production gates are in [Production V1 scope](../production/PRODUCTION_V1_RELEASE_SCOPE.md). This matrix does not certify live source reconciliation or approve UAT/production activation.
