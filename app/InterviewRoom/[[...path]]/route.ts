import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ path?: string[] }> };

/**
 * Standalone **Interview Room** (Haas-focused) — independent from MBA Interview Room.
 * Serves `public/InterviewRoom/index.html` for `/InterviewRoom` and any nested path so
 * shared links keep working. Assets resolve via `<base href="/InterviewRoom/">`.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  await params;
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
