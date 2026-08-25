# Production URL Validation Record

## Overview
This document records the technical validation of the proposed Production application base URL for the UNFPA MEL AI Dashboard.

## Validated URL
**Production application base URL**: https://unfpa-mel-ai-dashboard.vercel.app

## Technical Details
- **Date verified**: August 24, 2026
- **Vercel project**: unfpa-mel-ai-dashboard
- **HTTPS**: Verified (200 OK)
- **Production environment**: Yes

## Rationale
**Reason for choosing stable project alias**: 
The stable project alias format ([project-name].vercel.app) is preferred because it remains constant across future Production deployments. It maps predictably to the main environment without requiring manual DNS changes or referencing transient deployment states.

## Rejected URL Types
- **Immutable deployment URLs** (e.g., https://unfpa-mel-ai-dashboard-<random>-bdataanalyst14s-projects.vercel.app): Rejected because they are deployment-specific and change between releases.
- **Preview URLs**: Rejected because they do not reflect the main Production branch.

## Custom Domain Status
- **Custom organization domain**: NONE / pending future governance approval. 
The Vercel stable project alias is technically acceptable as the initial operational Production URL until a custom organizational domain is approved separately.

## Future Implications (Not yet configured)
Once formally approved, the Production URL will be used for:
- **Production OAuth callback pattern**: https://unfpa-mel-ai-dashboard.vercel.app/api/auth/callback/google
- **NEXTAUTH_URL**: https://unfpa-mel-ai-dashboard.vercel.app

*Note: No secrets, credentials, or actual OAuth clients have been configured during this URL validation gate.*

## Production URL Approval

Status: APPROVED

Approved production URL:
https://unfpa-mel-ai-dashboard.vercel.app

Approved OAuth callback:
https://unfpa-mel-ai-dashboard.vercel.app/api/auth/callback/google

Approval authority:
Designated dashboard technical/project owner

Approval date:
25 August 2026

Approval scope:
Production application URL only.

Remaining production gates:
Production user allowlist, Production Google OAuth, Production WIF,
Production BigQuery live access, DATA_MODE activation, and final Production
deployment.
