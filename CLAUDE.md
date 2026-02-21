# Path to Noor – Claude Engineering & Design Instructions

## Shared Resources
Reusable components, templates, and reference code live at:
`~/codespace/sahab/resources/`

If you need a pattern or component not yet in this project, check the resources folder first before building from scratch. Refer to `~/codespace/sahab/resources/CLAUDE.md` for the full inventory.

## About This Project
A bilingual (English/Arabic) guided learning platform for new Muslims. Offers structured learning paths, topic-based browsing, lessons with TipTap rich content, quizzes, progress tracking, and full RTL support.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, lucide-react, motion (framer-motion successor)
- MongoDB Atlas + Mongoose 9 for database
- NextAuth v5 (next-auth@5.0.0-beta.30) for authentication (Credentials + Google OAuth)
- next-intl for i18n (English + Arabic, locale prefix "always")
- TipTap v3 for rich text editing
- bcrypt for password hashing
- Cloudinary for image hosting/optimization
- Zod for validation
- Google Analytics (GA4)

## Core Principles
- Clarity and trust are more important than complexity.
- The website must feel credible, professional, and dignified.
- Favor simplicity, accessibility, and performance over feature richness.
- Keep security tight — validate all inputs, protect all admin routes.
- Full bilingual support: every user-facing string goes through next-intl.

## Architecture

### Route Groups
- `(public)/[locale]/` — Public-facing pages with i18n. Layout sets `<html lang={locale} dir={dir}>`.
- `(admin)/admin/` — Admin panel. Always `<html lang="en">`. Wrapped with NextAuth SessionProvider.

### i18n Routing
- Locales: `["en", "ar"]`, default `"en"`, prefix `"always"`
- Public URLs: `/en/...`, `/ar/...`
- All user-facing strings in `src/messages/{en,ar}.json`
- Use `useTranslations()` in client components, `getTranslations()` in server components
- Locale-aware navigation via `@/i18n/navigation` (Link, redirect, usePathname, useRouter)

### Combined Middleware (`src/middleware.ts`)
- `/admin/*` → Pass through (auth handled by dashboard layout server component via `auth()`)
- `/api/*` → Pass through
- Everything else → next-intl locale routing

### Bilingual Content Model
All content stored with `{ en: string, ar: string }` shape:
```typescript
name: { en: "Prayer", ar: "الصلاة" }
content: { en: TipTapJSON, ar: TipTapJSON }
```

### Guest Access
- Public routes allow unauthenticated users (guest browsing)
- Authentication required only for progress tracking, bookmarks, quizzes
- Admin routes require admin/super_admin role

## File Structure
```
src/
├── app/
│   ├── globals.css              # Tailwind v4 @theme + design system
│   ├── robots.ts                # SEO
│   ├── sitemap.ts               # SEO (both /en/ and /ar/ variants)
│   ├── (public)/[locale]/       # Public pages with i18n
│   │   ├── layout.tsx           # Root layout (fonts, metadata, Navbar, NextIntlClientProvider)
│   │   ├── page.tsx             # Homepage
│   │   ├── topics/              # Topic browsing
│   │   ├── paths/               # Learning paths
│   │   ├── learn/               # Lesson viewer
│   │   ├── login/               # User login
│   │   └── register/            # User registration
│   ├── (admin)/admin/           # Admin panel
│   │   ├── layout.tsx           # Admin root layout (SessionProvider)
│   │   ├── login/page.tsx       # Admin login
│   │   └── (dashboard)/         # Dashboard pages with sidebar layout
│   │       ├── layout.tsx       # Server component with auth() check
│   │       ├── DashboardShell.tsx # Client shell (sidebar + topbar)
│   │       ├── page.tsx         # Dashboard home
│   │       ├── topics/          # Topic management
│   │       ├── modules/         # Module management
│   │       ├── lessons/         # Lesson management
│   │       ├── paths/           # Path management
│   │       ├── quizzes/         # Quiz management
│   │       └── users/           # User management
│   └── api/auth/[...nextauth]/  # NextAuth route handler
├── components/
│   ├── ui/                      # Button, Card, SectionHeading
│   ├── layout/                  # Container, ThemeToggle, Navbar
│   ├── shared/                  # CloudinaryImage, AnimateIn, AnimatedCounter, GA, JsonLd
│   └── admin/                   # AdminSidebar, AdminTopbar, DataTable, ConfirmDialog
├── config/
│   └── env.ts                   # Zod env validation
├── db/
│   ├── connection.ts            # MongoDB connection pooling
│   ├── seed-admin.ts            # CLI seed script
│   └── models/
│       ├── User.ts              # User (with progress, bookmarks, preferredLanguage)
│       ├── Topic.ts             # Topic (hierarchical with parent ref)
│       ├── Module.ts            # Module (groups lessons)
│       ├── Lesson.ts            # Lesson (TipTap JSON content)
│       ├── LearningPath.ts      # Learning Path (ordered modules)
│       └── Quiz.ts              # Quiz (per-lesson, bilingual questions)
├── i18n/
│   ├── routing.ts               # Locale config
│   ├── request.ts               # Server-side message loading
│   └── navigation.ts            # Locale-aware Link, redirect, etc.
├── lib/
│   └── auth-config.ts           # Full NextAuth config (Credentials + Google)
├── messages/
│   ├── en.json                  # English UI strings
│   └── ar.json                  # Arabic UI strings
└── middleware.ts                # Combined: admin auth + i18n routing
```

