# UNFPA MEL AI Dashboard — Remaining Work Plan

**Prepared:** 2026-06-20  
**Project folder reviewed:** `H:\My Drive\unfpa-mel-ai-dashboard`  
**Related data pipeline repo:** `H:\My Drive\unfpa_mel`  
**Planning status:** Operational plan for remaining work; not a production authorization.

---

## 1. Executive Decision Summary

The project should now move from repeated agent prompting into a **gated execution model**. The main technical foundation is in place: BigQuery is already connected, all 15 IPs are represented in aggregate reporting data, the Executive Overview BigQuery proof of concept exists, and the geography/ArcGIS map work has been protected through explicit guardrails. However, **live route expansion should not proceed until two gates are closed**:

1. **DP-003B Freshness and Suppression Gate**  
   DP-003A found the live BigQuery connection and 15-IP coverage, but automatic refresh was only partially verified because the latest sync date was reported as `2026-05-15`. It also found that `combined_activity_summary` contains raw aggregate counts and needs confirmed `n < 5` suppression before dashboard rendering.

2. **Human M&E Registry Sign-Off Gate**  
   Registry-dependent routes remain blocked until M&E signs off registry/crosswalk/target/evidence/route calculation rules, including the 90 inferred matches, 331 unmatched activities, 83 NRCS/PeaceWin incomplete-source links, target/unit/cadence rules, and the GBV/OCMC suppression contract.

**Recommended immediate next action:** run **DP-003B** only. Do not run DP-004 route connection yet unless DP-003B returns `Ready for DP-004 Safe Aggregate Route Connection`.

---

## 2. Current Verified Status

| Area | Current status | Planning implication |
| --- | --- | --- |
| BigQuery connection | Connected and verified | Do not reconnect. Use existing connected environment. |
| 15-IP aggregate coverage | Verified | Route work can use aggregate IP coverage after safety gates. |
| Executive Overview | Server-side BigQuery POC implemented | Safe baseline; additional target/progress metrics still require registry approval. |
| Geography map / ArcGIS | Protected Gemini/Cline work with guardrails | Do not overwrite map files. Any route connection must preserve map base. |
| DP-003A | Conditionally accepted | BigQuery works, but freshness and suppression gates remain. |
| M&E registry | Draft / pending human validation | Registry-dependent routes remain blocked. |
| GBV/OCMC | Blocked | Requires pre-suppressed aggregate source, server-side suppression, privacy sign-off, and tests. |
| Deployment | Preview only when allowed | No production deployment until all gates and QA pass. |

---

## 3. Active Blockers

### 3.1 Freshness blocker

- Latest sync date reported in DP-003A: `2026-05-15`.
- This may be acceptable if no newer source submissions exist, but it must be verified.
- Dashboard should show a data freshness note if the latest sync is old or partially verified.

**Closure required:** DP-003B must classify freshness as one of:

- `fresh`
- `acceptable_with_note`
- `stale_needs_pipeline_check`
- `unknown_needs_admin_review`

### 3.2 Suppression blocker

- `combined_activity_summary` has raw aggregate counts.
- Non-zero counts from 1 to 4 must not reach the browser for sensitive routes or disaggregations.
- Suppression should be enforced at the BigQuery reporting view if possible, and at the API/server layer as mandatory fallback. Frontend masking is display only, not privacy protection.

**Closure required:** DP-003B must classify route-level suppression as one of:

- `suppression_ready`
- `suppression_needed_before_live_connection`
- `blocked_until_privacy_review`

### 3.3 M&E registry blocker

The following require human M&E decision before registry-dependent route connection:

- 15 IP identities and aliases.
- 575 activity records.
- 217 indicator records.
- 170 target records.
- 878 crosswalk links.
- 878 evidence placeholders.
- 90 inferred activity-indicator links.
- 331 unmatched activities.
- 83 NRCS/PeaceWin incomplete-source links.
- Target/unit/cadence rules.
- Route calculation rules.
- GBV/OCMC suppression contract.

---

## 4. Route Readiness Decision

### 4.1 Candidate routes after DP-003B only

These may proceed to DP-004 **only if DP-003B passes freshness and suppression gates** and the route does not use unapproved registry-derived target/crosswalk logic.

| Route | Route status | Minimum condition before connection |
| --- | --- | --- |
| `/dashboard/executive-overview` | Candidate | Keep current aggregate POC scope; no new registry-derived progress/target metrics. |
| `/dashboard/participant-reach` | Conditional candidate | Aggregate-only reach contract, approved disaggregation allowlist, suppression ready. |
| `/dashboard/data-quality` | Conditional candidate | Aggregate data-quality facts only; no evidence scoring until registry evidence rules approved. |
| `/dashboard/ip-performance` | Conditional candidate | Aggregate IP submission/status only; no target-based ranking until IP aliases and targets approved. |
| `/dashboard/geographic-coverage` | Conditional candidate | Preserve map base; aggregate geography only; no unapproved registry-coded geography joins. |

