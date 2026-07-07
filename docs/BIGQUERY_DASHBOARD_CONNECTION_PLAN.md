# BigQuery Dashboard Connection Plan

## Reviewed Source

The established pipeline at `H:\My Drive\unfpa_mel` was reviewed on 2026-06-11. It remains the
owner of KoBo ingestion and BigQuery table creation. This dashboard POC does not change pipeline
logic.

Documented defaults:

- Google Cloud project: `unfpadatabase` when available; deployment may use another configured ID.
- BigQuery dataset: `unfpadatabase`.
- BigQuery location: `asia-south1`.

Available tables:

| Table | Grain / purpose | Dashboard classification |
|---|---|---|
| `participants_flat_staging` | Latest participant repeat pull | Restricted; never query from dashboard |
| `participants_flat` | Participant-level final snapshot | Restricted/legacy reference; never return to frontend |
| `activity_summary_flat_staging` | Latest aggregate repeat pull | Internal pipeline only |
| `activity_summary_flat` | Aggregate activity rows | Internal reporting source |
| `combined_activity_summary` | Event/activity aggregate across both entry modes | Approved POC dashboard source |
| `indicator_progress_summary` | Aggregate indicator/activity/location totals | Dashboard-safe aggregate; no targets/status |
| `data_quality_summary` | Table-level quality issue counts | Dashboard-safe aggregate |
| `ip_submission_status` | Partner-level submission/event totals and sync time | Dashboard-safe aggregate |

No BigQuery views were found. The current reporting layer is implemented as tables.

## POC Status

Executive Overview POC implementation and mock-mode verification are complete.

- `DATA_MODE=mock`: serves the existing aggregate mock contract and labels prototype-only visuals.
- `DATA_MODE=bigquery`: queries approved aggregate tables server-side.
- BigQuery configuration/query failure: returns a clearly labelled `Mock fallback`.
- Live credential verification: pending because no local `.env.local` credentials are available.
- Protected ArcGIS/Nepal files: hash comparison passed with `fc` exit code 0.
- Preview deployment: ready at
  `https://unfpa-mel-ai-dashboard-cod001-n1ebgprly.vercel.app` (Vercel authentication protected).
- Production deployment: pending explicit approval.

## Executive Overview POC Contract

`getExecutiveOverviewData(filters)` returns:

```text
{
  summary: CombinedSummary,
  participantSex: [{ name, value, color }],
  insights: AiInsight[3],
  metadata: { dataSource, sourceLabel, lastRefreshed, note }
}
```

Live fields come from `combined_activity_summary`, with data-quality score from
`data_quality_summary` and freshness from `ip_submission_status`.

Supported filters:

- `year` -> `reporting_year1`
- `quarter` -> `report_quarter1`
- `project` -> `project1`
- `province` -> `province1`
- `district` -> `district1`
- `implementingPartner` / `ip` -> `ip_name`

Unavailable live fields are returned as zero in BigQuery mode rather than inferred:

- indicator on-track/watch/off-track classifications
- missing evidence
- pending validation
- approved/validated submissions
- late submissions

Programme target charts, indicator-status charts, and AI insights remain prototype data until
approved reporting tables are created.

## Route Mapping

| Dashboard route | Proposed BigQuery source | Required additions / gaps | Privacy |
|---|---|---|---|
| `/dashboard/executive-overview` | `combined_activity_summary`, `data_quality_summary`, `ip_submission_status` | Approved target/status and workflow summary view | Aggregate operational |
| `/dashboard/activity-progress` | `combined_activity_summary` | Planned activity/target table and completion definition | Aggregate operational |
| `/dashboard/participant-reach` | `indicator_progress_summary` | Approved demographic reporting view; retain aggregation | Aggregate sensitive |
| `/dashboard/indicator-progress` | `indicator_progress_summary` | Indicator target, baseline, status, framework mapping | Aggregate operational |
| `/dashboard/ip-performance` | `ip_submission_status`, `combined_activity_summary` | Evidence, timeliness, validation, quality-by-IP view | Partner aggregate |
| `/dashboard/geographic-coverage` | `combined_activity_summary` | Canonical geography-code mapping to ArcGIS boundaries | Aggregate geography |
| `/dashboard/gbv-ocmc-summary` | Not connected | Dedicated approved GBV aggregate view with suppression-ready cells | Highly sensitive aggregate only |
| `/dashboard/data-quality` | `data_quality_summary` | Trend/history and partner/location-safe quality summaries | Aggregate operational |
| `/dashboard/management-decision-centre` | Approved summary tables only | Governed insight/narrative output and audit metadata | Aggregate decision support |
| `/dashboard/activity-detail` | Not connected in POC | Approved event-level view excluding names, contacts, IDs, and survivor data | Restricted operational |

