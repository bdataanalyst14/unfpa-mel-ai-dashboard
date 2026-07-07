# GEOGRAPHIC COVERAGE FINAL MAP QA

## Overview
This QA verifies that the **Geographic Coverage** map displayed in the UNFPA MEL dashboard is safe for SMT demonstration and adheres to all required caveats.

## Checks Performed
1. **Protected files integrity** – SHA‑256 hashes from `protected_hashes_before.txt` and `protected_hashes_after.txt` are identical for all listed files, confirming no edits.
2. **Data source** – The map loads data from the mock file `src/data/mock/geographic-map-metrics.ts`. No live GIS or ArcGIS connections are invoked.
3. **GBV/OCMC** – No GBV or OCMC layers are present in the map view.
4. **Label readability** – Province and district labels render clearly at standard demo zoom levels.
5. **Caveat banner** – The presenter script displays the required caveat banner (see `SMT_MAP_CAVEAT_FINAL.md`).
6. **Khotang / Rawa Besi** – No specific data for these districts is present in the mock dataset; the map shows them with placeholder aggregates, which is acceptable for the demo.

## Findings
- All protected files remain unchanged (hashes match).
- The map operates in **mock/prototype mode** as intended.
- No live data claims are made.
- No privacy‑sensitive or raw cell‑level data is exposed.

## Conclusion
The Geographic Coverage map meets the QA criteria for an SMT demo with caveats.
