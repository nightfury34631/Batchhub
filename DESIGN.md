---
name: BatchHub
description: Centralized Academic Management & Collaboration Platform — Midnight Campus Design System
colors:
  primary: "#00D084"
  primary-hover: "#00B875"
  primary-soft: "rgba(0, 208, 132, 0.10)"
  primary-border: "rgba(0, 208, 132, 0.20)"
  bg-canvas: "#0B1316"
  surface-card: "#15242A"
  surface-hover: "#192C34"
  surface-inner: "#0E171B"
  surface-elevated: "#1B2E36"
  border-subtle: "#1F353C"
  text-primary: "#FFFFFF"
  text-secondary: "#D2DFE5"
  text-muted: "#7E96A0"
  text-dim: "#546B74"
  nav-active-bg: "rgba(0, 208, 132, 0.12)"
  nav-active-text: "#00D084"
  danger: "#F87171"
  danger-soft: "rgba(248, 113, 113, 0.12)"
  warning: "#FBBF24"
  warning-soft: "rgba(251, 191, 36, 0.12)"
  info: "#38BDF8"
  info-soft: "rgba(56, 189, 248, 0.12)"
  purple: "#A78BFA"
  purple-soft: "rgba(167, 139, 250, 0.12)"
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
  panel: "14px"
  card: "18px"
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

# Design System: BatchHub (Midnight Campus)

## Overview

**Creative North Star: "Midnight Campus — Precision Academic Command"**

BatchHub is designed as a calm, dark-adapted academic workspace built for deep concentration, night-owl study cycles, and high-signal cohort collaboration. The interface treats screen real estate like a precision instrument: dark oceanic slate surfaces recede into the background, allowing vital deadlines, urgent announcements, and peer project activity to emerge as luminous emerald beacons.

Rather than relying on flashy gradients, bright white backgrounds, or overbearing neon gamification, BatchHub commands attention through typographic hierarchy, disciplined spatial rhythm, and restrained electric emerald accents. Every surface communicates institutional reliability paired with modern SaaS elegance.

**Key Characteristics:**
- **Midnight Campus Tonal Depth:** Multi-tiered slate-obsidian backgrounds (`#0B1316`, `#0E171B`, `#15242A`, `#1B2E36`) create spatial hierarchy without heavy drop shadows.
- **Selective Luminous Accents:** Vivid emerald (`#00D084`) is reserved strictly for high-value interactive anchors, active routes, and primary actions.
- **Refined Geometry:** Gentle 12px pill curves, 14px panels, and 18px container radiuses impart tactile softness while preserving academic seriousness.
- **Anti-References:** Cluttered multi-color student templates, flashy gamer neon, and bureaucratic institutional LMS tables.

## Colors

The palette pairs deep, non-fatiguing dark obsidian backgrounds with targeted emerald and state-signaling accents.

### Primary
- **Midnight Emerald** (`#00D084`): The signature system beacon. Used exclusively for primary call-to-action buttons, active navigation indicators, unread notification dots, and key progress metrics.
- **Emerald Hover** (`#00B875`): Darker emerald used on primary button hover states.
- **Emerald Soft Tint** (`rgba(0, 208, 132, 0.10)`): Background fill for primary badges, active filters, and subtle highlight containers.
- **Emerald Border Glow** (`rgba(0, 208, 132, 0.20)`): Stroke highlight on focused inputs and card hover states.

### Secondary
- **Active Navigation Surface** (`rgba(0, 208, 132, 0.12)`): High-contrast active navigation background that anchors the active route.

