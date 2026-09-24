# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

New Muslims (reverts): people who have already taken their shahada and now face a wall of things they feel they should know, with no idea where to begin. Many are learning alone, often without Muslim family, sometimes the only Muslim in their household. They arrive anxious about doing things wrong, unsure what matters first, and easily overwhelmed by the volume of Islamic content online. They use the site mostly on phones, in short sessions.

Secondary users: volunteer mentors (experienced Muslims who are matched with a new Muslim by an admin), and Basmet admins who author and publish content in the admin panel.

People who have not become Muslim are not the audience. Every learner-facing surface assumes the visitor has already taken their shahada.

## Product Purpose

Give every new Muslim a clear, guided answer to "what should I learn next?" A learner does not need to know what they need to know: a short level check places them at a stage, recommends a path for that stage, and the path walks them step by step through lessons in the right order. Success is a new Muslim who starts the first lesson within minutes of arriving, keeps coming back, and finishes paths feeling capable rather than behind.

## Positioning

A free, trilingual (English, Arabic, Spanish) guided curriculum built specifically for new Muslims, with an optional human mentor behind it. Where general Islamic content sites are libraries you have to navigate yourself, this one decides the order for you based on where you are.

## Operating Context

- Learners browse without an account; an account (email or Google) saves progress, bookmarks, knowledge check results, and mentor requests.
- Content is authored in the admin panel by Basmet admins, per language (English required, Arabic and Spanish optional per item). Lessons are rich text or embedded video.
- Mentorship: a new Muslim requests a mentor; an admin reviews and assigns one; both sides get email notifications.
- Arabic renders right to left.

## Capabilities and Constraints

- Stack: Next.js 16, TypeScript, Tailwind v4, MongoDB (Mongoose), NextAuth v5, next-intl, TipTap. Hosted on Render (512MB tier; keep plain `next build` / `next start`).
- Content hierarchy today: learning paths contain modules, modules contain lessons, lessons can have a quiz. Topics are a separate browseable library that modules are tagged into.
- The redesign may rename these concepts for learners and restructure freely: the site has no real learners yet (only test and admin accounts).
- Undecided: the exact stage names and the path assigned to each stage beyond the two that exist.

## Brand Commitments

- Learner-facing name: **Basmet Dawah** (domain basmetdawah.org). "Path to Noor" is an internal name only. Do not state its relationship to Basmet Amal in copy until confirmed.
- Tone: gentle, warm, encouraging. Never guilt, never pressure. No streaks, points, leaderboards, or anything that punishes a missed day.
- The old visual look (royal blue and gold, glass cards) is not a commitment; the redesign replaces it.

## Evidence on Hand

- Production content (as of 2026-09-23): 2 published paths ("First Steps in Islam", "Living as a Muslim"), 9 modules, 57 lessons of which only 13 are published (all video lessons); 44 text lessons are unpublished drafts awaiting content. No quizzes, no revert stories.
- No testimonials, learner counts, or outcome data exist. Never claim "thousands of learners" or similar.
- Arabic and Spanish lesson content is mostly empty; path titles have all three languages.

## Product Principles

1. Decide for them. Every screen answers "what do I do next?" with one obvious action.
2. Meet them where they are. Placement by stage, never by a test they can fail.
3. Small steps, visible progress. Short lessons, a clear map of the journey, gentle acknowledgement of each step finished.
4. Calm over clever. Reassurance and clarity beat density and features; a first-week Muslim should never feel lost or behind.
5. Every language is first class. Arabic right to left and Spanish get the same care as English.

## Accessibility & Inclusion

WCAG 2.1 AA across public pages (Sahab standard). Full RTL support for Arabic. Readers range from native Arabic speakers to people seeing Arabic script for the first time, so any Arabic term shown to a non-Arabic reader needs transliteration and meaning.
