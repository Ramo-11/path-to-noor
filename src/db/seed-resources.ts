/**
 * Seed script to populate the database with resource data from resources_excel.xlsx.
 *
 * Usage:
 *   npx tsx src/db/seed-resources.ts
 *   npx tsx src/db/seed-resources.ts --force   # clear resource data and re-seed
 *
 * Creates topics, modules, lessons, and learning paths. Reuses existing topics
 * (Prayer, Quran, Pillars of Faith) if they already exist. All new slugs
 * prefixed with "res-" to avoid collisions with seed-data.ts.
 *
 * Lessons are created as UNPUBLISHED (no body content yet — only titles).
 * Video lessons are created as PUBLISHED (video link IS the content).
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose, { Types } from "mongoose";
import { Topic } from "./models/Topic";
import { Module } from "./models/Module";
import { Lesson } from "./models/Lesson";
import { LearningPath } from "./models/LearningPath";

// ─── Helpers ──────────────────────────────────────────────

function buildMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  const password = process.env.DB_PASSWORD;
  const dbName =
    process.env.NODE_ENV === "production"
      ? process.env.DB_NAME_PROD
      : process.env.DB_NAME_DEV;

  if (!uri || !password || !dbName) {
    throw new Error("Missing MONGODB_URI, DB_PASSWORD, or DB_NAME_* in .env");
  }

  const fullUri = uri.replace("<db_password>", password);
  const url = new URL(fullUri);
  url.pathname = `/${dbName}`;
  return url.toString();
}

function tri(en: string, ar: string, es: string) {
  return { en, ar, es };
}

function tiptapDoc(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function tiptapVideoDoc(title: string, url: string) {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: title }],
      },
      {
        type: "youtube",
        attrs: {
          src: url,
          start: 0,
          width: 640,
          height: 480,
        },
      },
    ],
  };
}

const emptyDoc = { type: "doc", content: [] };

function placeholderContent(objective: string) {
  return tiptapDoc([objective, "Content to be added."]);
}

async function findOrCreateTopic(
  slug: string,
  data: {
    name: ReturnType<typeof tri>;
    description: ReturnType<typeof tri>;
    icon: string;
    order: number;
    parent?: Types.ObjectId;
    published?: boolean;
  }
) {
  const existing = await Topic.findOne({ slug });
  if (existing) {
    console.log(`  ✓ Topic "${slug}" exists — reusing`);
    return existing;
  }
  const topic = await Topic.create({
    ...data,
    slug,
    published: data.published ?? true,
  });
  console.log(`  + Created topic "${slug}"`);
  return topic;
}

async function createModuleWithLessons(
  moduleSlug: string,
  moduleData: {
    title: ReturnType<typeof tri>;
    description: ReturnType<typeof tri>;
    topicIds: Types.ObjectId[];
  },
  lessons: Array<{
    slug: string;
    title: ReturnType<typeof tri>;
    contentEn: ReturnType<typeof tiptapDoc>;
    estimatedMinutes?: number;
    published?: boolean;
  }>
) {
  const existingModule = await Module.findOne({ slug: moduleSlug });
  if (existingModule) {
    console.log(`  ✓ Module "${moduleSlug}" exists — skipping`);
    return existingModule;
  }

  // Create module first with placeholder
  const mod = await Module.create({
    title: moduleData.title,
    description: moduleData.description,
    slug: moduleSlug,
    topics: moduleData.topicIds,
    lessons: [],
    published: true,
  });
  console.log(`  + Created module "${moduleSlug}"`);

  // Create lessons
  const lessonRefs: Array<{ lessonId: Types.ObjectId; order: number }> = [];

  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    const existingLesson = await Lesson.findOne({ slug: l.slug });
    if (existingLesson) {
      console.log(`    ✓ Lesson "${l.slug}" exists — skipping`);
      lessonRefs.push({ lessonId: existingLesson._id as Types.ObjectId, order: i + 1 });
      continue;
    }

    const lesson = await Lesson.create({
      title: l.title,
      content: {
        en: l.contentEn,
        ar: emptyDoc,
        es: emptyDoc,
      },
      slug: l.slug,
      moduleId: mod._id,
      estimatedMinutes: l.estimatedMinutes ?? 5,
      published: l.published ?? false,
    });
    console.log(`    + Created lesson "${l.slug}"`);
    lessonRefs.push({ lessonId: lesson._id as Types.ObjectId, order: i + 1 });
  }

  // Update module with lesson references
  await Module.findByIdAndUpdate(mod._id, { lessons: lessonRefs });
  return mod;
}

// ─── Seed ─────────────────────────────────────────────────

async function seed() {
  const force = process.argv.includes("--force");

  const mongoUri = buildMongoUri();
  console.log(`Connecting to: ${mongoUri.replace(/\/\/.*@/, "//***@")}...`);
  await mongoose.connect(mongoUri);
  console.log("Connected.\n");

  if (force) {
    console.log("Clearing resource data (res-* slugs)...");
    await Promise.all([
      Topic.deleteMany({ slug: /^res-/ }),
      Module.deleteMany({ slug: /^res-/ }),
      Lesson.deleteMany({ slug: /^res-/ }),
      LearningPath.deleteMany({ slug: /^res-/ }),
    ]);
    console.log("Cleared.\n");
  }

  // ─── Topics ─────────────────────────────────────────

  console.log("Creating/finding topics...\n");

  // Reuse existing topics from seed-data.ts if present
  const topicPillars = await findOrCreateTopic("pillars-of-faith", {
    name: tri("Pillars of Islam", "أركان الإسلام", "Pilares del Islam"),
    description: tri(
      "Learn the core pillars and beliefs that form the foundation of Islam.",
      "تعلم الأركان والمعتقدات الأساسية التي تشكل أساس الإسلام.",
      "Aprende los pilares y creencias fundamentales que forman la base del Islam."
    ),
    icon: "⭐",
    order: 1,
  });

  const topicPrayer = await findOrCreateTopic("prayer", {
    name: tri("Prayer (Salah)", "الصلاة", "La Oración (Salah)"),
    description: tri(
      "Learn the foundations of Islamic prayer, from purification to the five daily prayers.",
      "تعلم أساسيات الصلاة في الإسلام، من الطهارة إلى الصلوات الخمس.",
      "Aprende los fundamentos de la oración islámica."
    ),
    icon: "🕌",
    order: 2,
  });

  const topicQuran = await findOrCreateTopic("quran", {
    name: tri("Quran", "القرآن الكريم", "El Corán"),
    description: tri(
      "Explore the Holy Quran — its themes, guidance, and how to begin reading it.",
      "استكشف القرآن الكريم — مواضيعه وإرشاداته وكيفية البدء بقراءته.",
      "Explora el Sagrado Corán."
    ),
    icon: "📖",
    order: 3,
  });

  const topicHalalHaram = await findOrCreateTopic("res-halal-and-haram", {
    name: tri("Halal & Haram", "الحلال والحرام", "Halal y Haram"),
    description: tri(
      "Understand what is permissible and prohibited in Islam.",
      "تعرف على ما هو حلال وما هو حرام في الإسلام.",
      "Comprende lo que está permitido y prohibido en el Islam."
    ),
    icon: "⚖️",
    order: 7,
  });

  const topicDawah = await findOrCreateTopic("res-dawah", {
    name: tri("Dawah", "الدعوة", "Dawah"),
    description: tri(
      "Resources for sharing Islam and understanding its message.",
      "مصادر لنشر الإسلام وفهم رسالته.",
      "Recursos para compartir el Islam y comprender su mensaje."
    ),
    icon: "📢",
    order: 8,
  });

  const topicSupplication = await findOrCreateTopic("res-supplication", {
    name: tri("Supplications & Phrases", "الأذكار والأدعية", "Súplicas y Frases"),
    description: tri(
      "Learn the meaning of common Islamic phrases and daily supplications.",
      "تعلم معاني الأذكار والعبارات الإسلامية الشائعة.",
      "Aprende el significado de frases islámicas comunes y súplicas diarias."
    ),
    icon: "🤲",
    order: 9,
  });

  const topicQuestions = await findOrCreateTopic("res-common-questions", {
    name: tri("Common Questions", "أسئلة شائعة", "Preguntas Frecuentes"),
    description: tri(
      "Answers to frequently asked questions by new Muslims.",
      "إجابات على الأسئلة الشائعة للمسلمين الجدد.",
      "Respuestas a preguntas frecuentes de nuevos musulmanes."
    ),
    icon: "❓",
    order: 10,
  });

  // Empty topics (no lessons yet — placeholders for future content)
  await findOrCreateTopic("res-marriage", {
    name: tri("Marriage", "الزواج", "Matrimonio"),
    description: tri(
      "Islamic teachings on marriage, family, and relationships.",
      "تعاليم الإسلام حول الزواج والأسرة والعلاقات.",
      "Enseñanzas islámicas sobre el matrimonio, la familia y las relaciones."
    ),
    icon: "💍",
    order: 11,
    published: false,
  });

  await findOrCreateTopic("res-palestine", {
    name: tri("Palestine", "فلسطين", "Palestina"),
    description: tri(
      "Understanding the significance of Palestine in Islam.",
      "فهم أهمية فلسطين في الإسلام.",
      "Comprender la importancia de Palestina en el Islam."
    ),
    icon: "🇵🇸",
    order: 12,
    published: false,
  });

  await findOrCreateTopic("res-fiqh", {
    name: tri("Fiqh (Islamic Jurisprudence)", "الفقه", "Fiqh (Jurisprudencia Islámica)"),
    description: tri(
      "Islamic rulings on worship, transactions, and daily life.",
      "الأحكام الإسلامية في العبادات والمعاملات والحياة اليومية.",
      "Normas islámicas sobre adoración, transacciones y vida diaria."
    ),
    icon: "📝",
    order: 13,
    published: false,
  });

  await findOrCreateTopic("res-hadith", {
    name: tri("Hadith", "الحديث", "Hadiz"),
    description: tri(
      "Sayings and traditions of Prophet Muhammad (peace be upon him).",
      "أحاديث وسنة النبي محمد ﷺ.",
      "Dichos y tradiciones del Profeta Muhammad (la paz sea con él)."
    ),
    icon: "📜",
    order: 14,
    published: false,
  });

  await findOrCreateTopic("res-sahaba", {
    name: tri("Sahaba (Companions)", "الصحابة", "Sahaba (Compañeros)"),
    description: tri(
      "Stories and lessons from the companions of the Prophet.",
      "قصص ودروس من صحابة النبي ﷺ.",
      "Historias y lecciones de los compañeros del Profeta."
    ),
    icon: "👥",
    order: 15,
    published: false,
  });

  await findOrCreateTopic("res-prophets", {
    name: tri("Prophets", "الأنبياء", "Profetas"),
    description: tri(
      "Stories of the Prophets mentioned in the Quran and Sunnah.",
      "قصص الأنبياء المذكورين في القرآن والسنة.",
      "Historias de los Profetas mencionados en el Corán y la Sunnah."
    ),
    icon: "🌟",
    order: 16,
    published: false,
  });

  // ─── Modules & Lessons ──────────────────────────────

  console.log("\nCreating modules and lessons...\n");

  // ── Pillars of Islam ──

  const modPillars = await createModuleWithLessons(
    "res-pillars-essentials",
    {
      title: tri(
        "Pillars of Islam Essentials",
        "أساسيات أركان الإسلام",
        "Esenciales de los Pilares del Islam"
      ),
      description: tri(
        "Learn the Shahaadah, the five beliefs, and the five pillars of Islam.",
        "تعلم الشهادة والمعتقدات الخمس وأركان الإسلام الخمسة.",
        "Aprende la Shahaadah, las cinco creencias y los cinco pilares del Islam."
      ),
      topicIds: [topicPillars._id as Types.ObjectId],
    },
    [
      {
        slug: "res-saying-shahadah",
        title: tri("How to Say the Shahaadah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know how to say the Shahaadah (declaration of faith)."
        ),
      },
      {
        slug: "res-meaning-shahadah",
        title: tri("The Meaning of the Shahaadah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of the Shahaadah."
        ),
      },
      {
        slug: "res-five-beliefs",
        title: tri("The Five Basic Beliefs in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Be able to state the five basic beliefs in Islam."
        ),
      },
      {
        slug: "res-meaning-five-beliefs",
        title: tri("The Meaning of the Five Basic Beliefs", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of the five basic beliefs in Islam."
        ),
      },
      {
        slug: "res-five-pillars",
        title: tri("The Five Pillars of Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Be able to state the five pillars of Islam."
        ),
      },
      {
        slug: "res-meaning-five-pillars",
        title: tri("The Meaning of the Five Pillars", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of the five pillars of Islam."
        ),
      },
    ]
  );

  // ── Prayer Fundamentals ──

  const modPrayerFundamentals = await createModuleWithLessons(
    "res-prayer-fundamentals",
    {
      title: tri(
        "Prayer Fundamentals",
        "أساسيات الصلاة",
        "Fundamentos de la Oración"
      ),
      description: tri(
        "Everything you need to know to perform your daily prayers.",
        "كل ما تحتاج معرفته لأداء صلواتك اليومية.",
        "Todo lo que necesitas saber para realizar tus oraciones diarias."
      ),
      topicIds: [topicPrayer._id as Types.ObjectId],
    },
    [
      {
        slug: "res-daily-prayer-count",
        title: tri("How Many Times to Pray Each Day", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know how many times a Muslim must pray each day."
        ),
      },
      {
        slug: "res-recite-fatiha",
        title: tri("How to Recite Suurat al-Faatihah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to recite Suurat al-Faatihah."
        ),
      },
      {
        slug: "res-meaning-fatiha",
        title: tri("The Meaning of Suurat al-Faatihah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of each verse in Suurat al-Faatihah."
        ),
      },
      {
        slug: "res-how-to-wudu",
        title: tri("How to Make Wudu", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn the steps of performing Wudu (ablution)."
        ),
      },
      {
        slug: "res-taharah",
        title: tri("How to Make Taharah (Purification)", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the rules of Taharah (purification) in Islam."
        ),
      },
      {
        slug: "res-say-in-rukuu",
        title: tri("What to Say in Rukuu (Bowing)", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know what to say during Rukuu in prayer."
        ),
      },
      {
        slug: "res-say-in-sujuud",
        title: tri("What to Say in Sujuud (Prostration)", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know what to say during Sujuud in prayer."
        ),
      },
      {
        slug: "res-recite-tahiyyaat",
        title: tri("How to Recite Al-Tahiyyaat", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to recite Al-Tahiyyaat (Tashahhud)."
        ),
      },
      {
        slug: "res-prayer-parts",
        title: tri("What to Say in Each Part of Prayer", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know what to say in each activity of the prayer."
        ),
      },
      {
        slug: "res-prayer-meanings",
        title: tri("The Meaning of What We Say in Prayer", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of what is said during prayer."
        ),
      },
      {
        slug: "res-meaning-athaan",
        title: tri("The Meaning of the Athaan (Call to Prayer)", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know the meaning of each part of the Athaan."
        ),
      },
      {
        slug: "res-meaning-iqaamah",
        title: tri("The Meaning of the Iqaamah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Know the meaning of each part of the Iqaamah."
        ),
      },
      {
        slug: "res-sunnah-vs-fard",
        title: tri("Sunnah vs. Fard in Prayer", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the difference between Sunnah and Fard in prayer."
        ),
      },
      {
        slug: "res-jumuah-prayer",
        title: tri("How to Pray Al-Jumuah (Friday Prayer)", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to pray the Friday (Jumuah) prayer."
        ),
      },
      {
        slug: "res-eid-prayer",
        title: tri("How to Pray the Eid Prayer", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to pray the Eid prayer."
        ),
      },
    ]
  );

  // ── Prayer Video Resources ──

  const modPrayerVideos = await createModuleWithLessons(
    "res-prayer-videos",
    {
      title: tri(
        "Prayer Video Resources",
        "فيديوهات تعليم الصلاة",
        "Recursos de Video para la Oración"
      ),
      description: tri(
        "Video guides for learning prayer, Wudu, and Quran recitation.",
        "أدلة مرئية لتعلم الصلاة والوضوء وتلاوة القرآن.",
        "Guías en video para aprender la oración, Wudu y recitación del Corán."
      ),
      topicIds: [topicPrayer._id as Types.ObjectId],
    },
    [
      {
        slug: "res-video-salah-full",
        title: tri("How to Pray Salah (Full Video)", "", ""),
        contentEn: tiptapVideoDoc(
          "Complete guide to performing Salah",
          "https://www.youtube.com/watch?v=K9Ud5E28Cpc"
        ),
        published: true,
      },
      {
        slug: "res-video-allahu-akbar",
        title: tri("Allahu Akbar — Pronunciation Guide", "", ""),
        contentEn: tiptapVideoDoc(
          "Learn the correct pronunciation of Allahu Akbar",
          "https://www.youtube.com/watch?v=8cf_ylHJZ6I"
        ),
        published: true,
      },
      {
        slug: "res-video-subhana-rabbiyal-azeem",
        title: tri("Subhana Rabbiyal Azeem — Pronunciation Guide", "", ""),
        contentEn: tiptapVideoDoc(
          "What to say in Rukuu (bowing)",
          "https://www.youtube.com/watch?v=zsIiBi6SWUA"
        ),
        published: true,
      },
      {
        slug: "res-video-subhana-rabbi-al-ala",
        title: tri("Subhana Rabbi Al Ala — What to Say in Sujood", "", ""),
        contentEn: tiptapVideoDoc(
          "What to say in Sujood (prostration)",
          "https://www.youtube.com/watch?v=BhwRIylgWRs"
        ),
        published: true,
      },
      {
        slug: "res-video-sami-allahu",
        title: tri("Sami Allahu Liman Hamidah — Pronunciation Guide", "", ""),
        contentEn: tiptapVideoDoc(
          "What to say when rising from Rukuu",
          "https://www.youtube.com/watch?v=mt1JX2PCpB8"
        ),
        published: true,
      },
      {
        slug: "res-video-attahiyat",
        title: tri("Learn Attahiyat (Tashahhud)", "", ""),
        contentEn: tiptapVideoDoc(
          "Full Attahiyat Lillahi Wa Salawatu — Tashahhud",
          "https://www.youtube.com/watch?v=_wwegawIKjY"
        ),
        published: true,
      },
      {
        slug: "res-video-salawat",
        title: tri("Learn Salawat (Allahumma Salli)", "", ""),
        contentEn: tiptapVideoDoc(
          "Allahumma salli ala Muhammadin — Salawat on the Prophet",
          "https://www.youtube.com/watch?v=3yenzvkkTKU"
        ),
        published: true,
      },
      {
        slug: "res-video-wudu",
        title: tri("Performing Wudu Like the Prophet (PBUH)", "", ""),
        contentEn: tiptapVideoDoc(
          "Step-by-step Wudu (ablution) demonstration",
          "https://fb.watch/nti9wVlZoh/?mibextid=ZbWKwL"
        ),
        published: true,
      },
      {
        slug: "res-video-salah-with-meaning",
        title: tri("Salah With Meaning — Step by Step", "", ""),
        contentEn: tiptapVideoDoc(
          "Prayer demonstration with translation and meaning",
          "https://www.youtube.com/watch?v=SevO7B124yU"
        ),
        published: true,
      },
      {
        slug: "res-video-fatiha-analysis",
        title: tri("Surah Al-Fatiha — Analysis", "", ""),
        contentEn: tiptapVideoDoc(
          "Deep analysis of Surah Al-Fatiha",
          "https://www.youtube.com/watch?v=THJUwTWxJmA"
        ),
        published: true,
      },
    ]
  );

  // ── Quran — Essential Short Surahs ──

  const modShortSurahs = await createModuleWithLessons(
    "res-short-surahs",
    {
      title: tri(
        "Essential Short Surahs",
        "سور قصيرة أساسية",
        "Suras Cortas Esenciales"
      ),
      description: tri(
        "Learn to recite and understand the last three surahs of the Quran.",
        "تعلم تلاوة وفهم السور الثلاث الأخيرة من القرآن.",
        "Aprende a recitar y comprender las últimas tres suras del Corán."
      ),
      topicIds: [topicQuran._id as Types.ObjectId],
    },
    [
      {
        slug: "res-recite-ikhlaas",
        title: tri("How to Recite Suurat al-Ikhlaas", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to recite Suurat al-Ikhlaas (The Sincerity)."
        ),
      },
      {
        slug: "res-meaning-ikhlaas",
        title: tri("The Meaning of Suurat al-Ikhlaas", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of the verses of Suurat al-Ikhlaas."
        ),
      },
      {
        slug: "res-recite-falaq",
        title: tri("How to Recite Suurat al-Falaq", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to recite Suurat al-Falaq (The Daybreak)."
        ),
      },
      {
        slug: "res-meaning-falaq",
        title: tri("The Meaning of Suurat al-Falaq", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of the verses of Suurat al-Falaq."
        ),
      },
      {
        slug: "res-recite-naas",
        title: tri("How to Recite Suurat al-Naas", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn how to recite Suurat al-Naas (Mankind)."
        ),
      },
      {
        slug: "res-meaning-naas",
        title: tri("The Meaning of Suurat al-Naas", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of each verse of Suurat al-Naas."
        ),
      },
    ]
  );

  // ── Halal & Haram ──

  const modHalalHaram = await createModuleWithLessons(
    "res-halal-haram-basics",
    {
      title: tri(
        "Understanding Halal & Haram",
        "فهم الحلال والحرام",
        "Entendiendo Halal y Haram"
      ),
      description: tri(
        "Learn about the key prohibitions in Islam.",
        "تعرف على المحرمات الأساسية في الإسلام.",
        "Aprende sobre las prohibiciones clave en el Islam."
      ),
      topicIds: [topicHalalHaram._id as Types.ObjectId],
    },
    [
      {
        slug: "res-alcohol-prohibition",
        title: tri("Alcohol is Prohibited in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand why drinking alcohol is prohibited in Islam."
        ),
      },
      {
        slug: "res-pork-prohibition",
        title: tri("Pork is Prohibited in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand why eating pork is prohibited in Islam."
        ),
      },
      {
        slug: "res-adultery-prohibition",
        title: tri("Adultery is Prohibited in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand why adultery is prohibited in Islam."
        ),
      },
      {
        slug: "res-relationships-outside-marriage",
        title: tri("Relationships Outside Marriage", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand that intimate relationships outside of marriage are prohibited in Islam."
        ),
      },
    ]
  );

  // ── Dawah — Lectures ──

  const modDawahIntro = await createModuleWithLessons(
    "res-dawah-intro",
    {
      title: tri(
        "Introduction to Dawah",
        "مقدمة في الدعوة",
        "Introducción al Dawah"
      ),
      description: tri(
        "Foundational lectures on sharing Islam and understanding women's rights.",
        "محاضرات تأسيسية حول نشر الإسلام وفهم حقوق المرأة.",
        "Conferencias fundamentales sobre compartir el Islam y los derechos de la mujer."
      ),
      topicIds: [topicDawah._id as Types.ObjectId],
    },
    [
      {
        slug: "res-women-rights-islam",
        title: tri("Rights of Women in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the rights that Islam grants to women."
        ),
      },
      {
        slug: "res-dawah-basics",
        title: tri("Basics of Dawah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Learn the fundamentals of giving Dawah (inviting to Islam)."
        ),
      },
    ]
  );

  // ── Dawah — Video Resources ──

  const modDawahVideos = await createModuleWithLessons(
    "res-dawah-videos",
    {
      title: tri(
        "Dawah Video Resources",
        "فيديوهات الدعوة",
        "Recursos de Video de Dawah"
      ),
      description: tri(
        "Inspirational videos about Islam, its purpose, and advice for new Muslims.",
        "فيديوهات ملهمة عن الإسلام وهدفه ونصائح للمسلمين الجدد.",
        "Videos inspiradores sobre el Islam, su propósito y consejos para nuevos musulmanes."
      ),
      topicIds: [topicDawah._id as Types.ObjectId],
    },
    [
      {
        slug: "res-video-purpose-of-life",
        title: tri("The Purpose of Life — Jeffrey Lang", "", ""),
        contentEn: tiptapVideoDoc(
          "The Purpose of Life — Lecture by Jeffrey Lang",
          "https://www.youtube.com/watch?v=ifllgTA2pmY"
        ),
        published: true,
      },
      {
        slug: "res-video-advice-reverts",
        title: tri("Advice to Recent Reverts — Mufti Menk", "", ""),
        contentEn: tiptapVideoDoc(
          "Advice to Recent Reverts — Lecture by Mufti Menk",
          "https://www.youtube.com/watch?v=MLRLW-Co80Y"
        ),
        published: true,
      },
      {
        slug: "res-video-islam-101",
        title: tri("Islam 101 — Sheikh Uthman Ibn Farooq", "", ""),
        contentEn: tiptapVideoDoc(
          "Islam 101 — Comprehensive introduction by Sheikh Uthman Ibn Farooq",
          "https://www.youtube.com/watch?v=8XPbalPahx0"
        ),
        published: true,
      },
    ]
  );

  // ── Supplications & Common Phrases ──

  const modPhrases = await createModuleWithLessons(
    "res-islamic-phrases",
    {
      title: tri(
        "Common Islamic Phrases",
        "العبارات الإسلامية الشائعة",
        "Frases Islámicas Comunes"
      ),
      description: tri(
        "Learn the meaning of everyday Islamic phrases and expressions.",
        "تعلم معاني العبارات والتعبيرات الإسلامية اليومية.",
        "Aprende el significado de frases y expresiones islámicas cotidianas."
      ),
      topicIds: [topicSupplication._id as Types.ObjectId],
    },
    [
      {
        slug: "res-meaning-inshallah",
        title: tri("Meaning of Inshallah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning and proper usage of 'Inshallah' (God willing)."
        ),
      },
      {
        slug: "res-meaning-subhanallah",
        title: tri("Meaning of Subhanallah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning and proper usage of 'Subhanallah' (Glory be to God)."
        ),
      },
      {
        slug: "res-meaning-alhamdulillah",
        title: tri("Meaning of Alhamdulillah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning and proper usage of 'Alhamdulillah' (Praise be to God)."
        ),
      },
      {
        slug: "res-meaning-allahu-akbar",
        title: tri("Meaning of Allahu Akbar", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning and proper usage of 'Allahu Akbar' (God is the Greatest)."
        ),
      },
      {
        slug: "res-meaning-mashallah",
        title: tri("Meaning of Mashallah", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning and proper usage of 'Mashallah' (God has willed it)."
        ),
      },
      {
        slug: "res-meaning-tawakkul",
        title: tri("Meaning of Tawakkul", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the meaning of Tawakkul (reliance on God) in Islam."
        ),
      },
    ]
  );

  // ── Common Questions for New Muslims ──

  const modQuestions = await createModuleWithLessons(
    "res-common-questions",
    {
      title: tri(
        "Common Questions for New Muslims",
        "أسئلة شائعة للمسلمين الجدد",
        "Preguntas Frecuentes para Nuevos Musulmanes"
      ),
      description: tri(
        "Answers to questions that new Muslims commonly ask.",
        "إجابات على الأسئلة التي يطرحها المسلمون الجدد عادةً.",
        "Respuestas a preguntas que los nuevos musulmanes suelen hacer."
      ),
      topicIds: [topicQuestions._id as Types.ObjectId],
    },
    [
      {
        slug: "res-dogs-in-islam",
        title: tri("Ruling on Dogs in Islam", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the Islamic ruling regarding dogs."
        ),
      },
      {
        slug: "res-non-muslim-holidays",
        title: tri("Can I Celebrate Non-Muslim Holidays?", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the Islamic perspective on celebrating non-Muslim holidays."
        ),
      },
      {
        slug: "res-saying-merry-christmas",
        title: tri("Can I Say Merry Christmas?", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand the Islamic perspective on greeting non-Muslims during their holidays."
        ),
      },
      {
        slug: "res-celebrating-thanksgiving",
        title: tri("Can I Celebrate Thanksgiving with My Family?", "", ""),
        contentEn: placeholderContent(
          "Learning objective: Understand how to navigate family gatherings around cultural (non-religious) holidays."
        ),
      },
      {
        slug: "res-dua-non-muslim-relatives",
        title: tri(
          "Can I Make Dua for Non-Muslim Relatives Who Passed Away?",
          "",
          ""
        ),
        contentEn: placeholderContent(
          "Learning objective: Understand the Islamic ruling on making dua for deceased non-Muslim relatives."
        ),
      },
    ]
  );

  // ─── Learning Paths ──────────────────────────────────
  //
  // Path 1: "First Steps in Islam"
  //   A new Muslim's most urgent journey. You just said the Shahadah —
  //   now understand what you believe, then learn to pray (the first
  //   obligation). Covers: beliefs → prayer basics → prayer videos →
  //   short surahs (needed in prayer).
  //
  // Path 2: "Living as a Muslim"
  //   You can pray now. Next: learn everyday phrases, understand what's
  //   halal/haram, navigate real-life questions (holidays, family), and
  //   deepen your understanding through dawah resources.

  console.log("\nCreating learning paths...\n");

  const existingPath1 = await LearningPath.findOne({ slug: "res-first-steps-in-islam" });
  if (existingPath1) {
    console.log(`  ✓ Learning path "res-first-steps-in-islam" exists — skipping`);
  } else {
    await LearningPath.create({
      title: tri(
        "First Steps in Islam",
        "الخطوات الأولى في الإسلام",
        "Primeros Pasos en el Islam"
      ),
      description: tri(
        "Your essential guide from Shahadah to prayer. Learn what Muslims believe, how to perform Wudu and Salah, and memorize the short surahs you need for prayer. This is where every new Muslim should start.",
        "دليلك الأساسي من الشهادة إلى الصلاة. تعلم ما يؤمن به المسلمون، وكيفية الوضوء والصلاة، واحفظ السور القصيرة التي تحتاجها في صلاتك. هذا هو المكان الذي يجب أن يبدأ منه كل مسلم جديد.",
        "Tu guía esencial desde la Shahada hasta la oración. Aprende las creencias del Islam, cómo hacer Wudu y Salah, y memoriza las suras cortas necesarias para la oración."
      ),
      slug: "res-first-steps-in-islam",
      difficulty: "beginner",
      estimatedHours: 8,
      modules: [
        { moduleId: modPillars._id, order: 1 },
        { moduleId: modPrayerFundamentals._id, order: 2 },
        { moduleId: modPrayerVideos._id, order: 3 },
        { moduleId: modShortSurahs._id, order: 4 },
      ],
      audience: "revert",
      guestAccessible: true,
      published: true,
    });
    console.log(`  + Created learning path "res-first-steps-in-islam"`);
  }

  const existingPath2 = await LearningPath.findOne({ slug: "res-living-as-a-muslim" });
  if (existingPath2) {
    console.log(`  ✓ Learning path "res-living-as-a-muslim" exists — skipping`);
  } else {
    await LearningPath.create({
      title: tri(
        "Living as a Muslim",
        "الحياة كمسلم",
        "Viviendo como Musulmán"
      ),
      description: tri(
        "Now that you know the basics, learn how to navigate daily life as a Muslim. Understand common Islamic phrases, what is halal and haram, get answers to questions you will face from family and friends, and deepen your faith through inspiring talks and lectures.",
        "الآن بعد أن تعلمت الأساسيات، تعلم كيف تعيش حياتك اليومية كمسلم. افهم العبارات الإسلامية الشائعة، والحلال والحرام، واحصل على إجابات للأسئلة التي ستواجهها من العائلة والأصدقاء، وعمّق إيمانك من خلال محاضرات ملهمة.",
        "Ahora que conoces lo básico, aprende a navegar la vida diaria como musulmán. Comprende frases islámicas comunes, qué es halal y haram, y obtén respuestas a preguntas de familia y amigos."
      ),
      slug: "res-living-as-a-muslim",
      difficulty: "beginner",
      estimatedHours: 5,
      modules: [
        { moduleId: modPhrases._id, order: 1 },
        { moduleId: modHalalHaram._id, order: 2 },
        { moduleId: modQuestions._id, order: 3 },
        { moduleId: modDawahIntro._id, order: 4 },
        { moduleId: modDawahVideos._id, order: 5 },
      ],
      audience: "revert",
      guestAccessible: true,
      published: true,
    });
    console.log(`  + Created learning path "res-living-as-a-muslim"`);
  }

  // ─── Summary ────────────────────────────────────────

  const topicCount = await Topic.countDocuments();
  const moduleCount = await Module.countDocuments();
  const lessonCount = await Lesson.countDocuments();
  const pathCount = await LearningPath.countDocuments();

  console.log("\n══════════════════════════════════════");
  console.log(`Done! Database now has:`);
  console.log(`  Topics:         ${topicCount}`);
  console.log(`  Modules:        ${moduleCount}`);
  console.log(`  Lessons:        ${lessonCount}`);
  console.log(`  Learning Paths: ${pathCount}`);
  console.log("══════════════════════════════════════\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
