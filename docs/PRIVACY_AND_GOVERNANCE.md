# Data Privacy & Governance Protocols

This document details the safeguards built into the MEL Intelligence Dashboard for handling sensitive information.

## Privacy Rules Summary

All privacy policies are encoded in [privacy-rules.ts](file:///h:/My%20Drive/unfpa-mel-ai-dashboard/src/lib/privacy-rules.ts).

### 1. Small Cell Suppression
For Gender-Based Violence (GBV) service records, absolute counts between **1 and 4** represent high risk for re-identification in low-caseload districts.
- **Protocol**: Any cell value $x \in [1, 4]$ is automatically replaced with the string `< 5` in charts, tooltips, and tables.
- **Cascading Checks**: Sum totals must be recalculated using original values but formatted to protect small cells.

### 2. Suppression of Personal Identifiers (PII)
- **Rule**: Personal attributes like Names, Phone Numbers, Email Addresses, and home locations at the household level are **strictly excluded** from data ingestion.
- **Activity Log Filter**: The [activity-detail](file:///h:/My%20Drive/unfpa-mel-ai-dashboard/src/app/dashboard/activity-detail/page.tsx) route displays aggregated event statistics and excludes columns for personal attendee identities.

### 3. Role-Based Access Controls (RBAC)
- **Viewer**: General status tracking, summary statistics. Cannot view OCMC service data or raw export files.
- **Manager**: Fully operational metrics, OCMC summary access, audit trail logs, exports.
- **Admin**: Full database management, setting baseline targets, user provisioning, validation approvals.
