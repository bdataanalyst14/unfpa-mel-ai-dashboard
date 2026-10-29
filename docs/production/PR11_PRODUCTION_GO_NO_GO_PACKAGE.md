# PR #11 — corrected production decision package

Date: 29 October 2026. Branch: release/ui-ux-acceptance-2026-10-28. [PR #11](https://github.com/bdataanalyst14/unfpa-mel-ai-dashboard/pull/11).

**NO-GO for Production. Protected staging deployment and live UAT are also BLOCKED until the prerequisites and separate written approvals below are complete.** Publishing this documentation does not authorize a deployment, environment change, live query or merge.

## 1. Revision and evidence identity

- Reviewed PR head and local starting HEAD: 74365c680ec5291ae48fdfb12563571092283d74.
- Tested implementation recorded by the prior review: 8047bbf839b8801a7e139ea5e9b9df3b534bf09d.
- Main observed on 29 October: 41bba0cbc63485b4f81a2d1ea911ca0279eff48d.
- The 8047bbf → 74365c6 comparison changes only docs/production paths. The new release-package commit must also change only documentation. Its final SHA is verified after publication and recorded in the PR description/completion response; a file cannot embed its own future commit SHA.
- GitHub reported OPEN, draft, MERGEABLE/CLEAN at inspection. That is a time-specific mergeability observation, not permission to merge, a guaranteed fast-forward, or proof that release gates have passed.
- Prior tests remain historical evidence at [final disclosure acceptance](PR11_FINAL_DISCLOSURE_ACCEPTANCE.md) and [original disclosure evidence](pr11-disclosure-2026-10-29/evidence.json). This documentation correction does not rerun or extend those runtime tests. It does not turn the mock/NONE build evidence into live readiness proof.
- The original local draft was hash-verified into an ignored local backup before correction. Its SHA-256 and the metadata-only inspection are recorded in the [correction evidence](pr11-release-package-2026-10-29/evidence.json). Existing source, stash, scratch evidence and unrelated worktrees are preserved.

## 2. Seven findings corrected in documentation

| ID | Finding in the draft | Correction and remaining gate |
|---|---|---|
| F1 | Four-view claims and invented substitute view names | Publish the exact six-object runtime contract and its four-object history. Two added source views require explicit owner/data-governance approval; a technical allowlist is not approval. |
| F2 | Incomplete environment matrix and unsupported effective Preview scope | Document both mode names, frozen project/dataset aliases, explicit cost cap, build/runtime scope, auth-secret precedence and actual branch-effective metadata. Preview OAuth configuration is missing for this branch; no values were read or changed. |
| F3 | Unqualified privacy assurances and automatic acceptance of reduced participant utility | Require project-owner AND data-governance acceptance of uniform person suppression, structural/historical risks, operational exceptions and permitted audience. No blanket disclosure-risk or standards-compliance certification. |
| F4 | Incorrect UAT assertions: COUNT(*) for activity KPI, assumed ADMIN identity, fixed 302, unsupported route features | Use SUM(event_count); distinguish native row count; test both configured roles and page/API denial behavior; follow current route/filter/freshness contracts. |
| F5 | Staging treated as already authorized and deployment promotion suggested | Staging is conditional, protected Preview only, from the exact approved head and a clean isolated clone. No promotion, Production target or deployment-guard removal. |
| F6 | Mock fallback and arbitrary prior-commit rollback | Use access containment and a separately certified privacy-safe deployment only; otherwise remain unavailable/fail-closed. No synthetic production substitute and no timing promise. |
| F7 | Mergeability, readiness, test success and evidence retention treated as release approval | Separate observed facts, prior tests, UAT execution and signed approvals; store only sanitized status in the public PR; retain sensitive evidence privately under a defined retention/deletion policy. |

The document defects are corrected. Missing configuration, IAM/data approvals, protection attestation and UAT execution remain external gates, not completed controls.

## 3. Current source contract versus historical approval

The current single source of truth is src/lib/server/readiness-manifest-contract.js, shared by the BigQuery query guard and readiness scripts:

| Object | Historical four-view boundary | Current six-view runtime boundary |
|---|---|---|
| combined_activity_summary | Included | Included: published implementation summary and operational reporting |
| indicator_progress_summary | Included | Included in readiness; inclusion does not enable targets or indicator achievement |
| data_quality_summary | Included | Included: latest DQ snapshot; no composite score |
| ip_submission_status | Included | Included: submission metrics and pipeline sync |
| repeatdata | Not included | Added: name-list participant analysis source; do not label it aggregate-only or equate it with participants_flat |
| activity_summary | Not included | Added: summary-mode activity/participant source; semantics and access need approval |

The draft names district_reach_summary, partner_reporting_summary and latest_data_quality_snapshot are not entries in either documented historical four-view list or the current six-view allowlist. They are not deployment prerequisites.

Historical four-view approval does not expand merely because code now accepts six. Both owners must explicitly approve read access, purpose, source grain/fields, repeatdata processing, summary-mode semantics, audiences and lifecycle for all six. Reject direct participants_flat/participants_flat_staging, wildcard, raw export, schema expansion, writes and IAM mutation. Existing backend aggregation can still read person-bearing sources before withholding outputs; suppression does not remove the need for backend data authorization. Use an approved authorized-view/IAM design, not broad dataset access to make readiness pass.

Four-view runbooks, source-scope records and approval templates retain historical evidence only; their PR #11 notices point here. No historical approval is rewritten as a new six-view authorization. If the owners approve only four, this unchanged implementation is NOT ready for staging: stop for a separately reviewed contract/code decision.

## 4. Configuration decision

See the [precise matrix and metadata scope](PR11_CONFIGURATION_AND_READINESS_MATRIX.md). Names/scope/type only were inspected with decryption disabled; presence does not attest value, nonemptiness, IAM, expiry or connectivity.

Observed blockers:

- Preview generic mode/project/dataset/location/WIF names exist, but OAuth client ID/secret, AUTH_SECRET, NEXTAUTH_URL and explicit DASHBOARD_AUTH_REQUIRED are scoped only to ops/google-auth-preview-uat. They do not apply to this PR branch.
- BIGQUERY_MAX_BYTES_BILLED is absent from both Production and Preview metadata. The normal query path has a default cap; the ADMIN pre-UAT validator requires an explicit positive value no greater than 1,000,000,000. No approved explicit cap means no pre-UAT execution.
- Production DATA_MODE exists; DASHBOARD_DATA_MODE is absent. One mode alias is supported by code, but this release requires an explicit matching pair. Production ADMIN list exists and AUTHORIZED_USER list is absent; the owner must attest the intended role population rather than assume any particular person is an admin.
- Preview has a generic authorized-user list but no applicable admin-list metadata. Secret values, email membership and live configuration correctness remain unverified.
- Project-level deployment protection, Preview OIDC trust, approved OAuth callback origin, six-view IAM and published data freshness have not been attested by this metadata inspection.

No credentials, variables, project settings or source implementation were changed to close these gaps.

## 5. Restricted participant-publication policy: explicit decision required

Option A is a **restricted operational publication**, not the originally described full participant dashboard. All person counts, margins, demographics, related checks and percentages use uniform Suppressed/null publication independently of their zero/small/large/missing values. Existing person charts, scatter coordinates and ratios enter withheld/unavailable states. This is output suppression, not a promise that the route performs no server reads or that every JSON transport uses the same marker shape. See the prior bounded disclosure acceptance for the exact caller contract.

Operational event/submission counts, dimension labels, dates, row existence, filters and export structure remain available. Retaining these channels, historical exports/caches, external knowledge, temporal changes and correlations with attendance may still permit inference. Tests hold reporting structure and operational measures fixed. No claim of universal confidentiality or zero disclosure risk is made.

Both the project owner and data-governance/privacy owner must sign a decision accepting:

- the reduced utility and withheld participant analyses;
- all six backend sources and allowed fields/purposes, including repeatdata;
- operational exceptions, structural/historical risks, permitted audience and export restrictions;
- retention/deletion rules, incident owner and fail-closed contingency;
- exact implementation/release SHA, approved environment, expiry/review date and opaque approval reference.

Option B defers release for a separately designed, institutionally approved joint participant-publication policy. A ledger, perturbation, aggregation or differential privacy may be considered; this package mandates no particular unimplemented algorithm and certifies none. Reverting suppression is not an activation mechanism. Neither option is selected or approved here.

## 6. Protected staging UAT and exact Antigravity instruction

Use [PR11_PROTECTED_STAGING_UAT_CHECKLIST.md](PR11_PROTECTED_STAGING_UAT_CHECKLIST.md). All deployment, configuration and read-query authorizations must be explicit and separately scoped. Current status: NOT RUN / BLOCKED. A protected Preview must not be promoted as a Production release.

**Instruction to Antigravity:** Do not deploy yet. First obtain both publication-policy approvals, separate Preview deployment/configuration and cost-bounded read authorization, effective PR-branch OAuth/WIF configuration and protection attestation. Then deploy ONLY the exact approved published PR head from a new clean clone using the Preview command in the checklist. Keep the automatic Git deployment guard. Execute the checklist only within the approved audience, query/job budget and time window. Stop on any mismatch; do not modify source, suppression, IAM, environment values, aliases or Production to manufacture a PASS.

## 7. Privacy-safe rollback and operational contingency

1. On suspected disclosure/auth failure, STOP testing/export distribution. Notify the incident owner through the approved restricted channel; do not post payloads, tokens or screenshots to this public PR.
2. Authorized infrastructure staff contain access to affected HTML, API and CSV surfaces using established platform access controls or a maintained unavailable/maintenance response. Keep Google auth, suppression and no-store controls. If containment or control availability is uncertain, deny service rather than publish data.
3. Roll back only to an identified, previously certified deployment whose disclosure policy, six-view/read boundaries, auth and environment are still compatible and separately approved for this incident. The old baseline 41bba0c and earlier primary/complementary-only policies are NOT presumed safe rollback targets. No candidate is certified by this package.
4. If no privacy-safe target is attested, retain the blocked/unavailable service and approved operational manual process. Do not activate mock mode, fabricate a successful response, weaken auth or enable participant publication. This is an outage contingency, not new dashboard development.
5. Before reopening, recheck platform protection; authorized/unauthorized page/API/CSV access; suppressed output and blocked routes; current configuration/manifest; and the exact deployment identity. A static /api/health 200 alone does not establish readiness. Schema/WIF failures must remain unavailable with no mock substitution.
6. Investigate prior exports, caches and copies under the retention/incident policy; invalidate or revoke access where authorized. Do not promise downloaded copies can be recalled. Preserve restricted evidence only as long as approved and record remediation/status references publicly without data.

No rollback, revocation, environment change or deployment is executed by this document.

## 8. Sign-off and GO/NO-GO

| Approval / evidence | Required accountable owner | Status |
|---|---|---|
| Restricted participant policy AND six-view data access | Project owner + data-governance/privacy owner, both explicit | PENDING |
| Preview configuration, OIDC trust, least-privilege IAM, callback origin and platform protection | Infrastructure/security owner | PENDING; scope gaps observed |
| Exact-SHA protected Preview deployment | Project/environment owner | NOT AUTHORIZED by this task |
| Time/job/bytes-bounded read-only UAT | Data owner + project/environment owner | NOT AUTHORIZED by this task |
| Completed checklist, sanctioned evidence and freshness decision | UAT lead + programme/data owner | NOT RUN |
| Production release/merge and separate Production validation/deployment | Release owner + data governance + environment owner | PENDING; no automatic promotion |

Each signature must bind an opaque approval ID, decision, exact SHA, environment/audience, validity window, conditions and named accountable role in the restricted approval register. Public documentation contains status/references only. Deployment approval is not data-read approval; a build/readiness PASS is not publication approval.

**Final decision: GO to review/publish this documentation correction only. NO-GO for staging execution and Production release until the applicable gates above are satisfied.**
