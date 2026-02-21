# Path to Noor — Admin Guide

## Quick Start

### 1. Configure Environment

Edit `.env.local` with your actual credentials:

```env
# MongoDB Atlas — replace with your connection string
MONGODB_URI=mongodb+srv://username:<db_password>@cluster.mongodb.net
DB_PASSWORD=your_actual_password
DB_NAME_DEV=path_to_noor_dev

# NextAuth — generate a random secret (run: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional — for "Continue with Google")
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Install & Run

```bash
cd ~/codespace/sahab/products/path-to-noor
npm install
npm run dev
```

### 3. Create Your Admin Account

There is no default admin account. You must seed one:

```bash
npm run seed
```

This interactive script will ask for:
- **Email** — your login email
- **Display name** — shown in the admin panel
- **Password** — minimum 8 characters

The first user created is automatically a `super_admin`. Subsequent users get the `admin` role.

### 4. Log In to Admin

Go to **http://localhost:3000/admin/login** and sign in with the email/password you just created.

---

## URLs

| URL | What it is |
|-----|-----------|
| `http://localhost:3000/en` | Public site (English) |
| `http://localhost:3000/ar` | Public site (Arabic) |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/admin` | Admin dashboard (after login) |

---

## Admin Panel Overview

Once logged in at `/admin`, you'll see a sidebar with these sections:

### Topics
`/admin/topics`

Topics are the top-level categories for organizing content (e.g., "Prayer", "Quran", "Islamic History"). Topics can be hierarchical — a topic can have a parent topic to create subcategories.

**Fields:**
- Name (English + Arabic)
- Slug (auto-generated from English name, URL-friendly)
- Description (English + Arabic)
- Icon (Lucide icon name, default: "BookOpen")
- Parent Topic (optional, for creating subtopics)
- Order (controls display order)
- Published (only published topics appear on the public site)

### Modules
`/admin/modules`

Modules are collections of lessons grouped under topics. Think of them as "chapters" or "units".

**Fields:**
- Title (English + Arabic)
- Slug
- Description (English + Arabic)
- Thumbnail URL (optional, for a cover image)
- Published

### Lessons
`/admin/lessons`

Lessons are the actual content pieces. Each lesson belongs to a module and has a rich text editor for bilingual content.

**Fields:**
- Title (English + Arabic)
- Slug
- Module (which module this lesson belongs to)
- Type: `article` (text content), `video`, or `quiz`
- Duration (estimated reading time in minutes)
- Content (rich text editor with English/Arabic tabs)
- Published

The content editor supports: bold, italic, underline, headings (H1-H3), bullet/ordered lists, blockquotes, code blocks, horizontal rules, and undo/redo. Switch between the English and Arabic tabs to write content in both languages.

### Learning Paths
`/admin/paths`

Learning paths are curated sequences of modules. They guide learners through content in a structured order (e.g., "New Muslim Essentials", "Understanding the Quran").

**Fields:**
- Title (English + Arabic)
- Slug
- Description (English + Arabic)
- Thumbnail URL (optional)
- Difficulty: Beginner, Intermediate, or Advanced
- Estimated Hours
- Published

### Quizzes
`/admin/quizzes`

Each quiz is attached to a specific lesson. Quizzes have multiple questions, each with bilingual text and multiple-choice options.

**Fields:**
- Lesson (which lesson this quiz belongs to — one quiz per lesson)
- Passing Score (percentage, default 70%)
- Required (whether the quiz must be passed to continue)
- Questions (each with English/Arabic text, 2+ options, correct answer marking, optional explanation)

### Users
`/admin/users`

View all registered users. Shows their name, email, role, active status, preferred language, and join date. Users register themselves through the public site — you can view them here but user creation is handled via the public registration or Google OAuth.

---

## Content Workflow

Recommended order for setting up content:

1. **Create Topics** — Set up your top-level categories first
2. **Create Modules** — Add modules under your topics
3. **Create Lessons** — Write lesson content with the bilingual editor
4. **Create Quizzes** — Attach quizzes to lessons that need assessment
5. **Create Learning Paths** — Arrange modules into guided learning sequences
6. **Publish** — Toggle the "Published" switch on each item when ready. Unpublished content is hidden from the public site.

---

## User Roles

| Role | Access |
|------|--------|
| `super_admin` | Full admin panel access. Created by the seed script (first user). |
| `admin` | Full admin panel access. Created by seed script (subsequent users). |
| `user` | Public site only. Created when someone registers or signs in with Google. |

---

## Google OAuth Setup (Optional)

To enable "Continue with Google" on the login/register pages:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Go to **APIs & Services > Credentials**
4. Create an **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Secret into `.env.local`

If you don't set up Google OAuth, the Google button simply won't work — credentials login still functions normally.

---

## Bilingual Content

All content fields support English and Arabic. The public site automatically displays the correct language based on the URL:

- `/en/topics` — shows English content
- `/ar/topics` — shows Arabic content with RTL layout

When creating content in the admin panel, always fill in both English and Arabic fields for the best user experience. If Arabic is left empty, the site falls back to English.
