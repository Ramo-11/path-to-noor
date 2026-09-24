---
version: 1
slug: "src-app-public-locale-page-tsx"
primary_target: "src/app/(public)/[locale]/page.tsx"
related_targets: ["src/app/(public)/[locale]"]
---

# Learner site: A day of light

Scope: every learner-facing page under `src/app/(public)/[locale]/`. Home is Persuade; everything else is Operate or Read in the same world. Admin panel keeps its own look.

Audience and job: new Muslims, mostly on phones, often anxious, who should never have to decide what to learn next. Success is starting lesson one of a recommended path within minutes and coming back.

Constraints: English, Arabic (RTL), Spanish; light and dark; WCAG 2.1 AA. Owner steer (2026-09-24): the ink-on-white primer read as depressing; less text, more color, comfortable visuals, modern and minimal but still useful.

## Direction contract

THESIS: The journey is the arc of one day, dawn to evening, and every screen shows where in that day the learner stands. It refuses the stark ink-on-paper primer and the emerald-and-gold arabesque cliche.

OWN-WORLD: White page with soft tinted panels (dawn coral, daylight green, evening indigo) that code the three stages; deep blue pill buttons for the one next action; gold for small highlights. Cards with hairline borders and soft shadows, 20px and 28px radii. Soft painterly illustrations of places and objects (no people, no text) on every major surface. Readex Pro for all UI, Amiri for Arabic phrases.

STORY: A visitor sees a warm sunrise room and one line, answers six gentle questions, sees their stage as a time of day, and starts the first lesson of the path chosen for them.

FIRST VIEWPORT: Home. Dawn glow band; start side a two-line headline (second line in primary blue), one short lead, the pill "Find your starting point" with "about one minute"; end side the sunrise room illustration in a 28px rounded frame with a lifted shadow. Illustrated stage cards follow directly below.

FORM: "A day of light", picked by the owner on 2026-09-24 from three offered palettes (owner pinned, no seed roll).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Admin-uploadable cover images for new paths and library subjects (today new ones fall back to stage art or a shared set).
- Some library and path titles in the database still contain long dashes; they are admin content, not UI copy.