### Neutral
- **Obsidian Canvas** (`#0B1316`): Global application background and sticky navigation header baseline.
- **Standard Card Surface** (`#15242A`): Primary container background for widgets, modular cards, and dialog bodies.
- **Hover Card Surface** (`#192C34`): Dynamic hover reaction color for interactive cards and toolbar items.
- **Deep Inset Surface** (`#0E171B`): Inset background for form inputs, search fields, and nested metric strips.
- **Elevated Card Surface** (`#1B2E36`): Elevated surface for highlighted cards and modals.
- **Subtle Slate Border** (`#1F353C`): The primary architectural boundary for dividing cards, rows, and modal dialogs.
- **Pure White** (`#FFFFFF`): Primary headings, card titles, and high-emphasis data values.
- **Soft Cloud Text** (`#D2DFE5`): Secondary text, labels, and standard form values.
- **Muted Steel** (`#7E96A0`): Body paragraphs, descriptions, placeholder text, and inactive icons.
- **Dim Slate** (`#546B74`): Timestamps, keyboard shortcut hints, and structural breadcrumb dividers.

### State Accents
- **Coral Red** (`#F87171` / Soft: `rgba(248, 113, 113, 0.12)`): Deadline overdue warnings, destructive deletion buttons, and rejection states.
- **Amber Warning** (`#FBBF24` / Soft: `rgba(251, 191, 36, 0.12)`): Pending approvals, due-today reminders, and caution notices.
- **Sky Info** (`#38BDF8` / Soft: `rgba(56, 189, 248, 0.12)`): Information tags, study material resource indicators, and link badges.
- **Royal Purple** (`#A78BFA` / Soft: `rgba(167, 139, 250, 0.12)`): Collaboration invites, special tags, and role badges.

### Named Rules
- **The Rarity Rule:** Emerald (`#00D084`) must cover ≤ 10% of any viewport. Its power comes from restraint; when everything glows, nothing is urgent.
- **The No-White-Surface Rule:** Pure white (`#FFFFFF`) is strictly for typography and icons; it is never used as a background container color.

## Typography

**Display & Body Font:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif`
**Label/Mono Font:** System Monospace / Tabular Sans for numerical metrics, dates, and keyboard tags (`kbd`).

**Character:** Disciplined, contemporary geometric clarity with generous letter-spacing on small uppercase labels and tight tracking on bold headlines.

### Hierarchy
- **Display** (700 weight, 26px, 1.2 line-height, -0.5px tracking): Welcome greetings, primary metric values, and dashboard page anchors.
- **Headline** (700 weight, 20px, 1.3 line-height, -0.3px tracking): View headers, major section divisions, and modal titles.
- **Title** (700 weight, 16px, 1.35 line-height): Card headers, announcement titles, and widget names.
- **Body** (400 weight, 13.5px, 1.5 line-height, max line length 72ch): Narrative descriptions, announcement bodies, task instructions, and user metadata.
- **Label** (700 weight, 11.5px, 1.2 line-height, 0.3px tracking): Status badges, table column headers, and category tags.

### Named Rules
- **The Tabular Figures Rule:** All deadlines, countdowns, timestamps, and metric counts must render with consistent character widths to avoid layout jitter.

## Layout

BatchHub operates on a fixed-shell, fluid-interior desktop layout tailored for 1024px to 1440px+ workstations with a mobile overlay fallback.

- **Sidebar Navigation:** 240px persistent sidebar on desktop with clean section headers, icon + label navigation links, unread badge counters, and active emerald route indicators.
- **Sticky Topbar:** Fixed 64px header containing unified breadcrumbs, debounced global search box, Quick Create (`+ New`) dropdown, Notification Center, and User profile avatar.
- **View Container:** Centered maximum width container (`max-width: 1400px`) with 28px–36px horizontal padding and 22px–24px vertical section gap.
- **Card Grid:** Dynamic responsive CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) with 20px gutters for projects, announcements, and tasks.

## Elevation & Depth

BatchHub uses **tonal layering and border illumination** rather than heavy drop shadows. Surfaces feel machined and flush, stepping up in perceived elevation through progressively lighter background values.

Depth hierarchy:
1. **Canvas Layer** (`#0B1316`): The bottommost foundation.
2. **Card Layer** (`#15242A` with 1px `#1F353C` border): Resting container level.
3. **Hover Layer** (`#192C34` with 1px `rgba(0, 208, 132, 0.20)` border): Interactive reaction level.
4. **Elevated Layer** (`#1B2E36`): Highlighted cards and panels.
5. **Floating Overlays** (`#15242A` with `box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65)`): Modals, dropdown menus, and global search results.

