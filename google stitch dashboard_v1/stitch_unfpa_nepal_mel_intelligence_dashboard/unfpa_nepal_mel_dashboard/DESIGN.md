---
name: UNFPA Nepal MEL Dashboard
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
  on-surface-variant: '#43474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#a33e00'
  on-secondary: '#ffffff'
  secondary-container: '#fe6500'
  on-secondary-container: '#541d00'
  tertiary: '#001f3f'
  on-tertiary: '#ffffff'
  tertiary-container: '#003463'
  on-tertiary-container: '#4f9efd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb596'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7c2e00'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004785'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  canvas-aspect-ratio: '16:9'
  sidebar-width-expanded: 260px
  sidebar-width-collapsed: 72px
  grid-gutter: 24px
  container-padding: 32px
  component-gap: 16px
---

## Brand & Style
The design system is engineered to convey **diplomatic authority, precision, and operational transparency**. As an executive-facing MEL (Monitoring, Evaluation, and Learning) tool for UNFPA Nepal, the aesthetic prioritizes information density without clutter, ensuring senior management can derive "at-a-glance" insights.

The style is **Corporate / Modern**, utilizing a high-fidelity "canvas" approach. It balances the institutional weight of the United Nations with a contemporary digital-first interface. The visual language is characterized by a "Clear-View" philosophy: maximizing the data-to-ink ratio through generous whitespace, surgical use of color for status signaling, and a structured hierarchy that guides the executive eye from high-level KPIs to granular localized data.

## Colors
The palette is rooted in the UNFPA identity, adapted for high-performance data visualization.

- **Primary (Deep Navy):** Used for structural elements like the sidebar, primary headings, and the foundation of data visualizations. It represents stability and institutional trust.
- **Secondary (UNFPA Orange):** Reserved strictly for Call-to-Actions (CTAs) and critical "Alert" highlights. It should never be used for large backgrounds to prevent visual fatigue.
- **Tertiary (Royal Blue):** Used for interactive elements like links and active tab states to differentiate from the static Navy structure.
- **Background & Surfaces:** The main canvas uses a very light grey (#F8F9FA) to reduce glare, while functional cards use pure White (#FFFFFF) to create a clear "layered" effect.
- **Status Tones:** A muted semantic palette (Green, Amber, Red) is used for indicator lights and progress bars, ensuring they draw attention without clashing with the primary blue.

## Typography
**Inter** is the sole typeface for this design system to ensure maximum legibility and a systematic, technical feel.

- **Data Hierarchy:** The `display-lg` style is dedicated specifically to high-level metric counts (e.g., total reach or budget utilization percentages).
- **Navigation & Labels:** The `label-sm` style uses a slight tracking increase and uppercase transform for secondary metadata and table headers, creating clear separation from primary content.
- **Readability:** Line heights are set generously to ensure that even data-dense tables remain scannable for senior officials during rapid reviews.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid** optimized for a 16:9 aspect ratio, common in boardroom displays and executive laptops.

- **Sidebar:** A left-aligned, collapsible navigation bar. When expanded, it provides full context; when collapsed, it provides more horizontal breathing room for complex data tables.
- **Top Filter Bar:** A persistent horizontal bar sits at the top of the canvas, containing global dropdowns (Region, Fiscal Year, Program Area). This ensures all data on the screen is always contextualized.
- **The Grid:** A 12-column system is used within the main content area.
    - **Executive Summary:** 3 or 4 columns per KPI card.
    - **Main Charts:** 8 columns for primary visuals, with a 4-column "Insight Panel" to the right.
- **Spacing Rhythm:** An 8px base unit is used. 24px gutters provide significant separation between cards to prevent cognitive overload.

## Elevation & Depth
Depth in this design system is used functionally to separate the "Canvas" from "Interactive Units."

- **Level 0 (Background):** The Light Grey (#F8F9FA) foundation.
- **Level 1 (Cards):** Pure white surfaces with a 1px border (#E2E8F0) and a very soft, high-diffusion shadow (`0px 4px 20px rgba(0, 0, 0, 0.03)`). This creates a subtle "lift" that makes data components feel modular.
- **Level 2 (Modals/Dropdowns):** Higher contrast shadows to indicate temporary interaction layers that sit above the dashboard content.
- **Insight Panels:** These use a "Tonal Layer" approach rather than elevation. They are recessed blocks of soft blue (#F0F7FF) or grey to indicate supplementary AI-generated narratives or management summaries, distinguishing them from the raw statistical cards.

## Shapes
The shape language is professional and refined, avoiding extreme "playful" roundness while ensuring the interface feels modern and approachable.

- **Standard Radius:** 8px for standard UI elements (Buttons, Input fields).
- **Large Radius:** 12px for primary Dashboard Cards and Insight Panels.
- **Charts:** Bar charts should use a very slight top-corner radius (2px) to soften the data visual without compromising the precision of the coordinate reading.

## Components
- **Cards:** White background, 12px radius. Every card must have a title in `headline-md` and a "More Info" icon or action in the top-right corner.
- **Charts:** Use the Primary Blue for main data series. For comparative data, use shades of the primary blue (e.g., 60% opacity) rather than introducing new colors. Use the Status Palette only for "Target vs. Actual" performance metrics.
- **Navigation:** Sidebar uses white icons on the navy background. The active state is indicated by a 4px UNFPA Orange vertical bar on the left edge of the menu item.
- **Insight Panels:** Styled as "Management Summaries." These utilize a light-tinted background and a specific icon (e.g., a sparkle or document icon) to denote non-statistical, qualitative information.
- **Filters:** Dropdowns are minimal, using a 1px border. When active, the border shifts to Primary Blue.
- **Buttons:**
    - **Primary:** Solid Primary Blue with white text.
    - **Secondary:** Ghost style (Navy border and text).
    - **Action/CTA:** Solid UNFPA Orange (used only for "Submit Report" or "Export Data").