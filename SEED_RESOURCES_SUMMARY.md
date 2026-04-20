# Resource Seed Summary

Seeded from `resources_excel.xlsx` via `npx tsx src/db/seed-resources.ts`.

## What Was Created

### Topics (13 total)
| Topic | Slug | Status | Lessons |
|-------|------|--------|---------|
| Pillars of Islam | `pillars-of-faith` | Published | 6 |
| Prayer (Salah) | `prayer` | Published | 15 + 10 videos |
| Quran | `quran` | Published | 6 |
| Halal & Haram | `res-halal-and-haram` | Published | 4 |
| Dawah | `res-dawah` | Published | 2 + 3 videos |
| Supplications & Phrases | `res-supplication` | Published | 6 |
| Common Questions | `res-common-questions` | Published | 5 |
| Marriage | `res-marriage` | **Unpublished** | 0 |
| Palestine | `res-palestine` | **Unpublished** | 0 |
| Fiqh | `res-fiqh` | **Unpublished** | 0 |
| Hadith | `res-hadith` | **Unpublished** | 0 |
| Sahaba | `res-sahaba` | **Unpublished** | 0 |
| Prophets | `res-prophets` | **Unpublished** | 0 |

### Modules (9 total)
1. **Pillars of Islam Essentials** — 6 lessons (unpublished, need content)
2. **Prayer Fundamentals** — 15 lessons (unpublished, need content)
3. **Prayer Video Resources** — 10 video lessons (published, have video links)
4. **Essential Short Surahs** — 6 lessons (unpublished, need content)
5. **Understanding Halal & Haram** — 4 lessons (unpublished, need content)
6. **Introduction to Dawah** — 2 lessons (unpublished, need content)
7. **Dawah Video Resources** — 3 video lessons (published, have video links)
8. **Common Islamic Phrases** — 6 lessons (unpublished, need content)
9. **Common Questions for New Muslims** — 5 lessons (unpublished, need content)

### Lessons (57 total)
- **44 text lessons** — created as **unpublished** with placeholder content ("Learning objective: ... / Content to be added.")
- **13 video lessons** — created as **published** with video links embedded in content

## What's Missing (Needs Manual Work)

### 1. Lesson Body Content (44 lessons)
All non-video lessons only have titles and learning objectives. Actual educational content needs to be written and added through the admin panel. These lessons are unpublished until content is added.

### 2. Arabic Translations (all 57 lessons)
The Excel had no Arabic text. All lesson titles and content have empty Arabic fields (`""`). Need to be filled in through the admin panel.

### 3. Spanish Translations (all 57 lessons)
Same as Arabic — all empty. Need to be filled in.

### 4. Empty Topics (6 topics)
These were listed in the Excel with no sub-topics or content:
- Marriage, Palestine, Fiqh, Hadith, Sahaba, Prophets
- Created as **unpublished** topics with no modules or lessons
- Need content planning before they go live

### 5. No Learning Paths or Quizzes
The Excel only contained topics/lessons. No learning path ordering or quiz questions were provided.

## Typos Fixed From Excel

| Excel Original | Corrected To |
|---------------|-------------|
| Pillers | Pillars of Islam |
| Halah / Haram | Halal & Haram |
| Profits | Prophets |
| Palistine | Palestine |
| wemon | Women |
| crismats | Christmas |
| Salah Videw | (not used — clean title instead) |
| Wduu | Wudu |

## Data Decisions Made

1. **Duplicate removed**: Excel had two near-identical rows about adultery/relationships outside marriage. Kept one about adultery and one about relationships outside marriage, dropped the duplicate.
2. **Orphaned rows assigned**: Some rows had empty topic columns. Assigned contextually:
   - "Meaning of Subhanallah/Alhamdulillah/Allahu Akbar/Mashallah/Tawakkul" → Supplication topic
   - "Can I say Merry Christmas / celebrate Thanksgiving / make dua for non-Muslim relatives" → Common Questions topic
3. **Video lessons published**: Since the video link IS the content, these were set to `published: true`. Text lessons set to `published: false` since they need body content.

## Re-running the Script

- **Safe to re-run**: Checks for existing slugs before creating. Skips duplicates.
- **Force mode**: `npx tsx src/db/seed-resources.ts --force` clears all `res-*` slugged items and re-creates.
- **Won't affect existing data**: Topics like Prayer/Quran/Pillars are found by slug and reused, not duplicated.
