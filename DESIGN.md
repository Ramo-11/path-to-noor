---
name: Basmet Dawah
description: A ruled, boxed primer for new Muslims that already knows which page you are on.
colors:
  page: "#ffffff"
  ink: "#16181d"
  ink-2: "#474c57"
  ink-3: "#676d7a"
  rule: "#e3e5e9"
  rule-strong: "#8a909c"
  wash: "#f5f6f7"
  stage1: "#c8102e"
  stage1-tint: "#fbe8eb"
  stage1-text: "#b20f29"
  stage2: "#0a7b55"
  stage2-tint: "#e2f3eb"
  stage2-text: "#08704d"
  stage3: "#f6c343"
  stage3-tint: "#fef3d4"
  stage3-text: "#855d00"
  on-stage: "#ffffff"
  on-stage3: "#16181d"
  danger: "#b42318"
  danger-tint: "#fdecea"
  highlight: "#fde9a8"
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
  control: "0.625rem"
  cell: "0.75rem"
spacing:
  hairline: "1px"
  card-x-mobile: "1.25rem"
  card-x-desktop: "1.75rem"
  card-y-mobile: "1.5rem"
  card-y-desktop: "1.75rem"
  section-y-min: "2.5rem"
  section-y-max: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "rgb(from {colors.ink} r g b / 0.85)"
  button-secondary:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.wash}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0"
  input-text:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3rem"
  stage-mark-1:
    backgroundColor: "{colors.stage1}"
    textColor: "{colors.on-stage}"
    rounded: "0.5rem"
  stage-mark-2:
    backgroundColor: "{colors.stage2}"
    textColor: "{colors.on-stage}"
    rounded: "0.5rem"
  stage-mark-3:
    backgroundColor: "{colors.stage3}"
    textColor: "{colors.on-stage3}"
    rounded: "0.5rem"
---

# Design System: Basmet Dawah

## Overview

**Creative North Star: "The First Primer"**

Basmet Dawah's learner site is a ruled, boxed lesson book that already knows which page the reader is on. Every surface is built from the same primer grid: white paper, near-black ink, hairline rules that cells share rather than double up, and three stage inks that carry meaning and nothing else. There is no glass, no gradient, no drop shadow, no floating card grid, no emerald-and-gold arabesque decor. Depth comes from rule weight and wash tint, never from elevation.

The system is trilingual by construction, not by patch. Readex Pro (variable weight) carries every UI label and every paragraph in Latin and Arabic alike; Amiri appears only for set Arabic phrases quoted at primer scale (the shahada, a dua), rendered as a self-contained island in its own language and direction even inside a page running the opposite way. Interaction has one grammar: a single fill motion (ink or stage color flooding a cell from the reading edge) marks an answer, a completed step, or a milestone, and nothing else moves that way.

Color is restricted to information. Primer red, leaf green, and tab yellow exist to say "stage 1", "stage 2", "stage 3": on the stage grid, the stage line, progress cells, and step tabs. They never decorate a hero, a card, or a button. Buttons, inputs, and navigation stay ink-on-paper in both themes; dark mode inverts the paper without inventing new hues, and each stage ink gets a lighter, more saturated dark-mode variant so it still reads as ink on a dark page.

**Key Characteristics:**
- White (or near-black in dark mode) paper, near-black ink text, no gradients, no drop shadows anywhere in the learner site
- Hairline rules with shared borders (the primer grid), not card outlines with gaps
- Three stage inks (red / green / yellow) used exclusively to encode stage, always as a solid fill under ink text
- Readex Pro for all UI and body copy in every language; Amiri reserved for quoted Arabic phrases
- One motion: a directional fill, used for answers, completions, and milestones only

## Colors

The palette is a paper-and-ink duotone plus three primer inks that carry stage meaning; there is no decorative accent.

