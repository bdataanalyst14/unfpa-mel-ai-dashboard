# PR #11 — protected staging UAT checklist

Date: 29 October 2026. Status: **NOT RUN / BLOCKED**. [Decision package](PR11_PRODUCTION_GO_NO_GO_PACKAGE.md) · [Configuration matrix](PR11_CONFIGURATION_AND_READINESS_MATRIX.md).

This is an instruction for Antigravity AFTER separate authorizations, not authorization conferred by publishing the checklist. No Production deploy, merge, promotion, environment mutation, new query, source change or mock activation is performed in this documentation task.

## A. Prerequisites: stop before deployment if any item is missing

- [ ] Project owner AND data-governance/privacy owner explicitly approve restricted operational publication, withheld participant utility, operational/structural/historical risks, all six backend views, audience/exports and incident/retention policy.
- [ ] Separate Preview-deployment approval identifies the exact full published PR head, project/team, Preview origin, expiry, accountable operator and protection requirements. A documentation/implementation approval is not deployment authorization.
- [ ] Separate data-read authorization covers the approved views/fields, tested scopes, API/CSV requests, total query-job/bytes budget, per-query cap, time window and no-retry/stop rule. Ordinary page visits can execute queries; do not browse first and seek authorization later.
- [ ] Infrastructure owner attests complete effective Preview configuration for THIS branch, approved values privately, explicit cost cap, WIF trust and least-privilege view access. Old-branch-only OAuth keys do not qualify. No Production credentials/variables are copied or changed.
- [ ] Platform protection is already enabled for the intended Preview before deployment; its bypass/share access is restricted and approved. Google application RBAC remains independently required. Do not create public share links or expose bypass tokens.
- [ ] Approved Preview origin/routing and Google callback registration are reserved and consistent with NEXTAUTH_URL. If that setup or a stable test origin is absent, stop for separate infrastructure authorization; do not create an alias, change DNS or promote a deployment under this checklist.
- [ ] Owner-supplied current aggregate baselines, source lineage/freshness and expected role cases are available privately. Define allowed operational export fields and evidence-retention deadline. Do not print person rows/totals to obtain a baseline.
- [ ] A certified privacy-safe rollback target OR an approved access-denied/unavailable contingency exists. No old revision or mock fallback is presumed safe.

## B. Exact Antigravity deployment instruction — do not execute while blocked

After all A items are signed for one exact SHA, use a NEW clean clone on the PR branch. Do not upload the existing dirty workspace, local environment files or recovery evidence. In PowerShell, replace the two placeholders using the restricted approval record:

    $ApprovedHead = '<40-character full PR head explicitly approved in writing>'
    $UatPath = '<new unused absolute directory for this isolated UAT clone>'
    if ($ApprovedHead -notmatch '^[0-9a-f]{40}$') { throw 'STOP: invalid approved SHA' }
    if (Test-Path -LiteralPath $UatPath) { throw 'STOP: clone path must not exist' }
    $RemoteHead = gh pr view 11 --repo bdataanalyst14/unfpa-mel-ai-dashboard --json headRefOid --jq .headRefOid
    if ($LASTEXITCODE -ne 0 -or $RemoteHead.Trim() -ne $ApprovedHead) { throw 'STOP: PR approval/head mismatch' }
    git clone --single-branch --branch release/ui-ux-acceptance-2026-10-28 https://github.com/bdataanalyst14/unfpa-mel-ai-dashboard.git $UatPath
    if ($LASTEXITCODE -ne 0) { throw 'STOP: clone failed' }
    $CloneHead = git -C $UatPath rev-parse HEAD
    $CloneStatus = git -C $UatPath status --porcelain
    if ($LASTEXITCODE -ne 0 -or $CloneHead.Trim() -ne $ApprovedHead -or $CloneStatus) { throw 'STOP: clone not exact/clean' }
    vercel deploy --cwd $UatPath --project unfpa-mel-ai-dashboard --scope bdataanalyst14s-projects --target preview --meta githubCommitSha=$ApprovedHead --yes
    if ($LASTEXITCODE -ne 0) { throw 'STOP: Preview deployment failed' }