### 4.2 Routes blocked until M&E sign-off

| Route | Block reason |
| --- | --- |
| `/dashboard/activity-progress` | Requires approved activity registry, crosswalks, targets, unmatched activity treatment, and route calculation rules. |
| `/dashboard/indicator-progress` | Requires approved indicator registry, target/unit/cadence rules, NRCS/PeaceWin decisions, and crosswalk sign-off. |
| `/dashboard/management-decision-centre` | Requires full decision rules, target thresholds, evidence rules, and treatment of unresolved gaps. |
| `/dashboard/activity-detail` | Requires approved activity registry, safe field allowlist, exclusion of internal IDs/PII, and unmatched treatment. |
| `/dashboard/gbv-ocmc-summary` | Requires pre-suppressed aggregate source, server-side suppression, privacy sign-off, and privacy regression tests. |

---

## 5. Agent Operating Model

### 5.1 Core principle

Only one agent should implement code in a given workstream at a time. Other agents can audit, review, or prepare documentation. This prevents repeated work and accidental overwrites.

### 5.2 Recommended roles

| Agent/tool | Role now | Allowed work | Not allowed |
| --- | --- | --- | --- |
| ChatGPT / Agent Manager | Overall planner and gatekeeper | Decide next task, prepare prompts, review reports, update remaining-work plan | Direct code execution in repo unless explicitly asked |
| Gemini CLI | Data pipeline verifier and documentation agent | DP-003B freshness/suppression read-only validation, docs, audit scripts | Route connection, deployment, raw/staging/person-level queries |
| Cline | Controlled VS Code implementer | Minimal API/server suppression implementation if DP-003B says needed; DP-004 connection only after gate | Touching geography map files, registry-dependent routes, production deploy |
| Google Antigravity | UI/editor and QA reviewer | Visual QA, route UX review, preview checklist, map presentation review | BigQuery credentials, raw data, registry logic changes without sign-off |
| Codex | Future integration/code review backup | Use only after guardrails; specific file-level integration or review | Blind copy/overwrite, map work, production deployment |
| NotebookLM | Evidence and decision support | Review docs, summarize M&E decision pack, prepare human-review notes | Repo edits, code execution, credentials |
| MCP | Connector layer | Use for controlled file/context access if configured | Bypassing repo guardrails or credential safety |

---

## 6. Immediate Next Task — DP-003B

### Copy-paste command

```powershell
cd "H:\My Drive\unfpa-mel-ai-dashboard"
gemini -p "@docs\data_pipeline\DP_003B_FRESHNESS_SUPPRESSION_ROUTE_GATE_PROMPT.md"
```

### DP-003B prompt to create/run if the prompt file does not already exist

