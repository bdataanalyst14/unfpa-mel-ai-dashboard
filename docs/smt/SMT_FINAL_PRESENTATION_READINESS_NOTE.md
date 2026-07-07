# SMT_FINAL_PRESENTATION_READINESS_NOTE

## What is Ready to Demonstrate
- **Executive Overview Dashboard** (live aggregate POC) – shows anonymised counts with suppression (caveat applied).
- **Geographic Coverage Map** – mock data displayed safely; map files unchanged and verified.
- **SMT Demo Environment** – Vercel preview URL configured; no production deployment.

## What is Prototype / Mock
- **Future Data Refresh Pipeline** – placeholder UI showing expected refreshed metrics (still stale).
- **Advanced Filtering Controls** – UI components built but not wired to live data.

## What is Live Aggregate POC with Caveats
- Dashboard aggregates are live but rely on **suppression logic** (pending final QA).
- Counts greater than 4 are masked; percentages are bucketed.

## What is Blocked
- **DP‑004 routes** – blocked pending freshness (E001) and suppression (E002) validation.
- **GBV / OCMC** – live activation blocked pending privacy sign‑off.
- **M&E Registry dependent routes** – blocked pending registry owner approval.

## Decisions Needed from SMT
1. Approve a Data Engineer to run a safe, non‑destructive refresh script (or provide one).
2. Sign‑off on suppression wiring after Codex QA.
3. Assign an owner for the M&E registry approval.
4. Confirm no production deployment before final QA.
5. Confirm continued mock status for GBV/OCMC.

## Next Steps After SMT
- Once decisions are approved, Codex will finalize suppression wiring and run the refresh script.
- Updated evidence will be logged and DP‑004 routes will be re‑evaluated.
- Final QA sign‑off will allow the demo to move from caveat‑ready to fully live.
