# BQ_CONTENT_001 Activity Label Patch Note

Date: 2026-07-01

## Label Change

Changed Activity Detail subtitle from:

`Sample activity log for SMT prototype demonstration; synthetic ACT-2025 rows are not official registry activities.`

To BigQuery-row state:

`Activity log from BigQuery-backed preview data. Pending final activity registry and programme validation.`

Fallback state remains explicit:

`Activity log is using local fallback rows because BigQuery activity rows are not available in this browser session.`

## Activity Progress Caveat

Changed Activity Progress subtitle to:

`Activity progress uses BigQuery-backed preview aggregates. Row-level exception lists are pending approved activity registry mapping and programme validation.`

Synthetic `ACT-2025-*` row-level examples were removed from the visible delayed/evidence tables and replaced with pending approved-view messages.

## Scope

This is a label/caveat correction only. It does not claim final activity registry validation, production readiness, DP-004 clearance, or GBV/OCMC live activation.
