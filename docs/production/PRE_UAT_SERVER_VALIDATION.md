# Server-only pre-UAT validation procedure

Status: PREPARED; live execution NOT RUN. The current shell presence-only check found live mode not requested and required WIF fields incomplete. This does not establish the configuration of any remote environment. Do not retrieve, copy, source or modify credentials or enable live mode to make this procedure run.

## Locked model and allowed sources

RepeatData consists of individual/name-list records. Act_Summary contains separate aggregate participant counts. Combined_Summary is Act_Summary plus reportable RepeatData only. Never join or deduplicate these populations, never count aggregate rows as participants, and never add a raw RepeatData count to the already combined total. The dashboard reads the existing combined_activity_summary contract; it must not reconstruct that contract. The three source-specific metrics stay disabled until the warehouse owner certifies their approved aggregate mappings.

Only combined_activity_summary, indicator_progress_summary, data_quality_summary and ip_submission_status may be addressed. No participants_flat, staging, raw RepeatData/Act_Summary, GBV/survivor data, INFORMATION_SCHEMA expansion, wildcard tables or view-definition dumping. No writes or IAM tests that attempt writes. Read-only IAM must be attested by the existing environment owner; successful SELECT execution alone cannot prove absence of write grants.

## Prerequisites ? fail closed

1. Existing approved environment already runs BigQuery mode with matching runtime/readiness-manifest configuration and active request-scoped Vercel WIF. This continuation must not activate it, deploy new code, create a route, mint/export credentials, run auth login, or change an environment variable.
2. An authenticated exact-email ADMIN session is present in that existing server request context. Anonymous and ordinary AUTHORIZED_USER sessions must return BLOCKED_AUTHORIZATION without a query.
3. Current generation/view freshness and expiry have been approved separately by the data owner. Historical expiry risk around 12 September 2026 is not a current attestation. Record only an opaque approval reference in restricted evidence.
4. Existing BIGQUERY_MAX_BYTES_BILLED is a positive integer no greater than 100,000,000. The validator refuses missing or larger limits; do not set a new value just to pass. At most eight sequential query jobs are submitted, each bounded by the existing cap; no retries.
5. Debug/HTTP/SQL tracing and application request dumps are off. Do not use the older CLI preflights as a redacted substitute: their diagnostics can include identifiers. Do not run env dumps, token commands, database CLI output, or serialize SDK objects.

If any prerequisite is absent, record BLOCKED and stop. Elapsed time is not approval.

## Implementation and controlled invocation

`src/lib/server/pre-uat-validation.ts` exports `validatePreUatReadAccess()`. It imports server-only and uses the existing authorization, manifest/configuration and request-scoped WIF client. It is intentionally not wired into a public API, a client component, a build hook or a deployment. No live invocation surface was added.

In an already approved server maintenance/request context that can import this module, an authorized operator may invoke `await validatePreUatReadAccess()` once and retain only its returned status object. If that context/code is not already available, implementation review/integration is a separate blocker; do not deploy or inject a handler under this instruction. Do not call it from a browser console, client bundle or ordinary local Node shell. The runnable local command `npm run test:pre-uat-validation` exercises only injected offline clients and cannot validate live WIF.

The module first checks ADMIN authorization, existing BigQuery/WIF/readiness configuration, and cost cap. It then runs two fixed SELECTs for each approved view:

- A zero-row projection that checks required column references and numeric/string expression compatibility, with WHERE FALSE LIMIT 0. It returns no records or totals.
- An EXISTS probe returning only an internal boolean. It proves the configured principal can execute a read of a nonempty approved view, not that totals are correct.

No join, deduplication, participant listing, GBV access, INSERT/UPDATE/DDL, raw query input, or parameter values supplied by a caller are supported. Both calls use the existing validated server query path and configured location. Total schema compatibility includes total_participants separately from total_reportable_participants. Filter columns are reporting_year1, report_quarter1, project1, ip_name, province1; geographic references are district1 and palika1. The quality/indicator views do not require an undocumented IP column.

## Safe evidence contract

The function does not print anything. It returns exactly code, completedViews (0?4, a count of successful view checks), lineageVerified:false and uatApproved:false. Only those fields may be retained. Never log exceptions, SQL, SDK responses, parameters, environment values, project/dataset/account identifiers, tokens, request headers, participant/GBV data or aggregate totals. All exceptions become FAILED_READ_OR_SCHEMA with no error message/stack. SDK/cloud audit telemetry remains governed by the host platform; do not enable extra logging.

| Code | Meaning and next action |
|---|---|
| BLOCKED_AUTHORIZATION | No authorized ADMIN context; no reads |
| BLOCKED_CONFIGURATION | No already-approved live WIF configuration/manifest; no reads |
| BLOCKED_COST_LIMIT | Existing query limit fails policy; no reads |
| BLOCKED_EMPTY_VIEW | Read completed but an approved view was empty; stop and consult owner without attaching data |
| FAILED_READ_OR_SCHEMA | Authorization/config/schema/read failed; stop, no raw diagnostic output |
| PASSED_READ_AND_SCHEMA | All four views accepted the schema probes and nonempty reads; NOT lineage, expiry, IAM least privilege or UAT approval |

Offline tests cover all gates, each of eight failure positions, empty data, no reads before authorization, exact four-view sources and hostile exception redaction. No credential, project identifier or participant content is included in test result output.

## Independent warehouse sign-off still required

The warehouse owner must certify, through the existing restricted process, the locked model (addition, not join/deduplication), report-eligibility rule, source-mode mapping, generation and all five requested formulas. Do not inspect raw data or expand the dashboard's query boundary to obtain this evidence. Compare approved aggregate baselines privately during UAT; this validator deliberately emits no counts. A passing probe does not turn either source-specific deferred metric or live GBV on.
