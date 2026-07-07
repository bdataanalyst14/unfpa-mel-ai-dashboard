# Testing Checklist

## BigQuery Executive Overview POC

- [x] Pipeline repository reviewed without modifying ingestion logic.
- [x] `.env.example` contains placeholders only.
- [x] `DATA_MODE` defaults to `mock`.
- [x] BigQuery client is imported only by server modules.
- [x] API accepts year, quarter, project, province, district, and IP filters.
- [x] SQL uses parameters for filter values.
- [x] Raw participant/staging tables are not queried.
- [x] BigQuery failures return mock fallback without exposing SQL or credentials.
- [x] Mock fallback is visible and clearly labelled.
- [x] Target/status charts and AI insights are visibly labelled as mock/prototype data.
- [x] `npm install --legacy-peer-deps` (local verification copy; Google Drive install timed out)
- [x] `npm run build`
- [x] `npm run lint`
- [x] Local dev route check: `/dashboard/executive-overview`
- [x] Local dev route check: `/dashboard/geographic-coverage`
- [x] Local dev route check: `/dashboard/management-decision-centre`
- [x] Local dev route check: `/dashboard/gbv-ocmc-summary`
- [x] Local dev route check: `/dashboard/activity-detail`
- [ ] Live BigQuery credentials and reporting-table permissions verified securely.
- [x] Preview deployment target verified as `preview` and status `Ready`.
- [ ] Production deployment approved.

Visual/privacy regression checks:

- [x] ArcGIS/Nepal geography route and map content render in HTTP smoke test.
- [x] Management decision content renders.
- [x] `ActivityDetailTable` route content renders.
- [x] GBV privacy banner renders.
- [x] GBV small-cell suppression implementation remains active and unchanged.
- [x] Footer privacy caveat renders.
- [x] No personal or survivor-level fields appear in API output.

Limitations:

- Pixel-level visual inspection was not available; checks used compiled output and local rendered HTTP content.
- Live BigQuery mode was not exercised because real credentials were intentionally not provided.
- The credential-free BigQuery path was exercised and returned a safe `Mock fallback`.
- `.env.local` is absent; live credential verification remains pending.
- Protected geography hash comparison returned `fc` exit code 0.
- Preview URL: `https://unfpa-mel-ai-dashboard-cod001-n1ebgprly.vercel.app`.
- Preview routes return HTTP 401 without Vercel authorization because deployment protection is enabled.
- An unexpected production-target deployment was removed immediately; only the preview is retained.

## COD-003 Stabilization Recheck

- [x] Protected hash comparison: `fc` exit code 0.
- [x] `vercel ls`: only one deployment listed, environment `Preview`, status `Ready`.
- [x] `vercel inspect`: target `preview`, status `Ready`.
- [x] No deployment command run during COD-003.
- [x] `npm run build`: passed.
- [x] `npm run lint`: passed.
- [x] Executive Overview API: HTTP 200, mock source, aggregate response.
- [x] Executive Overview page: HTTP 200, visible mock/prototype label.
- [x] Geographic Coverage: HTTP 200, Programme Coverage Map present.
- [x] Management Decision Centre: HTTP 200.
- [x] GBV/OCMC: HTTP 200, privacy banner present.
- [x] Activity Detail: HTTP 200.
- [x] No local runtime error markers.
- [x] Server-only BigQuery import boundary confirmed.
- [x] `.env.local` absent and no private-key material found.
- [ ] Live BigQuery credentials and approved table permissions verified.
- [ ] Production approval and production deployment.

## COD-004B Documentation and Guardrail QA

- [x] Dashboard local registry/database audit completed.
- [x] No authoritative local 15-IP registry/crosswalk found.
- [x] All 15 external IP workbooks found and reviewed read-only.
- [x] BigQuery aggregate activity/reporting tables reviewed.
- [x] Hybrid source model documented.
- [x] Route-to-source mapping documented.
- [x] Reporting-view requirements documented for all dashboard routes.
- [x] Raw participant and staging tables classified as restricted.
- [x] No frontend route connected.
- [x] No source code changed.
- [x] No deployment run.
- [x] No `.env.local` or credentials committed.
- [x] Protected geography hashes unchanged.
- [ ] Normalize and approve the external activity/indicator registry.
- [ ] Resolve NRCS and PeaceWin indicator/target gaps.
- [ ] Define normalized evidence requirements and reporting frequency.
- [ ] Replace client-side GBV exact small-cell mock values before any production GBV connection.

## COD-005 Registry Validation

- [x] All 15 source workbooks processed read-only.
- [x] Required six JSON registry files created.
- [x] Data dictionary and normalization report created.
- [x] Registry envelopes include source, classification, validation status, and provenance.
- [x] Record counts equal JSON array lengths.
- [x] NRCS and PeaceWin links marked `incomplete_source`.
- [x] Evidence gaps marked `unknown` and `requires_me_review`.
- [x] Registry contains no participant or survivor records.
- [x] Registry is not imported by frontend routes.
- [ ] M&E validates official IP/activity/indicator codes and aliases.
- [ ] M&E resolves inferred, unmatched, duplicate, and conflicting mappings.
- [ ] M&E approves target values, units, cadence, and cumulative interpretation.
- [ ] M&E defines evidence requirements and ownership.
- [ ] Registry/crosswalk version approved for reporting use.
## GEM-007 Final Geography Map QA

- [x] ArcGIS `local_unit` shapefile used as boundary source.
- [x] Static Nepal SVG map base (856 KB) correctly generated and integrated.
- [x] `nepal-map-base.ts`, `GeographicCoverageMap.tsx`, `geographic-map-metrics.ts` present in `src`.
- [x] Old map placeholder terms ("Palika Centroids", "Stable coverage", etc.) removed from active code.
- [x] Khotang correction verified: Rawa Besi included, Lamidanda excluded, 10 current local levels.
- [x] Visual QA: Full Nepal boundary visible and properly scaled (fills card).
- [x] Visual QA: Programme bubbles align accurately with geography.
- [x] Visual QA: Default view is Activity Density by District.
- [x] Visual QA: Selectors (Activity/Reach/GBV and District/Province) functional.
- [x] Visual QA: Aggregated privacy view and data freshness footer visible.
- [x] `npm run build`: Pass.
- [x] `npm run lint`: Pass.
- [x] Responsive check: Map remains readable at desktop/tablet widths.
- [ ] Vercel preview deployment completed (awaiting authorization).
- [ ] Production deployment approved.
## FINAL-QA-001 Preview QA Checklist
- [x] Preview URL reviewed.
- [x] Geography map visual QA (Local): Pass.
- [x] Dashboard integration: Pass.
- [x] Privacy safeguards: Pass.
- [x] Responsive classes present: Pass.
## GEM-008 Final Preview QA Checklist
- [x] Vercel deployment inspected: Ready.
- [x] Geography map visual result: Pass.
- [x] Bubble alignment and scaling: Pass.
- [x] Privacy safeguards verified: Pass.
