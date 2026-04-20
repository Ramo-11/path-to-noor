# Path to Noor

## About
Bilingual (English/Arabic) guided learning platform for new Muslims. Structured learning paths, topic-based browsing, lessons with TipTap rich content, quizzes, progress tracking, and full RTL support.

## Tech Stack
- Next.js 16, TypeScript, Tailwind CSS v4, motion
- MongoDB Atlas + Mongoose 9
- NextAuth v5 (beta.30) — credentials + Google OAuth
- next-intl (English + Arabic, locale prefix "always")
- TipTap v3, Cloudinary, Zod, GA4

## Architecture

### Route Groups
- `(public)/[locale]/` — Public pages with i18n. Layout sets `<html lang={locale} dir={dir}>`.
- `(admin)/admin/` — Admin panel. Always `<html lang="en">`. SessionProvider wrapped.

### i18n Routing
- Locales: `["en", "ar"]`, default `"en"`, prefix `"always"` → URLs: `/en/...`, `/ar/...`
- Strings in `src/messages/{en,ar}.json`
- `useTranslations()` (client), `getTranslations()` (server)
- Locale-aware nav via `@/i18n/navigation` (Link, redirect, usePathname, useRouter)

### Middleware
- `/admin/*`, `/api/*` → pass through
- Everything else → next-intl locale routing

### Bilingual Content Model
All content stored as `{ en: string, ar: string }`:
```typescript
name: { en: "Prayer", ar: "الصلاة" }
content: { en: TipTapJSON, ar: TipTapJSON }
```

### Guest Access
Public routes allow unauthenticated browsing. Auth required for progress, bookmarks, quizzes. Admin routes require admin role.

## File Structure
```
src/
├── app/
│   ├── (public)/[locale]/       # Public pages (topics, paths, learn, login, register)
│   ├── (admin)/admin/           # Admin panel (dashboard, topics, modules, lessons, paths, quizzes, users)
│   └── api/auth/[...nextauth]/
├── components/ (ui/, layout/, shared/, admin/)
├── db/models/                   # User, Topic, Module, Lesson, LearningPath, Quiz
├── i18n/ (routing.ts, request.ts, navigation.ts)
├── lib/ (auth-config.ts, data.ts, data-utils.ts)
├── messages/ (en.json, ar.json)
└── middleware.ts
```

## Data Models
- **User**: role, preferredLanguage, progress [{lessonId, completedAt}], bookmarks
- **Topic**: hierarchical (parent self-ref), name/desc {en, ar}, slug, icon, order
- **Module**: title/desc {en, ar}, topics [ref], lessons [{lessonId, order}]
- **Lesson**: title/content {en, ar} (TipTap JSON as Mixed), type (article/video/quiz), estimatedMinutes
- **LearningPath**: title/desc {en, ar}, difficulty, modules [{moduleId, order}]
- **Quiz**: per-lesson, questions with bilingual text + options + explanations

## Project-Specific Pitfalls
- **next-intl**: Import Link from `@/i18n/navigation`, not `next/link`, in public pages
- **RTL**: Use logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start`, `end`) instead of `pl-`, `pr-`, `left`, `right`
- **Admin pages**: Use regular `next/link` (no i18n needed)

## Design System
- Primary: Deep Royal Blue (#1E3A5F). Accent: Rich Gold (#D4A017)
- Fonts: Noto Sans (Latin), Noto Sans Arabic
- Standard design utilities (glass-card, gradient-mesh, AnimateIn, etc.)
- **RTL-aware**: decorative-line, animated-underline adapt to text direction

## Admin Panel
Sidebar: Dashboard, Topics, Learning Paths, Modules, Lessons, Quizzes, Users (super_admin only)
