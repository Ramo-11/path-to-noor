import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  AUDIO_PATH,
  BLOCK_LIMITS,
  invalidAudio,
  invalidFactIcons,
  normalizeBreakdown,
  normalizeCompare,
  normalizeFacts,
  normalizeFlow,
  normalizeKeyPoint,
  normalizeMore,
  normalizePhraseCard,
  normalizeQuickCheck,
  normalizeScenario,
  normalizeStepList,
  normalizeTimeline,
} from "../lib/lesson-blocks";
import { youtubeEmbedUrl } from "../components/lesson/tiptap";

type Lang = "en" | "ar" | "es";
type Localized = Record<Lang, string>;

const LANGS: Lang[] = ["en", "ar", "es"];
const CONTENT_DIR = path.join(process.cwd(), "src/db/content");
const DRY_RUN = process.argv.includes("--dry-run");
const STRICT_AUDIO = process.argv.includes("--strict-audio");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ONLY = new Set(
  (process.argv.find((arg) => arg.startsWith("--only="))?.slice(7) ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
);

const SOURCES_HEADING: Localized = { en: "Sources", ar: "المصادر", es: "Fuentes" };
const WATCH_HEADING: Localized = { en: "Watch", ar: "شاهد", es: "Mira" };
const FULL_SERIES: Localized = {
  en: "Watch the full series on YouTube",
  ar: "شاهد السلسلة كاملة على يوتيوب",
  es: "Mira la serie completa en YouTube",
};
const IN_ENGLISH: Record<Lang, string> = { en: "", ar: "الفيديو باللغة الإنجليزية.", es: "El video está en inglés." };
const DIFFERENCE_NOTES: Record<"majority" | "cautious", Localized> = {
  majority: {
    en: "Scholars hold more than one view on this question. This lesson presents the view held by the majority of scholars. If you are unsure what applies to you, ask a trusted scholar or the imam at your local masjid.",
    ar: "للعلماء في هذه المسألة أكثر من قول، ويعرض هذا الدرس قول جمهور العلماء. وإن لم تكن متأكدا مما ينطبق على حالتك، فاسأل عالما تثق به أو إمام المسجد القريب منك.",
    es: "Los sabios tienen más de una opinión sobre esta cuestión. Esta lección presenta la opinión de la mayoría de los sabios. Si no estás seguro de qué se aplica a tu caso, pregunta a un sabio de confianza o al imam de tu mezquita local.",
  },
  cautious: {
    en: "Scholars today hold more than one view on this question, and no single view is clearly held by the majority. This lesson follows the more cautious view and focuses on what all sides agree on. If you are unsure what applies to you, ask a trusted scholar or the imam at your local masjid.",
    ar: "للعلماء المعاصرين في هذه المسألة أكثر من قول، وليس فيها قول ظاهر للجمهور. ويأخذ هذا الدرس بالقول الأحوط ويركز على ما يتفق عليه الجميع. وإن لم تكن متأكدا مما ينطبق على حالتك، فاسأل عالما تثق به أو إمام المسجد القريب منك.",
    es: "Los sabios de hoy tienen más de una opinión sobre esta cuestión, y ninguna es claramente la de la mayoría. Esta lección sigue la opinión más prudente y se centra en lo que todos aceptan. Si no estás seguro de qué se aplica a tu caso, pregunta a un sabio de confianza o al imam de tu mezquita local.",
  },
};

interface Block {
  p?: string;
  h?: string;
  ul?: string[];
  ol?: string[];
  quote?: string;
  cite?: string;
  key?: string;
  phrase?: { arabic: string; transliteration: string; meaning: string; audio?: string | string[] };
  breakdown?: { parts: unknown[]; result?: string; audio?: string | string[] };
  compare?: { first: unknown; second: unknown };
  flow?: { title?: string; steps: unknown[] };
  timeline?: { title?: string; events: unknown[] };
  facts?: { title?: string; items: unknown[] };
  scenario?: { situation?: string; lines: unknown[] };
  more?: { title?: string; blocks: Block[] };
  steps?: { title: string; steps: string[] };
  quick?: { question: string; options: string[]; correct: number; explanation: string };
}

interface CheckQuestion {
  q: Localized;
  options: Localized[];
  correct: number;
  why: Localized;
}

interface VideoRef {
  url: string;
  title: Localized;
  by: Localized;
  seconds: number;
  series?: string;
  note?: Localized;
}

interface LessonFile {
  slug: string;
  minutes: number;
  title: Localized;
  body: Record<Lang, Block[]>;
  sources: Array<{ label: string; url: string }>;
  differenceNote?: boolean | "majority" | "cautious";
  check?: CheckQuestion[];
  video?: VideoRef;
  watch?: VideoRef[];
}

interface StepEntry {
  slug: string;
  title?: Localized;
  description?: Localized;
  topics?: string[];
  lessons?: string[];
}

interface PathFile {
  slug: string;
  stage?: "beginning" | "foundations" | "deeper";
  order?: number;
  title?: Localized;
  description?: Localized;
  outcomes?: Localized[];
  steps?: StepEntry[];
}

type TipTapNode = Record<string, unknown>;

function fail(message: string): never {
  throw new Error(message);
}

function requireLocalized(value: unknown, where: string): Localized {
  const v = value as Partial<Localized> | undefined;
  for (const lang of LANGS) {
    if (!v || typeof v[lang] !== "string" || !v[lang]!.trim()) fail(`${where}: missing ${lang}`);
  }
  return v as Localized;
}

function inline(text: string): TipTapNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((part) => part.length > 0);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] };
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return { type: "text", text: part.slice(1, -1), marks: [{ type: "italic" }] };
    }
    return { type: "text", text: part };
  });
}

