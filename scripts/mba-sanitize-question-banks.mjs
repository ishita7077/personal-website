/**
 * One-off / repeatable: clean MBA question_bank.json files — strip authoring prefixes,
 * dedupe repeated "industry problem" filler, shorten a few structural intros.
 * Run: node scripts/mba-sanitize-question-banks.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", "data", "mba_interview_dataset");

function stripBracketPrefixes(text) {
  let t = String(text || "");
  while (/^\[[^\]]+\]\s*/.test(t)) {
    t = t.replace(/^\[[^\]]+\]\s*/, "");
  }
  return t.trim();
}

function cleanQuestionText(schoolId, text) {
  let t = stripBracketPrefixes(text);
  if (schoolId === "chicago_booth") {
    t = t.replace(/^Leave room for authenticity and questions back\.\s*/i, "").trim();
  }
  if (schoolId === "hbs") {
    t = t
      .replace(
        /^Post-Interview Reflection simulation:\s*HBS invitees submit a written reflection after the interview \(handoff cites ~300–450 words, due within 24 hours\)\.\s*/i,
        "After the real interview, HBS asks for a brief written reflection (often ~300–450 words, due within about 24 hours). "
      )
      .trim();
    t = t.replace(/^The interviewer has read your application\.\s*/i, "").trim();
  }
  if (schoolId === "kellogg") {
    t = t.replace(/^The interviewer has only your resume\.\s*/i, "").trim();
  }
  if (schoolId === "stanford_gsb") {
    t = t
      .replace(
        /^Expect follow-ups;\s*focus on recent meaningful experiences\.\s*/i,
        ""
      )
      .trim();
  }
  if (schoolId === "yale_som") {
    t = t
      .replace(/^\(Handoff cites ~60 seconds per video question\.\)\s*/i, "")
      .trim();
    t = t.replace(/^The interviewer has your resume only\.\s*/i, "").trim();
  }
  if (schoolId === "insead") {
    t = t.replace(/^—\s*handoff:\s*~45s prep\s*\/\s*~60s response\s*/i, "").trim();
    t = t.replace(/^—\s*handoff:\s*~5 minutes\s*/i, "").trim();
  }
  if (schoolId === "mit_sloan") {
    t = t
      .replace(
        /^Pre-interview exercise simulation:\s*MIT Sloan uses a short written component and a PDF such as a data visualisation or data-driven decision slide due shortly before the interview \(handoff\)\.\s*/i,
        "MIT Sloan often assigns a short written exercise and a simple data slide before the live interview. "
      )
      .trim();
  }
  if (schoolId === "wharton") {
    t = t
      .replace(/^TBD simulation \(debrief\):\s*After a 35-minute team discussion \(handoff\),\s*/i, "After the team discussion round, ")
      .replace(/^1:1 reflection simulation \(handoff ~10 minutes\):\s*/i, "");
  }
  if (schoolId === "london_business_school") {
    t = t.replace(/^Kira admissions video simulation \(handoff: LBS uses Kira Talent\)\.\s*/i, "").trim();
  }
  return t.trim();
}

function isDuplicateIndustrySpam(text) {
  const n = stripBracketPrefixes(text).toLowerCase();
  return (
    n.includes("problem in your industry") &&
    n.includes("first step") &&
    n.includes("post-mba")
  );
}

function humanizeQuestionGoal(goal) {
  if (!goal || typeof goal !== "string") return goal;
  if (/Address the simulated component/i.test(goal)) {
    return "Use a specific example and clear structure.";
  }
  return goal;
}

function processBank(schoolId, filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!raw.questions || !Array.isArray(raw.questions)) return;

  let qs = raw.questions.map((q) => ({
    ...q,
    text: cleanQuestionText(schoolId, q.text),
    expected_answer_map: q.expected_answer_map
      ? {
          ...q.expected_answer_map,
          questionGoal: humanizeQuestionGoal(q.expected_answer_map.questionGoal),
        }
      : q.expected_answer_map,
  }));

  let spamKept = false;
  qs = qs.filter((q) => {
    if (isDuplicateIndustrySpam(q.text)) {
      if (spamKept) return false;
      spamKept = true;
      return true;
    }
    return true;
  });

  raw.questions = qs;
  raw.question_count = qs.length;
  fs.writeFileSync(filePath, JSON.stringify(raw, null, 2) + "\n", "utf8");
  console.log("OK", schoolId, "→", qs.length, "questions");
}

const dirs = fs.readdirSync(DATA, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const d of dirs) {
  const sid = d.name;
  const fp = path.join(DATA, sid, "question_bank.json");
  if (fs.existsSync(fp)) {
    processBank(sid, fp);
  }
}

console.log("Done.");
