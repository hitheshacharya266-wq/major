---
name: Premium Service Ethos
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4949'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a79'
  outline-variant: '#bcc9c8'
  surface-tint: '#006a69'
  primary: '#006a69'
  on-primary: '#ffffff'
  primary-container: '#0ea5a4'
  on-primary-container: '#003333'
  inverse-primary: '#5ed9d7'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#565e74'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c94ac'
  on-tertiary-container: '#252d41'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7df5f4'
  primary-fixed-dim: '#5ed9d7'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#00504f'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-end SaaS environment, blending the reliability of enterprise software with the fluid aesthetics of modern consumer tech. The brand personality is professional, trustworthy, and precise.

The visual style follows a **Corporate / Modern** aesthetic with **Glassmorphic** accents. It prioritizes clarity and functional elegance, utilizing high-quality whitespace, subtle depth, and a refined color palette to evoke a sense of premium service and operational excellence. The emotional response is one of calm confidence and efficiency.

## Colors
The palette is rooted in a refined Teal and Emerald spectrum, optimized for professional SaaS interfaces.

- **Primary (#0EA5A4):** Used for primary actions, active states, and brand markers.
- **Secondary (#10B981):** An Emerald green used for success states and positive growth indicators.
- **Tertiary (#0F172A):** A deep Slate used for high-contrast typography and dark-mode foundations.
- **Neutral (#64748B):** A balanced Slate-grey for body text, borders, and secondary information.

The background uses a subtle off-white (#F8FAFC) to reduce eye strain, while interactive elements leverage the primary teal with varying luminosity for hover and pressed states.

## Typography
This design system utilizes **Plus Jakarta Sans** across all levels to maintain a friendly yet geometric and professional tone. 

The type scale is rigorous, using a modular scale to ensure hierarchy. Headlines feature slight negative letter-spacing to appear tighter and more "premium" at large sizes. Body text is optimized for readability with generous line-heights. Labels use a medium weight to distinguish them from standard body copy, ensuring they remain legible at smaller scales.

## Layout & Spacing
The layout is based on an **8px linear grid system**. All dimensions, padding, and margins must be multiples of 8px to ensure mathematical harmony across the UI.

- **Desktop:** A 12-column fluid grid with 24px gutters and a maximum container width of 1280px.
- **Tablet:** An 8-column grid with 16px gutters and 24px side margins.
- **Mobile:** A 4-column grid with 16px gutters and 16px side margins.

Horizontal spacing between logical groups should default to `xl` (32px), while internal component padding should utilize `md` (16px) or `lg` (24px).

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layers** and **Ambient Shadows**.

1.  **Base Layer:** The lowest level (#F8FAFC), used for the main application background.
2.  **Surface Layer:** White (#FFFFFF) surfaces for cards and containers, featuring a subtle 1px border (#E2E8F0).
3.  **Raised State:** Components like buttons or active cards use a soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
4.  **Overlay Layer:** Modals and dropdowns utilize **Glassmorphism**. Surfaces feature `backdrop-filter: blur(12px)` with a semi-transparent white background (`rgba(255, 255, 255, 0.8)`). Shadows here are more pronounced to suggest significant vertical distance.

## Shapes
The shape language is modern and approachable. A standard `rounded-lg` (16px) is the baseline for most components, while `rounded-xl` (24px) is reserved for large containers and cards to emphasize the "friendly" premium aesthetic.

Small components like checkboxes or tags should use `rounded-md` (8px) to maintain a consistent radius-to-size ratio.

## Components
Consistent styling across the application ensures a cohesive user experience.

- **Buttons:** Primary buttons use a solid Teal (#0EA5A4) fill with white text. They feature a subtle inner top-light border to simulate a 3D "soft press" look. Secondary buttons use a transparent background with a 1px border (#E2E8F0) and transition to a light teal tint on hover.
- **Cards:** Premium cards are white with a 1px neutral-200 border and 24px of padding. They should use `rounded-xl` (24px). On hover, cards transition to a slightly deeper ambient shadow.
- **Input Fields:** Use a 16px corner radius. The border is a light slate (#CBD5E1), which transitions to a 2px Teal (#0EA5A4) stroke on focus. Background is white or a very light gray (#F1F5F9).
- **Navigation Bar:** A clean, minimal top bar. Use a glassmorphic background (`blur(12px)`) with a subtle bottom border (#E2E8F0). Navigation links use `label-md` typography with a teal underline or text color change for the active state.
- **Chips/Badges:** Use a pill-shape (full rounded) with a low-opacity background of the primary or secondary color (e.g., Emerald at 10% opacity for "Success" labels).
- **Lists:** Clean rows separated by a 1px hairline divider. Interactive list items should have a soft 8px margin and use a 12px corner radius for their hover-state background.