```markdown
# DP-003B Gemini CLI — Freshness, Suppression, and Safe Route Readiness Gate

Mode:
Use the UNFPA Data Engineer / Security Privacy Reviewer / Reality Checker skills.

Execution style:
Work silently.
Do not ask routine permission.
Do not populate chat with every command, file view, or progress update.
Auto-approve safe read-only checks and documentation/proposal writes only.
Return one final consolidated report only.

Dashboard repo:
H:\My Drive\unfpa-mel-ai-dashboard

Data pipeline repo:
H:\My Drive\unfpa_mel

Current DP-003A findings:
- BigQuery connection verified via ADC.
- Project: `unfpadatabase`.
- 15 IPs verified in `ip_submission_status`.
- Latest sync date: `2026-05-15`.
- `combined_activity_summary` has 1798 rows.
- Safe aggregate views validated: `combined_activity_summary`, `indicator_progress_summary`, `data_quality_summary`, `ip_submission_status`.
- Restricted tables avoided: `participants_flat`, `participants_flat_staging`, `activity_summary_flat`, `activity_summary_flat_staging`.
- Risk: `combined_activity_summary` contains raw aggregate counts and requires k-anonymity suppression for `n < 5`.
- No route was connected.
- No deployment was run.

Objective:
Before any live dashboard route connection, verify whether the latest sync date is acceptable and whether the suppression layer is ready. Produce a clear go/no-go decision for DP-004 safe aggregate route connection.

Do not:
- modify BigQuery tables
- create or replace BigQuery views
- run destructive SQL
- query raw/staging/person-level/survivor-level rows
- expose participant-level data
- connect dashboard routes
- modify dashboard source code
- modify geography map files
- run Vercel
- deploy
- mark registry approved

Allowed actions:
- read-only BigQuery aggregate metadata/count/freshness checks
- inspect pipeline refresh logs/configs
- inspect dashboard API/service suppression logic
- inspect docs and scripts
- create/update documentation and proposal files only

Allowed writes:
- `docs\data_pipeline`
- `docs\bigquery`
- `docs\dashboard_qa`
- `docs\agentic_workflow`

Tasks:
1. Create/update `docs\data_pipeline\BIGQUERY_REFRESH_FRESHNESS_GATE.md`.
2. Create/update `docs\data_pipeline\BIGQUERY_SUPPRESSION_READINESS_GATE.md`.
3. Create `docs\data_pipeline\SUPPRESSION_IMPLEMENTATION_PLAN.md`.
4. Create/update `docs\data_pipeline\DP_004_ROUTE_CONNECTION_GO_NO_GO.md`.
5. Update `docs\data_pipeline\DP_004_SAFE_AGGREGATE_ROUTE_CONNECTION_PROMPT.md` so it connects only `go_for_DP004` routes.
6. Update `docs\agentic_workflow\UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md` with DP-003B status.

Final report must include:
1. Freshness status.
2. Latest sync date confirmed.
3. Whether automatic refresh is active.
4. IPs stale/missing/zero, if any.
5. Suppression status.
6. Whether `n < 5` suppression exists.
7. Whether API/server suppression exists.
8. Whether BigQuery/view suppression exists.
9. Routes go for DP-004.
10. Routes conditional.
11. Routes blocked.
12. Files created/updated.
13. Confirmation no destructive SQL was run.
14. Confirmation no raw/staging/person-level/survivor-level rows were queried.
15. Confirmation no dashboard route was connected.
16. Confirmation no deployment was run.
17. Recommended next action.

Final status must be one of:
- Ready for DP-004 Safe Aggregate Route Connection
- Conditional: Suppression Needed Before DP-004
- Conditional: Freshness Confirmation Needed Before DP-004
- Blocked by Privacy/Freshness Gate

Proceed silently now and return only the final consolidated report.
```

---

## 7. Conditional Next Task After DP-003B

### Scenario A — DP-003B returns `Ready for DP-004 Safe Aggregate Route Connection`

Assign **Cline or Codex, not both**, to run DP-004 in a temp working copy. Antigravity should only do visual QA after implementation.

```powershell
cd "H:\My Drive\unfpa-mel-ai-dashboard"
# Use the existing DP-004 prompt only after DP-003B says Ready.
cline "@docs\data_pipeline\DP_004_SAFE_AGGREGATE_ROUTE_CONNECTION_PROMPT.md"
```

DP-004 must:

- Connect only routes marked `go_for_DP004`.
- Preserve mock fallback.
- Keep registry-dependent routes blocked.
- Apply server/API suppression where required.
- Run build/lint from temp or controlled local working copy, not directly from unstable synced H Drive if that causes lock/performance issues.
- Not deploy.

### Scenario B — DP-003B returns `Conditional: Suppression Needed Before DP-004`

Assign **Cline** to implement a minimal server-side suppression utility and tests before route connection.

Required implementation concept:

- Create reusable server-side suppression function.
- Suppress non-zero counts `< 5`.
- Return safe display values such as `<5`, `suppressed: true`, and no raw small value.
- Apply to API responses before frontend receives data.
- Add tests proving exact 1–4 values do not appear in JSON payloads.
- Do not connect GBV/OCMC live data.
- Do not touch map files.

### Scenario C — DP-003B returns `Conditional: Freshness Confirmation Needed Before DP-004`

Assign **Gemini CLI** to inspect refresh configuration/logs and produce a data freshness decision. No route connection until freshness is accepted or dashboard warning behavior is agreed.

### Scenario D — DP-003B returns `Blocked by Privacy/Freshness Gate`

Stop code work. Prepare a blocker memo for the BigQuery/admin/M&E owner.

---

## 8. M&E Registry Human Review Workstream

This workstream can run in parallel with DP-003B because it is documentation and decision review, not code connection.

### Required human decisions

| Decision group | Required decision |
| --- | --- |
| 15 IP identities and aliases | Approve/correct canonical IP list. |
| 575 activities | Approve/correct/defer/block records. |
| 217 indicators | Approve/correct indicator records and mappings. |
| 170 targets | Approve target value, unit, cadence, and year. |
| 878 crosswalk links | Approve/correct/defer/block activity-indicator-target links. |
| 878 evidence placeholders | Define evidence type, frequency, owner, and scoring treatment. |
| 90 inferred matches | Confirm or block machine-assisted links. |
| 331 unmatched activities | Map, classify operational-only, exclude, defer, or block. |
| 83 NRCS/PeaceWin incomplete-source links | Provide source support or defer/exclude affected links. |
| GBV/OCMC suppression contract | Approve threshold, grain, server-side behavior, tests, and owner. |

### NotebookLM task

