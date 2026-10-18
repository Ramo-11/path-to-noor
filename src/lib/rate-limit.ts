import { isIP } from "node:net";
import mongoose, { Schema } from "mongoose";
import { connectDB } from "@/db/connection";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, { count: number; resetAt: number }>();

const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store) {
    if (now > value.resetAt) store.delete(key);
  }
}, 60_000);
sweeper.unref?.();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<RateLimitDoc>(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { collection: "ratelimits", versionKey: false }
);

const RateLimitModel: mongoose.Model<RateLimitDoc> =
  mongoose.models.RateLimit || mongoose.model<RateLimitDoc>("RateLimit", RateLimitSchema);

async function hit(key: string, windowMs: number): Promise<{ count: number; expiresAt: Date }> {
  const now = new Date();
  const fresh = new Date(now.getTime() + windowMs);
  const pipeline = [
    {
      $set: {
        count: {
          $cond: [{ $gt: ["$expiresAt", now] }, { $add: [{ $ifNull: ["$count", 0] }, 1] }, 1],
        },
        expiresAt: { $cond: [{ $gt: ["$expiresAt", now] }, "$expiresAt", fresh] },
      },
    },
  ];
  const run = () =>
    RateLimitModel.collection.findOneAndUpdate({ _id: key as never }, pipeline, {
      upsert: true,
      returnDocument: "after",
    });
  let doc;
  try {
    doc = await run();
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    doc = await run();
  }
  if (!doc) throw new Error("rate limit write returned nothing");
  return { count: doc.count as number, expiresAt: doc.expiresAt as Date };
}

export async function rateLimitShared(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    await connectDB();
    const { count, expiresAt } = await hit(key, windowMs);
    const resetAt = expiresAt.getTime();
    if (count > maxRequests) return { success: false, remaining: 0, resetAt };
    return { success: true, remaining: maxRequests - count, resetAt };
  } catch (error) {
    console.error("[RateLimit] shared store unavailable, using memory:", error);
    return rateLimit(key, maxRequests, windowMs);
  }
}

export async function clearRateLimit(key: string): Promise<void> {
  store.delete(key);
  try {
    await connectDB();
    await RateLimitModel.collection.deleteOne({ _id: key as never });
  } catch (error) {
    console.error("[RateLimit] could not clear key:", error);
  }
}

function validIp(value: string | null | undefined): string | null {
  const ip = value?.trim();
  return ip && isIP(ip) ? ip : null;
}

export function getClientIp(headers: Headers): string {
  const viaCloudflare = Boolean(headers.get("cf-ray"));
  if (viaCloudflare) {
    const edge = validIp(headers.get("cf-connecting-ip"));
    if (edge) return edge;
  }
  const hops = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  for (let i = hops.length - 1; i >= 0; i--) {
    const ip = validIp(hops[i]);
    if (ip) return ip;
  }
  return validIp(headers.get("x-real-ip")) || "unknown";
}
