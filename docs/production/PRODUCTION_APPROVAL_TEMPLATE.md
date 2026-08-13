# UNFPA Nepal MEL Dashboard - Production Approval Template

This approval template is required to govern changes to the production and UAT environments of the dashboard. Separate approvals must be granted for each phase. Do not pre-approve any section.

---

## 1. BigQuery Live Preflight Approval

Approval to run the live read-only BigQuery schema and count preflight check (`npm run production:bigquery-preflight`).

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`

---

## 2. Dashboard BigQuery Activation Approval

Approval to run the dashboard BigQuery activation script (`npm run production:activate-bigquery`) and switch from mock fallback to live BigQuery connection.

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`

---

## 3. Ubuntu Restricted-UAT Deployment Approval

Approval to deploy release packages and restart services within the Ubuntu restricted-UAT environment.

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`

---

## 4. Production Domain / TLS Configuration Approval

Approval to configure public domain names, public IP exposures, Nginx virtual hosts, or TLS certificates.

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`

---

## 5. SSO / Access Control Integration Approval

Approval to integrate Single Sign-On (SSO), active directory authentication, or user access management layers.

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`

---

## 6. Public Production Release Approval

Final authorization to release the UNFPA MEL Dashboard to the general production environment.

- **Authorized By**: __________________________
- **Role/Designation**: ________________________
- **Approval Signature Date**: ____ / ____ / ________
- **Reference ID / Note**: ______________________
- **Approval Status**: `[ ] PENDING` | `[ ] APPROVED` | `[ ] REJECTED`
