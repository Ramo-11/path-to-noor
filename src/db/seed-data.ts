/**
 * Seed script to populate the database with sample content for development.
 *
 * Usage:
 *   npx tsx src/db/seed-data.ts
 *
 * This creates topics, subtopics, modules, lessons, learning paths, and quizzes.
 * It does NOT create users — use seed-admin.ts for that.
 *
 * Running this script multiple times will skip seeding if data already exists.
 * Pass --force to clear and re-seed.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose, { Types } from "mongoose";
import { Topic } from "./models/Topic";
import { Module } from "./models/Module";
import { Lesson } from "./models/Lesson";
import { LearningPath } from "./models/LearningPath";
import { Quiz } from "./models/Quiz";

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

// ─── Helpers ──────────────────────────────────────────────

function tiptapDoc(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function tri(en: string, ar: string, es: string) {
  return { en, ar, es };
}

// ─── Seed Data ────────────────────────────────────────────

async function seed() {
  const force = process.argv.includes("--force");

  const mongoUri = buildMongoUri();
  console.log(`Connecting to: ${mongoUri.replace(/\/\/.*@/, "//***@")}...`);
  await mongoose.connect(mongoUri);
  console.log("Connected.\n");

  const existingTopics = await Topic.countDocuments();
  if (existingTopics > 0 && !force) {
    console.log(
      `Database already has ${existingTopics} topics. Use --force to clear and re-seed.`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  if (force) {
    console.log("Clearing existing data...");
    await Promise.all([
      Topic.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
      LearningPath.deleteMany({}),
      Quiz.deleteMany({}),
    ]);
    console.log("Cleared.\n");
  }

  // ─── Root Topics ──────────────────────────────────────

  console.log("Creating topics...");

  const topicPrayer = await Topic.create({
    name: tri("Prayer (Salah)", "الصلاة", "La Oración (Salah)"),
    description: tri(
      "Learn the foundations of Islamic prayer, from purification to the five daily prayers.",
      "تعلم أساسيات الصلاة في الإسلام، من الطهارة إلى الصلوات الخمس.",
      "Aprende los fundamentos de la oración islámica, desde la purificación hasta las cinco oraciones diarias."
    ),
    slug: "prayer",
    icon: "🕌",
    order: 1,
    published: true,
  });

  const topicQuran = await Topic.create({
    name: tri("Quran", "القرآن الكريم", "El Corán"),
    description: tri(
      "Explore the Holy Quran — its themes, guidance, and how to begin reading it.",
      "استكشف القرآن الكريم — مواضيعه وإرشاداته وكيفية البدء بقراءته.",
      "Explora el Sagrado Corán — sus temas, guía y cómo comenzar a leerlo."
    ),
    slug: "quran",
    icon: "📖",
    order: 2,
    published: true,
  });

  const topicFaith = await Topic.create({
    name: tri("Pillars of Faith", "أركان الإيمان", "Pilares de la Fe"),
    description: tri(
      "Understand the six pillars of faith (Iman) that every Muslim believes in.",
      "تعرّف على أركان الإيمان الستة التي يؤمن بها كل مسلم.",
      "Comprende los seis pilares de la fe (Iman) en los que cree todo musulmán."
    ),
    slug: "pillars-of-faith",
    icon: "⭐",
    order: 3,
    published: true,
  });

  const topicHistory = await Topic.create({
    name: tri("Islamic History", "التاريخ الإسلامي", "Historia Islámica"),
    description: tri(
      "Journey through the key events and figures in Islamic history.",
      "رحلة عبر الأحداث والشخصيات الرئيسية في التاريخ الإسلامي.",
      "Un recorrido por los eventos y figuras clave de la historia islámica."
    ),
    slug: "islamic-history",
    icon: "📜",
    order: 4,
    published: true,
  });

  const topicEthics = await Topic.create({
    name: tri("Ethics & Character", "الأخلاق والآداب", "Ética y Carácter"),
    description: tri(
      "Learn about Islamic ethics, manners, and building noble character.",
      "تعلم عن الأخلاق الإسلامية والآداب وبناء الشخصية النبيلة.",
      "Aprende sobre la ética islámica, los modales y la formación del carácter noble."
    ),
    slug: "ethics-character",
    icon: "🤝",
    order: 5,
    published: true,
  });

  const topicDailyLife = await Topic.create({
    name: tri("Daily Life as a Muslim", "الحياة اليومية كمسلم", "La Vida Diaria como Musulmán"),
    description: tri(
      "Practical guidance for living as a Muslim — from food to greetings to relationships.",
      "إرشادات عملية للعيش كمسلم — من الطعام إلى التحيات إلى العلاقات.",
      "Guía práctica para vivir como musulmán — desde la comida hasta los saludos y las relaciones."
    ),
    slug: "daily-life",
    icon: "🌙",
    order: 6,
    published: true,
  });

  // ─── Subtopics ──────────────────────────────────────

  console.log("Creating subtopics...");

  const subWudu = await Topic.create({
    name: tri("Wudu (Ablution)", "الوضوء", "Wudu (Ablución)"),
    description: tri(
      "Learn the steps of purification before prayer.",
      "تعلم خطوات الطهارة قبل الصلاة.",
      "Aprende los pasos de purificación antes de la oración."
    ),
    slug: "wudu",
    icon: "💧",
    parent: topicPrayer._id,
    order: 1,
    published: true,
  });

  const subFivePrayers = await Topic.create({
    name: tri("The Five Daily Prayers", "الصلوات الخمس", "Las Cinco Oraciones Diarias"),
    description: tri(
      "Understanding the timing, structure, and significance of each prayer.",
      "فهم توقيت وبنية وأهمية كل صلاة.",
      "Comprender el horario, la estructura y el significado de cada oración."
    ),
    slug: "five-daily-prayers",
    icon: "🕐",
    parent: topicPrayer._id,
    order: 2,
    published: true,
  });

  await Topic.create({
    name: tri("Friday Prayer (Jumu'ah)", "صلاة الجمعة", "La Oración del Viernes (Yumu'ah)"),
    description: tri(
      "Learn about the special Friday congregational prayer.",
      "تعرّف على صلاة الجمعة الخاصة.",
      "Aprende sobre la oración congregacional especial del viernes."
    ),
    slug: "friday-prayer",
    icon: "🕌",
    parent: topicPrayer._id,
    order: 3,
    published: true,
  });

  const subReadingQuran = await Topic.create({
    name: tri("How to Read the Quran", "كيف تقرأ القرآن", "Cómo Leer el Corán"),
    description: tri(
      "A beginner's guide to reading and understanding the Quran.",
      "دليل المبتدئين لقراءة القرآن وفهمه.",
      "Guía para principiantes para leer y comprender el Corán."
    ),
    slug: "reading-quran",
    icon: "📚",
    parent: topicQuran._id,
    order: 1,
    published: true,
  });

  await Topic.create({
    name: tri("Key Surahs for Beginners", "سور مهمة للمبتدئين", "Suras Clave para Principiantes"),
    description: tri(
      "Essential chapters every new Muslim should know.",
      "فصول أساسية يجب على كل مسلم جديد معرفتها.",
      "Capítulos esenciales que todo nuevo musulmán debe conocer."
    ),
    slug: "key-surahs",
    icon: "🌟",
    parent: topicQuran._id,
    order: 2,
    published: true,
  });

  await Topic.create({
    name: tri("Belief in Allah", "الإيمان بالله", "La Creencia en Allah"),
    description: tri(
      "Understanding the concept of God in Islam.",
      "فهم مفهوم الله في الإسلام.",
      "Comprender el concepto de Dios en el Islam."
    ),
    slug: "belief-in-allah",
    icon: "✨",
    parent: topicFaith._id,
    order: 1,
    published: true,
  });

  await Topic.create({
    name: tri("Belief in the Prophets", "الإيمان بالأنبياء", "La Creencia en los Profetas"),
    description: tri(
      "Learn about the prophets of Islam from Adam to Muhammad (PBUH).",
      "تعرّف على أنبياء الإسلام من آدم إلى محمد ﷺ.",
      "Aprende sobre los profetas del Islam desde Adán hasta Muhammad (la paz sea con él)."
    ),
    slug: "belief-in-prophets",
    icon: "👤",
    parent: topicFaith._id,
    order: 2,
    published: true,
  });

  // ─── Modules & Lessons ─────────────────────────────

  console.log("Creating modules and lessons...");

  // Module 1: Introduction to Prayer
  const lessonWhyPray = await Lesson.create({
    title: tri("Why Do Muslims Pray?", "لماذا يصلي المسلمون؟", "¿Por Qué Rezan los Musulmanes?"),
    content: {
      en: tiptapDoc([
        "Prayer (Salah) is the second pillar of Islam and the most important act of worship after the declaration of faith (Shahada). It is a direct connection between the worshipper and Allah.",
        "Muslims pray five times a day as an obligation. Prayer provides spiritual nourishment, discipline, and a constant reminder of one's purpose in life.",
        "The Prophet Muhammad (peace be upon him) said: 'The first thing a person will be asked about on the Day of Judgment is their prayer. If it is sound, the rest of their deeds will be sound too.'",
        "Prayer is not just a ritual — it is a conversation with your Creator. It brings peace, focus, and a sense of belonging to the global Muslim community (Ummah).",
      ]),
      ar: tiptapDoc([
        "الصلاة هي الركن الثاني من أركان الإسلام وأهم عبادة بعد الشهادة. إنها صلة مباشرة بين العبد والله.",
        "يصلي المسلمون خمس مرات يوميًا كفريضة. توفر الصلاة غذاءً روحيًا وانضباطًا وتذكيرًا دائمًا بهدف الإنسان في الحياة.",
        "قال النبي محمد ﷺ: 'أول ما يُحاسب عليه العبد يوم القيامة الصلاة، فإن صلحت صلح سائر عمله.'",
        "الصلاة ليست مجرد طقس — إنها حوار مع خالقك. تجلب السلام والتركيز والشعور بالانتماء إلى الأمة الإسلامية.",
      ]),
      es: tiptapDoc([
        "La oración (Salah) es el segundo pilar del Islam y el acto de adoración más importante después de la declaración de fe (Shahada). Es una conexión directa entre el adorador y Allah.",
        "Los musulmanes rezan cinco veces al día como obligación. La oración proporciona alimento espiritual, disciplina y un recordatorio constante del propósito de la vida.",
        "El Profeta Muhammad (la paz sea con él) dijo: 'Lo primero por lo que se le preguntará a una persona el Día del Juicio es su oración. Si es correcta, el resto de sus acciones serán correctas también.'",
        "La oración no es solo un ritual — es una conversación con tu Creador. Trae paz, enfoque y un sentido de pertenencia a la comunidad musulmana global (Ummah).",
      ]),
    },
    slug: "why-do-muslims-pray",
    moduleId: new Types.ObjectId(), // placeholder, updated below
    estimatedMinutes: 5,
    published: true,
  });

  const lessonWuduSteps = await Lesson.create({
    title: tri("Step-by-Step Guide to Wudu", "دليل الوضوء خطوة بخطوة", "Guía Paso a Paso del Wudu"),
    content: {
      en: tiptapDoc([
        "Wudu (ablution) is the Islamic purification ritual performed before prayer. It involves washing specific body parts in a prescribed order.",
        "Step 1: Make the intention (Niyyah) in your heart to perform Wudu for the sake of Allah.",
        "Step 2: Say 'Bismillah' (In the name of Allah).",
        "Step 3: Wash both hands up to the wrists three times.",
        "Step 4: Rinse your mouth three times.",
        "Step 5: Sniff water into your nostrils and blow it out three times.",
        "Step 6: Wash your face three times — from the hairline to the chin, and from ear to ear.",
        "Step 7: Wash your right arm from fingertips to elbow three times, then the left arm.",
        "Step 8: Wipe your head with wet hands once, from front to back and back to front.",
        "Step 9: Wipe the inside and outside of your ears once.",
        "Step 10: Wash your right foot up to the ankle three times, then the left foot.",
        "After completing Wudu, you may say the supplication: 'Ashhadu an la ilaha illallah, wa ashhadu anna Muhammadan abduhu wa rasuluh.'",
      ]),
      ar: tiptapDoc([
        "الوضوء هو طقس الطهارة الإسلامي الذي يُؤدى قبل الصلاة. يتضمن غسل أعضاء محددة بترتيب معين.",
        "الخطوة ١: انوِ في قلبك أداء الوضوء لله تعالى.",
        "الخطوة ٢: قل 'بسم الله'.",
        "الخطوة ٣: اغسل يديك إلى الرسغين ثلاث مرات.",
        "الخطوة ٤: تمضمض ثلاث مرات.",
        "الخطوة ٥: استنشق الماء واستنثره ثلاث مرات.",
        "الخطوة ٦: اغسل وجهك ثلاث مرات — من منبت الشعر إلى الذقن ومن أذن إلى أذن.",
        "الخطوة ٧: اغسل ذراعك اليمنى من أطراف الأصابع إلى المرفق ثلاث مرات ثم اليسرى.",
        "الخطوة ٨: امسح رأسك بيديك المبللتين مرة واحدة من الأمام إلى الخلف والعكس.",
        "الخطوة ٩: امسح داخل وخارج أذنيك مرة واحدة.",
        "الخطوة ١٠: اغسل قدمك اليمنى إلى الكعب ثلاث مرات ثم اليسرى.",
        "بعد إتمام الوضوء يمكنك قول الدعاء: 'أشهد أن لا إله إلا الله وأشهد أن محمدًا عبده ورسوله.'",
      ]),
      es: tiptapDoc([
        "El Wudu (ablución) es el ritual de purificación islámico que se realiza antes de la oración. Implica lavar partes específicas del cuerpo en un orden prescrito.",
        "Paso 1: Haz la intención (Niyyah) en tu corazón de realizar el Wudu por la causa de Allah.",
        "Paso 2: Di 'Bismillah' (En el nombre de Allah).",
        "Paso 3: Lava ambas manos hasta las muñecas tres veces.",
        "Paso 4: Enjuaga tu boca tres veces.",
        "Paso 5: Aspira agua por la nariz y expúlsala tres veces.",
        "Paso 6: Lava tu rostro tres veces — desde la línea del cabello hasta la barbilla, y de oreja a oreja.",
        "Paso 7: Lava tu brazo derecho desde las yemas hasta el codo tres veces, luego el izquierdo.",
        "Paso 8: Pasa tus manos húmedas por la cabeza una vez, de adelante hacia atrás y viceversa.",
        "Paso 9: Limpia el interior y exterior de tus oídos una vez.",
        "Paso 10: Lava tu pie derecho hasta el tobillo tres veces, luego el izquierdo.",
        "Después de completar el Wudu, puedes decir la súplica: 'Ashhadu an la ilaha illallah, wa ashhadu anna Muhammadan abduhu wa rasuluh.'",
      ]),
    },
    slug: "step-by-step-wudu",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 8,
    published: true,
  });

  const lessonFivePrayers = await Lesson.create({
    title: tri("The Five Daily Prayers Explained", "الصلوات الخمس بالتفصيل", "Las Cinco Oraciones Diarias Explicadas"),
    content: {
      en: tiptapDoc([
        "Muslims are required to pray five times each day. These prayers are spread throughout the day to keep the believer in constant remembrance of Allah.",
        "1. Fajr (Dawn Prayer): Performed before sunrise. It consists of 2 units (rak'ahs). This prayer marks the beginning of the day with remembrance of Allah.",
        "2. Dhuhr (Noon Prayer): Performed after the sun passes its zenith. It consists of 4 rak'ahs. A moment to pause and reconnect during the middle of the day.",
        "3. Asr (Afternoon Prayer): Performed in the late afternoon. It consists of 4 rak'ahs. The Prophet emphasized the importance of not missing this prayer.",
        "4. Maghrib (Sunset Prayer): Performed just after sunset. It consists of 3 rak'ahs. It marks the transition from day to night.",
        "5. Isha (Night Prayer): Performed after the twilight disappears. It consists of 4 rak'ahs. The final prayer of the day before rest.",
        "Each prayer follows a specific structure involving standing, bowing, prostrating, and sitting — all while reciting verses from the Quran and supplications.",
      ]),
      ar: tiptapDoc([
        "يُفرض على المسلمين الصلاة خمس مرات يوميًا. هذه الصلوات موزعة على مدار اليوم لإبقاء المؤمن في ذكر دائم لله.",
        "١. صلاة الفجر: تُؤدى قبل شروق الشمس وتتكون من ركعتين. تبدأ بها اليوم بذكر الله.",
        "٢. صلاة الظهر: تُؤدى بعد زوال الشمس وتتكون من ٤ ركعات. لحظة للتوقف وإعادة التواصل في منتصف اليوم.",
        "٣. صلاة العصر: تُؤدى في وقت متأخر من بعد الظهر وتتكون من ٤ ركعات. أكد النبي على أهمية عدم تفويتها.",
        "٤. صلاة المغرب: تُؤدى بعد غروب الشمس مباشرة وتتكون من ٣ ركعات. تمثل الانتقال من النهار إلى الليل.",
        "٥. صلاة العشاء: تُؤدى بعد اختفاء الشفق وتتكون من ٤ ركعات. آخر صلاة في اليوم قبل الراحة.",
        "كل صلاة تتبع هيكلًا محددًا يشمل القيام والركوع والسجود والجلوس — مع تلاوة آيات من القرآن والأدعية.",
      ]),
      es: tiptapDoc([
        "Los musulmanes deben rezar cinco veces al día. Estas oraciones están distribuidas a lo largo del día para mantener al creyente en constante recuerdo de Allah.",
        "1. Fajr (Oración del Alba): Se realiza antes del amanecer. Consiste en 2 unidades (rak'ahs). Marca el inicio del día con el recuerdo de Allah.",
        "2. Dhuhr (Oración del Mediodía): Se realiza después de que el sol pasa su cenit. Consiste en 4 rak'ahs. Un momento para pausar y reconectarse a mitad del día.",
        "3. Asr (Oración de la Tarde): Se realiza a media tarde. Consiste en 4 rak'ahs. El Profeta enfatizó la importancia de no perder esta oración.",
        "4. Maghrib (Oración del Ocaso): Se realiza justo después de la puesta del sol. Consiste en 3 rak'ahs. Marca la transición del día a la noche.",
        "5. Isha (Oración de la Noche): Se realiza después de que desaparece el crepúsculo. Consiste en 4 rak'ahs. La última oración del día antes del descanso.",
        "Cada oración sigue una estructura específica que incluye estar de pie, inclinarse, postrarse y sentarse — todo mientras se recitan versos del Corán y súplicas.",
      ]),
    },
    slug: "five-daily-prayers-explained",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 10,
    published: true,
  });

  const lessonHowToPray = await Lesson.create({
    title: tri("How to Perform Salah", "كيفية أداء الصلاة", "Cómo Realizar el Salah"),
    content: {
      en: tiptapDoc([
        "Performing Salah involves specific physical movements and recitations. Here is a step-by-step guide to praying one unit (rak'ah).",
        "1. Standing (Qiyam): Face the Qiblah (direction of Mecca). Raise your hands to your ears and say 'Allahu Akbar' (God is the Greatest). Place your right hand over your left on your chest.",
        "2. Recitation: Recite Surah Al-Fatiha (the opening chapter of the Quran), followed by any other short surah or verses.",
        "3. Bowing (Ruku): Say 'Allahu Akbar' and bow with your hands on your knees. Say 'Subhana Rabbiyal Adheem' (Glory be to my Lord, the Most Great) three times.",
        "4. Standing from Ruku: Rise and say 'Sami Allahu liman hamidah' (Allah hears those who praise Him), then say 'Rabbana wa lakal hamd' (Our Lord, to You is all praise).",
        "5. Prostration (Sujud): Say 'Allahu Akbar' and prostrate with your forehead, nose, palms, knees, and toes touching the ground. Say 'Subhana Rabbiyal A'la' (Glory be to my Lord, the Most High) three times.",
        "6. Sitting: Rise to a sitting position and say 'Allahu Akbar'. Pause briefly, then prostrate again.",
        "7. This completes one rak'ah. Repeat for the required number of units for each prayer.",
        "At the end of the prayer, sit and recite the Tashahhud and send blessings upon the Prophet, then turn your head right and left saying 'Assalamu alaikum wa rahmatullah' (Peace and mercy of Allah be upon you).",
      ]),
      ar: tiptapDoc([
        "أداء الصلاة يتضمن حركات بدنية وتلاوات محددة. إليك دليل خطوة بخطوة لأداء ركعة واحدة.",
        "١. القيام: استقبل القبلة (اتجاه مكة). ارفع يديك إلى أذنيك وقل 'الله أكبر'. ضع يدك اليمنى على اليسرى على صدرك.",
        "٢. القراءة: اقرأ سورة الفاتحة ثم أي سورة قصيرة أو آيات أخرى.",
        "٣. الركوع: قل 'الله أكبر' واركع بوضع يديك على ركبتيك. قل 'سبحان ربي العظيم' ثلاث مرات.",
        "٤. القيام من الركوع: قم وقل 'سمع الله لمن حمده' ثم قل 'ربنا ولك الحمد'.",
        "٥. السجود: قل 'الله أكبر' واسجد بوضع جبهتك وأنفك وكفيك وركبتيك وأصابع قدميك على الأرض. قل 'سبحان ربي الأعلى' ثلاث مرات.",
        "٦. الجلوس: ارتفع إلى وضع الجلوس وقل 'الله أكبر'. توقف لحظة ثم اسجد مرة أخرى.",
        "٧. هذا يكمل ركعة واحدة. كرر حسب عدد الركعات المطلوبة لكل صلاة.",
        "في نهاية الصلاة اجلس واقرأ التشهد وصلِّ على النبي ثم التفت يمينًا ويسارًا قائلًا 'السلام عليكم ورحمة الله'.",
      ]),
      es: tiptapDoc([
        "Realizar el Salah implica movimientos físicos específicos y recitaciones. Aquí tienes una guía paso a paso para rezar una unidad (rak'ah).",
        "1. De pie (Qiyam): Mira hacia la Qiblah (dirección de La Meca). Levanta tus manos a la altura de las orejas y di 'Allahu Akbar' (Dios es el Más Grande). Coloca tu mano derecha sobre la izquierda en tu pecho.",
        "2. Recitación: Recita Surah Al-Fatiha (el capítulo de apertura del Corán), seguido de cualquier otra surah corta o versos.",
        "3. Inclinación (Ruku): Di 'Allahu Akbar' e inclínate con las manos en las rodillas. Di 'Subhana Rabbiyal Adheem' (Gloria sea a mi Señor, el Más Grande) tres veces.",
        "4. Levantarse del Ruku: Levántate y di 'Sami Allahu liman hamidah' (Allah escucha a quienes Le alaban), luego di 'Rabbana wa lakal hamd' (Señor nuestro, a Ti pertenece toda la alabanza).",
        "5. Postración (Sujud): Di 'Allahu Akbar' y póstrate con tu frente, nariz, palmas, rodillas y dedos de los pies tocando el suelo. Di 'Subhana Rabbiyal A'la' (Gloria sea a mi Señor, el Más Alto) tres veces.",
        "6. Sentado: Levántate a una posición sentada y di 'Allahu Akbar'. Pausa brevemente, luego póstrate de nuevo.",
        "7. Esto completa una rak'ah. Repite el número requerido de unidades para cada oración.",
        "Al final de la oración, siéntate y recita el Tashahhud y envía bendiciones al Profeta, luego gira tu cabeza a la derecha e izquierda diciendo 'Assalamu alaikum wa rahmatullah' (La paz y la misericordia de Allah sean contigo).",
      ]),
    },
    slug: "how-to-perform-salah",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 12,
    published: true,
  });

  // Module 1: Introduction to Prayer
  const modulePrayerIntro = await Module.create({
    title: tri("Introduction to Prayer", "مقدمة في الصلاة", "Introducción a la Oración"),
    description: tri(
      "Learn why Muslims pray and how to prepare for prayer through purification.",
      "تعلم لماذا يصلي المسلمون وكيف تستعد للصلاة من خلال الطهارة.",
      "Aprende por qué rezan los musulmanes y cómo prepararse para la oración mediante la purificación."
    ),
    slug: "introduction-to-prayer",
    topics: [topicPrayer._id, subWudu._id],
    lessons: [
      { lessonId: lessonWhyPray._id, order: 1 },
      { lessonId: lessonWuduSteps._id, order: 2 },
    ],
    published: true,
  });

  // Update lesson moduleIds
  await Lesson.updateMany(
    { _id: { $in: [lessonWhyPray._id, lessonWuduSteps._id] } },
    { moduleId: modulePrayerIntro._id }
  );

  // Module 2: Performing the Prayers
  const modulePrayerPerform = await Module.create({
    title: tri("Performing the Prayers", "أداء الصلوات", "Realizando las Oraciones"),
    description: tri(
      "A practical guide to the five daily prayers and how to perform them correctly.",
      "دليل عملي للصلوات الخمس وكيفية أدائها بشكل صحيح.",
      "Una guía práctica de las cinco oraciones diarias y cómo realizarlas correctamente."
    ),
    slug: "performing-the-prayers",
    topics: [topicPrayer._id, subFivePrayers._id],
    lessons: [
      { lessonId: lessonFivePrayers._id, order: 1 },
      { lessonId: lessonHowToPray._id, order: 2 },
    ],
    published: true,
  });

  await Lesson.updateMany(
    { _id: { $in: [lessonFivePrayers._id, lessonHowToPray._id] } },
    { moduleId: modulePrayerPerform._id }
  );

  // Module 3: Introduction to the Quran
  const lessonWhatIsQuran = await Lesson.create({
    title: tri("What is the Quran?", "ما هو القرآن؟", "¿Qué es el Corán?"),
    content: {
      en: tiptapDoc([
        "The Quran is the holy book of Islam, believed by Muslims to be the literal word of God (Allah), revealed to the Prophet Muhammad (PBUH) over a period of 23 years through the Angel Gabriel (Jibril).",
        "It is written in classical Arabic and consists of 114 chapters (surahs), arranged roughly by length from longest to shortest (with the exception of the opening chapter, Al-Fatiha).",
        "The Quran covers guidance on worship, law, ethics, the stories of previous prophets, and the nature of God. It is the primary source of Islamic law and spirituality.",
        "Muslims believe the Quran has been perfectly preserved since its revelation — the same Arabic text read today is identical to what was revealed over 1,400 years ago.",
        "Reading and reciting the Quran is an act of worship in itself. Even if you cannot read Arabic yet, listening to its recitation and reading translations is highly encouraged.",
      ]),
      ar: tiptapDoc([
        "القرآن هو الكتاب المقدس للإسلام، يؤمن المسلمون بأنه كلام الله الحرفي الذي أُنزل على النبي محمد ﷺ على مدى ٢٣ عامًا عبر الملك جبريل.",
        "مكتوب بالعربية الفصحى ويتكون من ١١٤ سورة، مرتبة تقريبًا حسب الطول من الأطول إلى الأقصر (باستثناء السورة الأولى: الفاتحة).",
        "يتناول القرآن إرشادات في العبادة والشريعة والأخلاق وقصص الأنبياء السابقين وطبيعة الله. هو المصدر الأساسي للشريعة الإسلامية والروحانية.",
        "يؤمن المسلمون أن القرآن محفوظ بشكل كامل منذ نزوله — النص العربي المقروء اليوم مطابق لما أُنزل قبل أكثر من ١٤٠٠ عام.",
        "قراءة القرآن وتلاوته عبادة في حد ذاتها. حتى لو لم تستطع القراءة بالعربية بعد، فإن الاستماع لتلاوته وقراءة الترجمات مستحب.",
      ]),
      es: tiptapDoc([
        "El Corán es el libro sagrado del Islam. Los musulmanes creen que es la palabra literal de Dios (Allah), revelada al Profeta Muhammad (la paz sea con él) durante un período de 23 años a través del Ángel Gabriel (Yibril).",
        "Está escrito en árabe clásico y consta de 114 capítulos (suras), organizados aproximadamente por longitud de mayor a menor (con la excepción del capítulo de apertura, Al-Fatiha).",
        "El Corán cubre guías sobre adoración, ley, ética, historias de profetas anteriores y la naturaleza de Dios. Es la fuente primaria de la ley islámica y la espiritualidad.",
        "Los musulmanes creen que el Corán se ha preservado perfectamente desde su revelación — el mismo texto árabe leído hoy es idéntico al que fue revelado hace más de 1,400 años.",
        "Leer y recitar el Corán es un acto de adoración en sí mismo. Aunque aún no puedas leer en árabe, escuchar su recitación y leer traducciones es muy recomendable.",
      ]),
    },
    slug: "what-is-the-quran",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 7,
    published: true,
  });

  const lessonAlFatiha = await Lesson.create({
    title: tri("Surah Al-Fatiha: The Opening", "سورة الفاتحة", "Sura Al-Fatiha: La Apertura"),
    content: {
      en: tiptapDoc([
        "Surah Al-Fatiha is the first chapter of the Quran and is recited in every unit (rak'ah) of prayer. It is often called 'The Mother of the Book' (Umm Al-Kitab).",
        "The Arabic text: Bismillahir Rahmanir Raheem. Alhamdu lillahi Rabbil 'aalameen. Ar-Rahmanir Raheem. Maaliki yawmid deen. Iyyaaka na'budu wa iyyaaka nasta'een. Ihdinas siraatal mustaqeem. Siraatal ladhina an'amta 'alaihim, ghayril maghdoobi 'alaihim wa lad daalleen. Ameen.",
        "Translation: In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of all the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us on the Straight Path. The path of those who have received Your grace; not the path of those who have brought down wrath upon themselves, nor of those who have gone astray. Ameen.",
        "This surah encapsulates the essence of Islam in just seven verses — praising God, acknowledging His sovereignty, and asking for guidance.",
        "Memorizing Al-Fatiha is the first step for any new Muslim, as it is essential for performing prayer.",
      ]),
      ar: tiptapDoc([
        "سورة الفاتحة هي أول سورة في القرآن وتُقرأ في كل ركعة من الصلاة. تُسمى أيضًا 'أم الكتاب'.",
        "النص: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
        "تختصر هذه السورة جوهر الإسلام في سبع آيات فقط — حمد الله والاعتراف بسيادته وطلب الهداية.",
        "حفظ الفاتحة هو الخطوة الأولى لأي مسلم جديد لأنها ضرورية لأداء الصلاة.",
      ]),
      es: tiptapDoc([
        "Sura Al-Fatiha es el primer capítulo del Corán y se recita en cada unidad (rak'ah) de la oración. A menudo se le llama 'La Madre del Libro' (Umm Al-Kitab).",
        "El texto en árabe: Bismillahir Rahmanir Raheem. Alhamdu lillahi Rabbil 'aalameen. Ar-Rahmanir Raheem. Maaliki yawmid deen. Iyyaaka na'budu wa iyyaaka nasta'een. Ihdinas siraatal mustaqeem. Siraatal ladhina an'amta 'alaihim, ghayril maghdoobi 'alaihim wa lad daalleen. Ameen.",
        "Traducción: En el nombre de Allah, el Más Clemente, el Más Misericordioso. Toda alabanza pertenece a Allah, Señor de todos los mundos. El Más Clemente, el Más Misericordioso. Dueño del Día del Juicio. Solo a Ti adoramos y solo a Ti pedimos ayuda. Guíanos por el Camino Recto. El camino de aquellos que han recibido Tu gracia; no el de aquellos que han incurrido en ira, ni el de los extraviados. Amén.",
        "Esta sura encapsula la esencia del Islam en solo siete versos — alabando a Dios, reconociendo Su soberanía y pidiendo guía.",
        "Memorizar Al-Fatiha es el primer paso para cualquier nuevo musulmán, ya que es esencial para realizar la oración.",
      ]),
    },
    slug: "surah-al-fatiha",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 8,
    published: true,
  });

  const lessonStartReadingQuran = await Lesson.create({
    title: tri("How to Start Reading the Quran", "كيف تبدأ قراءة القرآن", "Cómo Empezar a Leer el Corán"),
    content: {
      en: tiptapDoc([
        "Starting to read the Quran can feel daunting, but it doesn't have to be. Here's a practical approach for new Muslims.",
        "Step 1: Begin with a translation in your language. Understanding the meaning is the first priority. Choose a reliable translation like Sahih International or The Clear Quran by Dr. Mustafa Khattab.",
        "Step 2: Start with shorter surahs at the back of the Quran (Chapters 112-114). These are easier to memorize and are commonly recited in prayer.",
        "Step 3: Read with Tafsir (commentary) for deeper understanding. Tafsir Ibn Kathir is a widely respected resource.",
        "Step 4: If you want to learn Arabic, start with basic Arabic alphabet courses. Many free apps and online resources can help you learn to read Arabic script.",
        "Step 5: Listen to recitations by renowned reciters like Mishary Rashid Alafasy or Abdul Rahman Al-Sudais. Hearing the Quran recited beautifully is a spiritual experience in itself.",
        "Step 6: Set a daily routine — even 5-10 minutes a day is valuable. Consistency matters more than quantity.",
        "Remember: the Quran was revealed over 23 years. There's no rush to finish it. Take your time, reflect, and let the meanings settle in your heart.",
      ]),
      ar: tiptapDoc([
        "البدء بقراءة القرآن قد يبدو صعبًا لكنه ليس كذلك. إليك نهجًا عمليًا للمسلمين الجدد.",
        "الخطوة ١: ابدأ بترجمة بلغتك. فهم المعنى هو الأولوية الأولى.",
        "الخطوة ٢: ابدأ بالسور القصيرة في نهاية القرآن (السور ١١٢-١١٤). هذه أسهل في الحفظ وتُقرأ كثيرًا في الصلاة.",
        "الخطوة ٣: اقرأ مع التفسير لفهم أعمق. تفسير ابن كثير مصدر محترم على نطاق واسع.",
        "الخطوة ٤: إذا أردت تعلم العربية ابدأ بدورات الحروف الأبجدية. هناك تطبيقات ومصادر مجانية كثيرة.",
        "الخطوة ٥: استمع لتلاوات مشاهير القراء مثل مشاري راشد العفاسي أو عبدالرحمن السديس.",
        "الخطوة ٦: ضع روتينًا يوميًا — حتى ٥-١٠ دقائق يوميًا قيّمة. الاستمرارية أهم من الكمية.",
        "تذكر: القرآن نزل على مدى ٢٣ عامًا. لا تستعجل. خذ وقتك وتأمل ودع المعاني تستقر في قلبك.",
      ]),
      es: tiptapDoc([
        "Comenzar a leer el Corán puede parecer abrumador, pero no tiene que serlo. Aquí tienes un enfoque práctico para nuevos musulmanes.",
        "Paso 1: Comienza con una traducción en tu idioma. Comprender el significado es la primera prioridad.",
        "Paso 2: Empieza con las suras más cortas al final del Corán (Capítulos 112-114). Son más fáciles de memorizar y se recitan comúnmente en la oración.",
        "Paso 3: Lee con Tafsir (comentario) para una comprensión más profunda. El Tafsir de Ibn Kathir es un recurso ampliamente respetado.",
        "Paso 4: Si quieres aprender árabe, comienza con cursos básicos del alfabeto árabe. Muchas aplicaciones y recursos en línea gratuitos pueden ayudarte.",
        "Paso 5: Escucha recitaciones de recitadores reconocidos como Mishary Rashid Alafasy o Abdul Rahman Al-Sudais.",
        "Paso 6: Establece una rutina diaria — incluso 5-10 minutos al día es valioso. La consistencia importa más que la cantidad.",
        "Recuerda: el Corán fue revelado a lo largo de 23 años. No hay prisa por terminarlo. Tómate tu tiempo, reflexiona y deja que los significados se asienten en tu corazón.",
      ]),
    },
    slug: "how-to-start-reading-quran",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 8,
    published: true,
  });

  const moduleQuranIntro = await Module.create({
    title: tri("Introduction to the Quran", "مقدمة في القرآن", "Introducción al Corán"),
    description: tri(
      "Discover the Quran — what it is, its significance, and how to begin your journey with it.",
      "اكتشف القرآن — ما هو وأهميته وكيف تبدأ رحلتك معه.",
      "Descubre el Corán — qué es, su importancia y cómo comenzar tu camino con él."
    ),
    slug: "introduction-to-quran",
    topics: [topicQuran._id, subReadingQuran._id],
    lessons: [
      { lessonId: lessonWhatIsQuran._id, order: 1 },
      { lessonId: lessonAlFatiha._id, order: 2 },
      { lessonId: lessonStartReadingQuran._id, order: 3 },
    ],
    published: true,
  });

  await Lesson.updateMany(
    { _id: { $in: [lessonWhatIsQuran._id, lessonAlFatiha._id, lessonStartReadingQuran._id] } },
    { moduleId: moduleQuranIntro._id }
  );

  // Module 4: Pillars of Faith
  const lessonSixPillars = await Lesson.create({
    title: tri("The Six Pillars of Faith (Iman)", "أركان الإيمان الستة", "Los Seis Pilares de la Fe (Iman)"),
    content: {
      en: tiptapDoc([
        "In Islam, faith (Iman) is built on six fundamental beliefs. These are not just abstract concepts — they shape how a Muslim views the world and lives their life.",
        "1. Belief in Allah: There is only one God, Allah. He has no partners, children, or equals. He is the Creator, Sustainer, and Ruler of everything that exists.",
        "2. Belief in the Angels: Angels are created from light and serve Allah. They have no free will and carry out specific duties. The most well-known is Gabriel (Jibril), who brought the Quran to Prophet Muhammad.",
        "3. Belief in the Holy Books: Allah sent scriptures to guide humanity. These include the Torah (Tawrat), the Psalms (Zabur), the Gospel (Injil), and the Quran — the final and perfectly preserved revelation.",
        "4. Belief in the Prophets: Allah sent prophets to every nation to guide people. From Adam to Noah to Abraham to Moses to Jesus to Muhammad (peace be upon them all). Muhammad is the final prophet.",
        "5. Belief in the Day of Judgment: There will be a day when all humans are resurrected and held accountable for their deeds. The righteous will enter Paradise; the wrongdoers will face consequences.",
        "6. Belief in Divine Decree (Qadr): Everything that happens — good or bad — is by the will and knowledge of Allah. This doesn't negate free will; rather, Allah knows what choices we will make.",
      ]),
      ar: tiptapDoc([
        "في الإسلام يُبنى الإيمان على ست عقائد أساسية. هذه ليست مجرد مفاهيم مجردة — إنها تشكل نظرة المسلم للعالم وطريقة حياته.",
        "١. الإيمان بالله: لا إله إلا الله وحده لا شريك له. هو الخالق والرازق والمدبر لكل شيء.",
        "٢. الإيمان بالملائكة: الملائكة مخلوقة من نور وتخدم الله. ليس لها إرادة حرة وتقوم بمهام محددة. أشهرها جبريل الذي نزل بالقرآن على النبي محمد.",
        "٣. الإيمان بالكتب السماوية: أنزل الله كتبًا لهداية البشرية: التوراة والزبور والإنجيل والقرآن — الوحي الأخير المحفوظ بالكامل.",
        "٤. الإيمان بالأنبياء: أرسل الله أنبياء لكل أمة. من آدم إلى نوح إلى إبراهيم إلى موسى إلى عيسى إلى محمد (عليهم جميعًا السلام). محمد هو خاتم الأنبياء.",
        "٥. الإيمان باليوم الآخر: سيأتي يوم يُبعث فيه جميع البشر ويُحاسبون على أعمالهم.",
        "٦. الإيمان بالقضاء والقدر: كل ما يحدث — خيرًا أو شرًا — بإرادة الله وعلمه. هذا لا ينفي الإرادة الحرة بل إن الله يعلم ما سنختاره.",
      ]),
      es: tiptapDoc([
        "En el Islam, la fe (Iman) se construye sobre seis creencias fundamentales. No son solo conceptos abstractos — moldean cómo un musulmán ve el mundo y vive su vida.",
        "1. Creencia en Allah: Solo hay un Dios, Allah. No tiene socios, hijos ni iguales. Es el Creador, Sustentador y Gobernante de todo lo que existe.",
        "2. Creencia en los Ángeles: Los ángeles están creados de luz y sirven a Allah. No tienen libre albedrío y realizan deberes específicos. El más conocido es Gabriel (Yibril), quien trajo el Corán al Profeta Muhammad.",
        "3. Creencia en los Libros Sagrados: Allah envió escrituras para guiar a la humanidad: la Torá (Tawrat), los Salmos (Zabur), el Evangelio (Inyil) y el Corán — la revelación final y perfectamente preservada.",
        "4. Creencia en los Profetas: Allah envió profetas a cada nación. Desde Adán hasta Noé, Abraham, Moisés, Jesús y Muhammad (la paz sea con todos ellos). Muhammad es el último profeta.",
        "5. Creencia en el Día del Juicio: Habrá un día en que todos los humanos serán resucitados y rendirán cuentas por sus acciones.",
        "6. Creencia en el Decreto Divino (Qadr): Todo lo que sucede — bueno o malo — es por la voluntad y el conocimiento de Allah. Esto no niega el libre albedrío; Allah sabe qué elecciones haremos.",
      ]),
    },
    slug: "six-pillars-of-faith",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 10,
    published: true,
  });

  const lessonShahadah = await Lesson.create({
    title: tri("The Shahada: Declaration of Faith", "الشهادة: إعلان الإيمان", "La Shahada: Declaración de Fe"),
    content: {
      en: tiptapDoc([
        "The Shahada is the Islamic declaration of faith and the first of the five pillars of Islam. It is the doorway into Islam.",
        "'Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan rasulullah.'",
        "Translation: 'I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.'",
        "This simple yet profound statement contains two parts:",
        "1. La ilaha illallah (There is no god but Allah): This affirms monotheism — the belief that only Allah is worthy of worship. No idols, no saints, no intermediaries.",
        "2. Muhammadur rasulullah (Muhammad is the Messenger of Allah): This affirms that Muhammad (PBUH) is the final prophet and that his teachings (the Sunnah) are a source of guidance alongside the Quran.",
        "When someone sincerely utters the Shahada with understanding and conviction, they enter the fold of Islam. It is the most important statement a Muslim ever makes.",
        "Muslims repeat the Shahada throughout their lives — in the call to prayer (Adhan), in the prayer itself, and as a constant reminder of their commitment to Allah.",
      ]),
      ar: tiptapDoc([
        "الشهادة هي إعلان الإيمان في الإسلام والركن الأول من أركان الإسلام الخمسة. هي بوابة الدخول في الإسلام.",
        "'أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله.'",
        "هذا البيان البسيط لكن العميق يحتوي على جزأين:",
        "١. لا إله إلا الله: يؤكد التوحيد — الإيمان بأن الله وحده يستحق العبادة. لا أصنام ولا أولياء ولا وسطاء.",
        "٢. محمد رسول الله: يؤكد أن محمدًا ﷺ هو خاتم الأنبياء وأن تعاليمه (السنة) مصدر هداية إلى جانب القرآن.",
        "عندما ينطق شخص الشهادة بإخلاص وفهم واقتناع يدخل في الإسلام. إنها أهم عبارة ينطقها المسلم.",
        "يكرر المسلمون الشهادة طوال حياتهم — في الأذان وفي الصلاة وكتذكير دائم بالتزامهم تجاه الله.",
      ]),
      es: tiptapDoc([
        "La Shahada es la declaración de fe islámica y el primero de los cinco pilares del Islam. Es la puerta de entrada al Islam.",
        "'Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan rasulullah.'",
        "Traducción: 'Doy testimonio de que no hay más dios que Allah, y doy testimonio de que Muhammad es el Mensajero de Allah.'",
        "Esta declaración simple pero profunda contiene dos partes:",
        "1. La ilaha illallah (No hay más dios que Allah): Esto afirma el monoteísmo — la creencia de que solo Allah es digno de adoración. Sin ídolos, sin santos, sin intermediarios.",
        "2. Muhammadur rasulullah (Muhammad es el Mensajero de Allah): Esto afirma que Muhammad (la paz sea con él) es el último profeta y que sus enseñanzas (la Sunnah) son una fuente de guía junto al Corán.",
        "Cuando alguien pronuncia sinceramente la Shahada con comprensión y convicción, entra en el Islam. Es la declaración más importante que un musulmán hace.",
        "Los musulmanes repiten la Shahada a lo largo de sus vidas — en la llamada a la oración (Adhan), en la propia oración y como un recordatorio constante de su compromiso con Allah.",
      ]),
    },
    slug: "the-shahada",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 7,
    published: true,
  });

  const moduleFaithBasics = await Module.create({
    title: tri("Foundations of Faith", "أسس الإيمان", "Fundamentos de la Fe"),
    description: tri(
      "Understand the core beliefs in Islam — from the Shahada to the six pillars of faith.",
      "تعرّف على العقائد الأساسية في الإسلام — من الشهادة إلى أركان الإيمان الستة.",
      "Comprende las creencias centrales del Islam — desde la Shahada hasta los seis pilares de la fe."
    ),
    slug: "foundations-of-faith",
    topics: [topicFaith._id],
    lessons: [
      { lessonId: lessonShahadah._id, order: 1 },
      { lessonId: lessonSixPillars._id, order: 2 },
    ],
    published: true,
  });

  await Lesson.updateMany(
    { _id: { $in: [lessonShahadah._id, lessonSixPillars._id] } },
    { moduleId: moduleFaithBasics._id }
  );

  // Module 5: Islamic Manners
  const lessonGreetings = await Lesson.create({
    title: tri("Islamic Greetings & Manners", "التحيات والآداب الإسلامية", "Saludos y Modales Islámicos"),
    content: {
      en: tiptapDoc([
        "Islam places great emphasis on good manners (Adab) and etiquette in daily interactions.",
        "The Islamic greeting: 'Assalamu Alaikum' (Peace be upon you). The response is 'Wa Alaikum Assalam' (And upon you be peace). This greeting is a prayer for peace and is considered an act of worship.",
        "Before eating: Say 'Bismillah' (In the name of Allah). Eat with your right hand. Don't waste food.",
        "After eating: Say 'Alhamdulillah' (All praise is due to Allah).",
        "When sneezing: Say 'Alhamdulillah'. Others respond with 'Yarhamukallah' (May Allah have mercy on you), and you reply 'Yahdikumullah wa yuslihu baalakum' (May Allah guide you and improve your condition).",
        "When entering a home: Say 'Assalamu Alaikum' even if no one is home.",
        "When meeting others: Smile — the Prophet said a smile is charity. Shake hands warmly. Be genuine and kind in conversation.",
        "These small acts of courtesy are deeply valued in Islam and earn spiritual rewards.",
      ]),
      ar: tiptapDoc([
        "يولي الإسلام أهمية كبيرة لحسن الخلق (الأدب) وآداب التعامل اليومي.",
        "التحية الإسلامية: 'السلام عليكم'. الرد: 'وعليكم السلام'. هذه التحية دعاء بالسلام وتُعتبر عبادة.",
        "قبل الأكل: قل 'بسم الله'. كل بيمينك. لا تسرف في الطعام.",
        "بعد الأكل: قل 'الحمد لله'.",
        "عند العطاس: قل 'الحمد لله'. يرد الآخرون 'يرحمك الله' وترد 'يهديكم الله ويصلح بالكم'.",
        "عند دخول المنزل: قل 'السلام عليكم' حتى لو لم يكن أحد في المنزل.",
        "عند مقابلة الآخرين: ابتسم — قال النبي إن التبسم صدقة. صافح بحرارة وكن صادقًا ولطيفًا في الحديث.",
        "هذه الآداب البسيطة محل تقدير كبير في الإسلام ويُثاب عليها.",
      ]),
      es: tiptapDoc([
        "El Islam pone gran énfasis en los buenos modales (Adab) y la etiqueta en las interacciones diarias.",
        "El saludo islámico: 'Assalamu Alaikum' (La paz sea contigo). La respuesta es 'Wa Alaikum Assalam' (Y sobre ti la paz). Este saludo es una oración por la paz y se considera un acto de adoración.",
        "Antes de comer: Di 'Bismillah' (En el nombre de Allah). Come con tu mano derecha. No desperdicies la comida.",
        "Después de comer: Di 'Alhamdulillah' (Toda alabanza sea para Allah).",
        "Al estornudar: Di 'Alhamdulillah'. Otros responden con 'Yarhamukallah' (Que Allah tenga misericordia de ti), y tú respondes 'Yahdikumullah wa yuslihu baalakum' (Que Allah te guíe y mejore tu condición).",
        "Al entrar a un hogar: Di 'Assalamu Alaikum' incluso si no hay nadie.",
        "Al conocer a otros: Sonríe — el Profeta dijo que sonreír es caridad. Saluda de mano con calidez. Sé genuino y amable en la conversación.",
        "Estos pequeños actos de cortesía son profundamente valorados en el Islam y obtienen recompensas espirituales.",
      ]),
    },
    slug: "islamic-greetings-manners",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 6,
    published: true,
  });

  const lessonDailyDuas = await Lesson.create({
    title: tri("Essential Daily Duas (Supplications)", "أدعية يومية أساسية", "Súplicas Diarias Esenciales (Duas)"),
    content: {
      en: tiptapDoc([
        "A Dua is a personal prayer or supplication to Allah. Unlike Salah (formal prayer), Dua can be made at any time, in any language, in any position.",
        "Here are essential daily duas every Muslim should know:",
        "Upon waking up: 'Alhamdulillahilladhi ahyana ba'da ma amatana wa ilayhin nushur' — All praise is due to Allah who gave us life after death and to Him is the return.",
        "Before sleeping: 'Bismika Allahumma amutu wa ahya' — In Your name, O Allah, I die and I live.",
        "Before entering the bathroom: 'Allahumma inni a'udhu bika minal khubthi wal khabaith' — O Allah, I seek refuge in You from evil.",
        "When leaving the house: 'Bismillah, tawakkaltu 'ala Allah, la hawla wa la quwwata illa billah' — In the name of Allah, I place my trust in Allah. There is no might or power except with Allah.",
        "When in difficulty: 'Inna lillahi wa inna ilayhi raji'un' — Indeed we belong to Allah and indeed to Him we return.",
        "For general supplication: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhab an-nar' — Our Lord, give us good in this world and the hereafter, and protect us from the punishment of the Fire.",
        "You can also make Dua in your own words and language. Allah understands all languages and knows what's in your heart.",
      ]),
      ar: tiptapDoc([
        "الدعاء هو صلاة شخصية أو تضرع لله. على عكس الصلاة المفروضة يمكن الدعاء في أي وقت وبأي لغة وفي أي وضع.",
        "إليك أدعية يومية أساسية يجب على كل مسلم معرفتها:",
        "عند الاستيقاظ: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور'.",
        "قبل النوم: 'باسمك اللهم أموت وأحيا'.",
        "قبل دخول الحمام: 'اللهم إني أعوذ بك من الخبث والخبائث'.",
        "عند الخروج من المنزل: 'بسم الله توكلت على الله لا حول ولا قوة إلا بالله'.",
        "عند الشدة: 'إنا لله وإنا إليه راجعون'.",
        "دعاء عام: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار'.",
        "يمكنك أيضًا الدعاء بكلماتك الخاصة ولغتك. الله يفهم كل اللغات ويعلم ما في قلبك.",
      ]),
      es: tiptapDoc([
        "Un Dua es una oración personal o súplica a Allah. A diferencia del Salah (oración formal), el Dua puede hacerse en cualquier momento, en cualquier idioma, en cualquier posición.",
        "Aquí están los duas diarios esenciales que todo musulmán debe conocer:",
        "Al despertar: 'Alhamdulillahilladhi ahyana ba'da ma amatana wa ilayhin nushur' — Toda alabanza a Allah que nos dio vida después de la muerte y a Él es el retorno.",
        "Antes de dormir: 'Bismika Allahumma amutu wa ahya' — En Tu nombre, oh Allah, muero y vivo.",
        "Antes de entrar al baño: 'Allahumma inni a'udhu bika minal khubthi wal khabaith' — Oh Allah, busco refugio en Ti del mal.",
        "Al salir de casa: 'Bismillah, tawakkaltu 'ala Allah, la hawla wa la quwwata illa billah' — En el nombre de Allah, pongo mi confianza en Allah. No hay poder ni fuerza excepto con Allah.",
        "En dificultad: 'Inna lillahi wa inna ilayhi raji'un' — Ciertamente pertenecemos a Allah y a Él regresaremos.",
        "Súplica general: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar' — Señor nuestro, danos el bien en este mundo y en el más allá, y protégenos del castigo del Fuego.",
        "También puedes hacer Dua con tus propias palabras e idioma. Allah entiende todos los idiomas y sabe lo que hay en tu corazón.",
      ]),
    },
    slug: "essential-daily-duas",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 8,
    published: true,
  });

  const moduleDailyLife = await Module.create({
    title: tri("Living as a Muslim", "الحياة كمسلم", "Vivir como Musulmán"),
    description: tri(
      "Practical guidance for daily life as a Muslim — greetings, manners, and essential supplications.",
      "إرشادات عملية للحياة اليومية كمسلم — التحيات والآداب والأدعية الأساسية.",
      "Guía práctica para la vida diaria como musulmán — saludos, modales y súplicas esenciales."
    ),
    slug: "living-as-a-muslim",
    topics: [topicDailyLife._id, topicEthics._id],
    lessons: [
      { lessonId: lessonGreetings._id, order: 1 },
      { lessonId: lessonDailyDuas._id, order: 2 },
    ],
    published: true,
  });

  await Lesson.updateMany(
    { _id: { $in: [lessonGreetings._id, lessonDailyDuas._id] } },
    { moduleId: moduleDailyLife._id }
  );

  // Module 6: Prophet Muhammad's Life
  const lessonProphetLife = await Lesson.create({
    title: tri("The Life of Prophet Muhammad (PBUH)", "حياة النبي محمد ﷺ", "La Vida del Profeta Muhammad (PBUH)"),
    content: {
      en: tiptapDoc([
        "Prophet Muhammad (peace be upon him) was born in Mecca around 570 CE. He was known as 'Al-Amin' (The Trustworthy) even before receiving prophethood.",
        "At the age of 40, while meditating in the Cave of Hira, he received the first revelation from Allah through the Angel Gabriel. The first word revealed was 'Iqra' (Read/Recite).",
        "For the next 23 years, he received the Quran and taught the message of Islam — belief in one God, justice, compassion, and the afterlife.",
        "He faced severe persecution in Mecca and eventually migrated to Medina in 622 CE — an event known as the Hijra, which marks the beginning of the Islamic calendar.",
        "In Medina, he established the first Muslim community, created the Constitution of Medina (one of the earliest written constitutions), and built a society based on justice and brotherhood.",
        "He returned to Mecca in 630 CE and peacefully conquered it, forgiving those who had persecuted him. He passed away in 632 CE in Medina.",
        "The Prophet's character is described in the Quran as 'an excellent example' (33:21). His gentleness, honesty, courage, and compassion continue to inspire billions of people worldwide.",
      ]),
      ar: tiptapDoc([
        "وُلد النبي محمد ﷺ في مكة حوالي عام ٥٧٠ ميلادي. عُرف بـ'الأمين' حتى قبل تلقيه النبوة.",
        "في سن الأربعين وأثناء تأمله في غار حراء نزل عليه الوحي من الله عبر الملك جبريل. أول كلمة نزلت كانت 'اقرأ'.",
        "على مدى ٢٣ عامًا تلقى القرآن ونشر رسالة الإسلام — الإيمان بإله واحد والعدل والرحمة والآخرة.",
        "واجه اضطهادًا شديدًا في مكة وهاجر في النهاية إلى المدينة عام ٦٢٢ م — حدث يُعرف بالهجرة ويمثل بداية التقويم الإسلامي.",
        "في المدينة أسس أول مجتمع مسلم ووضع دستور المدينة (من أقدم الدساتير المكتوبة) وبنى مجتمعًا قائمًا على العدل والأخوة.",
        "عاد إلى مكة عام ٦٣٠ م وفتحها سلميًا وعفا عمن اضطهدوه. توفي عام ٦٣٢ م في المدينة.",
        "وُصف خلق النبي في القرآن بأنه 'أسوة حسنة' (٣٣:٢١). لطفه وصدقه وشجاعته ورحمته لا تزال تلهم مليارات البشر.",
      ]),
      es: tiptapDoc([
        "El Profeta Muhammad (la paz sea con él) nació en La Meca alrededor del año 570 d.C. Era conocido como 'Al-Amin' (El Confiable) incluso antes de recibir la profecía.",
        "A los 40 años, mientras meditaba en la Cueva de Hira, recibió la primera revelación de Allah a través del Ángel Gabriel. La primera palabra revelada fue 'Iqra' (Lee/Recita).",
        "Durante los siguientes 23 años, recibió el Corán y enseñó el mensaje del Islam — la creencia en un solo Dios, la justicia, la compasión y la vida después de la muerte.",
        "Enfrentó severa persecución en La Meca y eventualmente emigró a Medina en el 622 d.C. — un evento conocido como la Hégira, que marca el inicio del calendario islámico.",
        "En Medina, estableció la primera comunidad musulmana, creó la Constitución de Medina (una de las primeras constituciones escritas) y construyó una sociedad basada en la justicia y la hermandad.",
        "Regresó a La Meca en el 630 d.C. y la conquistó pacíficamente, perdonando a quienes lo habían perseguido. Falleció en el 632 d.C. en Medina.",
        "El carácter del Profeta se describe en el Corán como 'un ejemplo excelente' (33:21). Su amabilidad, honestidad, valentía y compasión continúan inspirando a miles de millones de personas.",
      ]),
    },
    slug: "life-of-prophet-muhammad",
    moduleId: new Types.ObjectId(),
    estimatedMinutes: 12,
    published: true,
  });

  const moduleHistory = await Module.create({
    title: tri("The Prophet's Story", "قصة النبي", "La Historia del Profeta"),
    description: tri(
      "Learn about the life and legacy of Prophet Muhammad (peace be upon him).",
      "تعرّف على حياة وإرث النبي محمد ﷺ.",
      "Aprende sobre la vida y el legado del Profeta Muhammad (la paz sea con él)."
    ),
    slug: "the-prophets-story",
    topics: [topicHistory._id],
    lessons: [
      { lessonId: lessonProphetLife._id, order: 1 },
    ],
    published: true,
  });

  await Lesson.updateOne(
    { _id: lessonProphetLife._id },
    { moduleId: moduleHistory._id }
  );

  // ─── Learning Paths ──────────────────────────────────

  console.log("Creating learning paths...");

  await LearningPath.create({
    title: tri("New Muslim Essentials", "أساسيات المسلم الجديد", "Esenciales para Nuevos Musulmanes"),
    description: tri(
      "Everything you need to know as a new Muslim — from the declaration of faith to daily prayers and essential knowledge. This path covers the foundations step by step.",
      "كل ما تحتاج معرفته كمسلم جديد — من الشهادة إلى الصلوات اليومية والمعرفة الأساسية. يغطي هذا المسار الأسس خطوة بخطوة.",
      "Todo lo que necesitas saber como nuevo musulmán — desde la declaración de fe hasta las oraciones diarias y el conocimiento esencial. Esta ruta cubre los fundamentos paso a paso."
    ),
    slug: "new-muslim-essentials",
    difficulty: "beginner",
    estimatedHours: 8,
    modules: [
      { moduleId: moduleFaithBasics._id, order: 1 },
      { moduleId: modulePrayerIntro._id, order: 2 },
      { moduleId: modulePrayerPerform._id, order: 3 },
      { moduleId: moduleDailyLife._id, order: 4 },
    ],
    published: true,
  });

  await LearningPath.create({
    title: tri("Understanding the Quran", "فهم القرآن", "Comprender el Corán"),
    description: tri(
      "A guided journey into the Quran — learn what it is, how to read it, and begin exploring its timeless guidance.",
      "رحلة مُوجهة في القرآن — تعلم ما هو وكيف تقرأه وابدأ باستكشاف إرشاداته الخالدة.",
      "Un viaje guiado al Corán — aprende qué es, cómo leerlo y comienza a explorar su guía eterna."
    ),
    slug: "understanding-the-quran",
    difficulty: "beginner",
    estimatedHours: 5,
    modules: [
      { moduleId: moduleQuranIntro._id, order: 1 },
    ],
    published: true,
  });

  await LearningPath.create({
    title: tri("Islamic History & Legacy", "التاريخ الإسلامي وإرثه", "Historia y Legado Islámico"),
    description: tri(
      "Explore the life of the Prophet, the early Muslim community, and the events that shaped Islamic civilization.",
      "استكشف حياة النبي والمجتمع المسلم المبكر والأحداث التي شكلت الحضارة الإسلامية.",
      "Explora la vida del Profeta, la comunidad musulmana temprana y los eventos que moldearon la civilización islámica."
    ),
    slug: "islamic-history-legacy",
    difficulty: "intermediate",
    estimatedHours: 6,
    modules: [
      { moduleId: moduleHistory._id, order: 1 },
    ],
    published: true,
  });

  // ─── Quizzes ──────────────────────────────────────────

  console.log("Creating quizzes...");

  await Quiz.create({
    lessonId: lessonWuduSteps._id,
    required: false,
    passingScore: 70,
    questions: [
      {
        question: tri(
          "What is the first step of Wudu?",
          "ما هي الخطوة الأولى من الوضوء؟",
          "¿Cuál es el primer paso del Wudu?"
        ),
        options: [
          { text: tri("Wash your face", "اغسل وجهك", "Lava tu rostro"), isCorrect: false },
          { text: tri("Make the intention (Niyyah)", "انوِ النية", "Hacer la intención (Niyyah)"), isCorrect: true },
          { text: tri("Wash your hands", "اغسل يديك", "Lava tus manos"), isCorrect: false },
          { text: tri("Rinse your mouth", "تمضمض", "Enjuaga tu boca"), isCorrect: false },
        ],
        explanation: tri(
          "Wudu begins with making the intention (Niyyah) in your heart, followed by saying 'Bismillah'.",
          "يبدأ الوضوء بالنية في القلب ثم قول 'بسم الله'.",
          "El Wudu comienza con hacer la intención (Niyyah) en tu corazón, seguido de decir 'Bismillah'."
        ),
      },
      {
        question: tri(
          "How many times do you wash each body part in Wudu?",
          "كم مرة تغسل كل عضو في الوضوء؟",
          "¿Cuántas veces se lava cada parte del cuerpo en el Wudu?"
        ),
        options: [
          { text: tri("Once", "مرة واحدة", "Una vez"), isCorrect: false },
          { text: tri("Twice", "مرتين", "Dos veces"), isCorrect: false },
          { text: tri("Three times", "ثلاث مرات", "Tres veces"), isCorrect: true },
          { text: tri("Four times", "أربع مرات", "Cuatro veces"), isCorrect: false },
        ],
        explanation: tri(
          "Most parts are washed three times, except wiping the head and ears which is done once.",
          "تُغسل معظم الأعضاء ثلاث مرات باستثناء مسح الرأس والأذنين الذي يتم مرة واحدة.",
          "La mayoría de las partes se lavan tres veces, excepto el paso de la cabeza y los oídos que se hace una vez."
        ),
      },
      {
        question: tri(
          "Which hand do you start washing first in Wudu?",
          "بأي يد تبدأ الغسل في الوضوء؟",
          "¿Con qué mano comienzas a lavar en el Wudu?"
        ),
        options: [
          { text: tri("Left hand", "اليسرى", "Mano izquierda"), isCorrect: false },
          { text: tri("Right hand", "اليمنى", "Mano derecha"), isCorrect: true },
          { text: tri("Both at the same time", "كلتاهما معًا", "Ambas al mismo tiempo"), isCorrect: false },
          { text: tri("It doesn't matter", "لا يهم", "No importa"), isCorrect: false },
        ],
        explanation: tri(
          "In Islam, you always start with the right side first — right hand before left, right foot before left.",
          "في الإسلام تبدأ دائمًا بالجانب الأيمن — اليد اليمنى قبل اليسرى والقدم اليمنى قبل اليسرى.",
          "En el Islam, siempre se comienza por el lado derecho — mano derecha antes que la izquierda, pie derecho antes que el izquierdo."
        ),
      },
    ],
  });

  await Quiz.create({
    lessonId: lessonFivePrayers._id,
    required: false,
    passingScore: 70,
    questions: [
      {
        question: tri(
          "How many daily prayers are obligatory in Islam?",
          "كم عدد الصلوات اليومية المفروضة في الإسلام؟",
          "¿Cuántas oraciones diarias son obligatorias en el Islam?"
        ),
        options: [
          { text: tri("Three", "ثلاث", "Tres"), isCorrect: false },
          { text: tri("Five", "خمس", "Cinco"), isCorrect: true },
          { text: tri("Seven", "سبع", "Siete"), isCorrect: false },
          { text: tri("Two", "اثنتان", "Dos"), isCorrect: false },
        ],
        explanation: tri(
          "Muslims are required to pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha.",
          "يُفرض على المسلمين أداء خمس صلوات يوميًا: الفجر والظهر والعصر والمغرب والعشاء.",
          "Los musulmanes deben rezar cinco veces al día: Fajr, Dhuhr, Asr, Maghrib e Isha."
        ),
      },
      {
        question: tri(
          "Which prayer is performed at dawn?",
          "أي صلاة تُؤدى عند الفجر؟",
          "¿Qué oración se realiza al amanecer?"
        ),
        options: [
          { text: tri("Dhuhr", "الظهر", "Dhuhr"), isCorrect: false },
          { text: tri("Maghrib", "المغرب", "Maghrib"), isCorrect: false },
          { text: tri("Fajr", "الفجر", "Fajr"), isCorrect: true },
          { text: tri("Isha", "العشاء", "Isha"), isCorrect: false },
        ],
        explanation: tri(
          "Fajr is the dawn prayer, performed before sunrise. It consists of 2 rak'ahs.",
          "صلاة الفجر هي صلاة الفجر وتُؤدى قبل شروق الشمس وتتكون من ركعتين.",
          "Fajr es la oración del amanecer, realizada antes de la salida del sol. Consiste en 2 rak'ahs."
        ),
      },
      {
        question: tri(
          "How many rak'ahs does Maghrib prayer have?",
          "كم ركعة في صلاة المغرب؟",
          "¿Cuántas rak'ahs tiene la oración del Maghrib?"
        ),
        options: [
          { text: tri("2", "٢", "2"), isCorrect: false },
          { text: tri("3", "٣", "3"), isCorrect: true },
          { text: tri("4", "٤", "4"), isCorrect: false },
          { text: tri("1", "١", "1"), isCorrect: false },
        ],
        explanation: tri(
          "Maghrib is unique among the five prayers as it has 3 rak'ahs — the others have either 2 or 4.",
          "صلاة المغرب فريدة بين الصلوات الخمس حيث تتكون من ٣ ركعات — الأخرى إما ٢ أو ٤.",
          "Maghrib es única entre las cinco oraciones ya que tiene 3 rak'ahs — las demás tienen 2 o 4."
        ),
      },
    ],
  });

  await Quiz.create({
    lessonId: lessonSixPillars._id,
    required: false,
    passingScore: 70,
    questions: [
      {
        question: tri(
          "How many pillars of faith (Iman) are there in Islam?",
          "كم عدد أركان الإيمان في الإسلام؟",
          "¿Cuántos pilares de fe (Iman) hay en el Islam?"
        ),
        options: [
          { text: tri("Five", "خمسة", "Cinco"), isCorrect: false },
          { text: tri("Six", "ستة", "Seis"), isCorrect: true },
          { text: tri("Four", "أربعة", "Cuatro"), isCorrect: false },
          { text: tri("Seven", "سبعة", "Siete"), isCorrect: false },
        ],
        explanation: tri(
          "There are six pillars of faith: belief in Allah, Angels, Holy Books, Prophets, Day of Judgment, and Divine Decree.",
          "هناك ستة أركان للإيمان: الإيمان بالله والملائكة والكتب والرسل واليوم الآخر والقضاء والقدر.",
          "Hay seis pilares de la fe: la creencia en Allah, los Ángeles, los Libros Sagrados, los Profetas, el Día del Juicio y el Decreto Divino."
        ),
      },
      {
        question: tri(
          "Which angel brought the Quran to Prophet Muhammad?",
          "أي ملك نزل بالقرآن على النبي محمد؟",
          "¿Qué ángel trajo el Corán al Profeta Muhammad?"
        ),
        options: [
          { text: tri("Mikail", "ميكائيل", "Mikail"), isCorrect: false },
          { text: tri("Israfil", "إسرافيل", "Israfil"), isCorrect: false },
          { text: tri("Jibril (Gabriel)", "جبريل", "Yibril (Gabriel)"), isCorrect: true },
          { text: tri("Azrael", "عزرائيل", "Azrael"), isCorrect: false },
        ],
        explanation: tri(
          "Angel Jibril (Gabriel) was responsible for delivering the revelation of the Quran to Prophet Muhammad over 23 years.",
          "الملك جبريل كان مسؤولاً عن إيصال وحي القرآن للنبي محمد على مدى ٢٣ عامًا.",
          "El Ángel Yibril (Gabriel) fue responsable de entregar la revelación del Corán al Profeta Muhammad durante 23 años."
        ),
      },
      {
        question: tri(
          "What is Qadr?",
          "ما هو القدر؟",
          "¿Qué es el Qadr?"
        ),
        options: [
          { text: tri("The Day of Judgment", "يوم القيامة", "El Día del Juicio"), isCorrect: false },
          { text: tri("Divine Decree (predestination)", "القضاء والقدر", "El Decreto Divino (predestinación)"), isCorrect: true },
          { text: tri("A type of prayer", "نوع من الصلاة", "Un tipo de oración"), isCorrect: false },
          { text: tri("An angel's name", "اسم ملك", "El nombre de un ángel"), isCorrect: false },
        ],
        explanation: tri(
          "Qadr (Divine Decree) is the belief that everything happens by the will and knowledge of Allah, while humans still have free will in making choices.",
          "القدر هو الإيمان بأن كل شيء يحدث بإرادة الله وعلمه مع احتفاظ الإنسان بحرية الاختيار.",
          "Qadr (Decreto Divino) es la creencia de que todo sucede por la voluntad y el conocimiento de Allah, mientras los humanos aún tienen libre albedrío en sus elecciones."
        ),
      },
    ],
  });

  // ─── Summary ──────────────────────────────────────────

  const [topicCount, moduleCount, lessonCount, pathCount, quizCount] = await Promise.all([
    Topic.countDocuments(),
    Module.countDocuments(),
    Lesson.countDocuments(),
    LearningPath.countDocuments(),
    Quiz.countDocuments(),
  ]);

  console.log("\nSeed complete!");
  console.log(`  Topics: ${topicCount}`);
  console.log(`  Modules: ${moduleCount}`);
  console.log(`  Lessons: ${lessonCount}`);
  console.log(`  Learning Paths: ${pathCount}`);
  console.log(`  Quizzes: ${quizCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
