# Basmet Dawah (Path to Noor): Progress

Trilingual (EN/AR/ES) guided learning platform for new Muslims. Runs on Render. Learner-facing name is Basmet Dawah.

Snapshot: 2026-09-23.

## Done

- Public platform: learning paths, topics, modules, lessons (TipTap rich content), quizzes, progress tracking, bookmarks, revert stories, mentorship matching, onboarding, profile, contact, FAQ. Guest browsing without auth.
- Trilingual EN/AR/ES via next-intl with full RTL support.
- Auth: NextAuth v5 credentials + Google OAuth, privacy and terms pages, forgot-password blocked for Google accounts.
- Admin panel: dashboard plus CRUD for topics, learning paths, modules, lessons, quizzes, stories, mentorship, users, and system users. Admin seed: `npm run seed`.
- Emails: mentor and mentee notifications via Resend with spam mitigation.
- Content seeding per `SEED_RESOURCES_SUMMARY.md`.

## Learner redesign (built 2026-09-23, awaiting review)

Decisions (Omar, 2026-09-23): name stays Basmet Dawah; audience is new Muslims only; not live with real learners, so routes and structure can change; a six question level check places learners in one of three stages and recommends a path; gentle tone, no streaks or points; visual world "The First Primer" rendered minimal (see `.impeccable/surfaces/` brief and `PRODUCT.md`).

- (done) Foundation: design tokens and primer utilities in `globals.css`, Readex Pro + Amiri fonts, primitives in `src/components/primer/`, stages (`src/lib/stages.ts`), placement scoring (`src/lib/placement.ts`), path outlines and learner state (`src/lib/learning.ts`), lesson block schema (`src/lib/lesson-blocks.ts`), per-namespace messages in `src/messages/<locale>/`, `LearningPath.stage/order/outcomes` (replaces `difficulty`), `User.placement`, guest visibility fix (guests now see revert content), redirects from old routes, sitemap and robots.
- (done) Pages: home and `/start` level check, `/paths` and journey map, lesson reader with interactive blocks and knowledge check, `/library`, `/saved`, `/journey`, `/settings`, auth and onboarding, `/mentor`, contact, legal, system pages, site shell with mobile tab bar, admin stage fields, outcomes, and lesson block editor (admin preview renders the learner view).
- (done) Verification 2026-09-23: type check and production build pass; screenshots in EN/AR/ES, light/dark, desktop/mobile; placement, progress, knowledge check, and redirect endpoints exercised on the dev database; finish review verdict "ship"; DESIGN.md recorded.
- (pending) Omar's review of the redesign; commit and deploy when approved.

New vocabulary: Paths have Steps (was modules) which have Lessons; Library (was topics); Knowledge check (was quiz); Saved (was bookmarks); My journey (was profile); Talk to a mentor (was mentorship).

## Before deploying the redesign

- Run `NODE_ENV=production npm run migrate:stages` against production once (maps `difficulty` to `stage`, puts "Living as a Muslim" in stage 2). Needs Omar's go-ahead.
- Stage 3 (Growing deeper) has no path yet; it shows as "being prepared" until one is published.
- 44 of 57 lessons are still unpublished drafts with placeholder text; paths look thin until educators add content.

## Known issues

- `ROADMAP.md` is stale; treat `CLAUDE.md` as current.
- Runs on Render's 512MB tier: keep plain `next build` / `next start` scripts.
