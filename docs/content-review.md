# Lesson content: points for a scholar to review

Published 2026-09-24: 67 lessons (44 existing drafts filled in, 23 new in the Stage 3 path "Growing Deeper in Faith") in English, Arabic, and Spanish. Source files: `src/db/content/`; import with `npm run import:content` (development) or `NODE_ENV=production npm run import:content`.

## How the content was checked

- Every Quran quote was copied from the Tanzil Uthmani text (api.alquran.cloud), with Saheeh International (English), Isa García (Spanish), and al-Muyassar (Arabic explanation). An automated scan confirms every Quran string matches.
- Every hadith was fetched from the Hadith Encyclopedia (hadeethenc.com) or the standard collections, and only sahih or hasan hadith are used. Where recognized graders disagree (one grades it weak), the hadith was removed: Tirmidhi 2517 (tie your camel), Ibn Majah 3803, Nasa'i 3371, Abu Dawud 1573, Tirmidhi 413, Abu Dawud 5195 (replaced by Tirmidhi 2689), Abu Dawud 850, Tirmidhi 2499. Weak narrations were left out entirely (for example Tirmidhi 3619, Tirmidhi 3683, the weak reply to the iqamah).
- Each lesson was written by one agent and re-checked by a second, independent one.
- Contested questions show the majority view with a disclaimer at the bottom, as decided on 2026-09-24. Majority claims are backed by IslamWeb, IslamQA, and AMJA fatwas that name the majority.

## Please review

1. **Thanksgiving** (`res-celebrating-thanksgiving`): no source names a majority view, so the lesson follows the more cautious view and its disclaimer says so.
2. **Dua for deceased non-Muslim relatives** (`res-dua-non-muslim-relatives`): sources describe the ruling as consensus, so it carries no "scholars differ" disclaimer.
3. **Al-Fatiha 1:7** (`res-meaning-fatiha`): describes the qualities (knowing the truth and not following it, losing the way) rather than naming the groups al-Muyassar names, out of care for readers from Christian families.
4. **Isa's return** (`prophets-isa-maryam`): quotes only the first sentence of Bukhari 3448 / Muslim 155, marked as part of a longer hadith; the full text is linked.
5. **Relationships** (`res-relationships-outside-marriage`): for reverts dating or married to a non-Muslim, states only the agreed basics and refers them to a scholar or imam.
6. **School attributions from general fiqh knowledge**, confirmed by the reviewers against IslamWeb and Dorar: what breaks wudu (touching, spouse contact), the follower's words after ruku, ghusl on entering Islam, dua in one's own language in prayer, hand position, iqamah repetitions, Eid takbir counts.
7. **Recitation tips** in the short surah lessons (qalqalah, ghunnah, stopping rules) are standard Hafs tajweed written without a fetched source; worth a qualified reciter's glance.
8. **Applications beyond a hadith's own setting**: Bukhari 3282 (seeking refuge, said in anger) used as a general phrase; Bukhari 6069 / Muslim 2990 used to reassure new Muslims they need not disclose their past; Muslim 2552 applied to the friends of a non-Muslim parent.
9. **Own translations**: where the Hadith Encyclopedia has no Spanish (and in a few English cases), the meaning was translated by the writers and labeled; the reviewers checked them against the Arabic.
10. **Zakah**: no money figures are given for the threshold; learners are pointed to their local masjid.

## Video curriculum (added 2026-10-17)

60 YouTube videos from Omar's curriculum sheet, approved by Omar as is, including the madhhab and Sunni and Shia talks. 25 sit in a "Watch" section at the end of the matching lesson; 32 are their own video lessons in seven new steps (`watch-*` files). The videos are in English for all three languages. Not added: the curriculum's "Why your dua may feel unanswered" (Omar Suleiman, APMbmqtV5nI), removed from YouTube, and "Advice to new reverts" (Mufti Menk), already on the site as `res-video-advice-reverts`.

## Lighter, visual lessons (2026-10-17)

All 67 teaching lessons were restructured in English, Arabic, and Spanish into shorter text with visual blocks; optional depth moved into closed "more" sections. A script confirmed every Quran and hadith quote, citation, and phrase card is unchanged. Points worth a scholar's glance:

1. **Paraphrased hadith lines** now sit in timeline or fact cards: the Prophet asking Abu Bakr to lead the prayer, Umar's dua, Khadijah's greeting from Allah, fact cards in `seerah-his-character`, and the Tirmidhi 2689 greeting rewards as a flow in `res-meaning-mashallah`.
2. **New two-column summaries** built from the lessons' own sentences: who the Prophet is and is not (`res-meaning-shahadah`), "Christians believe" beside "The Quran teaches" on the crucifixion (`prophets-isa-maryam`), wudu before touching the mushaf (`quran-reading-as-new-muslim`), zakah below and above the nisab (`res-meaning-five-pillars`), Eid extra takbir counts (`res-eid-prayer`).
3. **`res-taharah`**: the main text now says "the believer never becomes impure" with the Abu Hurayrah narration and citation inside the closed section.
4. **`res-prayer-parts`**: several steps were merged; the "be at ease in each position" hadith moved into the closed section while the key point still refers to it.
5. **Whole-verse cards** added for Ayat al-Kursi (2:255) and the end of Al-Baqarah (2:285, 2:286), joined from the existing split cards, to carry recitation audio.
6. **Audio**: Quran recitation is Mishary Alafasy (everyayah.com). Dhikr, duas, and hadith phrases use an AI Arabic voice, checked by transcription; a native speaker should still listen to them once.
