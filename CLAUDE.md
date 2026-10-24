# Basmet Dawah

## About
Trilingual (English/Arabic/Spanish) guided learning platform for three audiences: people curious about Islam, new Muslims, and Muslims who want to learn more. Structured learning paths, topic-based browsing, lessons with TipTap rich content, quizzes, progress tracking, revert stories, mentorship matching, and full RTL support.

## Tech Stack
- Next.js 16, TypeScript, Tailwind CSS v4, motion
- MongoDB Atlas + Mongoose 9
- NextAuth v5 (beta.30): credentials + Google OAuth
- next-intl (en/ar/es, locale prefix "always")
- TipTap v3, Cloudinary, Zod, GA4

## Architecture

### Route Groups
- `(public)/[locale]/`: public pages with i18n. Layout sets `<html lang={locale} dir={dir}>`.
- `(admin)/admin/`: admin panel. Always `<html lang="en">`. SessionProvider wrapped.

### i18n Routing
- Locales: `["en", "ar", "es"]`, default `"en"`, prefix `"always"` -> URLs: `/en/...`, `/ar/...`, `/es/...`
- Strings in `src/messages/<locale>/<namespace>.json`, one file per namespace; the list lives in `MESSAGE_NAMESPACES` in `src/i18n/request.ts` (add a namespace there and in all three locale folders)
- `useTranslations()` (client), `getTranslations()` (server)
- Locale-aware nav via `@/i18n/navigation` (Link, redirect, usePathname, useRouter)

### Proxy (middleware)
- `/admin/*`, `/api/*` -> pass through
- Everything else -> next-intl locale routing

### Content Model
All content stored per-locale (`en` required; `ar`/`es` may be empty):
```typescript
name: { en: "Prayer", ar: "...", es: "..." }
content: { en: TipTapJSON, ar: TipTapJSON, es: TipTapJSON }
```

### Guest Access
Public routes allow unauthenticated browsing. Auth required for progress, bookmarks, quizzes, mentorship requests. Admin routes require admin role.

## File Structure
- `src/app/(public)/[locale]/`: topics, paths, learn, mentorship, contact, bookmarks, profile, onboarding, auth pages
- `src/app/(admin)/admin/`: login + `(dashboard)` admin pages
- `src/app/api/`: route handlers grouped as auth, admin, user, public, contact
- `src/components/`: ui/, layout/, shared/, admin/
- `src/db/models/`: one file per model
- `src/i18n/` (routing.ts, request.ts, navigation.ts), `src/messages/`, `src/proxy.ts` (Next 16 name for middleware)

## Data Models
- **User**: role, preferredLanguage, progress [{lessonId, completedAt}], bookmarks, optional `placement { stage, answers, takenAt }` from the level check, optional `track` (`curious|new|muslim`), `userType` (`revert|mentor`; mentor only through an approved volunteer application)
- **Topic**: hierarchical (parent self-ref), name/desc per-locale, slug, icon, order
- **Module**: title/desc per-locale, topics [ref], lessons [{lessonId, order}]
- **Lesson**: title/content per-locale (TipTap JSON as Mixed), type (article/video/quiz), estimatedMinutes
- **LearningPath**: title/desc per-locale, `tracks[]` (default `["new"]`), `stage` (`beginning|foundations|deeper`, only for paths in the `new` track), `order`, `outcomes[]` per-locale, modules [{moduleId, order}]
- **Quiz**: per-lesson, questions with per-locale text + options + explanations
- **Story**: revert story for the public site; personName/title/excerpt/content per-locale, optional video (youtube/upload), featured/published/order
- **MentorRequest**: revertId (User ref), optional mentorId, status (pending/assigned/rejected), message, adminNote
- **MentorApplication**: a Muslim volunteering as a mentor; status pending/approved/declined, approve sets `userType: "mentor"`

