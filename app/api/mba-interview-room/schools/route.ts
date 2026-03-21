import { NextResponse } from "next/server";
import { getSchoolRegistry } from "@/lib/mba-interview/school-registry";

/** Programmes available in the MBA Interview Room static app (`berkeley_haas` uses `/InterviewRoom`). */
export async function GET() {
  try {
    const reg = getSchoolRegistry();
    const schools = reg.schools.filter((s) => s.id !== "berkeley_haas");
    return NextResponse.json({ version: reg.version, schools });
  } catch (e) {
    console.error("mba-interview-room schools list error:", e);
    return NextResponse.json({ error: "Could not load school registry." }, { status: 500 });
  }
}
