import { NextResponse } from "next/server";
import { getSchoolRegistry } from "@/lib/mba-interview/school-registry";

/** Programmes available in the MBA Interview Room static app (full registry, including Berkeley Haas). */
export async function GET() {
  try {
    const reg = getSchoolRegistry();
    return NextResponse.json({ version: reg.version, schools: reg.schools });
  } catch (e) {
    console.error("mba-interview-room schools list error:", e);
    return NextResponse.json({ error: "Could not load school registry." }, { status: 500 });
  }
}
