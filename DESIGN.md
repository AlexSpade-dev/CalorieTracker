---
name: Oceanic Abyssal Tracker
colors:
  surface: '#0d0f32'
  surface-dim: '#0d0f32'
  surface-bright: '#34365a'
  surface-container-lowest: '#080a2c'
  surface-container-low: '#16183a'
  surface-container: '#1a1c3e'
  surface-container-high: '#242749'
  surface-container-highest: '#2f3255'
  on-surface: '#e0e0ff'
  on-surface-variant: '#bec8d0'
  inverse-surface: '#e0e0ff'
  inverse-on-surface: '#2b2d50'
  outline: '#88929a'
  outline-variant: '#3e484f'
  surface-tint: '#79d1ff'
  primary: '#79d1ff'
  on-primary: '#003549'
  primary-container: '#1a9bcd'
  on-primary-container: '#002d40'
  inverse-primary: '#006689'
  secondary: '#8ccff2'
  on-secondary: '#003547'
  secondary-container: '#015e7c'
  on-secondary-container: '#93d6f9'
  tertiary: '#b6c4fd'
  on-tertiary: '#1e2e5d'
  tertiary-container: '#808fc4'
  on-tertiary-container: '#172756'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3e8ff'
  primary-fixed-dim: '#79d1ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c68'
  secondary-fixed: '#c0e8ff'
  secondary-fixed-dim: '#8ccff2'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d66'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b6c4fd'
  on-tertiary-fixed: '#051847'
  on-tertiary-fixed-variant: '#354475'
  background: '#0d0f32'
  on-background: '#e0e0ff'
  surface-variant: '#2f3255'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  spacing-3xs: 0.125rem
  spacing-2xs: 0.25rem
  spacing-xs: 0.5rem
  spacing-sm: 0.75rem
  spacing-md: 1rem
  spacing-lg: 1.25rem
  spacing-xl: 1.5rem
  spacing-2xl: 2rem
  spacing-3xl: 2.5rem
  screen-margin-mobile: 1rem
  screen-margin-tablet: 1.5rem
  card-padding: 1.25rem
  bottom-nav-height: 4.5rem
---

## Brand & Style

This design system establishes a high-performance, immersive health tracking experience tailored for mobile users seeking focus, clarity, and precision. The aesthetic merges **Deep Minimalist Oceanic Glass** with functional sports-instrument precision: void-like deep prussian depths combined with bioluminescent ocean-blue telemetry. 

The emotional tone balances calm authority with motivational urgency. Nutrition tracking often creates cognitive fatigue; by placing data in deep, low-luminance navy containers with high-contrast glowing accents, metrics feel effortless to read under any lighting condition. The interface eliminates visual clutter, elevating caloric targets, macro distributions, and consumption timelines to primary visual anchors.

## Colors

The color palette is built strictly for dark mode, creating deep spatial depth through navy tone stratification:

- **Primary Background (`#000022` - Prussian Blue)**: Serves as the canvas floor, mobile app frame, hero headers, and default viewport backdrop.
- **Surface & Containers (`#001242` - Deep Navy)**: Applied to cards, modal sheets, list containers, and inactive input fills. Provides structural separation from the prussian background without jarring edges.
- **Primary Action & Data Active (`#0094C6` - Ocean Blue)**: The core interactive accent. Used for primary CTAs, active segmented toggles, active input rings, macro ring progress indicators, and caloric metric readouts.
- **Secondary Interactive & Accents (`#005E7C` - Baltic Blue)**: Used for secondary actions, chip outlines, unselected macro track paths, icon fills, and subtle hover/pressed states.
- **Structural Outlines & Low-Level Base (`#040F16` - Ink Black)**: Used for card borders, structural dividers, chip surfaces, and contrast insets.
- **Primary Typography (`#FFFFFF` - Pure White)**: Reserved for primary values, macro counts, calorie totals, and high-priority headers.
- **Secondary Typography (`#E0F2FE` - Soft Ice Blue)**: Used for body text, descriptive labels, macro units (g/kcal), and secondary metadata to eliminate harsh white glare while maintaining WCAG AAA contrast against deep navy surfaces.

## Typography

Plus Jakarta Sans is utilized across display, body, and labels for its geometric balance and open letter counters. 

- **Tabular Figures**: All metric styles (`metric-lg`, `metric-md`, and calorie counters) must explicitly declare `font-variant-numeric: tabular-nums` or `font-feature-settings: "tnum" 1`. This prevents layout shifts during rapid value incrementation and maintains vertical alignment across macro breakdowns.
- **Hierarchy Protocol**: Numbers lead. Caloric remainders and gram counts use bold weights (`700` or `800`) in Pure White (`#FFFFFF`). Supplementary nutritional categorizations (carbs, protein, fats, grams, kcal units) rely on `label-sm` or `label-md` in Soft Ice Blue (`#E0F2FE`) with uppercase or semi-expanded tracking.

## Layout & Spacing

The layout is engineered around a fluid vertical column model optimized for single-thumb mobile ergonomics:

- **Grid & Margins**: On mobile viewports (&lt;600px), layouts adhere to a 4-column fluid grid with 16px (`screen-margin-mobile`) exterior safe margins and 12px gutters. On tablets (600px–1024px), the system reflows into an 8-column layout with 24px margins.
- **Spacing Rhythm**: Spacing scales strictly in multiples of 4px and 8px. Functional groupings inside cards maintain 8px (`spacing-xs`) or 12px (`spacing-sm`) interior gaps, while major meal sections maintain 16px (`spacing-md`) to 20px (`spacing-lg`) stacking separation.
- **Bottom Navigation Offset**: Every main view must pad its bottom scroll container by `bottom-nav-height` plus safe area insets to avoid content collision with the fixed bottom tab bar.

