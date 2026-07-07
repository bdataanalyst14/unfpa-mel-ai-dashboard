# Privacy & Governance Reference

The following rules must be enforced throughout the dashboard implementation. These rules are non‑negotiable and must be reflected in data handling, UI rendering, and any automated processes.

## Personal Data Restrictions
* **No participant names** – All names must be omitted.
* **No phone numbers** – Phone numbers are considered PII and must not be displayed or stored in the UI.
* **No personal identifiers** – Any unique identifiers that could be used to re‑identify an individual are prohibited.
* **No individual GBV survivor records** – GBV data must be aggregated; no single survivor record may be shown.

## GBV Data Handling
* **Aggregated GBV data only** – Show only totals or aggregated metrics.
* **Suppress GBV counts from 1–4** – If the count of GBV incidents is between 1 and 4, display a placeholder such as "<5" to protect privacy.
* **Separate programme participants from GBV survivor/service‑user data** – Keep these data sets distinct in both storage and presentation.

## UI & Footer Requirements
* **Footer caveat on every page** – Include a disclaimer that the data is aggregated and may be subject to privacy restrictions.
* **GBV privacy banner requirement** – A banner must appear on pages that contain GBV metrics, reminding users of the privacy safeguards.
* **Data quality caveat** – For any KPI that is pending validation or has missing evidence, display a note indicating the data quality status.

## Implementation Notes
* All privacy logic should live in a dedicated utility module (e.g., `src/utils/privacy.ts`).
* UI components that render sensitive data must consume the privacy utilities to decide whether to show, mask, or suppress values.
* Unit tests should verify that suppressed values are never rendered.