function paragraph(text: string): TipTapNode {
  return { type: "paragraph", content: inline(text) };
}

function list(type: "bulletList" | "orderedList", items: string[]): TipTapNode {
  return {
    type,
    content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
  };
}

function checkAudio(value: unknown, where: string): void {
  const bad = invalidAudio(value);
  if (bad.length > 0) fail(`${where}: audio must match ${AUDIO_PATH} (got ${bad.join(", ")})`);
  const clips = typeof value === "string" ? [value] : Array.isArray(value) ? (value as string[]) : [];
  for (const clip of clips) {
    if (fs.existsSync(path.join(PUBLIC_DIR, clip))) continue;
    if (STRICT_AUDIO) fail(`${where}: audio file missing: public${clip}`);
    console.warn(`warning: ${where}: audio file missing: public${clip}`);
  }
}

function checkRange(count: unknown, [min, max]: readonly [number, number], what: string, where: string): void {
  const n = Array.isArray(count) ? count.length : 0;
  if (n < min || n > max) fail(`${where}: ${what} needs ${min} to ${max} entries, got ${n}`);
}

function blockToNode(block: Block, where: string, nested = false): TipTapNode {
  if (typeof block.p === "string") return paragraph(block.p);
  if (typeof block.h === "string") {
    return { type: "heading", attrs: { level: 2 }, content: inline(block.h) };
  }
  if (Array.isArray(block.ul)) return list("bulletList", block.ul);
  if (Array.isArray(block.ol)) return list("orderedList", block.ol);
  if (typeof block.quote === "string") {
    if ("audio" in block) fail(`${where}: quote.audio is not supported`);
    const content: TipTapNode[] = [paragraph(block.quote)];
    if (block.cite) content.push({ type: "paragraph", content: [{ type: "text", text: block.cite, marks: [{ type: "italic" }] }] });
    return { type: "blockquote", content };
  }
  if (typeof block.key === "string") {
    const attrs = normalizeKeyPoint({ text: block.key }) ?? fail(`${where}: invalid key point`);
    return { type: "keyPoint", attrs };
  }
  if (block.phrase) {
    checkAudio(block.phrase.audio, `${where} phrase`);
    const attrs = normalizePhraseCard(block.phrase) ?? fail(`${where}: invalid phrase card`);
    return { type: "phraseCard", attrs };
  }
  if (block.steps) {
    const attrs = normalizeStepList(block.steps) ?? fail(`${where}: invalid step list`);
    return { type: "stepList", attrs };
  }
  if (block.quick) {
    const attrs =
      normalizeQuickCheck({
        question: block.quick.question,
        options: block.quick.options,
        correctIndex: block.quick.correct,
        explanation: block.quick.explanation,
      }) ?? fail(`${where}: invalid quick question`);
    return { type: "quickCheck", attrs };
  }
  if (block.breakdown) {
    checkRange(block.breakdown.parts, BLOCK_LIMITS.breakdownParts, "breakdown parts", where);
    checkAudio(block.breakdown.audio, `${where} breakdown`);
    const attrs = normalizeBreakdown(block.breakdown) ?? fail(`${where}: invalid breakdown (every part needs arabic and meaning)`);
    return { type: "breakdown", attrs };
  }
  if (block.compare) {
    const attrs = normalizeCompare(block.compare) ?? fail(`${where}: invalid compare (first and second each need a title and 1 to 5 items)`);
    return { type: "compare", attrs };
  }
  if (block.flow) {
    checkRange(block.flow.steps, BLOCK_LIMITS.flowSteps, "flow steps", where);
    const attrs = normalizeFlow(block.flow) ?? fail(`${where}: invalid flow (every step needs a label)`);
    return { type: "flow", attrs };
  }
  if (block.timeline) {
    checkRange(block.timeline.events, BLOCK_LIMITS.timelineEvents, "timeline events", where);
    const attrs = normalizeTimeline(block.timeline) ?? fail(`${where}: invalid timeline (every event needs when and text)`);
    return { type: "timeline", attrs };
  }
  if (block.facts) {
    checkRange(block.facts.items, BLOCK_LIMITS.factItems, "facts items", where);
    const badIcons = invalidFactIcons(block.facts.items);
    if (badIcons.length > 0) fail(`${where}: unknown facts icon ${badIcons.join(", ")}`);
    const attrs = normalizeFacts(block.facts) ?? fail(`${where}: invalid facts (every item needs a label)`);
    return { type: "facts", attrs };
  }
  if (block.scenario) {
    checkRange(block.scenario.lines, BLOCK_LIMITS.scenarioLines, "scenario lines", where);
    const lines = block.scenario.lines as Array<{ from?: unknown }>;
    if (lines.some((line) => line?.from !== "them" && line?.from !== "you")) fail(`${where}: scenario line "from" must be "them" or "you"`);
    const attrs = normalizeScenario(block.scenario) ?? fail(`${where}: invalid scenario (every line needs text)`);
    return { type: "scenario", attrs };
  }
  if (block.more) {
    if (nested) fail(`${where}: more cannot contain more`);
    if (!Array.isArray(block.more.blocks) || block.more.blocks.length === 0) fail(`${where}: more needs blocks`);
    const attrs = normalizeMore(block.more);
    if (!attrs.title.trim()) fail(`${where}: more needs a title`);
    const content = block.more.blocks.map((child, i) => {
      if (child.more || child.quick || typeof child.key === "string") fail(`${where} more block ${i + 1}: more, quick and key are not allowed inside more`);
      return blockToNode(child, `${where} more block ${i + 1}`, true);
    });
    return { type: "moreBlock", attrs, content };
  }
  return fail(`${where}: unknown block ${JSON.stringify(block).slice(0, 80)}`);
}

