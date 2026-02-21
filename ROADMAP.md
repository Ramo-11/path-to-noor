# Path to Noor — Development Roadmap

## Phase A: Admin CRUD (Foundation)
Everything depends on being able to create/manage content.

### A1. Admin API Routes
- [ ] `src/app/api/admin/topics/route.ts` — GET (list), POST (create)
- [ ] `src/app/api/admin/topics/[id]/route.ts` — GET, PUT, DELETE
- [ ] `src/app/api/admin/modules/route.ts` — GET, POST
- [ ] `src/app/api/admin/modules/[id]/route.ts` — GET, PUT, DELETE
- [ ] `src/app/api/admin/lessons/route.ts` — GET, POST
- [ ] `src/app/api/admin/lessons/[id]/route.ts` — GET, PUT, DELETE
- [ ] `src/app/api/admin/paths/route.ts` — GET, POST
- [ ] `src/app/api/admin/paths/[id]/route.ts` — GET, PUT, DELETE
- [ ] `src/app/api/admin/quizzes/route.ts` — GET, POST
- [ ] `src/app/api/admin/quizzes/[id]/route.ts` — GET, PUT, DELETE
- [ ] `src/app/api/admin/users/route.ts` — GET (list), PUT (update role/status)
- [ ] `src/lib/admin-auth.ts` — helper to validate admin session in API routes

### A2. TipTap Editor Component
- [ ] `src/components/admin/TipTapEditor.tsx` — rich text editor with toolbar
- [ ] `src/components/admin/BilingualEditor.tsx` — tabs for EN/AR with two TipTap instances

### A3. Admin Pages
- [ ] `src/app/(admin)/admin/(dashboard)/topics/page.tsx` — list with DataTable
- [ ] `src/app/(admin)/admin/(dashboard)/topics/new/page.tsx` — create form
- [ ] `src/app/(admin)/admin/(dashboard)/topics/[id]/page.tsx` — edit form
- [ ] `src/app/(admin)/admin/(dashboard)/modules/page.tsx` — list
- [ ] `src/app/(admin)/admin/(dashboard)/modules/new/page.tsx` — create (with lesson ordering)
- [ ] `src/app/(admin)/admin/(dashboard)/modules/[id]/page.tsx` — edit
- [ ] `src/app/(admin)/admin/(dashboard)/lessons/page.tsx` — list
- [ ] `src/app/(admin)/admin/(dashboard)/lessons/new/page.tsx` — create (with TipTap)
- [ ] `src/app/(admin)/admin/(dashboard)/lessons/[id]/page.tsx` — edit
- [ ] `src/app/(admin)/admin/(dashboard)/paths/page.tsx` — list
- [ ] `src/app/(admin)/admin/(dashboard)/paths/new/page.tsx` — create (with module ordering)
- [ ] `src/app/(admin)/admin/(dashboard)/paths/[id]/page.tsx` — edit
- [ ] `src/app/(admin)/admin/(dashboard)/quizzes/page.tsx` — list
- [ ] `src/app/(admin)/admin/(dashboard)/quizzes/new/page.tsx` — create (question builder)
- [ ] `src/app/(admin)/admin/(dashboard)/quizzes/[id]/page.tsx` — edit
- [ ] `src/app/(admin)/admin/(dashboard)/users/page.tsx` — user list + role management

---

## Phase B: User Auth Flow
Public-facing authentication for learners.

- [ ] `src/app/(public)/[locale]/login/page.tsx` — email/password + Google OAuth
- [ ] `src/app/(public)/[locale]/register/page.tsx` — sign-up form + Google OAuth
- [ ] Update NextAuth pages config to use locale-aware paths
- [ ] Add auth state to Navbar (show user avatar/name when logged in)
- [ ] Add `src/messages/{en,ar}.json` auth-related strings (already done)

---

## Phase C: Public Content Pages
The learner-facing experience.

### C1. Topic Browsing
- [ ] `src/app/(public)/[locale]/topics/page.tsx` — grid of top-level topics
- [ ] `src/app/(public)/[locale]/topics/[slug]/page.tsx` — topic detail + subtopics + related modules
- [ ] `src/lib/data.ts` — server-only DB query functions (getTopics, getTopicBySlug, etc.)

### C2. Learning Paths
- [ ] `src/app/(public)/[locale]/paths/page.tsx` — grid of learning paths with difficulty badges
- [ ] `src/app/(public)/[locale]/paths/[slug]/page.tsx` — path detail + module list + progress bar

### C3. Lesson Viewer
- [ ] `src/app/(public)/[locale]/learn/[slug]/page.tsx` — lesson content renderer
- [ ] `src/components/shared/TipTapRenderer.tsx` — read-only TipTap content display
- [ ] Previous/next lesson navigation
- [ ] "Mark as complete" button (requires auth)
- [ ] Bookmark button

### C4. Quiz Experience
- [ ] Quiz component embedded in lesson page (when lesson type is "quiz")
- [ ] Question display with bilingual text
- [ ] Answer selection + submission
- [ ] Score display + explanation reveal
- [ ] Progress recording

---

## Phase D: Progress & Personalization
Logged-in user features.

- [ ] `src/app/api/user/progress/route.ts` — mark lesson complete, get progress
- [ ] `src/app/api/user/bookmarks/route.ts` — add/remove bookmarks
- [ ] `src/app/(public)/[locale]/dashboard/page.tsx` — user dashboard (my progress, bookmarks, continue learning)
- [ ] Progress bars on path/module pages
- [ ] "Continue where you left off" on homepage

---

## Phase E: Polish & Production
Final touches before launch.

- [ ] Footer component
- [ ] 404 page (bilingual)
- [ ] Loading states for all pages (loading.tsx files)
- [ ] Error boundaries (error.tsx files)
- [ ] Metadata for all public pages (dynamic SEO)
- [ ] JSON-LD structured data for courses
- [ ] OpenGraph images
- [ ] Mobile responsiveness audit
- [ ] RTL layout audit
- [ ] Accessibility audit (keyboard nav, screen reader)
- [ ] Performance optimization (lazy loading, image optimization)

---

## Dependency Order
```
A1 (API routes) + A2 (TipTap editor) → A3 (Admin pages)
                                          ↓
B (User auth) ←──────────────────── can start in parallel
                                          ↓
A3 complete → C (Public pages) → D (Progress tracking)
                                          ↓
                                    E (Polish)
```
