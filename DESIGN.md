---
name: Basmet Dawah
description: A day of light, dawn to evening, guiding a new Muslim to their next lesson.
colors:
  page: "#ffffff"
  canvas: "#f6f6fb"
  surface: "#ffffff"
  ink: "#1d2140"
  ink-2: "#4b5070"
  ink-3: "#62677f"
  rule: "#e7e7f0"
  rule-strong: "#8b8fa8"
  wash: "#f1f1f7"
  primary: "#2b3990"
  primary-hover: "#222e78"
  on-primary: "#ffffff"
  primary-tint: "#e9ecfa"
  accent: "#f2b544"
  accent-tint: "#fdf3da"
  accent-text: "#8a5a00"
  sky: "#9cd3ee"
  sky-tint: "#e6f4fb"
  stage1: "#f07c5e"
  stage1-tint: "#ffeee7"
  stage1-text: "#b5472c"
  stage2: "#218358"
  stage2-tint: "#e4f5ec"
  stage2-text: "#1e7a52"
  stage3: "#4b45a8"
  stage3-tint: "#ecebfa"
  stage3-text: "#4b45a8"
  on-stage: "#ffffff"
  on-stage3: "#ffffff"
  danger: "#b42318"
  danger-tint: "#fdecea"
  highlight: "#fde6b0"
typography:
  display:
    fontFamily: "Readex Pro variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.2vw + 1rem, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Readex Pro variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 2.4vw + 1.1rem, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Readex Pro variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 0.8vw + 1.1rem, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Readex Pro variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  meta:
    fontFamily: "Readex Pro variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  arabic-phrase:
    fontFamily: "Amiri, serif"
    lineHeight: 1.7
rounded:
  control: "0.875rem"
  cell: "1.25rem"
  panel: "1.75rem"
  pill: "9999px"
spacing:
  hairline: "1px"
  card-x-mobile: "1.25rem"
  card-x-desktop: "1.75rem"
  section-y-mobile: "2.5rem"
  section-y-desktop: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.wash}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    padding: "0"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.75rem"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3rem"
  stage-chip-1:
    backgroundColor: "{colors.stage1-tint}"
    textColor: "{colors.stage1-text}"
    rounded: "{rounded.pill}"
  stage-chip-2:
    backgroundColor: "{colors.stage2-tint}"
    textColor: "{colors.stage2-text}"
    rounded: "{rounded.pill}"
  stage-chip-3:
    backgroundColor: "{colors.stage3-tint}"
    textColor: "{colors.stage3-text}"
    rounded: "{rounded.pill}"
  stage-mark-1:
    backgroundColor: "{colors.stage1}"
    textColor: "{colors.on-stage}"
    rounded: "{rounded.pill}"
  stage-mark-2:
    backgroundColor: "{colors.stage2}"
    textColor: "{colors.on-stage}"
    rounded: "{rounded.pill}"
  stage-mark-3:
    backgroundColor: "{colors.stage3}"
    textColor: "{colors.on-stage3}"
    rounded: "{rounded.pill}"
---

# Design System: Basmet Dawah

## Overview

**Creative North Star: "A day of light"**

Basmet Dawah's learner site is the arc of one day, dawn to evening, and every screen shows where the learner stands in it. The page is white and calm, warmed by soft tinted panels that carry the three learning stages as times of day: dawn coral for just beginning, daylight green for building the basics, evening indigo for growing deeper. This is a deliberate replacement of an earlier ink-on-white primer world (see Not canonized below): that system read as flat and joyless, so the build now favors color, comfortable illustration, and gentle lift over rule-and-ink austerity, while staying modern and minimal rather than ornamental. It also refuses the emerald-and-gold arabesque cliche common to Islamic-content sites.