function duration(seconds: number, lang: Lang): string {
  if (seconds < 60) return { en: "Under a minute", ar: "أقل من دقيقة", es: "Menos de un minuto" }[lang];
  const minutes = Math.round(seconds / 60);
  if (lang !== "ar") return `${minutes} min`;
  if (minutes === 1) return "دقيقة واحدة";
  if (minutes === 2) return "دقيقتان";
  return minutes <= 10 ? `${minutes} دقائق` : `${minutes} دقيقة`;
}

function videoNodes(video: VideoRef, lang: Lang, inWatchSection: boolean): TipTapNode[] {
  const stop = lang === "ar" ? "، " : ", ";
  const language = video.note ? video.note[lang] : IN_ENGLISH[lang];
  const length = inWatchSection ? `${stop}${duration(video.seconds, lang)}` : "";
  const credit = `${video.by[lang]}${length}.${language ? ` ${language}` : ""}`;
  const nodes: TipTapNode[] = [];
  if (inWatchSection) nodes.push({ type: "paragraph", content: [{ type: "text", text: video.title[lang], marks: [{ type: "bold" }] }] });
  nodes.push({ type: "youtube", attrs: { src: video.url } });
  nodes.push({ type: "paragraph", content: [{ type: "text", text: credit }] });
  if (video.series) {
    nodes.push({
      type: "paragraph",
      content: [{ type: "text", text: FULL_SERIES[lang], marks: [{ type: "link", attrs: { href: video.series } }] }],
    });
  }
  return nodes;
}

