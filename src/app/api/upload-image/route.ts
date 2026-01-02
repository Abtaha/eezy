import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

function normalizeMime(type: string) {
  // Some users might send image/jpg (non-standard). Normalize it.
  if (type === "image/jpg") return "image/jpeg";
  return type;
}

function extFromMime(type: string) {
  switch (type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return "";
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new NextResponse("Missing file field named 'file'.", {
        status: 400,
      });
    }

    const mime = normalizeMime(file.type);

    // Allow only these
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
      return new NextResponse(
        `Unsupported file type: ${file.type}. Allowed: JPG/JPEG, PNG, WEBP.`,
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return new NextResponse("Empty file.", { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return new NextResponse(
        `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max is ${
          MAX_BYTES / (1024 * 1024)
        }MB.`,
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = extFromMime(mime) || path.extname(file.name) || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return new NextResponse(message, { status: 500 });
  }
}
