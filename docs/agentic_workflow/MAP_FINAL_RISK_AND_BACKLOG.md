# MAP FINAL RISK AND BACKLOG

## Risks / Blockers
- **Live geographic data connection** is blocked until **E001** (refresh script admin approval) and **E002** (suppression tests/final QA) are cleared.
- **Protected map source files** (`nepal-map-base.ts`, `GeographicCoverageMap.tsx`, `geographic-map-metrics.ts`, etc.) must remain read‑only; any accidental edit would break the protected‑map guarantee.
- **GBV/OCMC data** is not included in the map view; attempting to add it would violate privacy and block the demo.
- **Khotang / Rawa Besi** specific granularity is unavailable in the mock dataset; the map shows placeholder aggregates.

## Backlog / Recommendations (Documentation/UI only)
- Add a **visual banner** on the Geographic Coverage page indicating the mock‑data status (e.g., "Demo mode – mock data only"). *Recommendation only – no source edit performed.*
- Update the **presenter script** to explicitly read the caveat banner before discussing any map details.
- Review UI label sizes for province/district names to ensure readability on low‑resolution demo screens.
- Track the implementation of a real GIS data pipeline as a future task after E001/E002 are resolved.

*All items are purely documentation/UI recommendations; no code changes have been made.*