function buildDoc(lesson: LessonFile, lang: Lang): TipTapNode {
  const blocks = lesson.body?.[lang];
  if (!Array.isArray(blocks) || blocks.length === 0) fail(`${lesson.slug}: empty ${lang} body`);
  const content = blocks.map((block, index) => blockToNode(block, `${lesson.slug} ${lang} block ${index + 1}`));

  if (lesson.video) {
    const [player, ...rest] = videoNodes(lesson.video, lang, false);
    content.unshift(player);
    content.push(...rest);
  }

  if (lesson.watch && lesson.watch.length > 0) {
    const watch: TipTapNode[] = [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: WATCH_HEADING[lang] }] },
      ...lesson.watch.flatMap((video) => videoNodes(video, lang, true)),
    ];
    const closing = typeof blocks[blocks.length - 1].p === "string" ? content.length - 1 : content.length;
    content.splice(closing, 0, ...watch);
  }

  if (lesson.sources.length > 0) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: SOURCES_HEADING[lang] }] });
    content.push({
      type: "bulletList",
      content: lesson.sources.map((source) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: source.label, marks: [{ type: "link", attrs: { href: source.url } }] }],
          },
        ],
      })),
    });
  }

  if (lesson.differenceNote) {
    const note = DIFFERENCE_NOTES[lesson.differenceNote === "cautious" ? "cautious" : "majority"];
    content.push({ type: "horizontalRule" });
    content.push({ type: "paragraph", content: [{ type: "text", text: note[lang], marks: [{ type: "italic" }] }] });
  }

  return { type: "doc", content };
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function listJson(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(full, name));
}

