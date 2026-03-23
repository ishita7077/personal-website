import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ path?: string[] }> };

/**
 * Redirect `/InterviewRoom` to `/mba-interview-room`.
 *
 * We keep this route because the desktop icon may still link to `/InterviewRoom`;
 * in production we want a single canonical URL for the multi-school MBA experience.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  await params;
  // Note: we intentionally redirect *all* `/InterviewRoom/*` requests.
  const url = new URL(_req.url);
  url.pathname = "/mba-interview-room";
  return NextResponse.redirect(url, 307);
}
