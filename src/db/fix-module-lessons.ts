/**
 * One-time script to sync lessons into their module's lessons array.
 * Run with: npx tsx src/db/fix-module-lessons.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;
  const password = process.env.DB_PASSWORD;
  const dbName =
    process.env.NODE_ENV === "production"
      ? process.env.DB_NAME_PROD
      : process.env.DB_NAME_DEV;

  if (!uri || !password || !dbName) {
    console.error("Missing MONGODB_URI, DB_PASSWORD, or DB_NAME env vars");
    process.exit(1);
  }

  const connectionString = uri.replace("<db_password>", password);
  await mongoose.connect(connectionString, { dbName });
  console.log(`Connected to ${dbName}`);

  const db = mongoose.connection.db!;
  const lessons = await db.collection("lessons").find({}).toArray();
  const modules = await db.collection("modules").find({}).toArray();

  let fixed = 0;

  for (const lesson of lessons) {
    if (!lesson.moduleId) continue;

    const moduleId = lesson.moduleId.toString();
    const mod = modules.find((m) => m._id.toString() === moduleId);

    if (!mod) {
      console.log(`  Lesson "${lesson.title?.en}" references missing module ${moduleId}`);
      continue;
    }

    const alreadyLinked = (mod.lessons || []).some(
      (entry: { lessonId: mongoose.Types.ObjectId }) =>
        entry.lessonId?.toString() === lesson._id.toString()
    );

    if (!alreadyLinked) {
      const currentMax = (mod.lessons || []).reduce(
        (max: number, entry: { order?: number }) => Math.max(max, entry.order ?? 0),
        0
      );

      await db.collection("modules").updateOne(
        { _id: mod._id },
        {
          $push: {
            lessons: { lessonId: lesson._id, order: currentMax + 1 },
          } as any,
        }
      );

      console.log(`  Added "${lesson.title?.en}" to module "${mod.title?.en}" (order: ${currentMax + 1})`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} lesson(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
