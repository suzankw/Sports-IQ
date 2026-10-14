---
name: Elite Athletics Collegiate
colors:
  surface: '#faf9fd'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#af2b3e'
  on-secondary: '#ffffff'
  secondary-container: '#fd6673'
  on-secondary-container: '#680018'
  tertiary: '#180500'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d1500'
  on-tertiary-container: '#b97958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b5'
  on-secondary-fixed: '#40000b'
  on-secondary-fixed-variant: '#8e0f28'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#6c391d'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
  excellence-gold: '#C5A059'
  turi-navy: '#002147'
  turi-red: '#800020'
  heritage-cream: '#F9F8F6'
  grit-mud: '#4E4239'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  motto-italic:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-desktop: 64px
  margin-mobile: 16px
  gutter: 24px
  unit: 8px
  section-gap: 80px
  nav-width: 256px
---

## Brand & Style

The visual identity is rooted in **Modern Collegiate Heritage**. It combines the prestige of traditional academic institutions (like St. Andrew's Turi) with high-performance sports analytics. The style is **Corporate / Modern** with a slight leaning toward **Brutalism** through the use of high-contrast borders and structured grids.

The brand should evoke:
- **Authority:** Trustworthy data for elite coaches and athletes.
- **Precision:** Clean lines and meticulous spacing reflecting technical accuracy.
- **Energy:** High-contrast action photography and bold color accents representing athletic movement.

## Colors

The palette is anchored by "Turi Navy" and "Turi Red," providing a classic, authoritative base. "Excellence Gold" is used strategically as a high-value accent color for top-tier achievements and active states.

- **Primary (Turi Navy):** Used for navigation backgrounds, primary headings, and brand iconography.
- **Secondary (Turi Red):** Used for urgent actions (Live Scores), critical alerts, and trending indicators.
- **Accent (Excellence Gold):** Reserved for elite status indicators, active menu borders, and premium highlights.
- **Surface:** A crisp "Heritage Cream" or pure white is used for card containers to ensure maximum legibility of data.

## Typography

The system utilizes a dual-font strategy. **Source Serif 4** provides an academic, prestigious feel for all major headings and display text. **Montserrat** acts as the functional workhorse, providing high legibility for data, labels, and body copy.

- **Headlines:** Use serif weights for titles.
- **Labels:** Always use Montserrat, frequently in all-caps with generous letter spacing to denote secondary information or categories.
- **Numerical Data:** High-contrast Source Serif is preferred for large stat callouts to maintain the "Elite" aesthetic.

## Layout & Spacing

The system follows a **Fixed Grid** philosophy on desktop with a maximum content width of 1280px.

- **Navigation:** A permanent 256px (64 units) left sidebar combined with a 64px (16 units) top bar.
- **Grid:** A 12-column grid system is used for dashboard layouts.
- **Bento Logic:** Content is organized into discrete cards with 24px gutters.
- **Vertical Rhythm:** Large sections are separated by 80px gaps to allow the data-heavy interface room to breathe.

## Elevation & Depth

The design uses **Low-contrast outlines** and **Tonal layers** rather than heavy shadows.

- **Containers:** Cards use a `1px` border in `outline-variant` (#C4C6CF) to define boundaries.
- **Active State:** The "active" sidebar item uses a high-contrast `4px` left border in Excellence Gold and a slight background tint to create "pseudo-depth" without using Z-axis elevation.
- **Shadows:** Minimal `shadow-sm` is applied only to interactive cards on hover to provide tactile feedback.
- **Overlays:** A gradient overlay (Navy to Transparent) is used on image-heavy cards to ensure text legibility.

## Shapes

The shape language is **Soft and Precise**. 

- **Standard Radius:** Elements like small buttons and stat cards use a subtle `0.25rem` (4px) radius.
- **Icon Containers:** Small utility icons are housed in slightly rounded squares.
- **Avatars:** User profiles and certain sport-type indicators use `full` rounding (circles) to provide a organic contrast to the rigid grid.

## Components

### Buttons
- **Primary:** High-contrast (Red or Navy) with white text. All-caps labels.
- **Tertiary/Nav:** Ghost buttons with Excellence Gold accents for active states.

### Cards
- **Statistical Cards:** Features a `4px` top border in either Navy or Gold to categorize the "type" or "importance" of the stat.
- **Media Cards:** Use full-bleed background images with a dark Navy gradient at the bottom for text overlay.

### Navigation
- **Sidebar Items:** Clean list items with Material Symbols. Active state requires a `4px` right/left border.
- **Top Bar:** Fixed, translucent or high-surface-bright background with a subtle bottom border.

### Inputs
- **Search:** Subtle background fill (`surface-container-low`) with a persistent search icon and `outline-variant` border. No roundedness beyond the standard 4px.