import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Serves the multi-school MBA Interview Room static app (`public/MbaInterviewRoom/`).
 *
 * Optional: map a subdomain to this path via your host’s rewrite rules.
 */
export async function GET() {
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