Installed CLI help (54.7.1) confirms --project, --scope, --target and --meta. Confirm the operator's installed help and approved team/project before use. The branch remains named release/ui-ux-acceptance-2026-10-28 in the clean clone so its Preview overrides can apply; do not deploy a detached checkout under an assumed old-branch environment. Metadata is a traceability aid, not cryptographic proof of uploaded source. Independently record clean clone SHA, provider Git metadata, deployment/build ID, target and configuration-hash match.

The automatic Git deployment guard remains false for this branch; manual Preview deployment is a separate approval. Use a remote build with the target's pre-existing approved configuration. Do not use --prod, a Production target, --prebuilt from local mock/NONE output, --public, promotion/rollback commands, source/bypass tokens on command lines, --env/--build-env overrides or automatic retries. Never remove the guard to obtain a preview.

Record the returned URL only in the restricted UAT register until its protection and correct origin are confirmed. Do not browse data pages until both platform and application access checks below are authorized. No Production domain may point at the Preview. Preview UAT cannot certify a subsequent Production rebuild.

## C. Execute sequentially within the authorized budget

Each row starts NOT RUN. Record tester role, UTC time, exact SHA/deployment, PASS/FAIL/BLOCKED, sanitized outcome and private evidence reference. Stop on unexpected disclosure, auth bypass, source/config mismatch or budget exhaustion. Never weaken controls to pass a test.