## Project-Specific Pitfalls
- **next-intl**: Import Link from `@/i18n/navigation`, not `next/link`, in public pages
- **RTL**: Use logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start`, `end`) instead of `pl-`, `pr-`, `left`, `right`
- **Admin pages**: Use regular `next/link` (no i18n needed)

## Religious Content
- Contested questions present the majority view of scholars, with a note at the bottom that scholars differ and this is the majority view. Establish the majority from a source that names it (qaf.ai first; IslamWeb, IslamQA, AMJA work too). With no evidenced majority, say so and give the cautious view. Consensus rulings get no "scholars differ" note.
- Hadith: sahih or hasan only; if any recognized grader calls it weak, leave it out. Fetch every verse and hadith from a source, never from memory, check with an independent verifier, and log items for scholar review in `docs/content-review.md`. Same standard as `resources/guides/khutbah.md`.

## Learner Experience
- Vocabulary shown to learners: Paths have Steps (the `Module` model) which have Lessons; Library (the `Topic` model); Knowledge check (the `Quiz` model); Saved (bookmarks); My journey (`/journey`); Talk to a mentor (`/mentor`). Old routes redirect in `next.config.ts`.
- Tracks (Omar, 2026-10-24): the home asks "Where are you today?" with three cards and nothing else in the hero. `curious` -> `/curious` (path `discover-islam`), `new` -> the level check `/start`, `muslim` -> `/muslim` (`growing-deeper`, `walk-with-a-new-muslim`, and the volunteer form `/mentor/volunteer`). Definitions in `src/lib/tracks.ts`; guests keep the choice in localStorage `bd.track`, `TrackSync` copies it to the account. Stage chips and stage colors show only on staged paths.
- Public forms (register, contact, forgot password) go through `src/lib/bot-guard.ts`: honeypot, minimum fill time, and Cloudflare Turnstile when `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are both set.
- Level check at `/start`: scoring in `src/lib/placement.ts` (the server recomputes on save); guests keep the result in localStorage (`bd.placement`), `PlacementSync` copies it to the account after sign-in.
- Path outlines, recommendations, and learner state: `src/lib/learning.ts` (server) and `src/lib/learning-types.ts` (client-safe types plus `pickRecommendedPath`).
- Lesson content renders on the server through `src/components/lesson/LessonContent.tsx`; interactive blocks (`phraseCard`, `stepList`, `quickCheck`, `keyPoint`, plus the visual blocks `breakdown`, `compare`, `flow`, `timeline`, `facts`, `scenario`, and the collapsible `more`) are defined in `src/lib/lesson-blocks.ts`, rendered from `src/components/lesson/blocks/`, and edited in the admin TipTap editor. Lesson JSON shapes are checked by the importer.
- Audio: `phrase.audio` (and `breakdown.audio`) holds one path or a list played in order. Quran recitation is Mishary Alafasy from everyayah.com at `public/audio/quran/SSSAAA.mp3`, only on cards holding complete ayahs. Other phrases are ElevenLabs voice Chaouki (`eleven_v3`, Arabic) at `public/audio/phrases/<lesson-slug>-<n>.mp3`, each checked by transcribing it back. Partial Quran verses get no audio (no AI voice on Quran). `--strict-audio` on the importer fails on a missing file. New phrase audio: load the ElevenLabs key (`~/codespace/sahab/.secrets/elevenlabs.env`), then `python3 scripts/lesson-audio.py list`, `quran` (downloads recitation), and `generate <paths to skip>` (skip partial Quran verses), which writes the files and the `audio` fields and prints a transcription match score per clip. Set Quran recitation `audio` fields by hand before `list`, since clip numbers shift; zsh does not split an unquoted `$var`, so pass skip paths as separate arguments or every listed phrase gets AI voice.
- `npm run migrate:stages` maps legacy `difficulty` to `stage`; run once per database.

## Design System
- Direction "A day of light" (2026-09-24, replaced "The First Primer"): the three stages are times of day, dawn coral (`stage1`), daylight green (`stage2`), evening indigo (`stage3`); deep blue `primary` pill buttons; gold `accent` for small highlights; soft tinted panels (`PageBanner`, `.glow-*`), `.card` with hairline border plus soft shadow. Tokens and utilities in `src/app/globals.css`; primitives in `src/components/primer/`. Full record in `DESIGN.md`.
- Illustrations: `public/illustrations/<name>.webp` plus `-sm.webp`, mapped to places by `src/lib/illustrations.ts` (`STAGE_ART`, `pathArt`, `libraryArt`, `artTone`); prompts and the re-encode recipe in `docs/illustrations.md`. New paths and subjects fall back to shared art until given their own entry.
- Copy rule: short. One sentence leads, nothing said twice, long optional detail behind a `more` block. Lessons favor visual blocks over paragraphs (Omar, 2026-10-17). Quran and hadith quotes and their citations are never reworded; lesson prose may be trimmed and restructured without changing any ruling.
- No colored side-stripe accents on cards, quotes, or panels anywhere (Omar called them AI slop).
- Fonts: Readex Pro (Latin and Arabic UI), Amiri (Arabic phrases).
- App icons come from `resources/app-icons` using `docs/brand/mark.svg`; the generator does not detect this repo's nested root layout, so copy its outputs to `src/app/` by hand.
- Admin panel keeps its older slate/primary styling.

## Admin Panel
Sidebar: Dashboard, Topics, Learning Paths, Modules, Lessons, Quizzes, Stories, Mentorship, Reports (learner lesson feedback), Users, System Users (super_admin only). See `src/components/admin/AdminSidebar.tsx`.
