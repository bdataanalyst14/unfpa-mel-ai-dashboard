# BQ_ACTUAL_002_VERCEL_PROJECT_LINK_CHECK

Date: 2026-06-30
Status: `vercel_project_linked_env_empty`

No tokens or secret values are recorded in this evidence file.

## Commands Run

- `vercel --version`
- `vercel whoami`
- `vercel project ls`
- `vercel link --yes --scope bdataanalyst14s-projects --project unfpa-mel-ai-dashboard-cod001`
- `vercel env ls --format json`

## Result

| Check | Result |
| --- | --- |
| Vercel CLI | `54.7.1` |
| Authenticated account | `bdataanalyst14` |
| Team/scope | `bdataanalyst14s-projects` |
| Linked project | `unfpa-mel-ai-dashboard-cod001` |
| Project ID | `prj_o0TUpnpFp8fan4bp3o27PpAebb2v` |
| Org ID | `team_rWUCdbt4SARVifQg4jJl6nRL` |
| Environment variables listed | `[]` |

## Interpretation

The local integration sandbox is linked to the intended Vercel project. The project currently has no Vercel environment variables visible to the CLI, so Preview cannot activate BigQuery.
