import fs from "fs";
import path from "path";
import type { QuestionBankFile, SchoolMetaFile } from "./types";
import { isValidSchoolId } from "./school-registry";

export type InterviewRoomConfigFile = {
  version: number;
  school_id: string;
  prepTime: number;
  answerTime: number;
  totalQuestions: number;
  /** Citation for timer defaults (handoff report). */
  timing_basis?: string;
  pickMode: "random_set" | "shuffle_weighted";
  sets: Array<
    Array<{
      id: string;
      text: string;
      expected_answer_map: unknown;
      question_type?: string;
      interview_phase?: string;
      tags?: string[];
      prep_time_seconds?: number;
      answer_time_seconds?: number;
    }>
  > | null;
};

export type InterviewRoomClientBundle = {
  schoolId: string;
  displayName: string;
  meta: SchoolMetaFile;
  interviewRoom: InterviewRoomConfigFile;
  questionPool: QuestionBankFile["questions"];
  /** Full `answer_framework.md` for the Resources screen */
  answerFrameworkMd: string;
};

export function loadInterviewRoomBundle(
  schoolId: string
): InterviewRoomClientBundle | null {
  if (!isValidSchoolId(schoolId)) return null;
  const base = path.join(process.cwd(), "data", "mba_interview_dataset", schoolId);
  try {
    const meta = JSON.parse(
      fs.readFileSync(path.join(base, "school_meta.json"), "utf-8")
    ) as SchoolMetaFile;
    const interviewRoom = JSON.parse(
      fs.readFileSync(path.join(base, "interview_room.json"), "utf-8")
    ) as InterviewRoomConfigFile;
    const bank = JSON.parse(
      fs.readFileSync(path.join(base, "question_bank.json"), "utf-8")
    ) as QuestionBankFile;
    const answerFrameworkMd = fs.readFileSync(
      path.join(base, "answer_framework.md"),
      "utf-8"
    );
    return {
      schoolId,
      displayName: meta.display_name,
      meta,
      interviewRoom,
      questionPool: bank.questions,
      answerFrameworkMd,
    };
  } catch {
    return null;
  }
}
