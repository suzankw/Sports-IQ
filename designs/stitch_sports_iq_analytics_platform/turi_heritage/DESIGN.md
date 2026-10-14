---
name: Turi Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5a413d'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e706c'
  outline-variant: '#e2bfb9'
  surface-tint: '#b22b1d'
  primary: '#570000'
  on-primary: '#ffffff'
  primary-container: '#800000'
  on-primary-container: '#ff8371'
  inverse-primary: '#ffb4a8'
  secondary: '#3e5d9b'
  on-secondary: '#ffffff'
  secondary-container: '#9dbbff'
  on-secondary-container: '#294a86'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cba72f'
  on-tertiary-container: '#4e3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#8f0f07'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#244581'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
  turi-maroon: '#800000'
  royal-navy: '#335390'
  crest-gold: '#D4AF37'
  highland-mist: '#F4F4F4'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  container-max: 1280px
---

## Brand & Style
The design system embodies the "Turi Spirit"—a prestigious blend of British academic tradition and the resilient character of the Kenyan highlands. It is designed for an elite audience of parents, alumni, and educators who value heritage, character-driven leadership, and excellence.

The aesthetic follows a **Modern Traditional** movement. It utilizes high-quality serif typography and a structured, formal layout to evoke authority and permanence. Subtle textures reminiscent of high-altitude landscapes and traditional crests are paired with a clean, airy interface to ensure the heritage feels living and forward-looking rather than archaic. The emotional response is one of deep trust, aspiration, and disciplined excellence.

## Colors
The palette is rooted in the school's heraldic colors. **Turi Maroon** serves as the primary brand anchor, used for key actions and headers to signal strength and tradition. **Royal Navy** provides a professional secondary balance, ideal for academic information and structural elements. **Crest Gold** is reserved for accents, awards, and premium highlights.

The background uses **Highland Mist** (#F4F4F4) to reduce the harshness of pure white, providing a paper-like quality that complements the academic theme. Typography is primarily **Ebony** (#212121) to ensure high legibility while maintaining a softer feel than pure black.

## Typography
The system uses **Source Serif 4** for both headlines and body copy to reinforce a prestigious, literary, and academic atmosphere. Large display headings use tighter letter spacing and heavy weights to project authority. 

For functional interface elements, **Inter** is introduced as a supporting sans-serif. It is used exclusively for labels, navigation items, and small metadata to ensure clarity and modern utility without distracting from the classic serif narrative. All labels should be set in uppercase with a slight tracking increase to maintain a sophisticated, curated feel.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to mirror the structured nature of the institution. Content is centered within a 1280px container using a 12-column system. On mobile, the system transitions to a fluid 4-column layout.

Spacing is generous, favoring "white space as a luxury." Sections are separated by large vertical buffers (80px–120px) to allow the content to breathe. Use an 8px base grid for all internal component dimensions to ensure mathematical harmony across the interface.

## Elevation & Depth
Elevation is conveyed through **Tonal Layers** and **Soft Ambient Shadows**. Instead of heavy shadows, the system uses subtle shifts in background color (e.g., placing a white card on a Highland Mist background) to define hierarchy.

Where depth is required for interactive elements like modals or floating menus, use a "Legacy Shadow": a very soft, large-radius blur (20-40px) with low opacity (5-8%) and a slight navy tint. This creates a subtle lift that feels natural and non-digital. Avoid all harsh borders or high-contrast shadows.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding removes the clinical sharpness of square corners while maintaining a formal, architectural structure. 

Buttons and input fields should utilize this consistent small radius. Circular shapes are permitted only for user avatars or specific badge elements. High-altitude "performance" sections may use sharp 90-degree corners for images to evoke a sense of precision and discipline.

## Components
- **Buttons:** Primary buttons use a solid Turi Maroon fill with white text. Secondary buttons use a Navy outline. Tertiary buttons are text-only with a gold underline on hover.
- **Cards:** Cards should have a white background, a 1px Highland Mist border, and no shadow. The header of the card may feature a subtle 4px top border in Crest Gold.
- **Input Fields:** Use a traditional "form" feel with a light gray border and Inter labels. Focus states should be indicated by a 2px Royal Navy border.
- **Chips/Badges:** Used for "House" names or sports categories. They should use a light tint of the secondary color (Navy) with dark text.
- **Lists:** Use elegant dividers (0.5px thickness) and generous vertical padding. Bullet points should be replaced with a small gold diamond or square icon for a more bespoke feel.
- **Heritage Elements:** Incorporate a "Signature" component—a specialized block for quotes or headmaster messages that uses a larger italicized Source Serif 4 font and a decorative gold left-border.