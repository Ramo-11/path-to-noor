# Static personalization

1. Public pages render one shared guest version: no `auth()`, `cookies()` or `headers()`; `export const revalidate = <literal>`, `generateStaticParams` (locales, slugs, or `[]`); content loaded with `{ isGuest: true }`. Crawlers and guests get full HTML.
2. Per-user data only from `GET /api/me` (`src/app/api/me/route.ts`, `src/lib/me-types.ts`): `{ user: null }` or `user`, `track`, `placement`, `completedLessonIds`, `currentPath`, `recommendedPath`, `recommendedIsFallback`, `paths` (member outlines). Add fields there.
3. `useLearner()` in `src/lib/use-learner.ts`: `{ status: loading|guest|signedIn|error, me }`; `refreshLearner()` forces a refetch.
4. Hint: `src/proxy.ts` mirrors the session cookie into `bd_auth=1`; a head script in the layout sets `html[data-learner="in"]` before paint; `globals.css` hides `[data-guest-only]` and shows `[data-member-skeleton]` under it. `guest` or `error` clears the attribute.
5. Server renders the guest version inside `LearnerRegion` (`src/components/home/LearnerRegion.tsx`) or a `data-guest-only` wrapper, with a same-size skeleton; signed in renders the member version with `settle`. See `HomePersonal.tsx`, `HomeMember.tsx`.
6. Rule: a signed-in learner must see exactly what the page showed before conversion (same access, progress, hidden blocks). Build views with `toPathView(outline, useLocale())`.
7. Saved and journey show a guest empty state (no redirect), so no proxy rule.