Use NotebookLM to load the M&E decision pack and ask:

```text
Review the M&E Registry Decision Matrix, Sign-Off Package, Registry Gap Decision Log, Route Governance Matrix, and GBV/OCMC Suppression Requirements. Produce a 2-page human-review briefing that lists only decisions M&E must make before protected preview, grouped by route and risk. Do not suggest code changes. Focus on approval/correction/defer/block decisions.
```

---

## 9. Preview and Deployment Rules

### Preview allowed only after

- DP-003B gate passed or conditional requirements resolved.
- DP-004 connected only approved aggregate routes.
- Build passed.
- Lint passed.
- Protected geography hashes unchanged.
- API payload inspection confirms no raw small cells for suppressed fields.
- Registry-dependent routes remain mock/blocked.

### Production deployment not allowed until

- M&E registry sign-off completed.
- Privacy/suppression sign-off completed.
- Route-by-route QA completed.
- Preview accepted by product owner/M&E owner.
- Credential and environment variable review completed.

Never run:

```powershell
vercel --prod
```

unless explicitly authorized after all gates pass.

---

## 10. File Outputs To Maintain

### Existing source-of-truth files

- `PROJECT_PLAN_AND_PROGRESS_TRACKER.md`
- `docs\agentic_workflow\UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md`
- `docs\agentic_workflow\M&E_REGISTRY_DECISION_MATRIX_FOR_SIGNOFF.md`
- `docs\agentic_workflow\ROUTE_GOVERNANCE_MATRIX.md`
- `docs\agentic_workflow\GBV_OCMC_SUPPRESSION_REQUIREMENTS.md`
- `docs\data_pipeline\DP_004_SAFE_AGGREGATE_ROUTE_CONNECTION_PROMPT.md`

### New/updated files needed next

- `docs\data_pipeline\DP_003B_FRESHNESS_SUPPRESSION_ROUTE_GATE_PROMPT.md`
- `docs\data_pipeline\BIGQUERY_REFRESH_FRESHNESS_GATE.md`
- `docs\data_pipeline\BIGQUERY_SUPPRESSION_READINESS_GATE.md`
- `docs\data_pipeline\SUPPRESSION_IMPLEMENTATION_PLAN.md`
- `docs\data_pipeline\DP_004_ROUTE_CONNECTION_GO_NO_GO.md`
- `docs\dashboard_qa\SAFE_AGGREGATE_ROUTE_PREVIEW_QA_CHECKLIST.md`
- `docs\agentic_workflow\AGENT_HANDOFF_AND_GUARDRAIL_REGISTER.md`

---

## 11. Daily Operating Checklist

Before giving any agent a new task, confirm:

- Which agent owns the task?
- Which files/folders are allowed?
- Which files/folders are protected?
- Is this read-only, documentation-only, or implementation?
- Does the task touch BigQuery credentials or raw data?
- Does the task touch map/ArcGIS files?
- Does the task touch registry-dependent routes?
- Does the task require build/lint?
- Is deployment explicitly forbidden?
- What single final report is required?

---

## 12. Recommended Next 5 Actions

1. Create `DP_003B_FRESHNESS_SUPPRESSION_ROUTE_GATE_PROMPT.md` in `docs\data_pipeline`.
2. Run Gemini CLI DP-003B silently and collect one final consolidated report.
3. If suppression is missing, assign Cline a minimal API/server suppression implementation before DP-004.
4. If DP-003B passes, run DP-004 for only approved safe aggregate routes.
5. In parallel, prepare M&E human sign-off session using the registry decision matrix.

---

## 13. Stop/Go Rules

| Condition | Decision |
| --- | --- |
| DP-003B says suppression missing | Stop DP-004; implement suppression first. |
| DP-003B says freshness unknown/stale | Stop DP-004; verify refresh or add freshness warning. |
| Agent modifies protected map files | Stop; revert protected files and compare hashes. |
| Agent queries raw/person/survivor rows | Stop; privacy incident review. |
| Agent connects registry-dependent routes before sign-off | Stop; revert route connection. |
| Agent requests production deploy | Reject unless explicit post-QA authorization exists. |
| M&E signs registry and route rules | Registry-dependent implementation can be planned route-by-route. |

---

## 14. Final Recommendation

Do not continue broad multi-agent implementation yet. The remaining work should be controlled through **two immediate gates**:

1. **DP-003B freshness and suppression gate** led by Gemini CLI.
2. **Human M&E registry sign-off** supported by NotebookLM and the existing decision matrix.

Only after DP-003B passes should Cline or Codex connect the safe aggregate routes under DP-004. Antigravity should then perform visual QA and route-level usability checks. Registry-dependent routes and GBV/OCMC live activation should remain blocked until their specific governance and privacy sign-offs are complete.