## Shapes

- **Base Radius:** 8px (`--radius-sm`) for inner tags, compact action buttons, and keyboard badges.
- **Control Radius:** 12px (`--radius-pill`) for primary buttons, form inputs, navigation items, and search bars.
- **Panel Radius:** 14px (`--radius-panel`) for sub-panels and modal content boxes.
- **Card Radius:** 18px (`--radius-card`) for modular containers, widget blocks, and modal dialogs.
- **Full Radius:** 9999px for avatar circles, unread count badges, and pill tags.
- **Strokes:** Consistent 1px solid borders (`#1F353C`) throughout.

## Components

### Primary Button
- **Shape:** Pill-curved (12px radius).
- **Appearance:** Background `#00D084`, text `#0B1316`, weight 700, padding `9px 18px`.
- **States:** Hover background `#00B875`, active transform `scale(0.98)`.

### Secondary Button
- **Shape:** Pill-curved (12px radius).
- **Appearance:** Background `#0E171B`, border 1px `#1F353C`, text `#D2DFE5`, weight 600, padding `9px 16px`.
- **States:** Hover background `#192C34`, text `#FFFFFF`, border-color `rgba(255, 255, 255, 0.15)`.

### Cards & Containers
- **Shape:** Rounded 18px (`--radius-card`), padding 22px.
- **Appearance:** Background `#15242A`, border 1px `#1F353C`.
- **Hover State:** Background `#192C34`, border-color `rgba(0, 208, 132, 0.20)`.

### Form Fields & Inputs
- **Shape:** Rounded 12px, padding `10px 14px`.
- **Appearance:** Background `#0E171B`, border 1px `#1F353C`, text `#FFFFFF`, font-size 13.5px.
- **Focus State:** Border-color `#00D084` with zero browser-default outline rings.

### Badges & Status Chips
- **Shape:** Rounded 8px, padding `4px 10px`, font-size 11.5px, font-weight 700.
- **Variants:**
  - *Emerald (Active / Approved):* Background `rgba(0, 208, 132, 0.10)`, text `#00D084`, border `rgba(0, 208, 132, 0.20)`.
  - *Warning (Pending / Due Soon):* Background `rgba(251, 191, 36, 0.12)`, text `#FBBF24`, border `rgba(251, 191, 36, 0.3)`.
  - *Danger (Overdue / Rejected):* Background `rgba(248, 113, 113, 0.12)`, text `#F87171`, border `rgba(248, 113, 113, 0.3)`.
  - *Purple (Collaboration / Lead):* Background `rgba(167, 139, 250, 0.12)`, text `#A78BFA`, border `rgba(167, 139, 250, 0.3)`.

### Modal Dialogs
- **Overlay:** Fixed fullscreen `rgba(0, 0, 0, 0.72)` with `backdrop-filter: blur(4px)`.
- **Dialog Box:** Width 90% (max 520px), background `#15242A`, border 1px `#1F353C`, radius 18px, shadow `0 20px 48px rgba(0, 0, 0, 0.6)`.

## Do's and Don'ts

### Do:
- **Do** use tonal surface step-ups (`#0B1316` → `#0E171B` → `#15242A` → `#1B2E36`) to express hierarchy.
- **Do** reserve `#00D084` for primary calls-to-action, active indicators, and critical badges.
- **Do** use 1px subtle borders (`#1F353C`) to separate adjacent dark sections cleanly.
- **Do** provide instant feedback via toast messages or inline state transitions.
- **Do** maintain a consistent 12px pill radius on interactive inputs and buttons.

### Don't:
- **Don't** use multi-color neon gradients or rainbow accents across cards.
- **Don't** use pure black (`#000000`) or pure white (`#FFFFFF`) for background container surfaces.
- **Don't** allow primary emerald accents to exceed 10% of the visible viewport area.
- **Don't** use heavy colored drop shadows under resting cards.
- **Don't** display raw database timestamps without humanized formatting (e.g., "Nov 18, 2026").
