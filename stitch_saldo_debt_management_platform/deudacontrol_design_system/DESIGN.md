---
name: DeudaControl Design System
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3f484a'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#6f797a'
  outline-variant: '#bfc8c9'
  surface-tint: '#20686f'
  primary: '#004349'
  on-primary: '#ffffff'
  primary-container: '#0d5c63'
  on-primary-container: '#90d2da'
  inverse-primary: '#8fd1d9'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#004712'
  on-tertiary: '#ffffff'
  tertiary-container: '#00611c'
  on-tertiary-container: '#7fdc80'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#abeef6'
  primary-fixed-dim: '#8fd1d9'
  on-primary-fixed: '#002023'
  on-primary-fixed-variant: '#004f55'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#99f899'
  tertiary-fixed-dim: '#7edb7f'
  on-tertiary-fixed: '#002105'
  on-tertiary-fixed-variant: '#005316'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
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
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  kpi-value:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
This design system is built to evoke trust, clarity, and a sense of financial control. The brand personality is professional and institutional yet accessible, moving away from the intimidating nature of traditional banking towards a modern, transparent SaaS experience. 

The aesthetic follows a **Corporate Minimalist** approach. It prioritizes data legibility and functional hierarchy over decorative elements. The UI utilizes ample whitespace to reduce cognitive load—crucial for users managing debt—and relies on a structured grid to convey stability. Visual flourishes are restricted to functional iconography and purposeful color application to signify financial health and status.

## Colors
The palette is anchored by a deep teal primary color, chosen for its association with wisdom and financial stability. 

- **Primary Canvas:** The background uses a very light neutral gray to reduce screen glare during long sessions, while cards and surfaces use pure white to pop forward.
- **Functional Accents:** Color is used strictly for semantic meaning. Success (Green) represents paid installments or improved credit scores; Warning (Amber) signals upcoming due dates; Danger (Red) indicates overdue payments.
- **Interactive States:** Hover states for the primary action color shift toward a darker, high-contrast teal to provide clear affordance without changing the hue.

## Typography
Inter is the exclusive typeface for this design system, chosen for its exceptional legibility in data-dense environments.

- **KPIs & Data:** Large financial figures (COP currency) should use the `kpi-value` or `headline-lg` tokens with a tighter letter spacing to maintain a "locked-in" professional look.
- **Tables:** For data tables, use `body-sm` for row content and `label-md` for headers to create a clear visual distinction.
- **Hierarchy:** Maintain a strict contrast between `text-primary` for headings/amounts and `text-secondary` for descriptions or meta-data.

## Layout & Spacing
The system operates on an **8px linear scale**. All margins, paddings, and component heights must be multiples of 8.

- **Grid:** A 12-column fluid grid is used for desktop (breakpoint 1024px+). For the dashboard view, a fixed sidebar of 260px is recommended, with the remaining content area flowing fluidly.
- **Data Density:** Use `md` (16px) spacing for internal card padding in high-density views, and `lg` (24px) for standard marketing or landing pages.
- **Mobile:** Margins scale down to 16px on mobile devices, with columns collapsing to a single-stack layout.

## Elevation & Depth
Elevation is used sparingly to maintain the minimalist SaaS aesthetic. The system relies on **Tonal Layers** supplemented by subtle shadows.

- **Level 0 (Background):** `#F8FAFA` – The lowest layer.
- **Level 1 (Cards/Surfaces):** `#FFFFFF` – Used for all primary content containers. These feature a `1px` solid border in `#E1E4E6` and a very soft shadow: `0px 2px 4px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Dropdowns/Modals):** These floating elements use a more pronounced shadow to indicate focus: `0px 12px 24px rgba(0, 0, 0, 0.1)`.
- **Interaction:** On hover, interactive cards may increase their shadow depth slightly or shift the border color to the primary teal at 30% opacity.

## Shapes
The shape language is structured and dependable. A default radius of **8px** (0.5rem) is used for standard components like buttons and inputs. Large containers and dashboard cards use a **12px** (rounded-lg) radius to feel more modern and approachable. 

Avoid fully circular "pill" shapes for buttons to maintain the professional, institutional character of the fintech space.

## Components
- **Buttons:** Primary buttons use the Deep Teal background with white text. Secondary buttons use a transparent background with a Teal border. Heights are standardized at 40px (md) and 48px (lg).
- **Cards:** Dashboard cards must include a 12px border-radius and the standard Level 1 shadow. Headers within cards should be separated by the Light Neutral Gray divider.
- **Input Fields:** Fields use a white background, 1px border (`#E1E4E6`), and 8px radius. On focus, the border shifts to the Primary Teal.
- **KPI Tiles:** Special components for displaying "Deuda Total" or "Próximo Pago." These feature a `title-md` label and a `kpi-value` amount.
- **Status Chips:** Small badges with a 4px radius. They use a 10% opacity background of the semantic color (Success/Warning/Danger) with the full-strength color for the text.
- **Data Tables:** Clean lines, no vertical borders. Row hover state uses `#F8FAFA`. Use `Source Code Pro` or a tabular-nums font feature for currency columns to ensure alignment.