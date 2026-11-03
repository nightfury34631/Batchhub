---
name: BatchHub
description: Centralized Academic Management & Collaboration Platform
colors:
  primary: "#2EE59D"
  primary-hover: "#26C988"
  primary-soft: "rgba(46, 229, 157, 0.12)"
  primary-border: "rgba(46, 229, 157, 0.25)"
  bg-canvas: "#0B1418"
  surface-card: "#111D22"
  surface-hover: "#15242B"
  surface-inner: "#0E181C"
  border-subtle: "#1A2F37"
  text-primary: "#FFFFFF"
  text-secondary: "#D9E3E7"
  text-muted: "#7B949E"
  text-dim: "#5C747D"
  nav-active-bg: "#183038"
  danger: "#F87171"
  danger-soft: "rgba(248, 113, 113, 0.12)"
  warning: "#FBBF24"
  warning-soft: "rgba(251, 191, 36, 0.12)"
  info: "#38BDF8"
  info-soft: "rgba(56, 189, 248, 0.12)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.3px"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.3px"
rounded:
  sm: "8px"
  pill: "12px"
  card: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg-canvas}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-inner}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card-standard:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.card}"
    padding: "22px"
  input-standard:
    backgroundColor: "{colors.surface-inner}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
---

# Design System: BatchHub

## Overview

**Creative North Star: "The Nocturnal Observatory"**

BatchHub is designed as a calm, dark-adapted academic workspace built for deep concentration, night-owl study cycles, and high-signal cohort collaboration. The interface treats screen real estate like a precision instrument: dark oceanic obsidian surfaces recede into the background, allowing vital deadlines, urgent announcements, and peer project activity to emerge as luminous mint and emerald beacons.

Rather than relying on flashy gradients, bright white backgrounds, or overbearing neon gamification, BatchHub commands attention through typographic hierarchy, disciplined spatial rhythm, and restrained electric mint accents. Every surface communicates institutional reliability paired with modern SaaS elegance.

**Key Characteristics:**
- **Nocturnal Tonal Depth:** Multi-tiered slate-obsidian backgrounds (`#0B1418`, `#0E181C`, `#111D22`) create spatial hierarchy without heavy shadows.
- **Selective Luminous Accents:** Vivid mint (`#2EE59D`) is reserved strictly for high-value interactive anchors, active routes, and primary actions.
- **Refined Pill-Form Geometry:** Gentle 12px pill curves and 16px container radiuses impart tactile softness while preserving academic seriousness.
- **Anti-References:** Cluttered multi-color student templates, flashy gamer neon, and bureaucratic institutional LMS tables.

## Colors

The palette pairs deep, non-fatiguing dark obsidian backgrounds with targeted emerald and state-signaling accents.

