import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_FOLDERS = new Set([
  "path-to-noor/lessons",
  "path-to-noor/thumbnails",
  "path-to-noor/topics",
  "path-to-noor/stories",
  "path-to-noor/avatars",
]);
const DEFAULT_FOLDER = "path-to-noor/lessons";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if (!isAdminSession(authResult)) return authResult;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const requestedFolder = (formData.get("folder") as string) || DEFAULT_FOLDER;
    const folder = ALLOWED_FOLDERS.has(requestedFolder)
      ? requestedFolder
      : DEFAULT_FOLDER;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      overwrite: false,
    });

    return NextResponse.json({
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
