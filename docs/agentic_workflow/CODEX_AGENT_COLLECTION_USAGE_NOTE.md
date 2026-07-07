# CODEX_AGENT_COLLECTION_USAGE_NOTE

Date: 2026-06-29
Environment: `H:\My Drive\unfpa-mel-ai-dashboard-clean`
Reference library: `H:\My Drive\ai agent collection`
Status: `reference_used_no_agents_installed_or_copied`

## Scope

The agent collection was used as a read-only role and guardrail reference for this clean-sandbox recovery pass. No agents were installed, executed, copied into the repository, or activated as runtime tools.

## Reference Files Reviewed

- `unfpa_sub_agent_operating_model_md_package/01_MASTER_EXECUTION_GUIDE.md`
- `unfpa_sub_agent_operating_model_md_package/02_AGENT_PROMPTS_BY_TOOL.md`
- `unfpa_sub_agent_operating_model_md_package/04_GUARDRAILS_AND_REVIEW_GATES.md`
- `unfpa_sub_agent_operating_model_md_package/06_READY_TO_USE_MASTER_PROMPTS.md`
- `unfpa_sub_agent_operating_model_md_package/07_OPTIONAL_UNFPA_AGENT_PROFILE_TEMPLATES.md`
- `agency-agents/engineering/engineering-minimal-change-engineer.md`
- `agency-agents/engineering/engineering-code-reviewer.md`
- `agency-agents/engineering/engineering-frontend-developer.md`
- `agency-agents/engineering/engineering-sre.md`
- `agency-agents/testing/testing-reality-checker.md`
- `agency-agents/testing/testing-evidence-collector.md`
- `agency-agents/testing/testing-test-results-analyzer.md`
- `agency-agents/testing/testing-api-tester.md`
- `agency-agents/security/security-appsec-engineer.md`
- `agency-agents/security/security-compliance-auditor.md`
- `agency-agents/security/security-architect.md`
- `agency-agents/project-management/project-management-project-shepherd.md`
- `agency-agents/support/support-legal-compliance-checker.md`
- `agency-agents/support/support-executive-summary-generator.md`

## Applied Operating Pattern

- Minimal-change execution: documentation and package-lock recovery only; no protected geography edits.
- Evidence-first review: command outcomes and blocked steps are recorded in dedicated reports.
- Security/privacy guardrails: no deployment, no BigQuery query, no credential access, no `.env` edits, no refresh scripts, and no GBV/OCMC live activation.
- Reality-check posture: dependency recovery is not marked complete because `npm ci` was rejected by the sandbox approval reviewer.

## Sub-Agent Use

No external sub-agent was spawned. The collection was sufficient as a read-only reference and the work was small enough to keep under direct Codex control.