### Primary
- **Vivid Mint** (#2EE59D): The signature system beacon. Used exclusively for primary call-to-action buttons, active navigation indicators, unread notification dots, and key progress metrics.
- **Mint Hover** (#26C988): Darker emerald used on primary button hover states.
- **Mint Soft Tint** (rgba(46, 229, 157, 0.12)): Background fill for primary badges, active filters, and subtle highlight containers.
- **Mint Border Glow** (rgba(46, 229, 157, 0.25)): Stroke highlight on focused inputs and card hover states.

### Secondary
- **Deep Marine Slate** (#183038): High-contrast active navigation background that anchors the active route without high brightness.

### Neutral
- **Obsidian Canvas** (#0B1418): Global application background and sticky navigation header baseline.
- **Elevated Card Surface** (#111D22): Primary container background for widgets, modular cards, and dialog bodies.
- **Hover Card Surface** (#15242B): Dynamic hover reaction color for interactive cards and toolbar items.
- **Deep Inset Surface** (#0E181C): Inset background for form inputs, search fields, and nested metric strips.
- **Subtle Slate Border** (#1A2F37): The primary architectural boundary for dividing cards, rows, and modal dialogs.
- **Pure White** (#FFFFFF): Primary headings, card titles, and high-emphasis data values.
- **Soft Cloud Text** (#D9E3E7): Secondary text, labels, and standard form values.
- **Muted Steel** (#7B949E): Body paragraphs, descriptions, placeholder text, and inactive icons.
- **Dim Slate** (#5C747D): Timestamps, keyboard shortcut hints, and structural breadcrumb dividers.

### State Accents
- **Urgent Coral** (#F87171): Deadline overdue warnings, destructive deletion buttons, and rejection states.
- **Amber Warning** (#FBBF24): Pending approvals, due-today reminders, and caution notices.
- **Sky Info** (#38BDF8): Information tags, study material resource indicators, and link badges.

### Named Rules
**The Rarity Rule.** Vivid Mint (#2EE59D) must cover ≤ 10% of any viewport. Its power comes from restraint; when everything glows, nothing is urgent.
**The No-White-Surface Rule.** Pure white (#FFFFFF) is strictly for typography and icons; it is never used as a background container color.

## Typography

**Display & Body Font:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif`
**Label/Mono Font:** System Monospace / Tabular Sans for numerical metrics and keyboard tags (`kbd`).

**Character:** Disciplined, contemporary geometric clarity with generous letter-spacing on small uppercase labels and tight tracking on bold headlines.

### Hierarchy
- **Display** (700 weight, 26px, 1.2 line-height, -0.5px tracking): Welcome greetings, primary metric values, and dashboard page anchors.
- **Headline** (700 weight, 20px, 1.3 line-height, -0.3px tracking): View headers, major section divisions, and modal titles.
- **Title** (700 weight, 16px, 1.35 line-height): Card headers, announcement titles, and widget names.
- **Body** (400 weight, 13.5px, 1.5 line-height, max line length 72ch): Narrative descriptions, announcement bodies, task instructions, and user metadata.
- **Label** (700 weight, 11.5px, 1.2 line-height, 0.3px tracking, uppercase optional): Status badges, table column headers, and category tags.

### Named Rules
**The Tabular Figures Rule.** All deadlines, countdowns, timestamps, and metric counts must render with consistent character widths to avoid layout jitter.

## Layout

BatchHub operates on a fixed-shell, fluid-interior desktop layout tailored for 1024px to 1440px+ workstations with a mobile overlay fallback.

- **Icon Rail & Hover Drawer Sidebar:** Compact 68px icon rail on desktop that expands to 220px on mouse hover with smooth `cubic-bezier(0.4, 0, 0.2, 1)` easing, keeping the main content canvas wide and unobstructed.
- **Sticky Topbar:** Fixed 64px header containing unified breadcrumbs, debounced global search box (max 480px), Quick Create (`+ Create`) dropdown, Notification Center, and User profile menu.
- **View Container:** Centered maximum width container (`max-width: 1400px`) with 28px–36px horizontal padding and 22px–24px vertical section gap.
- **Card Grid:** Dynamic responsive CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) with 20px gutters for projects, announcements, and tasks.

## Elevation & Depth

BatchHub uses **tonal layering and border illumination** rather than heavy drop shadows. Surfaces feel machined and flush, stepping up in perceived elevation through progressively lighter background values.

Depth hierarchy:
1. **Canvas Layer** (`#0B1418`): The bottommost foundation.
2. **Card Layer** (`#111D22` with 1px `#1A2F37` border): Resting container level.
3. **Hover Layer** (`#15242B` with 1px `rgba(46, 229, 157, 0.25)` border): Interactive reaction level.
4. **Floating Overlays** (`#111D22` with `box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65)`): Modals, dropdown menus, and global search results.

### Named Rules
**The Glow-Over-Shadow Rule.** Never use diffuse colored drop shadows under cards. Convey focus and selection with a 1px border stroke tint (`var(--primary-mint-border)`) rather than fuzzy outer glows.

## Shapes

- **Base Radius:** 8px (`--radius-sm`) for inner tags, compact action buttons, and keyboard badges.
- **Control Radius:** 12px (`--radius-pill`) for primary buttons, form inputs, navigation items, and search bars.
- **Card Radius:** 16px (`--radius-card`) for modular containers, widget blocks, and modal dialogs.
- **Full Radius:** 9999px for avatar circles, unread count badges, and pill tags.
- **Strokes:** Consistent 1px solid borders throughout. Dotted/dashed borders are reserved solely for CR elevated affordances (`.cr-panel-link`) and empty state placeholders (`.empty-state-box`).

## Components

### Primary Button
- **Shape:** Pill-curved (12px radius).
- **Appearance:** Background `#2EE59D`, text `#0B1418`, weight 700, padding `9px 18px`.
- **States:** Hover background `#26C988`, active transform `scale(0.98)`.

### Secondary Button
- **Shape:** Pill-curved (12px radius).
- **Appearance:** Background `#0E181C`, border 1px `#1A2F37`, text `#D9E3E7`, weight 600, padding `9px 16px`.
- **States:** Hover background `#15242B`, text `#FFFFFF`, border-color `rgba(255, 255, 255, 0.15)`.

### Cards & Containers
- **Shape:** Rounded 16px (`--radius-card`), padding 22px.
- **Appearance:** Background `#111D22`, border 1px `#1A2F37`.
- **Hover State:** Background `#15242B`, border-color `rgba(46, 229, 157, 0.25)`.

### Form Fields & Inputs
- **Shape:** Rounded 12px, padding `10px 14px`.
- **Appearance:** Background `#0E181C`, border 1px `#1A2F37`, text `#FFFFFF`, font-size 13.5px.
- **Focus State:** Border-color `#2EE59D` with zero browser-default outline rings.

### Badges & Status Chips
- **Shape:** Rounded 6px, padding `4px 10px`, font-size 11.5px, font-weight 700.
- **Variants:**
  - *Emerald (Active / Approved):* Background `rgba(46, 229, 157, 0.12)`, text `#2EE59D`, border `rgba(46, 229, 157, 0.25)`.
  - *Warning (Pending / Due Soon):* Background `rgba(251, 191, 36, 0.12)`, text `#FBBF24`, border `rgba(251, 191, 36, 0.3)`.
  - *Danger (Overdue / Rejected):* Background `rgba(248, 113, 113, 0.12)`, text `#F87171`, border `rgba(248, 113, 113, 0.3)`.

### Modal Dialogs
- **Overlay:** Fixed fullscreen `rgba(0, 0, 0, 0.72)` with `backdrop-filter: blur(4px)`.
- **Dialog Box:** Width 90% (max 520px), background `#111D22`, border 1px `#1A2F37`, radius 16px, shadow `0 20px 48px rgba(0, 0, 0, 0.6)`.

## Do's and Don'ts

### Do:
- **Do** use tonal surface step-ups (`#0B1418` → `#0E181C` → `#111D22` → `#15242B`) to express hierarchy.
- **Do** reserve `#2EE59D` for primary calls-to-action, active indicators, and critical badges.
- **Do** use 1px subtle borders (`#1A2F37`) to separate adjacent dark sections cleanly.
- **Do** provide instant feedback via toast messages or inline state transitions rather than native browser `alert()`.
- **Do** maintain a consistent 12px pill radius on interactive inputs and buttons.

### Don't:
- **Don't** use multi-color neon gradients or rainbow accents across cards.
- **Don't** use pure black (`#000000`) or pure white (`#FFFFFF`) for background container surfaces.
- **Don't** allow primary mint accents to exceed 10% of the visible viewport area.
- **Don't** use heavy colored drop shadows under resting cards.
- **Don't** display raw database timestamps without humanized formatting (e.g., "Oct 24, 2026").