### Primary
- **Primer Ink** (#16181d, dark mode #eef0f3): the near-black text, headline, icon, and primary-button color. Carries almost every non-stage visual weight on the page.

### Secondary (stage inks)
- **Primer Red** (#c8102e, dark #ff6b78): stage 1 ("just beginning"). Fill on the stage-1 cell, numeral, progress cell, and completed step-tab check.
- **Leaf Green** (#0a7b55, dark #3ccb8f): stage 2 ("building the basics"). Same roles as Primer Red, scoped to stage 2; also the correct-answer fill in knowledge checks regardless of the learner's own stage.
- **Tab Yellow** (#f6c343, same value in both themes): stage 3 ("growing deeper"). Same roles, scoped to stage 3. Pairs with near-black text (`on-stage3`), not white, because it is the one fill light enough to fail white-on-yellow contrast.

Each stage ink ships a tint (10 percent strength, for success/selection backgrounds) and a darker text variant (for stage-colored copy on white) so the ink itself is never used as body text.

### Neutral
- **Primer Page** (#ffffff, dark #111316): page and card background.
- **Soft Ink** (#474c57, dark #b7bcc6): secondary body copy (leads, descriptions).
- **Faint Ink** (#676d7a, dark #9197a3): tertiary text, meta labels, placeholders, disabled captions.
- **Hairline Rule** (#e3e5e9, dark #2a2e35): the default border between primer-grid cells and section dividers.
- **Strong Rule** (#8a909c, dark #6d7380): input borders and the current step-tab numeral ring, where a rule needs to read as interactive.
- **Paper Wash** (#f5f6f7, dark #1a1d22): hover background for rows and tabs, the flat fill behind quoted code, and the missed-answer background in a knowledge check.
- **Selection Highlight** (#fde9a8, dark #5a4a14): text `::selection` only.
- **Danger Red** (#b42318, dark #ff8a80) with **Danger Tint** (#fdecea, dark #3a1b19): form errors and the destructive button variant.

### Named Rules
**The Information-Only Color Rule.** Primer red, leaf green, and tab yellow appear only to encode stage 1, 2, or 3 (stage marks, progress cells, step-tab checks, the stage grid). They never color a hero, a generic card, a nav item, or a button; ink and paper carry everything else.

**The Fill-Under-Ink Rule.** A stage color never stands alone as text on paper; it is always a solid fill with a contrast-checked ink on top (white on red/green, near-black on yellow), matching the `on-stage` / `on-stage3` pairing.

## Typography

**Display / Body / Label Font:** Readex Pro (variable weight), with `ui-sans-serif, system-ui, sans-serif` fallback, loaded for Latin, Latin-ext, and Arabic subsets.
**Arabic Phrase Font:** Amiri (400/700), for quoted Arabic phrases only, with generic `serif` fallback.

**Character:** One typeface carries the entire interface and every paragraph in every language, so the site reads as a single voice regardless of locale; Amiri is the one deliberate register shift, reserved for the moment a learner is asked to read or repeat Arabic scripture, and always isolated (`direction: rtl`, `unicode-bidi: isolate`) so it holds its own direction inside an LTR or RTL page.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 4.2vw + 1rem, 4.75rem)`, line-height 1.02, tracking -0.035em): the home H1 only.
- **Title** (600, `clamp(2rem, 2.4vw + 1.1rem, 3.25rem)`, line-height 1.08, tracking -0.03em): page-level headings below home (path title, journey title).
- **Heading** (600, `clamp(1.375rem, 0.8vw + 1.1rem, 1.75rem)`, line-height 1.2, tracking -0.02em): section and card headings (path row title, lesson title).
- **Body** (400, 1.0625rem, line-height 1.65): default paragraph text; lesson prose runs slightly larger (1.125rem / 1.75) and caps at 68ch.
- **Meta** (500, 0.8125rem, line-height 1.4): counts, timestamps, status labels, language codes; always tabular-nums where it carries a number.

### Named Rules
**The One Voice Rule.** Readex Pro sets every UI control and every paragraph in English, Arabic, and Spanish. A second typeface is never introduced for "flavor"; Amiri is not a display font, it is a script-accuracy tool for quoted Arabic.

## Layout

The site runs on a single `max-w-6xl` container with responsive `px-4 / px-6 / px-8` gutters. Home's hero is a two-column grid above `lg`: a 5-column start side (headline, lead, primary action) and a 7-column end side (the primer grid or continue card), stacking end-side-below-start on mobile per the direction contract's FIRST VIEWPORT. Section rhythm is generous and irregular by design: `pt-10 pb-16` on mobile widening to `pt-20` and `pb-24` on desktop, with a hairline `border-t` (not a shadow or background change) separating stacked sections.

Path and lesson pages add a left-edge (`start`, so it flips under RTL automatically) rail of step tabs: horizontal and `sticky top-16` on mobile, vertical and `sticky top-24` from `lg` up, sized to `10.5rem` auto-columns on mobile and full column width on desktop. Row-based content (path list, step list, knowledge-check options) uses the primer grid's single-pixel shared-border technique rather than a gap-and-card layout: children sit flush, each with a `1px` outline in `--rule`, so adjoining cells never show a doubled line.

## Elevation & Depth

There are no shadows anywhere in the learner site (confirmed by source scan: no `box-shadow` or `shadow-*` utility outside the out-of-scope admin panel). Depth is conveyed entirely by rule weight and tonal layering: a hairline `--rule` border separates default content, `--rule-strong` marks an interactive edge (inputs, the current step-tab ring), and `--wash` is the one background step above paper, used for hover states and for resting one region visually behind another. The current section of a document (an in-view step tab) is marked by a `3px` solid ink bar on its leading edge, not by lifting it off the page.

### Named Rules
**The Flat Primer Rule.** Nothing in the learner site casts a shadow or floats above the page. If a surface needs to read as "active" or "current," it gets a thicker rule, a wash fill, or the ink-bar marker, never elevation.

## Shapes

Corners are gently rounded and used at exactly two scales: `--radius-control` (0.625rem / 10px) for buttons, inputs, menus, and small badges, and `--radius-cell` (0.75rem / 12px) for primer-grid containers, lesson images, and embedded video frames. Circles are reserved for stage-mark cells at their smallest size, avatar initials, and quick-check option markers; everything else is a rounded rectangle or a plain rule-bounded cell with no radius at all (table-like rows inside the primer grid).

## Components

### Buttons
- **Shape:** rounded rectangle (`--radius-control`, 10px), `min-h-11` (44px) default / `min-h-13` (52px) large, horizontal padding 1.25rem (md) to 1.75rem (lg).
- **Primary:** ink fill, paper text, ink border (`bg-ink text-page border-ink`); hover drops to 85% opacity, active to 75%. This is the only button variant carrying a strong fill; it marks the one obvious next action per screen (Product Principle 1).
- **Secondary:** paper fill, ink text and border; hover fills `--wash`.
- **Quiet:** no fill or border, underlined ink text (`decoration-rule-strong`, darkening to full ink on hover); used for every secondary link-style action ("Browse all paths", "Journey").
- **Danger:** paper fill, danger-red text and border, `--danger-tint` on hover; used only for destructive actions.

### Primer Grid (signature component)
The recurring custom pattern: a `display: grid` container with `gap: 1px` and a `page`-colored background, whose children each carry a `1px outline` in `--rule`. The 1px gap plus matching background produces a hairline that is shared between adjoining cells instead of doubled, so a row of path cards, step-list rows, or quiz options reads as one ruled sheet rather than a stack of separate cards. Used for the stage grid, path rows, step lists, and the knowledge-check question block.

### Cards / Containers
- **Corner Style:** `--radius-cell` (12px) on the outer primer-grid container; inner cells are square.
- **Background:** paper, no fill difference between "card" and "page" at rest; `--wash` only on hover/active.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px `--rule` on the outer container, shared hairlines between cells.
- **Internal Padding:** 1.25rem/1.5rem (mobile) up to 1.75rem (desktop) horizontal and vertical.

### Inputs / Fields
- **Style:** paper background, `--rule-strong` border, `--radius-control` (10px), `min-h-12` (48px), password fields get a trailing show/hide toggle (lucide `Eye`/`EyeOff`).
- **Focus:** border shifts to full ink plus a 2px ink `focus-visible` outline offset 2px; no glow or color change.
- **Error:** border and helper text switch to `--danger`; `aria-invalid` set, no shake or icon change.

### Navigation
- **Style:** one hairline row (`h-16`, `border-b border-rule`, paper background), wordmark plus three text links, active link marked by an ink underline bar, not a pill or background fill. Language switch and account menu are text/initial-avatar triggers opening a bordered, radius-cell dropdown; no icon-only nav items except the persistent theme toggle. Mobile adds a fixed bottom tab bar (`MobileTabBar`) rather than a hamburger drawer.
- **States:** hover moves inactive links from `--ink-2` to `--ink`; current page gets `aria-current="page"` plus the underline bar.

### Step Tabs (signature component)
A left-edge (top-edge on mobile) rail of numbered tabs, one per lesson step, built on the primer grid. Each tab's numeral cell fills with the active stage color once its step is complete (with an inline `Check`), stays a bordered ink ring while current, and is a plain rule-bordered ring for upcoming/preparing steps. The in-view tab gets a `3px` solid ink bar on its leading edge (bottom on mobile, inline-start on desktop, so it flips automatically under RTL) and syncs to scroll via `IntersectionObserver`.

## Do's and Don'ts

### Do:
- **Do** keep the primer grid's shared 1px hairline technique for any new list, row, or option group; do not fall back to gapped cards with individual borders.
- **Do** use small line icons (lucide, 16-24px, `strokeWidth` 1.75-3) for functional affordances (chevrons, checks, eye toggles, nav icons); the build uses them natively throughout, inline and never in an icon font.
- **Do** put answer, selection, and completion markers on the trailing edge of a row (`order-last`, or `inset-inline-end`), never the leading edge, so they hold their position correctly under RTL.
- **Do** treat Amiri-set Arabic phrases and fallback-language lesson content as self-contained islands: their own `direction` and `unicode-bidi: isolate` regardless of the surrounding page's language.
- **Do** reserve the ink fill (`button-primary`) for the one obvious next action on a screen; every other action is secondary or quiet.

### Don't:
- **Don't** add a shadow, glow, gradient, or glass/blur surface anywhere in the learner site; depth is rule weight and wash tint only.
- **Don't** use a stage color (red/green/yellow) for anything but stage 1/2/3 identity; it never becomes a generic accent, a decorative background, or a brand color.
- **Don't** introduce a second display typeface for "personality"; Readex Pro carries every language and every role except quoted Arabic phrases.
- **Don't** apply this system to the admin panel. Admin keeps its own incumbent slate/primary (blue/gold) styling; it is out of scope for this DESIGN.md and gains only new fields and lesson-block editors, not the primer visual language.

---

Not canonized: the admin panel's slate/primary-blue-and-gold styling (`--color-primary-*`, `--color-accent-*` in `globals.css`, used only under `app/(admin)` and `components/admin`) is a pre-existing, separate system left untouched by this build; it is recorded here as an explicit out-of-scope boundary, not folded into the learner-site tokens above.
