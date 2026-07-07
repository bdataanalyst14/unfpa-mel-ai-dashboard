# Dashboard Build Roadmap

This document outlines the milestones leading to full production deployment.

## Implementation Milestones

### Phase I — Polish & Static Prototype (Current)
- [x] Initial design system, rounded cards, layout templates, colors.
- [x] Recharts implementation for 9 visualization components.
- [x] Full route support (10 dashboard pages).
- [x] Data privacy rules and cell suppression logic mock.

### Phase II — Dynamic Excel/CSV Ingestion
- [ ] Connect prototype pages to a local file ingestion layer (xlsx/csv parse).
- [ ] Deploy basic password/token authentication.
- [ ] Support local browser database (IndexedDB) for saving file sessions.

### Phase III — Database and API Connectors
- [ ] Establish connectors to live data sources: KoBo Toolbox API, Google Sheets API.
- [ ] Create postgres data warehouse to store history.
- [ ] Deploy Next-Auth for role-based dashboard access controls (Viewer/Manager/Admin).

### Phase IV — AI Integration & Launch
- [ ] Connect AI narrative generator to live OpenAI/Gemini endpoints.
- [ ] Build interactive voice/text query interface.
- [ ] Security audit & production release under UNFPA domain.
