# BQ_CONTENT_002 Build Hang Diagnosis

Date: 2026-07-01

## Diagnosis

The local build hang was caused by filesystem permissions on stale generated `.next` output, not by BigQuery calls during static generation.

Observed sequence:

- `npm run build` stayed silent after the Next.js banner and did not update `.next`.
- Attempting to remove `.next` without elevated filesystem access produced access-denied errors across `.next/cache`, `.next/server`, and manifest files.
- After elevated removal of `.next`, the next non-elevated build failed immediately with `EPERM: operation not permitted, mkdir '.next'`.
- Running `npm run build` with elevated filesystem access completed successfully.

## Build Stage

The hang occurred before the reported compile/page-generation stages because Next.js could not refresh generated output cleanly.

## Root Cause

Local sandbox filesystem permission issue on `.next`, not route static generation, BigQuery network access, or Preview protection.
