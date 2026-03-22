import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ path?: string[] }> };

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js":  "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
};

/**
 * Standalone **Interview Room** (Haas-focused) — independent from MBA Interview Room.
 * Serves `public/InterviewRoom/index.html` for `/InterviewRoom` and any nested path so
 * shared links keep working. Assets (CSS/JS/images) are served directly by extension.
 * Assets resolve via `<base href="/InterviewRoom/">`.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { path: segments } = await params;

  // If there are path segments, check if it's an asset request
  if (segments && segments.length > 0) {
    const ext = path.extname(segments[segments.length - 1]).toLowerCase();
    const mimeType = MIME_TYPES[ext];

    if (mimeType) {
      try {
        const assetPath = path.join(process.cwd(), "public", "InterviewRoom", ...segments);
        const data = await readFile(assetPath);
        return new NextResponse(data, {
          headers: { "Content-Type": mimeType },
        });
      } catch {
        return new NextResponse("Asset not found", { status: 404 });
      }
    }
  }

  // Otherwise serve the SPA shell
  try {
    const filePath = path.join(process.cwd(), "public", "InterviewRoom", "index.html");
    const html = await readFile(filePath, "utf-8");
    const baseTag = '<base href="/InterviewRoom/">';
    const withBase =
      html.indexOf("<head>") !== -1 ? html.replace("<head>", `<head>${baseTag}`) : html;
    return new NextResponse(withBase, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("InterviewRoom route error:", err);
    return new NextResponse("Interview Room not found", { status: 404 });
  }
}
