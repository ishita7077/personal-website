import { NextResponse } from "next/server";
import { getSchoolRegistry } from "@/lib/mba-interview/school-registry";

export async function GET() {
  try {
    const reg = getSchoolRegistry();
    return NextResponse.json(reg);
  } catch (e) {
    console.error("mba-interview schools list error:", e);
    return NextResponse.json({ error: "Could not load school registry." }, { status: 500 });
  }
}