## Data Models

### User
- email, password, name, image, role (super_admin/admin/user)
- preferredLanguage (en/ar), progress [{lessonId, completedAt}], bookmarks [lessonId]

### Topic (hierarchical)
- name {en, ar}, description {en, ar}, slug, icon, parent (self-ref for subtopics), order, published

### Module
- title {en, ar}, description {en, ar}, slug, thumbnail, topics [ref], lessons [{lessonId, order}], published

### Lesson
- title {en, ar}, content {en: Mixed, ar: Mixed} (TipTap JSON), slug, moduleId, type (article/video/quiz), estimatedMinutes, published

### LearningPath
- title {en, ar}, description {en, ar}, slug, thumbnail, difficulty, estimatedHours, modules [{moduleId, order}], published

### Quiz
- lessonId (unique), required, passingScore, questions [{question {en,ar}, options [{text {en,ar}, isCorrect}], explanation {en,ar}}]

## NextAuth v5 Patterns
- `auth()` — server-side session check (used in dashboard layout)
- `signIn("credentials", { ... })` — client-side credentials login
- `signIn("google")` — Google OAuth
- `signOut({ callbackUrl })` — logout
- JWT strategy with 30-day sessions
- Token carries: id, role, preferredLanguage

## Key Architecture Decisions

### Database Patterns
- MongoDB connection uses global cache pattern to prevent connection leaks in dev
- All Mongoose models use `mongoose.models.X || mongoose.model<X>()` pattern
- **NEVER** do `const Model = cond ? A : B; Model.findById(id)` — TypeScript union of Mongoose models makes static methods non-callable

### TipTap JSON Storage
- Lesson content stored as `Schema.Types.Mixed` (arbitrary JSON)
- TipTap JSON is the canonical format — rendered on the frontend with TipTap's read-only mode
- Admin uses TipTap editor with bilingual tabs (EN/AR)

## Common Pitfalls
- **`params` is async**: In Next.js 16, always `const { slug } = await params`
- **Tailwind v4**: No `tailwind.config.ts` — use `@theme` in CSS
- **Cloudinary remotePatterns**: Already configured in `next.config.ts`
- **next-intl**: Import Link from `@/i18n/navigation`, not `next/link`, in public pages
- **RTL**: Use logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start`, `end`) instead of `pl-`, `pr-`, `ml-`, `mr-`, `left`, `right`
- **Admin pages**: Admin uses regular `next/link` (no i18n needed)

## Design System
- Color palette: Deep Royal Blue primary (#1E3A5F), Rich Gold accent (#D4A017)
- Fonts: Noto Sans (Latin), Noto Sans Arabic
- Glass morphism: `.glass-card`
- Noise texture: `.noise-overlay`
- Gradient mesh backgrounds: `.gradient-mesh`
- Decorative accents: `.decorative-line`, `.decorative-line-center` (RTL-aware)
- Gradient text: `.gradient-text` (blue → gold)
- Card hover lift: `.card-hover`
- Stat glow: `.stat-glow`
- Animated underline: `.animated-underline` (RTL-aware)
- `AnimateIn` component (presets: fade-up, fade-in, fade-left, fade-right, scale, blur-in)
- `StaggerContainer` + `StaggerItem` for grid choreography
- `AnimatedCounter` for counting-up numbers on scroll

## UI / UX Standards
- Professional, dignified design appropriate for Islamic educational content.
- Mobile-first and accessible (WCAG-aware).
- Strong visual hierarchy: clear headings, readable body text, consistent spacing.
- Always handle loading, empty, and error states.
- Smooth transitions only when they add clarity.
- Full RTL support — test both English and Arabic layouts.

## Admin Panel
- Sidebar navigation: Dashboard, Topics, Learning Paths, Modules, Lessons, Quizzes, Users (super_admin only)
- Dashboard layout is a server component that checks auth via `auth()`
- Client DashboardShell wraps sidebar + topbar
- AdminTopbar uses NextAuth `signOut()` for logout
- DataTable component for all list views
- ConfirmDialog for destructive actions

## SEO & Performance
- Metadata + Open Graph tags on all pages.
- `robots.ts` and `sitemap.ts` generators (sitemap includes both locale variants).
- `JsonLd` for structured data.
- Prefer server components. Minimize client JS.
- Use `CloudinaryImage` for optimized image delivery.
