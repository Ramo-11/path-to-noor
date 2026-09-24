import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";

const DIFFICULTY_TO_STAGE: Record<string, string> = {
  beginner: "beginning",
  intermediate: "foundations",
  advanced: "deeper",
};

const STAGE_BY_SLUG: Record<string, string> = {
  "res-first-steps-in-islam": "beginning",
  "res-living-as-a-muslim": "foundations",
};

function buildMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  const password = process.env.DB_PASSWORD;
  const dbName =
    process.env.NODE_ENV === "production" ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;

  if (!uri || !password || !dbName) {
    throw new Error("Missing MONGODB_URI, DB_PASSWORD, or DB_NAME_* in .env.local");
  }

  const url = new URL(uri.replace("<db_password>", password));
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function main() {
  const uri = buildMongoUri();
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database handle");

  console.log(`Migrating learning paths in ${db.databaseName}`);
  const paths = db.collection("learningpaths");
  const docs = await paths.find({}).toArray();

  const orderByStage = new Map<string, number>();
  const sorted = [...docs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const doc of sorted) {
    const stage =
      STAGE_BY_SLUG[doc.slug] ??
      (typeof doc.stage === "string" ? doc.stage : undefined) ??
      DIFFICULTY_TO_STAGE[doc.difficulty] ??
      "beginning";
    const order = typeof doc.order === "number" ? doc.order : (orderByStage.get(stage) ?? 0) + 1;
    orderByStage.set(stage, Math.max(order, orderByStage.get(stage) ?? 0));

    await paths.updateOne(
      { _id: doc._id },
      {
        $set: { stage, order, outcomes: Array.isArray(doc.outcomes) ? doc.outcomes : [] },
        $unset: { difficulty: "" },
      }
    );
    console.log(`  ${doc.slug}: stage=${stage} order=${order}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
