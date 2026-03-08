/**
 * Interactive CLI script to seed the first admin user.
 *
 * Usage:
 *   npx tsx src/db/seed-admin.ts
 *   # or if configured in package.json:
 *   npm run seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createInterface } from "readline";

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

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["super_admin", "admin", "user"], default: "admin" },
    isActive: { type: Boolean, default: true },
    preferredLanguage: { type: String, enum: ["en", "ar", "es"], default: "en" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n--- Basmet Dawah: Admin Seed Script ---\n");

  const mongoUri = buildMongoUri();
  console.log(`Connecting to: ${mongoUri.replace(/\/\/.*@/, "//***@")}...`);
  await mongoose.connect(mongoUri);
  console.log("Connected.\n");

  const existingCount = await User.countDocuments();
  if (existingCount > 0) {
    const proceed = await ask(
      `Found ${existingCount} existing user(s). Create another? (y/n): `
    );
    if (proceed.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  const email = await ask("Email: ");
  const name = await ask("Display name: ");
  const password = await ask("Password (min 8 chars): ");

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const roleInput = await ask("Role (1 = super_admin, 2 = admin) [1]: ");
  const role = roleInput.trim() === "2" ? "admin" : "super_admin";
  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    name: name.trim(),
    role,
    isActive: true,
    preferredLanguage: "en",
  });

  console.log(`\nCreated ${role} user "${email}" successfully.`);

  rl.close();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
