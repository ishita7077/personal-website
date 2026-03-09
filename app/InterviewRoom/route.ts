import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Serves the Interview Room static HTML.
 * Assets (CSS, JS) are served from public/InterviewRoom/ at /InterviewRoom/*.
 * We inject <base href="/InterviewRoom/"> so relative paths resolve correctly.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "InterviewRoom", "index.html");
    const html = await readFile(filePath, "utf-8");

    // Inject base tag so src/styles/main.css → /InterviewRoom/src/styles/main.css
    const baseTag = '<base href="/InterviewRoom/">';
    const withBase =
      html.indexOf("<head>") !== -1
        ? html.replace("<head>", `<head>${baseTag}`)
        : html;

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
