import fs from "fs";
import path from "path";
import type {
  EvidenceMapFile,
  QuestionBankFile,
  SchoolMetaFile,
} from "./types";
import { isValidSchoolId } from "./school-registry";

export type SchoolDataBundle = {
  meta: SchoolMetaFile;
  questionBank: QuestionBankFile;
  evidenceMap: EvidenceMapFile;
  answerFrameworkMd: string;
};

export function loadSchoolDataBundle(schoolId: string): SchoolDataBundle | null {
  if (!isValidSchoolId(schoolId)) return null;
  const base = path.join(process.cwd(), "data", "mba_interview_dataset", schoolId);
  try {
    const meta = JSON.parse(
      fs.readFileSync(path.join(base, "school_meta.json"), "utf-8")
    ) as SchoolMetaFile;
    const questionBank = JSON.parse(
      fs.readFileSync(path.join(base, "question_bank.json"), "utf-8")
    ) as QuestionBankFile;
    const evidenceMap = JSON.parse(
      fs.readFileSync(path.join(base, "evidence_map.json"), "utf-8")
    ) as EvidenceMapFile;
    const answerFrameworkMd = fs.readFileSync(
      path.join(base, "answer_framework.md"),
      "utf-8"
    );
    return { meta, questionBank, evidenceMap, answerFrameworkMd };
  } catch {
    return null;
  }
}
