import { z } from "zod";

const envSchema = z.object({
  // Database
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (url) =>
        url.startsWith("mongodb://") || url.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a valid MongoDB connection string"
    ),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME_PROD: z.string().min(1, "DB_NAME_PROD is required"),
  DB_NAME_DEV: z.string().min(1, "DB_NAME_DEV is required"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // General
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function validateEnv(): Env {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return {} as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, msgs]) => `  ${field}: ${msgs?.join(", ")}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return result.data;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

export function getMongoUri(): string {
  const envVars = getEnv();

  const isProduction = envVars.NODE_ENV === "production";
  const dbName = isProduction ? envVars.DB_NAME_PROD : envVars.DB_NAME_DEV;

  let uri = envVars.MONGODB_URI;
  if (envVars.DB_PASSWORD) {
    uri = uri.replace("<db_password>", envVars.DB_PASSWORD);
  }

  const url = new URL(uri);
  url.pathname = `/${dbName}`;

  return url.toString();
}