## Elevation & Depth

Visual hierarchy uses **Tonal Layering** supplemented with **Low-Contrast Glowing Outlines** instead of traditional drop shadows, avoiding muddy blurs in deep navy spaces:

- **Base Floor (Elevation 0)**: `#000022` (Prussian Blue). Completely flat, solid backdrop.
- **Surface Level 1 (Elevation 1 - Cards, Meal Logs)**: `#001242` (Deep Navy) layered over Prussian Blue, framed with a 1px border of `#040F16` (Ink Black) or an ethereal ambient outline of `rgba(0, 148, 198, 0.12)`.
- **Surface Level 2 (Elevation 2 - Floating Action Sheets, Inset Inputs)**: `rgba(0, 18, 66, 0.85)` with `backdrop-filter: blur(16px)` and a subtle directional top highlight border: `1px solid rgba(224, 242, 254, 0.08)`.
- **Active Metric Glow (Elevation 3)**: Key progress states, primary action buttons, and macro targets emit a localized diffuse glow: `box-shadow: 0 4px 20px -2px rgba(0, 148, 198, 0.35)`.

## Shapes

The geometric architecture relies on **organic, rounded contours** that soften numeric data while retaining structural rigor:

- **Cards and Sheet Containers**: Utilize `rounded-2xl` (1rem to 1.25rem / 16px–20px) to form sleek pods that rest comfortably on modern edge-to-edge mobile displays.
- **Buttons and Selectors**: Primary and secondary CTAs, search bars, and filter chips adopt **full pill geometry** (`border-radius: 9999px`).
- **Inputs & Inset Wells**: Data entry fields, search inputs, and meal segment cells use `12px` to `14px` border radius, creating visual continuity between exterior cards and interior interactions.

## Components

### Buttons
- **Primary CTA**: Full pill shape (`rounded-full`), solid `#0094C6` fill, text `#FFFFFF` (`label-md`), 48px standard touch target height. Glowing elevation (`box-shadow: 0 4px 16px rgba(0, 148, 198, 0.3)`). Pressed state shifts background to `#005E7C`.
- **Secondary Button**: Full pill shape, background `#001242`, border `1px solid #005E7C`, text `#E0F2FE`. Pressed state fills with `rgba(0, 94, 124, 0.25)`.
- **Icon Actions**: 40x40px pill/circle container, background `#040F16`, icon stroke `#0094C6`.

### Cards & Containers
- **Meal & Summary Cards**: Background `#001242`, border `1px solid rgba(4, 15, 22, 0.8)`, `rounded-2xl`, internal padding 20px. 
- **Summary Stat Card**: Houses the central caloric deficit/surplus tally. Subdued linear gradient from `rgba(0, 148, 198, 0.08)` to `rgba(0, 18, 66, 0)` across the top rim.

### Inputs & Search Bars
- **Form Input**: Height 48px, background `#001242`, border `1px solid #040F16`, radius 12px, text `#FFFFFF`, placeholder `#005E7C`.
- **Focused State**: Border shifts dynamically to `#0094C6`, accompanied by an outer halo `box-shadow: 0 0 0 3px rgba(0, 148, 198, 0.2)`.

### Chips & Filter Tags
- Full pill shape, padding `6px 14px`. Inactive: background `#040F16`, border `1px solid rgba(0, 94, 124, 0.4)`, text `#E0F2FE`. Active: background `#0094C6`, border `1px solid #0094C6`, text `#FFFFFF`.

### Macro Nutrient Rings & Progress Bars
- **Macro Progress Rings**: Dual-stroke circular SVGs. Track stroke width 8px in `#001242` or `#040F16`. Active indicator stroke in `#0094C6` (or secondary `#005E7C` for specific macro differentiation), with rounded caps (`stroke-linecap: round`). Centered content displays remaining kcal in `metric-lg`.
- **Horizontal Linear Progress Bars**: Track height 6px, radius 9999px, background `#040F16`. Fill indicator `#0094C6`, transitioning smoothly via CSS `cubic-bezier(0.4, 0, 0.2, 1)`.

### Lists & Meal Entries
- Staggered horizontal item rows inside meal cards. Title in `#FFFFFF` (`body-md`), weight/portion subtext in `#E0F2FE` (`body-sm`), trailing calorie counter in `#0094C6` (`label-md`, tabular figures). Divided by `1px solid rgba(4, 15, 22, 0.6)`.

### Checkboxes & Segmented Selectors
- **Radio & Checkbox**: 22x22px, border `2px solid #005E7C`, radius 6px (or circle for radio). Checked: fill `#0094C6` with crisp white SVG checkmark.

### Bottom Tab Navigation Bar
- Fixed floating or pinned dock with `backdrop-filter: blur(20px)`, background `rgba(0, 0, 34, 0.92)`, border top `1px solid rgba(0, 94, 124, 0.25)`.
- Items: Unselected icons rendered in `#005E7C`; active item highlighted in `#0094C6` with an underlying micro dot indicator (4px) in `#0094C6`. Central "Quick Log" button elevated as a floating pill or circle in solid `#0094C6`.