One deep blue pill (`--primary`, #2b3990) carries the single next action on every screen: "Find your starting point," "Continue," "Talk to a mentor." Soft painterly illustrations of places and objects, dawn rooms, prayer rugs, lantern-lit corners, hillside paths, appear on every major surface; by explicit production rule they contain no people, no faces, no hands, and no text, letters, or calligraphy. Cards carry hairline borders and soft resting or lifted shadows rather than the flat, shadowless primer grid the previous system prescribed. Readex Pro sets every UI label and paragraph in English, Arabic, and Spanish; Amiri is reserved for set Arabic phrases quoted at readable scale.

**Key Characteristics:**
- White page and surface, with soft dawn/day/evening tinted panels and gradient glows, not a flat ink-on-paper duotone
- One deep blue pill button (`--primary`) per screen for the single next action; gold (`--accent`) reserved for small highlights, never buttons
- Three stage colors (dawn coral, daylight green, evening indigo) carried on illustrations, stage marks, stage chips, and progress fills, never as a text kicker sitting above a heading
- Soft resting shadow (`--shadow-soft`) and a stronger lift shadow (`--shadow-lift`) on cards, hero art, and hover states; this is not a flat, shadowless system
- Soft painterly illustrations of places and objects only, no people, no faces, no hands, no text or calligraphy, on every major surface

## Colors

The palette is a warm white ground with one blue action color, one gold highlight, and three stage tints that read as times of day.

### Primary
- **Twilight Blue** (`#2b3990`, dark mode `#9daaff`): the single primary-button fill, active nav pill, focus ring, and links inside prose. This is the one color that means "press this."

### Secondary
- **Warm Gold** (`#f2b544`, dark `#f5c15c`): small highlights only, illustration accents, the `::selection` background family (`--highlight`), and the sun/spark details in the brand mark. Never a button fill.
- **Sky Blue** (`#9cd3ee`, dark `#5aa9d4`): a fourth, unassigned atmosphere tone used for library "questions" tone panels and illustration skies; it does not encode a stage.

### Stage colors
- **Dawn Coral** (`#f07c5e`, dark `#ff9478`): stage 1, "just beginning." Fills the stage-1 mark, its tinted chip, progress cells, and the dawn glow band and illustrations tied to that stage.
- **Daylight Green** (`#218358`, dark `#4cc792`): stage 2, "building the basics." Same roles, scoped to stage 2; pairs with white text (`on-stage`).
- **Evening Indigo** (`#4b45a8`, dark `#a49dff`): stage 3, "growing deeper." Same roles, scoped to stage 3; pairs with white text (`on-stage3`), unlike the old system's yellow stage-3 which needed ink text for contrast.

Each stage ships a light tint (chip and glow backgrounds) and a darker text variant (stage-colored copy on white), so the saturated stage color itself is reserved for fills and marks, never body text.

### Neutral
- **Page** (`#ffffff`, dark `#0e1124`): base page background.
- **Canvas** (`#f6f6fb`, dark `#12162c`): the one step darker background for banded sections (paths list, mentor block).
- **Surface** (`#ffffff`, dark `#171b35`): card and menu backgrounds.
- **Ink** (`#1d2140`, dark `#eef0fb`): headings, primary text, icon color.
- **Ink 2** (`#4b5070`, dark `#bcc0da`): body copy, leads, descriptions.
- **Ink 3** (`#62677f`, dark `#9398b8`): meta text, counts, placeholders, tertiary captions.
- **Rule** (`#e7e7f0`, dark `#272c4c`): default hairline border between cards and sections.
- **Rule Strong** (`#8b8fa8`, dark `#6b7294`): input borders and the current step-tab ring.
- **Wash** (`#f1f1f7`, dark `#1e2342`): hover background for rows, nav items, and buttons.
- **Danger** (`#b42318`, dark `#ff8a80`) with **Danger Tint** (`#fdecea`, dark `#3a1b19`): form errors and the destructive button variant.

### Named Rules
**The One Pill Rule.** Every screen carries exactly one primary (deep-blue, filled) button for its single obvious next action. Every other action on that screen is secondary (outlined), quiet (underlined text), or danger; a screen never shows two filled primary pills at once.

**The Stage-on-Substance Rule.** Stage color identity (dawn coral, daylight green, evening indigo) lives on illustrations, stage marks, stage chips overlaid on artwork, progress fills, and step-tab numerals, meta-row material the learner is already scanning. It is never rendered as a standalone label or kicker floating above a heading with no other function; a stage chip always sits on or beside imagery or a progress element, not as decoration for its own sake.

**The Gold-Is-Rare Rule.** Warm gold marks a small highlight (a sun in an illustration, a spark accent, text selection) and never becomes a button, a card fill, or a nav state; blue alone carries interactive weight.

## Typography

**Display / Body / Label Font:** Readex Pro (variable weight), with `ui-sans-serif, system-ui, sans-serif` fallback, covering Latin and Arabic subsets.
**Arabic Phrase Font:** Amiri, for quoted Arabic phrases only, with generic `serif` fallback.

**Character:** One warm, rounded sans carries every control and every paragraph in English, Arabic, and Spanish, so the interface reads as one voice regardless of locale. Amiri is the sole register shift, used only when a learner is asked to read or repeat Arabic scripture, and always isolated (`direction: rtl`, `unicode-bidi: isolate`) so it holds its own direction inside either an LTR or RTL page.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 4.2vw + 1rem, 4.75rem)`, line-height 1.02, tracking -0.035em): the home H1 only; its second line is set in Twilight Blue per the direction contract's FIRST VIEWPORT.
- **Title** (600, `clamp(2rem, 2.4vw + 1.1rem, 3.25rem)`, line-height 1.08, tracking -0.03em): page-level headings below home (path title, journey title).
- **Heading** (600, `clamp(1.375rem, 0.8vw + 1.1rem, 1.75rem)`, line-height 1.2, tracking -0.02em): section and card headings (path card title, lesson title, quick-check question).
- **Body** (400, 1.0625rem, line-height 1.65): default paragraph text; lesson prose runs slightly larger (1.125rem / 1.75) and caps at 68ch.
- **Meta** (500, 0.8125rem, line-height 1.4): counts, timestamps, status labels; tabular-nums where it carries a number.

### Named Rules
**The One Voice Rule.** Readex Pro sets every UI control and every paragraph in English, Arabic, and Spanish. A second typeface is never introduced for flavor; Amiri is a script-accuracy tool for quoted Arabic, not a display font.

## Layout

The site runs on a `max-w-6xl` container with responsive `px-4 / px-6 / px-8` gutters. Home's hero is a two-column grid above `lg` (`grid-cols-12`): a start side (headline, lead, primary pill action) on the left six columns and an end side (illustration in a `--radius-panel` frame with `shadow-lift`) on the right six, per the direction contract's FIRST VIEWPORT; the end side stacks below the start side on mobile. Section backgrounds alternate white and `--canvas`, and dawn/day/evening gradient glow bands (`.glow-dawn`, `.glow-day`, `.glow-evening`) wash the top of hero and CTA sections rather than a hard color block. Row-based lists (paths, library, quick-check options) use a responsive card grid, not a shared-hairline table.

Path and lesson pages add a leading-edge rail of step tabs (horizontal and `sticky top-16` on mobile, vertical and `sticky top-24` from `lg` up), positioned with logical `start` properties so it flips automatically under RTL.

## Elevation & Depth

This is a layered, lifted system, not a flat one: cards, illustration frames, dropdown menus, and the primary button all carry a shadow. `--shadow-soft` (`0 1px 2px rgb(29 33 64 / 0.04), 0 6px 20px -8px rgb(29 33 64 / 0.1)`) is the resting elevation for cards, stage chips, buttons, and bordered rows. `--shadow-lift` (`0 2px 6px rgb(29 33 64 / 0.05), 0 18px 40px -18px rgb(29 33 64 / 0.24)`) is the stronger elevation for the hero illustration frame, the continue card, hover states on interactive cards, and open menus. Dark mode uses the same two-tier vocabulary with black-based shadow color. Depth is diffuse and ambient throughout, never a hard offset or neobrutalist block shadow.

### Shadow Vocabulary
- **Soft** (`box-shadow: var(--shadow-soft)`): resting elevation for cards, buttons, chips, and bordered rows.
- **Lift** (`box-shadow: var(--shadow-lift)`): hero and continue-card illustration frames, hover state on interactive cards, open dropdown menus.

### Named Rules
**The Ambient Lift Rule.** Shadows are soft and diffuse, doubled (a tight near shadow plus a broad far one) to read as gentle elevation, not as a hard, offset, cartoon-style shadow; that device belongs to a neobrutalist world this one is not.

## Shapes

Corners are generously rounded at three scales: `--radius-control` (0.875rem / 14px) for inputs and small controls, `--radius-cell` (1.25rem / 20px) for cards and stage tiles, and `--radius-panel` (1.75rem / 28px) for the hero and page-banner illustration frames and their outer section wrapper, matching the direction contract's "20px and 28px radii." Buttons are full pills (`rounded-full`), not rounded rectangles, distinguishing interactive controls from static cards at a glance. Stage marks and account-menu avatars are circles; progress indicators are pill-shaped segmented bars or a single pill track.

## Components

### Buttons
- **Shape:** pill (`rounded-full`), `min-h-11` (44px) default / `min-h-13` (52px) large, horizontal padding 1.25rem (md) to 1.75rem (lg).
- **Primary:** deep-blue fill, white text, `shadow-soft` (`bg-primary text-on-primary shadow-soft`); hover darkens to `--primary-hover`, active nudges down one pixel. Reserved for the one obvious next action per screen (The One Pill Rule).
- **Secondary:** white fill, ink text and border, `shadow-soft`; hover fills `--wash`.
- **Quiet:** no fill, no shadow, underlined primary-blue text (`decoration-primary/30`, darkening on hover); used for every secondary link-style action ("Browse all paths," "Journey").
- **Danger:** white fill, danger-red text and border; hover fills `--danger-tint`; destructive actions only.

### Chips
- **Stage Chip:** pill, tinted stage background with stage-text color and a small solid stage-color dot; overlaid on illustration corners (`absolute start-3 top-3`) with `shadow-soft`, or set inline in a meta row. Never floats alone above a heading with no image or progress element beside it.

### Cards / Containers
- **Corner Style:** `--radius-cell` (20px); illustration frames inside a card use a slightly tighter radius to nest cleanly.
- **Background:** white surface at rest; `--wash` on hover for interactive rows.
- **Shadow Strategy:** `shadow-soft` at rest, `shadow-lift` on hover for link-cards (see Elevation & Depth).
- **Border:** 1px `--rule`, brightening to `--rule-strong` on hover.
- **Internal Padding:** 1.25rem (mobile) up to 1.75rem to 2rem (desktop).

### Inputs / Fields
- **Style:** white background, `--rule-strong` border, `--radius-control` (14px), `min-h-12` (48px); password fields carry a trailing show/hide toggle (lucide `Eye`/`EyeOff`).
- **Focus:** border shifts to `--primary` plus a 2px primary `focus-visible` outline offset 2px.
- **Error:** border and helper text switch to `--danger`, `aria-invalid` set.

### Navigation
- **Style:** one hairline row (`h-16`, `border-b border-rule`, white background), wordmark (BrandMark plus text) and text links; the active link gets a filled `primary-tint` pill background with primary text, not an underline bar. Language and account menus are text/initial-avatar triggers opening a bordered, `shadow-lift` dropdown in `--radius-cell`. Mobile replaces the link row with a fixed bottom tab bar (`MobileTabBar`): four icon-plus-label tabs, active tab shown with a filled pill behind its icon.
- **States:** hover moves inactive links from `--ink-2`/`--ink-3` to `--ink`/`--primary`; current page gets `aria-current`.

### Illustrations (signature material)
Every major surface (hero, stage grid, path cards, mentor block, final CTA) carries a soft painterly illustration of a place or object rendered in the shared "soft modern flat illustration" style: rounded simple shapes, subtle paper grain, gentle gradients, generous negative space, and a fixed stage palette (dawn coral, apricot, leaf green, sky blue, deep indigo, warm gold). Every illustration prompt in `docs/illustrations.md` carries the same production rule verbatim: no people, no figures, no faces, no hands, and no text, letters, calligraphy, writing, logos, or watermarks. Illustrations sit in `--radius-cell` or `--radius-panel` frames with `object-fit: cover`, get a `brightness(0.86) saturate(0.95)` filter in dark mode rather than a separate dark asset, and scale up slightly (`scale-[1.03]`) on card hover.

## Do's and Don'ts

### Do:
- **Do** give every screen exactly one filled primary (deep-blue) pill for its one obvious next action (The One Pill Rule); every other action is secondary, quiet, or danger.
- **Do** carry stage identity on illustrations, marks, chips overlaid on imagery, and progress fills, never as a bare kicker line above a heading (The Stage-on-Substance Rule).
- **Do** keep every illustration people-free, face-free, hand-free, and text-free, matching the production rule in `docs/illustrations.md`; a new illustration prompt must restate that rule.
- **Do** use small line icons (lucide, 16 to 24px, `strokeWidth` 1.75 to 2.5) for functional affordances (chevrons, checks, eye toggles, nav icons); the build uses them natively throughout, inline and never in an icon font.
- **Do** put answer, selection, and progress markers so they hold their visual position under RTL by using logical (`start`/`end`, `inset-inline-*`) properties, not fixed `left`/`right`.
- **Do** treat Amiri-set Arabic phrases as self-contained islands: their own `direction` and `unicode-bidi: isolate` regardless of the surrounding page's language.

### Don't:
- **Don't** use warm gold for a button, a card fill, or a nav state; it is a small-highlight color only (The Gold-Is-Rare Rule).
- **Don't** show a stage color as body text without its tint background or a contrast-checked `on-stage`/`on-stage3` pairing on top of the solid fill.
- **Don't** introduce a second display typeface for personality; Readex Pro carries every language and every role except quoted Arabic phrases.
- **Don't** add a hard, offset, single-direction "cartoon" shadow anywhere; this world's depth is soft and ambient (The Ambient Lift Rule), and a hard-offset shadow belongs to a neobrutalist system this one is not.
- **Don't** apply this system to the admin panel. Admin keeps its own incumbent slate/primary (blue/gold) styling under `--color-primary-*` and `--color-accent-*`; it is out of scope for this DESIGN.md and gains only new fields and lesson-block editors, not the learner-site visual language.

---

Not canonized: the previous "First Primer" system (ink-only, no shadows, red/green/yellow stage inks, shared-hairline primer grid) was replaced wholesale in this build per an explicit owner steer recorded in the direction contract ("the ink-on-white primer read as depressing; less text, more color, comfortable visuals"), and is not preserved anywhere in this file; any surviving reference to "primer grid," "First Primer," or the old red/yellow stage hues elsewhere in the codebase (naming only, e.g. the `.primer-grid` CSS class and `primer/` component folder, which now hold the new system's components) is a naming artifact of the rename, not a second visual system. The admin panel's slate/primary-blue-and-gold styling remains a separate, pre-existing, out-of-scope system, recorded here only as a boundary, not folded into the learner-site tokens above.
