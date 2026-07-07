# QA Checklist – After Antigravity Build

This checklist should be run after Antigravity completes the implementation. It covers both build‑time and run‑time checks.

## Build & Lint
* `npm install`
* `npm run dev`
* `npm run lint`
* `npm run build`

## Functional Checks
* **All 10 routes load** – Verify that each route defined in `src/app/` renders without errors.
* **Sidebar navigation works** – Click each link and confirm navigation.
* **KPI cards render** – Ensure KPI cards display values and are not blank.
* **Charts render** – All Recharts components should display data.
* **GBV privacy banner appears** – On pages with GBV metrics, the banner must be visible.
* **GBV suppression logic works** – Counts of 1–4 should display `<5`.
* **Data freshness footer appears on every page** – Footer must be present.
* **No personal identifiers are displayed** – Inspect rendered HTML for names, phone numbers, or unique IDs.
* **No raw Stitch HTML is pasted into React pages** – Ensure no `<div>`s with raw HTML from Stitch.
* **Mock data is under `src/data/mock/`** – Verify mock files exist and are used.
* **KPI logic is in utility files, not hardcoded inside page files** – Check that KPI calculations are imported from `src/utils/`.

## Security & Privacy
* Verify that privacy utilities are imported where needed.
* Run a quick audit of console logs for any PII.

---
**Note:** This checklist is for documentation only. No code changes are made.
