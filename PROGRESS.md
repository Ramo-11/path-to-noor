# Basmet Dawah: Progress

Trilingual (EN/AR/ES) guided learning platform for new Muslims. Runs on Render. Learner-facing name is Basmet Dawah.

Snapshot: 2026-09-24.

## Done

- Public platform: learning paths, topics, modules, lessons (TipTap rich content), quizzes, progress tracking, bookmarks, revert stories, mentorship matching, onboarding, profile, contact, FAQ. Guest browsing without auth.
- Trilingual EN/AR/ES via next-intl with full RTL support.
- Auth: NextAuth v5 credentials + Google OAuth, privacy and terms pages, forgot-password blocked for Google accounts.
- Admin panel: dashboard plus CRUD for topics, learning paths, modules, lessons, quizzes, stories, mentorship, users, and system users. Admin seed: `npm run seed`.
- Emails: mentor and mentee notifications via Resend with spam mitigation.
- Content seeding per `SEED_RESOURCES_SUMMARY.md`.

## Learner redesign (built 2026-09-23, live 2026-09-24)

Decisions (Omar, 2026-09-23): name stays Basmet Dawah; audience is new Muslims only; not live with real learners, so routes and structure can change; a six question level check places learners in one of three stages and recommends a path; gentle tone, no streaks or points; visual world "The First Primer" rendered minimal (see `.impeccable/surfaces/` brief and `PRODUCT.md`).

- (done) Foundation: design tokens and primer utilities in `globals.css`, Readex Pro + Amiri fonts, primitives in `src/components/primer/`, stages (`src/lib/stages.ts`), placement scoring (`src/lib/placement.ts`), path outlines and learner state (`src/lib/learning.ts`), lesson block schema (`src/lib/lesson-blocks.ts`), per-namespace messages in `src/messages/<locale>/`, `LearningPath.stage/order/outcomes` (replaces `difficulty`), `User.placement`, guest visibility fix (guests now see revert content), redirects from old routes, sitemap and robots.
- (done) Pages: home and `/start` level check, `/paths` and journey map, lesson reader with interactive blocks and knowledge check, `/library`, `/saved`, `/journey`, `/settings`, auth and onboarding, `/mentor`, contact, legal, system pages, site shell with mobile tab bar, admin stage fields, outcomes, and lesson block editor (admin preview renders the learner view).
- (done) Verification 2026-09-23: type check and production build pass; screenshots in EN/AR/ES, light/dark, desktop/mobile; placement, progress, knowledge check, and redirect endpoints exercised on the dev database; finish review verdict "ship"; DESIGN.md recorded.
- (done) Deployed 2026-09-24: redesign pushed to master (Render), stage migration run on production.
- (done) Content 2026-09-24: 44 draft lessons written and published, plus a new Stage 3 path "Growing Deeper in Faith" (5 steps, 23 lessons), all in EN/AR/ES with interactive blocks, knowledge checks per step, and verified sources. Source files in `src/db/content/`, importer `npm run import:content`. Points for a scholar: `docs/content-review.md`.
- (pending) Commit the content files, importer, and the Spanish footer wording fix (not yet on GitHub).

New vocabulary: Paths have Steps (was modules) which have Lessons; Library (was topics); Knowledge check (was quiz); Saved (was bookmarks); My journey (was profile); Talk to a mentor (was mentorship).

## Color and text pass "A day of light" (2026-09-24)

Why: Omar found the ink-on-white primer text heavy and depressing in light mode. Principles: less text, more color, comfortable visuals, minimal but useful.

- (done) New palette and tokens (light and dark), pill buttons, soft cards and panels, brand mark, nav, footer, tab bar.
- (done) 23 illustrations generated in ElevenLabs (places and objects, no people, no text), in `public/illustrations/`, sources in `docs/illustrations.md`.
- (done) Every learner page restyled and its copy cut in EN/AR/ES: home, level check, paths, path, lesson reader and blocks, knowledge check, library, saved, journey, mentor, contact, auth, settings, legal, error, not found, loading.
- (done) App icons and web manifest; unknown URLs now reach the designed not found page; non-YouTube lesson videos (Facebook links) show a "watch the video" card instead of nothing.
- (done) Verified: type check, production build, screenshots desktop and mobile, light and dark, Arabic, signed in; independent finish review.
- (pending) Commit and deploy (not done; waiting for Omar).
- (pending) Remove `src/components/placement/StageStrip.tsx` and `StageFill.tsx`, now unused.

## Content rules (Omar, 2026-09-24)

- Religious text is never written from memory: Quran from the Tanzil Uthmani text, hadith only sahih or hasan; a hadith any recognized grader calls weak is left out.
- Questions where scholars differ: present the majority view with the standard disclaimer (`differenceNote` in the lesson file); "cautious" variant when no majority is evidenced; no disclaimer for consensus rulings.
- Editing a lesson in the admin panel changes the database only; re-running the importer overwrites those edits with the files in `src/db/content/`.

## Known issues

- `ROADMAP.md` is stale; treat `CLAUDE.md` as current.
- Runs on Render's 512MB tier: keep plain `next build` / `next start` scripts.