## Required Reporting Views

1. `dashboard_executive_overview`: approved KPI, quality, validation/evidence/timeliness, and refresh contract.
2. `dashboard_indicator_progress`: indicator metadata, target, actual, achievement, status, year, and quarter.
3. `dashboard_ip_performance`: partner activity, validation, evidence, timeliness, quality, and coverage.
4. `dashboard_geographic_coverage`: canonical province/district/palika codes and aggregate metrics.
5. `dashboard_gbv_ocmc_suppressed`: pre-aggregated, disclosure-controlled GBV/OCMC cells only.

## Privacy Controls

- BigQuery access is server-side only.
- Browser responses contain only aggregate fields defined by the route contract.
- Raw participant and staging tables are not queried.
- No names, contacts, participant IDs, submission IDs, or survivor-level fields are selected.
- GBV/OCMC remains disconnected in this phase.
- Existing small-cell suppression and privacy banners remain unchanged.

## Phases

1. Executive Overview aggregate POC with mock fallback.
2. Create/approve missing Executive Overview reporting view and connect all overview visuals.
3. Connect indicator progress and activity progress.
4. Connect IP performance, data quality, and geography through canonical mappings.
5. Connect controlled activity detail through a reviewed non-PII view.
6. Connect GBV/OCMC only after a suppression-ready aggregate view and governance approval.
7. Preview verification and security review.
8. Production deployment after explicit approval.

Do not connect Indicator Progress until an approved target/status reporting view exists.

## Vercel Environment Checklist

Recommended Preview setting now:

```text
DATA_MODE=mock
```

Required variables for a later controlled live test:

| Variable | Purpose |
|---|---|
| `DATA_MODE` | `mock` for current preview; `bigquery` only for approved live testing |
| `GOOGLE_CLOUD_PROJECT_ID` | BigQuery billing/data project identifier |
| `BIGQUERY_DATASET_ID` | Approved reporting dataset |
| `BIGQUERY_LOCATION` | Dataset/query location, currently documented as `asia-south1` |
| `GOOGLE_CLIENT_EMAIL` | Read-only dashboard service-account email |
| `GOOGLE_PRIVATE_KEY` | Server-only service-account private key |
| `BIGQUERY_MAX_BYTES_BILLED` | Per-query cost guardrail |
| `BIGQUERY_CACHE_TTL_SECONDS` | Server aggregate cache duration; default 300 |
| `ENABLE_GBV_SUPPRESSION` | Keep `true`; GBV connection is not enabled in this phase |

Credential rules:

- Set secrets through Vercel environment configuration, never committed files.
- Use a dedicated service account with read-only access to approved aggregate/reporting tables or views.
- Do not grant access to participant-level tables, survivor-level GBV records, personal identifiers,
  or unrestricted staging tables.
- Scope Preview and Production variables separately.
- Keep Preview on `DATA_MODE=mock` until table permissions and aggregate results are reviewed.

## Production Readiness Gates

Before any production deployment:

1. Approve target/status progress reporting view.
2. Approve evidence-validation reporting view.
3. Approve timeliness reporting view.
4. Approve canonical geography-code reporting view.
5. Approve suppressed GBV/OCMC aggregate summary view.
6. Verify the dashboard service account has read-only access only to approved reporting assets.
7. Test `DATA_MODE=bigquery` in a protected non-production environment.
8. Validate totals, filters, freshness, query cost limits, fallback behavior, and audit logging.
9. Re-run build, lint, privacy checks, route checks, and protected geography hashes.
10. Obtain explicit production approval.

## Hybrid Activity-Indicator Mapping Model

Indicator Progress is not a BigQuery-only product. The reviewed source model has three layers.

### A. BigQuery Activity Layer

Use BigQuery for:

- Executive Overview aggregate operational KPIs
- Activity Progress actual events and reach
- Participant Reach aggregates and approved disaggregation
- IP submission/activity performance
- Geographic Coverage metric overlays on the protected static ArcGIS map
- Data Quality counts
- Activity Detail through an approved aggregate-safe contract only

Primary sources:

- `combined_activity_summary`
- `indicator_progress_summary`
- `data_quality_summary`
- `ip_submission_status`

BigQuery does not currently provide approved target/status thresholds, normalized evidence
requirements, or authoritative CPD/SP/UNSDCF registry metadata.

### B. External Indicator Registry Layer

The 15 reviewed IP workbooks are the current authoritative candidate source for:

