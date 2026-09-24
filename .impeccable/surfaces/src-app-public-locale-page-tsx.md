---
version: 1
slug: "src-app-public-locale-page-tsx"
primary_target: "src/app/(public)/[locale]/page.tsx"
related_targets: ["src/app/(public)/[locale]"]
---

# Learner site redesign

Scope: every learner-facing page under `src/app/(public)/[locale]/` (home, level check, paths, path journey, lesson reader, knowledge check, library, saved, my journey, settings, mentor, auth, contact, legal). Home is Persuade; everything else is Operate or Read and inherits the same world. Admin panel keeps its look; it only gains the new fields and lesson blocks.

Audience and job: new Muslims, mostly on phones, who should never have to decide what to learn next. Success is starting lesson one of a recommended path within minutes.

Constraints: English, Arabic (RTL), Spanish; light and dark; WCAG 2.1 AA; Omar's steer: simple, modern, minimal in a useful way, never cluttered.

## Direction contract

THESIS: The site is a new Muslim's first primer: a ruled, boxed, color-coded lesson book that already knows which page you are on. It refuses emerald-and-gold arabesque decor and floating SaaS card grids.

OWN-WORLD: White primer page, near-black ink, hairline ruled cells that share borders; no shadows, no floating cards, no gradients. Three primer inks code the three stages and nothing else: primer red for stage 1, leaf green for stage 2, tab yellow for stage 3 (always a fill under ink). Lesson and step tabs run down the page edge. Readex Pro for all UI and body in Latin and Arabic; Amiri for Arabic phrases set at primer scale. Color is information, never decoration.

STORY: A visitor learns they do not need to know what to learn. They answer six gentle questions, watch their stage cell fill, and start lesson one of the path chosen for them. Signature interaction: the level check is Lesson 1 of the primer; each answer fills its cell and the stage cells respond; the result opens the recommended path's step tabs. Motion grammar: one fill motion (ink or stage color flooding a cell from the reading edge), used for answers, completions, and milestones, nothing else.

FIRST VIEWPORT: Home. Start side: a large two-line headline and one ink primary button "Find your starting point" with "about 1 minute" beneath. End side (below on mobile): the primer grid, three stage cells side by side on one ruled row, each with its color tab and large numeral, name, and one line. Nav is one hairline row.

FORM: The First Primer, position 1 on the ordered list (chosen as the pick), seed key 0d239f72.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Stage 3 has no path yet; shown as "being prepared".
- Most lessons are unpublished drafts; paths must read well with thin content.