| ID | Test and exact pass criteria | Safe evidence |
|---|---|---|
| U1 | Verify project/team, Preview target, exact approved clone/Git revision, build ID and existing platform protection. Anonymous external clients cannot reach data surfaces. After authorized platform access, application authentication still applies. | IDs/status only; no cookies, headers or bypass material |
| U2 | Confirm build/postbuild bundled six-view WIF manifest and runtime configuration match. Non-sensitive mode/target/validation outcomes only. A static /api/health 200 is liveness, not live readiness. | Configuration hash and attestation reference; no token/STS/SDK dump |
| U3 | Behind platform protection, unauthenticated dashboard access redirects to the local /auth/signin route (Next redirect is normally 307; follow the actual guarded path, not a hardcoded Google 302). Unauthenticated page-data/participant/export APIs return 401 and no dataset. Verified Google account outside BOTH lists is denied; session authorization failure returns 403 for APIs and page access redirects to /auth/unauthorized. | Status/route/role and sanitized screenshot; redact names/emails |
| U4 | Test a verified AUTHORIZED_USER and a separately configured ADMIN, plus logout/expiry and unverified/malformed-session cases through sanctioned tests. Role comes only from exact normalized lists, ADMIN precedence if both. Ordinary user cannot run the ADMIN pre-UAT validator; no particular staff account is presumed admin. | Role/outcome, no JWT/session export |
| U5 | If an approved existing server-request maintenance context is available, invoke validatePreUatReadAccess once: expect PASSED_READ_AND_SCHEMA, completedViews=6, lineageVerified=false, uatApproved=false. At most 12 sequential SELECTs, explicit positive cap <=1,000,000,000 and lower approved overall budget. If no invocation context exists, record BLOCKED; do not add a route, inject code or use a browser/local-node console. | Only those four returned fields; no raw logs/schema/SQL |
| U6 | Reconcile reported activities against SUM(event_count) from combined_activity_summary for the same approved scope. Native aggregate row count COUNT(*) is a different quantity; never substitute it. Do not require historical 4,663. Compare distinct nonempty partner/district/province/project metrics to their matching operational basis; IP submission headlines use ip_submission_status and differ from combined-summary matrices. | PASS/difference status; numeric baselines remain private where required |
| U7 | Exercise year, quarter, project, partner, province, district and municipality one at a time and in approved intersections on combined-summary routes. Preserve hierarchy/search/sort/page scope and reject duplicate/invalid inputs without an unfiltered substitute. IP submission route supports partner only; DQ is system-wide; Indicator/GBV stay disabled. No claim that every filter applies everywhere. | Scenario IDs and outcomes; no query parameters containing sensitive labels |
| U8 | Verify uniform Suppressed/null person outputs in page-data, participant endpoints, tooltips, accessible DOM, hidden chart payloads, margins, related checks and percentages. No magnitude-dependent bounds/order/geometry. Person sorting cannot recover relative magnitudes; zero/small/large/missing cases are covered by prior synthetic tests, not by modifying live data. Operational exceptions and structural inference remain governance risks. | Redacted outcome only; inspect authorized responses privately |
| U9 | Activity Detail: verify 57 approved fields, native grain, approved search/hierarchy, stable sorting, pages and full matching export. Click the actual buttons “Download Full Combined Summary CSV” and “Download Visible Columns CSV.” Full export has all 57; selected export has only validated selected columns; both cover the full filtered row scope, not one page. Person measures, disaggregation sums and *_check fields are Suppressed; approved operational dimensions/counts retain their semantics. Repeated/invalid parameters or upstream failure must yield JSON error/no CSV download. | Row/column counts, file hashes and assertion outcomes; actual CSV restricted |
| U10 | Verify CSV BOM/UTF-8, CRLF, quoting/embedded quotes/newlines and formula-like leading cells including whitespace/control prefixes. Use existing synthetic test evidence if live fields do not contain a case; do not inject malicious warehouse values. Successful responses are private/no-store. No raw person data or excluded internal/free-text fields may be exported. | Synthetic case IDs/private file hash; no CSV contents in PR |
| U11 | Distinguish MAX(latest_sync_time) pipeline sync, latest selected activity end date and latest MAX(run_timestamp) DQ snapshot. DQ counts only that latest snapshot. Missing snapshots remain unavailable, not fabricated freshness. Obtain current data-owner acceptance; do not treat August timestamps or current page time as a fresh pipeline. | Opaque freshness decision reference |
| U12 | Map: 777 boundaries carry district event values, not local-unit observations or residence. Verify names/codes, keyboard/pointer province→district focus, breadcrumbs/Back/Reset, municipality-only reset, operational measure changes and no hidden participant values. Verify project/partner district matrices within the same scope. | Synthetic/redacted map image; no narrow sensitive-location data |
| U13 | Indicator route shows pending linkage, and GBV/OCMC including alias stays blocked. No survivor/service data, fabricated targets, performance scores or causal management claims. Deterministic management observations use publishable operational metrics only; person ratios remain unavailable. | Route/status only |
| U14 | Inspect 375, 768, 1024 and 1440px; bounded table/ranking scrolling, usable search, actual withheld states, navigation/focus/Escape, map/column keyboard controls and screen-reader text. Use current locked-layout acceptance at this implementation revision, not earlier superseded screenshots or a requirement that all cards form one mobile column. | Redacted or synthetic screenshots; manual accessibility sign-off |
| U15 | Verify fail-closed error behavior using existing sanctioned fixtures or a separately approved isolated failure test. Do not change Production credentials/variables/IAM to provoke a failure. No mock substitution, raw diagnostic data or partial CSV; no approved failure-test mechanism means BLOCKED, not PASS. | Error/status only |

Successful live reads do not prove source authorization, absence of write grants, complete privacy safety or permission to release. The package's containment/rollback procedure applies immediately on failure.

## D. Evidence and closure

- Public PR: exact SHA, deployment target/status, completed module IDs, sanitized PASS/FAIL/BLOCKED counts, configuration-name/scope inventory and opaque approval/evidence references only.
- Restricted store: signed decisions, approved baselines, authorized CSVs and sanitized incident/build/access evidence as necessary. Define custodian, access group, retention deadline and deletion verification before collection. Avoid raw tokens, cookies, STS/SDK objects, full debug logs, HARs or session-bearing traces entirely.
- Both project owner and data governance sign restricted publication/six-view acceptance and UAT result. Environment owner attests protection, auth/WIF and contingency. Record unresolved tests explicitly.
- Any later SHA, configuration, audience or data-contract change requires review/rebinding of approvals. Production validation/release is separately authorized against the actual Production artifact/configuration; no automatic promotion or merge follows staging PASS.

References: [Vercel deploy CLI](https://vercel.com/docs/cli/deploy), [Deployment Protection](https://vercel.com/docs/deployment-protection). This document is prepared only; all UAT outcomes and approvals remain pending.
