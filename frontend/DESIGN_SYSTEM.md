# SolarPredict Design System Specification

## 1. Design Philosophy: Apple / Google / Stripe Minimalism
- **One Hero Statement per Screen**: Bold visual anchors, generous white-space, calm breathing room.
- **Elevation over Borders**: Surfaces defined by subtle soft shadows and tonal contrasts (`0 1px 3px rgba(0,0,0,0.06)`), eliminating heavy borders and neon outlines.
- **Disciplined Color Budget**:
  - **Neutrals**: True off-whites in light mode (`#F8F9FA` / `#FFFFFF`), true dark neutrals in dark mode (`#0B0D10` / `#13161B`).
  - **Single Accent**: Solar Amber (`#F59E0B` in light, `#FB923C` in dark) reserved strictly for primary interactive actions, active navigation indicator, and the primary key metric anchor.
  - **Semantic Accents**: Subtle Emerald (`#10B981`) for savings/eco gains, Crimson (`#EF4444`) for errors, Slate Blue (`#6366F1`) for secondary informational metrics.
- **Human-Readable Typography**: Single unified family (`Inter`), clear hierarchy without all-caps shouting or small-caps clutter.

---

## 2. Color System & Semantic Tokens

| Token | Light Mode (`html:not(.dark)`) | Dark Mode (`html.dark`) | Purpose |
| :--- | :--- | :--- | :--- |
| `--surface-bg` | `#F8F9FA` (Soft warm-tinted off-white) | `#0B0D10` (True neutral deep black) | Screen background |
| `--surface-card` | `#FFFFFF` (Pure white) | `#14171D` (Calm slate-black elevated) | Card & panel background |
| `--surface-subtle` | `#F1F3F5` (Elevated neutral) | `#1C2028` (Subtle dark surface) | Input fields, pills, secondary elements |
| `--border-subtle` | `rgba(0, 0, 0, 0.07)` | `rgba(255, 255, 255, 0.08)` | Minimum hairline boundary |
| `--text-primary` | `#111827` (Near-black, high contrast) | `#F3F4F6` (Near-white, crisp) | Headlines, primary data numbers |
| `--text-secondary`| `#4B5563` (Neutral slate-600) | `#9CA3AF` (Muted neutral) | Explanations, sub-metrics, descriptions |
| `--text-muted` | `#6B7280` (Muted gray) | `#6B7280` (Low priority label) | Footers, captions, metadata |
| `--accent-primary` | `#D97706` (Restrained warm amber) | `#F59E0B` | Primary CTA, key hero number |
| `--accent-surface` | `rgba(217, 119, 6, 0.08)` | `rgba(245, 158, 11, 0.12)` | Active tab pill, subtle focus ring |
| `--semantic-success`| `#059669` (Forest emerald) | `#10B981` | Bill savings, trees, payback |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 6px 16px -2px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.4), 0 8px 24px -4px rgba(0,0,0,0.5)` | Elevation depth |
| `--shadow-elevated`| `0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 25px -5px rgba(0,0,0,0.06)` | `0 12px 32px -4px rgba(0,0,0,0.6)` | Modals, bottom popovers |

---

## 3. Typography Scale (Inter)

- **Landing Headline**: `text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight` (Line height: 1.1)
- **Section / Page Title**: `text-2xl sm:text-3xl font-bold tracking-tight text-primary`
- **Card Big Number (Anchor)**: `text-3xl sm:text-4xl font-extrabold tracking-tight font-sans`
- **Card Subtitle / Metric Label**: `text-xs sm:text-sm font-medium text-secondary` (Sentence case, never all-caps letter-spaced)
- **Body Text**: `text-base font-normal leading-relaxed text-secondary`
- **Footnotes / Meta**: `text-xs font-normal text-muted`

---

## 4. Spacing, Elevation & Component Rules

1. **8pt Grid Discipline**: All padding & margins are multiples of 8px (`p-4`=16px, `p-6`=24px, `p-8`=32px, `gap-6`=24px).
2. **Cards**:
   - `rounded-2xl` (16px radius).
   - Solid neutral background (`--surface-card`) + soft shadow (`--shadow-card`).
   - Hairline border (`1px solid var(--border-subtle)`) for crisp definition without visual heaviness.
   - Internal padding: minimum 24px desktop, 16px mobile.
3. **Buttons**:
   - **Primary CTA**: Solid warm solar amber background, pure white text, `rounded-xl` or `rounded-full`, soft ambient shadow on hover. No border outlines.
   - **Secondary Button**: Flat neutral surface (`--surface-subtle`), `text-primary`, subtle hover elevation.
   - **Ghost Action**: Transparent background, `text-secondary` transitioning to `text-primary` on hover.
4. **Theme Switcher**:
   - Global Theme Context persisted in `localStorage` supporting instant toggle between Light and Dark mode with smooth CSS variable transitions.
5. **Loading Experience**:
   - Replaces the busy checklist with a minimal, centered pulse animation and calm status text (Apple "Setting up..." pattern).
