import { NextResponse } from "next/server";
import { loadSchoolDataBundle } from "@/lib/mba-interview/load-school-data";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const bundle = loadSchoolDataBundle(id);
  if (!bundle) {
    return NextResponse.json({ error: "Unknown school or missing dataset." }, { status: 404 });
  }
  return NextResponse.json({
    meta: bundle.meta,
    questionBank: bundle.questionBank,
    evidenceMap: bundle.evidenceMap,
    answerFrameworkMd: bundle.answerFrameworkMd,
  });
}