function validateLesson(lesson: LessonFile, file: string): void {
  if (!lesson.slug || !/^[a-z0-9-]+$/.test(lesson.slug)) fail(`${file}: bad slug`);
  if (path.basename(file, ".json") !== lesson.slug) fail(`${file}: file name must match slug`);
  if (!Number.isFinite(lesson.minutes) || lesson.minutes < 1) fail(`${lesson.slug}: minutes`);
  requireLocalized(lesson.title, `${lesson.slug} title`);
  if (!Array.isArray(lesson.sources)) fail(`${lesson.slug}: sources must be an array`);
  for (const source of lesson.sources) {
    if (!source.label || !/^https:\/\//.test(source.url)) fail(`${lesson.slug}: bad source ${JSON.stringify(source)}`);
  }
  for (const [index, question] of (lesson.check ?? []).entries()) {
    const where = `${lesson.slug} check ${index + 1}`;
    requireLocalized(question.q, where);
    requireLocalized(question.why, `${where} explanation`);
    if (!Array.isArray(question.options) || question.options.length < 2) fail(`${where}: options`);
    question.options.forEach((option, i) => requireLocalized(option, `${where} option ${i + 1}`));
    if (question.correct < 0 || question.correct >= question.options.length) fail(`${where}: correct index`);
  }
  if (lesson.video && lesson.watch) fail(`${lesson.slug}: use video or watch, not both`);
  for (const [index, video] of [...(lesson.video ? [lesson.video] : []), ...(lesson.watch ?? [])].entries()) {
    const where = `${lesson.slug} video ${index + 1}`;
    if (!youtubeEmbedUrl(video.url)) fail(`${where}: not an embeddable YouTube link`);
    requireLocalized(video.title, `${where} title`);
    requireLocalized(video.by, `${where} by`);
    if (video.note) requireLocalized(video.note, `${where} note`);
    if (!Number.isInteger(video.seconds) || video.seconds < 1) fail(`${where}: seconds`);
    if (video.series && !/^https:\/\/www\.youtube\.com\/playlist\?list=[\w-]+$/.test(video.series)) {
      fail(`${where}: series must be a YouTube playlist link`);
    }
  }
  for (const lang of LANGS) buildDoc(lesson, lang);
}

function buildMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  const password = process.env.DB_PASSWORD;
  const dbName =
    process.env.NODE_ENV === "production" ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;
  if (!uri || !password || !dbName) fail("Missing MONGODB_URI, DB_PASSWORD, or DB_NAME_* in .env.local");
  const url = new URL(uri.replace("<db_password>", password));
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function main() {
  if (ONLY.size > 0 && !DRY_RUN) fail("--only is for validation and needs --dry-run");
  const lessonFiles = listJson("lessons").filter(
    (file) => ONLY.size === 0 || ONLY.has(path.basename(file, ".json"))
  );
  const lessons = lessonFiles.map((file) => {
    const lesson = readJson<LessonFile>(file);
    validateLesson(lesson, file);
    return lesson;
  });
  const paths = ONLY.size > 0 ? [] : listJson("paths").map((file) => readJson<PathFile>(file));
  const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

  for (const pathFile of paths) {
    for (const step of pathFile.steps ?? []) {
      for (const slug of step.lessons ?? []) {
        if (!lessonBySlug.has(slug)) fail(`${pathFile.slug}/${step.slug}: no lesson file for ${slug}`);
      }
    }
  }

  console.log(`Validated ${lessons.length} lessons and ${paths.length} path files`);
  if (DRY_RUN) return;

  await mongoose.connect(buildMongoUri());
  const db = mongoose.connection.db ?? fail("No database handle");
  console.log(`Importing into ${db.databaseName}`);
  const now = new Date();

  const topicsCol = db.collection("topics");
  const modulesCol = db.collection("modules");
  const lessonsCol = db.collection("lessons");
  const pathsCol = db.collection("learningpaths");
  const quizzesCol = db.collection("quizzes");

  const moduleForLesson = new Map<string, mongoose.Types.ObjectId>();

  for (const pathFile of paths) {
    for (const step of pathFile.steps ?? []) {
      const topicIds: mongoose.Types.ObjectId[] = [];
      for (const topicSlug of step.topics ?? []) {
        const topic = await topicsCol.findOne({ slug: topicSlug });
        if (!topic) fail(`Unknown topic ${topicSlug}`);
        topicIds.push(topic._id as mongoose.Types.ObjectId);
        if (!topic.published) {
          await topicsCol.updateOne({ _id: topic._id }, { $set: { published: true, updatedAt: now } });
          console.log(`  published topic ${topicSlug}`);
        }
      }

      const existing = await modulesCol.findOne({ slug: step.slug });
      const set: Record<string, unknown> = { updatedAt: now, published: true };
      if (step.title) set.title = requireLocalized(step.title, `${step.slug} title`);
      if (step.description) set.description = requireLocalized(step.description, `${step.slug} description`);
      if (topicIds.length > 0) set.topics = topicIds;

      let moduleId: mongoose.Types.ObjectId;
      if (existing) {
        moduleId = existing._id as mongoose.Types.ObjectId;
        await modulesCol.updateOne({ _id: moduleId }, { $set: set });
      } else {
        if (!step.title || !step.description) fail(`New step ${step.slug} needs title and description`);
        const result = await modulesCol.insertOne({
          slug: step.slug,
          thumbnail: "",
          topics: topicIds,
          lessons: [],
          audience: "all",
          guestAccessible: true,
          createdAt: now,
          ...set,
        });
        moduleId = result.insertedId as mongoose.Types.ObjectId;
        console.log(`  created step ${step.slug}`);
      }
      for (const slug of step.lessons ?? []) moduleForLesson.set(slug, moduleId);
    }
  }

  const lessonIds = new Map<string, mongoose.Types.ObjectId>();
  for (const lesson of lessons) {
    const content = { en: buildDoc(lesson, "en"), ar: buildDoc(lesson, "ar"), es: buildDoc(lesson, "es") };
    const existing = await lessonsCol.findOne({ slug: lesson.slug });
    let lessonId: mongoose.Types.ObjectId;
    if (existing) {
      lessonId = existing._id as mongoose.Types.ObjectId;
      const moduleId = moduleForLesson.get(lesson.slug);
      await lessonsCol.updateOne(
        { _id: lessonId },
        {
          $set: {
            title: lesson.title,
            content,
            estimatedMinutes: lesson.minutes,
            published: true,
            updatedAt: now,
            ...(moduleId ? { moduleId } : {}),
          },
        }
      );
    } else {
      const moduleId = moduleForLesson.get(lesson.slug) ?? fail(`New lesson ${lesson.slug} is not listed in any step`);
      const result = await lessonsCol.insertOne({
        slug: lesson.slug,
        title: lesson.title,
        content,
        moduleId,
        estimatedMinutes: lesson.minutes,
        audience: "all",
        guestAccessible: true,
        published: true,
        createdAt: now,
        updatedAt: now,
      });
      lessonId = result.insertedId as mongoose.Types.ObjectId;
      console.log(`  created lesson ${lesson.slug}`);
    }
    lessonIds.set(lesson.slug, lessonId);

    if (lesson.check && lesson.check.length > 0) {
      const questions = lesson.check.map((question) => ({
        question: question.q,
        options: question.options.map((text, index) => ({ text, isCorrect: index === question.correct })),
        explanation: question.why,
      }));
      await quizzesCol.updateOne(
        { lessonId },
        {
          $set: { questions, updatedAt: now },
          $setOnInsert: { lessonId, required: false, passingScore: 70, createdAt: now },
        },
        { upsert: true }
      );
    }
  }

  for (const pathFile of paths) {
    for (const step of pathFile.steps ?? []) {
      if (!step.lessons || step.lessons.length === 0) continue;
      const ordered = step.lessons.map((slug, index) => ({
        lessonId: lessonIds.get(slug) ?? fail(`Missing lesson id for ${slug}`),
        order: index + 1,
      }));
      await modulesCol.updateOne({ slug: step.slug }, { $set: { lessons: ordered, updatedAt: now } });
    }

    const existing = await pathsCol.findOne({ slug: pathFile.slug });
    const set: Record<string, unknown> = { updatedAt: now };
    if (pathFile.title) set.title = requireLocalized(pathFile.title, `${pathFile.slug} title`);
    if (pathFile.description) set.description = requireLocalized(pathFile.description, `${pathFile.slug} description`);
    if (pathFile.outcomes) {
      set.outcomes = pathFile.outcomes.map((outcome, i) => requireLocalized(outcome, `${pathFile.slug} outcome ${i + 1}`));
    }
    if (pathFile.stage) set.stage = pathFile.stage;
    if (typeof pathFile.order === "number") set.order = pathFile.order;

    const stepModules = await Promise.all(
      (pathFile.steps ?? []).map(async (step, index) => {
        const mod = await modulesCol.findOne({ slug: step.slug });
        return { moduleId: mod?._id ?? fail(`Missing step ${step.slug}`), order: index + 1 };
      })
    );

    if (existing) {
      if (stepModules.length > 0) set.modules = stepModules;
      await pathsCol.updateOne({ _id: existing._id }, { $set: set });
    } else {
      if (!pathFile.title || !pathFile.description || !pathFile.stage) fail(`New path ${pathFile.slug} needs title, description, stage`);
      await pathsCol.insertOne({
        slug: pathFile.slug,
        thumbnail: "",
        estimatedHours: 1,
        modules: stepModules,
        audience: "all",
        guestAccessible: true,
        published: true,
        createdAt: now,
        order: 1,
        outcomes: [],
        ...set,
      });
      console.log(`  created path ${pathFile.slug}`);
    }
  }

  for (const pathDoc of await pathsCol.find({ published: true }).toArray()) {
    const moduleIds = (pathDoc.modules ?? []).map((m: { moduleId: mongoose.Types.ObjectId }) => m.moduleId);
    const mods = await modulesCol.find({ _id: { $in: moduleIds }, published: true }).toArray();
    const ids = mods.flatMap((m) => (m.lessons ?? []).map((l: { lessonId: mongoose.Types.ObjectId }) => l.lessonId));
    const published = await lessonsCol.find({ _id: { $in: ids }, published: true }).project({ estimatedMinutes: 1 }).toArray();
    const minutes = published.reduce((sum, l) => sum + (l.estimatedMinutes || 0), 0);
    const hours = Math.max(1, Math.round(minutes / 60));
    await pathsCol.updateOne({ _id: pathDoc._id }, { $set: { estimatedHours: hours } });
    console.log(`  ${pathDoc.slug}: ${published.length} published lessons, about ${hours}h`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
