# Design Reference Notes

## Primary Reference – **Stitch V1**
* Stitch V1 is the definitive visual source of truth for the dashboard. All layout, colour, and data‑point placement decisions should be anchored to this version.

## Secondary Reference – **Figma Prototype (fig1.pdf)**
* The Figma prototype is used for:
  * Executive Overview wording
  * Filter options and labels
  * KPI card labels
  * AI summary section
  * Footer content
* Do **not** copy any code or design tokens directly from Figma. Use it only as a visual guide.

## Tertiary Reference – **Stitch V2**
* Stitch V2 contains pages that are missing from V1:
  * Participant Reach
  * IP Performance
  * GBV/OCMC
  * Management Decision Centre
  * Activity Detail
* These pages should be implemented using the same component patterns as V1.

## Implementation Guidance
* Translate the visual design into reusable **Next.js** components.
* Use **Tailwind CSS** for styling, following the project's existing utility‑first approach.
* Leverage **shadcn/ui** primitives for common UI patterns (cards, modals, etc.).
* Use **Recharts** for all charting needs.
* Use **lucide‑react** for icons.
* Keep the component library small and focused – only expose what is needed for the dashboard.
* Avoid duplicating logic; centralise KPI calculations in utility modules.

---
**Note:** This document is for reference only. No source files are modified.
