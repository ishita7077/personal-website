import { NextResponse } from "next/server";
import { loadInterviewRoomBundle } from "@/lib/mba-interview/load-interview-room-bundle";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Full dataset bundle for one programme (questions, timing, meta, framework markdown).
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const bundle = loadInterviewRoomBundle(id);
  if (!bundle) {
    return NextResponse.json({ error: "Unknown school or missing dataset." }, { status: 404 });
  }
  return NextResponse.json(bundle);
}
