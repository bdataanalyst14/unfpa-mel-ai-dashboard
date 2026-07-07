# GBV Production Suppression Note

- Exact small‑cell counts must never be sent to the browser in production.
- Suppression must happen **server‑side** (e.g., in a BigQuery aggregate view) before the data reaches the front‑end.
- The front‑end should receive only `display_count` (rounded or bucketed) for cells that are below the disclosure threshold.
- Raw counts may be stored in a restricted backend layer for authorized analysts only.
- The GBV/OCMC route must remain disconnected from real data until the approved suppression view is in place.
