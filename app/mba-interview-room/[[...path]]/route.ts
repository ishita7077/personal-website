import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ path?: string[] }> };

/**
 * Serves the MBA Interview Room SPA for `/mba-interview-room` and nested paths
 * (e.g. `/mba-interview-room/stanford_gsb`, `/mba-interview-room/stanford_gsb/resources`).
 * Assets resolve via `<base href="/MbaInterviewRoom/">`.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  await params;
  try {
    const filePath = path.join(process.cwd(), "public", "MbaInterviewRoom", "index.html");
    const html = await readFile(filePath, "utf-8");
    const baseTag = '<base href="/MbaInterviewRoom/">';
    const withBase =
      html.indexOf("<head>") !== -1 ? html.replace("<head>", `<head>${baseTag}`) : html;
    return new NextResponse(withBase, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("MbaInterviewRoom route error:", err);
    return new NextResponse("MBA Interview Room not found", { status: 404 });
  }
}
