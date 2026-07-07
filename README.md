# UNFPA Nepal MEL Dashboard Prototype

A high-performance static prototype of the UNFPA Nepal Country Office Monitoring, Evaluation & Learning (MEL) Dashboard, designed to streamline implementing partner reporting, data validation, and program decision-making.

## Technology Stack

- **Framework**: Next.js App Router (v14)
- **Styling**: Tailwind CSS & shadcn/ui
- **Icons**: lucide-react
- **Data Visualizations**: Recharts
- **Typing**: TypeScript

## Key Features

1. **Executive Overview**: High-level indicator dials, AI insights, and progress charts.
2. **Implementation Milestones**: Completed vs. planned timelines by outcome/project.
3. **Participant Profile**: Inclusive disaggregation ratios (sex, age, caste, ethnicity, and disability).
4. **CPD Output Matrix**: Real-time progress indicators matched to UNSDCF and Strategic Plan components.
5. **Partner Performance**: Scorecards detailing compliance rates, late reports, and evidence uploads.
6. **Geographic Coverage**: Footprint tracking across provinces and palikas.
7. **Confidentiality Safeguards**: Privacy-compliant GBV services dashboard with mandatory small-cell suppression rules.
8. **M&E Quality Controls**: Consistency warning logs for data disaggregation.
9. **Decision Centre**: AI advisory narratives, program risks, and narrative generator templates.

## Directory Structure

```text
├── docs/                     # Technical specifications and build roadmap
├── src/
│   ├── app/                  # Route layouts and dashboard pages
│   ├── components/
│   │   ├── charts/           # Recharts visualization modules
│   │   ├── dashboard/        # Reusable dashboard widgets and cards
│   │   ├── layout/           # Global sidebar nav and layouts
│   │   └── ui/               # Base shadcn primitives
│   ├── data/mock/            # Synthetic data datasets matching KoBo schema
│   └── lib/                  # KPI metrics math, privacy rules, and RBAC
```

## Setup Instructions

### 1. Install Dependencies
Run the install command using legacy-peer-deps to align Radix UI primitives:
```bash
npm install --legacy-peer-deps
```

### 2. Launch Local Dev Server
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify Build Assets
Run compilation and verification scripts:
```bash
npm run build
```

## Data Modes

Executive Overview supports the first server-side BigQuery connection POC.

- `DATA_MODE=mock` is the default and preserves the prototype experience.
- `DATA_MODE=bigquery` reads aggregate operational KPIs from the established pipeline reporting
  tables in `H:\My Drive\unfpa_mel`.
- BigQuery credentials are server-only. Use `.env.example` as the placeholder reference and do not
  commit `.env.local` or real credentials.
- Raw participant records and GBV/OCMC survivor-level records are not connected.
- Target/status charts and AI insights remain labelled prototype data until approved reporting views exist.
- Without valid server credentials, BigQuery mode returns a clearly labelled mock fallback.

See `docs/BIGQUERY_DASHBOARD_CONNECTION_PLAN.md` for route mappings and remaining reporting-view gaps.

Current preview remains on `DATA_MODE=mock`. Live BigQuery testing requires a dedicated read-only
service account limited to approved aggregate/reporting assets. Do not grant the dashboard account
access to raw participant, unrestricted staging, personal-identifier, or survivor-level GBV data.
