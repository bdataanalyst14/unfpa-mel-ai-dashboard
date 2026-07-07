# Server/API Suppression Patch Plan

## Objective

Apply minimal server/API-side small-cell suppression before live BigQuery dashboard payloads are returned to the browser.

## Scope Applied In COD-SPRINT-SUPPRESSION-002

The patch is limited to the existing Executive Overview BigQuery service:

- `src/lib/server/suppression.ts`
- `src/lib/server/suppression.test.ts`
- `src/lib/server/bigquery-dashboard-service.ts`

No dashboard route/page file was changed. GBV/OCMC remains disconnected from live data.

## Implementation Pattern

The service imports `suppressCount` and `suppressPercentage` from the server-only suppression utility. Raw aggregate values are transformed after the BigQuery aggregate query returns and before the response object is cached or returned.

For count fields:

- `0` remains visible.
- Non-zero counts below `5` are suppressed.
- Counts `5+` remain visible.
- Invalid values are represented safely.

For compatibility, existing numeric response fields remain numeric. When a count is suppressed, the numeric compatibility value is `0`, and the presentation-safe value is available in `metadata.suppression.fields[fieldName].displayValue`.

For derived percentages, the service adds safe metadata under `metadata.suppression.percentages`. A percentage is suppressed if its numerator or denominator is unsafe.

## Protected Payload Fields

The Executive Overview BigQuery payload now applies count suppression metadata to:

- `totalEvents`
- `reportableParticipants`
- `femaleParticipants`
- `maleParticipants`
- `otherParticipants`
- `beneficiaries`
- `guests`
- `nonReportableParticipants`
- `districtsCovered`
- `ipsReporting`
- `indicatorsOnTrack`
- `indicatorsWatch`
- `indicatorsOffTrack`
- `missingEvidence`
- `pendingValidation`
- `approvedSubmissions`
- `lateSubmissions`

Derived percentage metadata is produced for:

- `femaleParticipantShare`
- `maleParticipantShare`
- `otherParticipantShare`

## Remaining Limits

- `dataQualityScore` remains unsuppressed because the service currently receives only the final aggregate score, not the numerator/denominator components needed for denominator safety checks.
- This patch does not create or modify BigQuery views.
- This patch does not connect any additional route.
- This patch does not make DP004 ready; freshness remains stale and final API/browser QA is still required.

