/**
 * Interactive CLI script to reset an admin user's password.
 *
 * Usage:
 *   npx tsx src/db/reset-password.ts
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

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ["super_admin", "admin", "user"], default: "admin" },
  isActive: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n--- Path to Noor: Password Reset Script ---\n");

  const mongoUri = buildMongoUri();
  console.log(`Connecting to: ${mongoUri.replace(/\/\/.*@/, "//***@")}...`);
  await mongoose.connect(mongoUri);
  console.log("Connected.\n");

  // List admin users
  const admins = await User.find({ role: { $in: ["super_admin", "admin"] } }).select(
    "email name role"
  );

  if (admins.length === 0) {
    console.log("No admin users found. Use the seed script to create one.");
    process.exit(0);
  }

  console.log("Admin users:");
  admins.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email} (${u.role}) — ${u.name}`);
  });
  console.log();

  const choice = await ask(`Select user (1-${admins.length}): `);
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= admins.length) {
    console.error("Invalid selection.");
    process.exit(1);
  }

  const selected = admins[index];
  const newPassword = await ask("New password (min 8 chars): ");

  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.updateOne({ _id: selected._id }, { $set: { password: hashedPassword } });

  console.log(`\nPassword updated for "${selected.email}" successfully.`);

  rl.close();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