- IP activity and subactivity registries
- project/workplan indicator definitions
- annual and quarterly targets
- CPD milestone/indicator mappings
- SP/UNSDCF narrative or coded linkages where supplied
- activity-to-indicator relationships
- remarks and revision context

All 15 named workbooks were found. Most include direct activity-to-indicator linkage and annual/Q1-Q4
targets. NRCS and PeaceWin do not contain usable indicator-target registries. Evidence requirements,
reporting frequency, responsible team, and coded SP/UNSDCF fields are not consistently available.

### C. Bridge/Crosswalk Layer

A governed crosswalk is required before Indicator Progress or target/status visuals are connected.

Minimum fields:

| Field | Purpose |
|---|---|
| `ip_name` | Source IP name |
| `normalized_ip_name` | Canonical partner name |
| `activity_code` | Source activity/subactivity code |
| `activity_id` | Stable activity identifier when available |
| `normalized_activity_name` | Canonical activity name |
| `indicator_code` | Source/canonical indicator code |
| `indicator_name` | Indicator definition |
| `output` | Programme output |
| `outcome` | Programme outcome |
| `cpd_indicator` | CPD linkage |
| `sp_indicator` | Strategic Plan linkage |
| `unsdcf_indicator` | UNSDCF linkage |
| `reporting_year` | Target/reporting year |
| `reporting_quarter` | Quarter or annual marker |
| `target_value` | Approved target |
| `evidence_required` | Approved evidence requirement |
| `source_document` | Workbook and sheet provenance |
| `mapping_confidence` | Automated/reviewer confidence |
| `mapping_status` | Draft, reviewed, approved, rejected |

Recommended additional governance fields: source sheet/row, target unit, reporting frequency,
effective dates, reviewer, approval date, revision/version, direct/indirect contribution, and notes.

## Hybrid Route-to-Source Mapping

| Route | Operational source | Registry/reference source | Required bridge or safeguard |
|---|---|---|---|
| Executive Overview | BigQuery aggregates | External targets later | Existing mock fallback; approved overview view |
| Activity Progress | `combined_activity_summary` | IP activity/target registry | Activity-code crosswalk and completion definition |
| Participant Reach | BigQuery activity/participant aggregates | Indicator framework for attribution | Suppression and approved demographic grain |
| Indicator Progress | BigQuery actuals | External IP indicator registry | Approved activity-indicator-target crosswalk |
| IP Performance | BigQuery IP submission/activity summary | External IP targets | Canonical IP mapping and target attribution |
| Geographic Coverage | Protected ArcGIS map base + BigQuery geography metrics | Canonical geography registry | Geography-code crosswalk; do not alter map base |
| GBV/OCMC Summary | Approved suppressed aggregate source only | Approved service indicator registry | Server-side suppression; never ship small raw cells |
| Data Quality | `data_quality_summary` | Evidence requirement registry | Evidence completeness and quality-rule mapping |
| Management Decision Centre | BigQuery issues/actuals | Indicator, target, evidence registry | Governed calculations and auditable rules |
| Activity Detail | Approved aggregate-safe BigQuery detail | Activity registry | Field allowlist; exclude internal IDs and PII |

No new route should be connected until its source contract, crosswalk, privacy classification, and
approval owner are documented.

## External Workbook Review Summary

Found and reviewed read-only:

- Aasaman Nepal, ADRA, CMC, FPAN, GNI, JURI, KIDS, NRCS, PeaceWin, Plan International,
  SAATHI, SOSEC, SPN, TPO Nepal, and WOREC.
- `sosecprogramindicator.xlsx` was present instead of the anticipated `.xls`.
- Common hierarchy: project -> outcome -> output -> activity -> subactivity.
- Common fields: activity/fund codes, event type, project/workplan indicator, CPD milestone,
  annual target, and quarterly targets.
- Common normalization gaps: inconsistent or absent codes, narrative SP/UNSDCF mappings,
  non-standard remarks/revisions, missing evidence requirements, missing reporting frequency,
  and missing responsible-team assignments.

The dashboard repo itself contains no authoritative local database or 15-IP registry. Its current
activity and indicator datasets are synthetic prototypes and do not provide a governed crosswalk.

## Draft Registry Layer

COD-005 created a provisional dashboard-side registry under `src/data/registry/`:

- 15 IP records
- 575 activity records
- 217 indicator records
- 170 target records
- 878 activity-indicator crosswalk records
- 878 evidence-requirement placeholders

All registry envelopes are classified `dashboard_registry_non_personal` and remain
`pending_user_validation`. The files are not imported by any dashboard route.

NRCS and PeaceWin activity links are marked `incomplete_source` because their workbooks do not
contain usable indicator-target registries.
