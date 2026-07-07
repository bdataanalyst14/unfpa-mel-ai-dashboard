# AG-070/071 MCP Connector Hardening Review

Date: 2026-07-04

Final status: Accept with minor coverage caveat

## Scope Clarification

AG-070/071 was a targeted MCP/connector hardening review, not an exhaustive repository audit. The review focused on server-side BigQuery wiring, dashboard API route boundaries, scripts that could affect refresh/audit behavior, and documentation that governs BigQuery, privacy, security, deployment, and agentic workflow controls.

The targeted coverage is sufficient for manager acceptance of the MCP/connector hardening gate because no Google connector, MCP workflow, deployment workflow, live job, refresh workflow, credential workflow, or external automation was found to have been enabled by this task. The caveat is that this was not a full line-by-line review of every file in the repository.

## Files And Areas Reviewed

| Area | Reviewed | Notes |
|---|---:|---|
| `src/lib/server/bigquery-client.ts` | Yes | Checked BigQuery client creation, environment-variable name references, credential handling boundaries, and safe query wrapper behavior. |
| `src/lib/server/bigquery-dashboard-service.ts` | Yes | Checked BigQuery aggregate service path, mock fallback, small-cell suppression metadata, and in-memory cache behavior. |
| `src/lib/server/dashboard-page-data-service.ts` | Yes | Checked route-level BigQuery data service, GBV/OCMC live-data block, config status gate, and fallback behavior. |
| `src/app/api/dashboard/executive-overview/route.ts` | Yes | Checked API route delegates only to server data service and returns private no-store JSON. |
| `src/app/api/dashboard/page-data/route.ts` | Yes | Checked API route delegates only to server page-data service and returns private no-store JSON. |
| `scripts/*` | Yes, targeted | File inventory reviewed; `scripts/verify.js` inspected because it is the approved local verification runner. Map-generation scripts were inventoried only and not executed. |
| `scripts/audit/*` | Yes, targeted | Audit script names and search hits reviewed for BigQuery/audit relevance. No audit script was executed. |
| `docs/data_pipeline/*` | Yes, targeted | Reviewed/search-scanned for BigQuery, Vercel, deployment, refresh, credential, and live-validation governance evidence. |
| `docs/bigquery/*` | Yes, targeted | Reviewed/search-scanned for proposed query and privacy-safety evidence. No SQL was executed. |
| `docs/security/*` | Yes, targeted | Reviewed/search-scanned for secret/env safety and security/privacy narrative evidence. |
| `docs/privacy/*` | Yes, targeted | Reviewed/search-scanned for suppression acceptance, test cases, runner notes, and wiring handoff evidence. |
| `docs/agentic_workflow/*` | Yes, targeted | Reviewed/search-scanned for technical evidence, no-deployment/no-credential assertions, readiness status, and prior build/test evidence. |

Protected map files were not modified.

## Search Terms Used

The targeted scan used the following terms:

- `mcp`
- `connector`
- `google`
- `drive`
- `sheets`
- `gmail`
- `calendar`
- `bigquery`
- `vercel`
- `deploy`
- `refresh`
- `credential`
- `secret`
- `token`
- `service account`
- `automation`
- `agent`
- `live`
- `api`

Representative command pattern used:

```bash
rg -i --count "mcp|connector|google|drive|sheets|gmail|calendar|bigquery|vercel|deploy|refresh|credential|secret|token|service account|automation|agent|live|api" src/lib/server src/app/api/dashboard scripts docs/data_pipeline docs/bigquery docs/security docs/privacy docs/agentic_workflow
```

## Schedule Tool/Action Clarification

No runtime automation, deployment schedule, connector schedule, live job, external workflow, cron job, Vercel deployment schedule, BigQuery refresh schedule, or Google connector workflow was created or activated.

Any previous "schedule" reference should be understood as internal task tracking or planning language only. It was not a live system action.

## Hardening Confirmations

| Control | Status |
|---|---|
| Source code changed by AG-070/071 clarification task | No |
| Protected map files changed | No |
| `.env` files read or edited | No |
| Credentials, secrets, tokens, or service account files read or edited | No |
| Live BigQuery call executed | No |
| Refresh script executed | No |
| Vercel deployment command executed | No |
| Google connector enabled | No |
| MCP connector workflow activated | No |
| Google Drive, Sheets, Gmail, or Calendar workflow activated | No |
| External API or LLM API called | No |

## Command Evidence

Current local command results from this clarification pass:

| Command | Result | Evidence |
|---|---|---|
| `npm run test:verify` | Passed | `Verification passed. Checks passed: 19. Scope: local suppression utilities and service wiring only. No BigQuery calls, live routes, refresh scripts, credentials, or .env reads.` |
| `npm run lint` | Not reproduced in this checkout | Failed before lint because `next` was not resolved from local `node_modules`. Historical accepted status says lint passed. |
| `npm run build` | Not reproduced in this checkout | Failed before build because `next` was not resolved from local `node_modules`. Historical accepted status says build passed. |

Prior accepted evidence in the repository and task brief records:

- `npm run build`: passed previously.
- `npm run test:verify`: passed.
- `npm run lint`: passed.

Because the current failure mode is missing local Next.js dependency resolution rather than a source-code or hardening failure, it does not change the AG-070/071 hardening conclusion. It should be tracked as an environment/dependency readiness caveat for staging preparation.

## Conclusion

AG-070/071 is accepted with a minor coverage caveat. The review was targeted, not exhaustive, and it found no evidence that this task enabled a Google connector, MCP connector workflow, deployment, refresh, live BigQuery call, credential action, or external automation.
