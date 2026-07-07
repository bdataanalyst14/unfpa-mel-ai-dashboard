# UNFPA MEL Dashboard — Agent Guide

## Setup
```bash
npm install --legacy-peer-deps   # Radix/ui peer-dep alignment
```

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server → localhost:3000 |
| `npm run build` | Full production build |
| `npm run lint` | `next lint` (no typecheck built-in) |
| `npm run test:verify` | Standalone Node.js script at `scripts/verify.js` — checks suppression + bigquery-service wiring. **No Jest/Vitest needed.** |

The `.test.ts` file at `src/lib/server/suppression.test.ts` has no runner configured. To enable it, add a test framework first.

## Data Modes
- `DATA_MODE=mock` (default) — prototype experience, no credentials needed.
- `DATA_MODE=bigquery` — reads from BigQuery. Requires env vars from `.env.example`; do **not** commit real credentials.
- BigQuery failures fall back to clearly labelled mock data.

## Architecture
- **Next.js 14 App Router** — pages under `src/app/dashboard/*`, each subdir is a route.
- Root `/` and `/dashboard/` both redirect to `/dashboard/executive-overview`.
- Path alias `@/*` → `./src/*`.
- **Server-only code** in `src/lib/server/` (`import 'server-only'`): BigQuery client, suppression, dashboard service.
- GBV small-cell suppression (`suppression.ts`): counts 1–4 → `<5`, negative/null → `N/A`. Required for all GBV-OCMC pages.
- shadcn/ui components in `src/components/ui/`, charts in `src/components/charts/`, dashboard widgets in `src/components/dashboard/`.

## Mock Data
- `src/data/mock/` — synthetic datasets mirroring KoBo schema.
- `src/data/registry/` — IP, indicator, activity, target registries (JSON).
- `src/data/geo/` — Nepal geography base data.

## Excluded from TypeScript
These top-level directories are excluded from `tsconfig.json` and **not part of the app**:
`figmaprototype/`, `Figma_dashboard/`, `UNFPA Nepal MEL Dashboard Prototype/`, `google stitch dashboard_v1/`, `google_stitich_dashboard_v2/`

## Vercel
Deployed via Vercel (project ID in `.vercel/project.json`). No CI/CD workflow present.

## Key Conventions
- **TypeScript strict mode** — use proper types from `src/lib/types.ts`.
- **Tailwind CSS** custom colors: `sidebar-navy`, `primary-blue`, `accent-orange`, `status-*`, `canvas-bg`.
- **No comments in code** unless required.
- All new components should follow shadcn/ui conventions (check existing `src/components/ui/` for patterns).
