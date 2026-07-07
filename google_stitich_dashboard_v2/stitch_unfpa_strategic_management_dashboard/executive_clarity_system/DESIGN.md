---
name: Executive Clarity System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404751'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717882'
  outline-variant: '#c0c7d3'
  surface-tint: '#0062a2'
  primary: '#005994'
  on-primary: '#ffffff'
  primary-container: '#0072bc'
  on-primary-container: '#ecf3ff'
  inverse-primary: '#9dcaff'
  secondary: '#3a5f94'
  on-secondary: '#ffffff'
  secondary-container: '#9fc2fe'
  on-secondary-container: '#294f83'
  tertiary: '#953900'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd4a00'
  on-tertiary-container: '#ffefea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9dcaff'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#00497c'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a7c8ff'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#1f477b'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  kpi-value:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter-grid: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  sidebar-width: 260px
  ai-panel-width: 380px
---

## Brand & Style
The design system is engineered for the UNFPA Nepal Senior Management, prioritizing cognitive ease and rapid decision-making. The brand personality is **authoritative, transparent, and mission-driven**. It adopts a **Refined Minimalism** style, utilizing heavy whitespace to reduce the "data noise" typical of complex dashboards. 

The emotional response should be one of calm control. By stripping away non-functional decorative elements, the UI directs the executive's focus toward critical humanitarian metrics and strategic gaps. The aesthetic is "Professional Modern"—reliable enough for government-level reporting, yet streamlined enough for daily operational monitoring.

## Colors
This design system utilizes a high-clarity, light-mode palette to maintain a "paper-like" professional feel. 

- **Canvas & Surfaces:** The background uses `#F8F9FA` to define the workspace, while cards and containers use pure `#FFFFFF` to lift content forward.
- **Primary & Secondary Blues:** Used for data visualization and navigation. `#0072BC` (UNFPA Blue) represents active states, while `#003366` provides depth for text and headers.
- **Strategic Accent:** `#FF6600` is reserved strictly for high-priority calls to action or identifying critical strategic pivots. Use sparingly to maintain its psychological impact.
- **Semantic Logic:** Status indicators follow standard traffic-light conventions, ensuring immediate recognition of regional performance or funding gaps.

## Typography
The design system utilizes **Inter** for its exceptional legibility in data-dense environments. The hierarchy is intentionally steep to help senior management distinguish between high-level summaries and granular details.

- **KPI Values:** Use `kpi-value` for hero numbers on dashboard cards.
- **Labels:** Use `label-md` for small descriptors or axis titles in charts, employing uppercase styling for structural clarity.
- **Executive Summary:** Use `body-lg` for the AI Advisor panel to ensure long-form text is comfortable for reading during briefings.

## Layout & Spacing
The design system follows a **Fixed-Fluid Hybrid** model. The main navigation sidebar and the AI Advisor panel are fixed-width anchors, while the central data canvas is fluid to maximize screen real estate on executive ultra-wide monitors.

- **Grid:** A 12-column system is used within the central canvas for KPI card placement.
- **Breakpoints:** 
  - **Desktop (1440px+):** Full 3-pane view (Sidebar + Dashboard + AI Panel).
  - **Tablet (1024px):** AI Panel becomes a collapsible overlay.
  - **Mobile (768px):** Single column stack with a simplified KPI summary.
- **Whitespace:** Generous `margin-page` and `stack-lg` units are mandated to prevent the interface from feeling "crowded," which is essential for high-stress decision-making environments.

## Elevation & Depth
This design system uses **Tonal Layers** with very soft **Ambient Shadows** to create a structured hierarchy without visual clutter.

- **Level 0 (Canvas):** `#F8F9FA` background, no shadow.
- **Level 1 (Cards/Sidebar):** Pure white background with a 1px border in `#E9ECEF` and a subtle shadow (Blur: 8px, Y: 4px, Color: `rgba(0,0,0,0.04)`).
- **Level 2 (Popovers/Modals):** Pure white with a more pronounced shadow (Blur: 20px, Y: 10px, Color: `rgba(0,0,0,0.08)`) to indicate focus.
- **AI Advisor Panel:** Uses a soft backdrop blur (Glassmorphism) when overlaid on mobile, but remains a solid Level 1 surface on desktop to maintain a professional, stable appearance.

## Shapes
The design system employs a **Soft** shape language. This subtle rounding (4px - 8px) takes the edge off the technical data visualization, making the dashboard feel modern and approachable while maintaining a serious, institutional character.

- **KPI Cards:** Use `rounded-lg` (8px) to frame metrics clearly.
- **Buttons & Inputs:** Use base roundedness (4px) for a crisp, precise look.
- **Selection Indicators:** Sidebar active states use a vertical "pill" indicator on the leading edge rather than fully rounded corners for the menu item itself.

## Components
- **KPI Cards:** White surfaces with a top-border accent color reflecting the status (Blue, Green, Amber, or Red). Include a small sparkline for 30-day trends.
- **Vertical Sidebar:** A dark blue (`#003366`) or very light grey (`#F8F9FA`) sidebar with clear, high-contrast icons. Use active-state highlighting in `#0072BC`.
- **AI Management Assistant:** A dedicated right-hand panel with a distinct header. Use `body-lg` for AI-generated insights. Use subtle "Advisor" cues like a specific iconography set (e.g., sparkle or brain icons) in the UNFPA Orange accent.
- **Status Badges:** Small, pill-shaped indicators using low-opacity versions of the status colors with high-contrast text for accessibility.
- **Data Tables:** High-density but clean. Remove vertical lines; use subtle horizontal dividers. Header rows should be in `label-md` style with a light grey background.
- **Primary Buttons:** Solid `#FF6600` for urgent actions; `#0072BC` for standard executive actions.