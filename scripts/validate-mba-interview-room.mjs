#!/usr/bin/env node
/**
 * Validates MBA Interview Room datasets and session pick logic (mirrors public/MbaInterviewRoom/src/js/app.js).
 * Run: node scripts/validate-mba-interview-room.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataset = path.join(root, "data", "mba_interview_dataset");

function shuffleArray(arr) {
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isWrittenResponseQuestion(q) {
  if (!q) return false;
  const qt = String(q.question_type || "");
  const ph = String(q.interview_phase || "");
  if (qt === "written_reflection" || qt === "written_timed") return true;
  if (qt === "data_task") return true;
  if (ph === "kira_written" || ph === "post_interview_reflection" || ph === "pre_interview_written")
    return true;
  return false;
}

function pickOrderedQuestionPool(schoolId, ir, pool) {
  const n = Math.min(ir.totalQuestions || 6, pool.length);
  if (schoolId === "yale_som") {
    const videos = shuffleArray(pool.filter((q) => q.interview_phase === "video"));
    const lives = shuffleArray(pool.filter((q) => q.interview_phase === "live_behavioral"));
    const wantV = Math.min(2, videos.length);
    const picked = videos.slice(0, wantV);
    const used = new Set(picked.map((p) => p.id));
    const need = n - picked.length;
    const livePick = lives.filter((q) => !used.has(q.id)).slice(0, Math.min(need, lives.length));
    picked.push(...livePick);
    if (picked.length < n) {
      const rest = shuffleArray(pool.filter((q) => !picked.some((p) => p.id === q.id)));
      picked.push(...rest.slice(0, n - picked.length));
    }
    return picked.slice(0, n);
  }
  if (schoolId === "insead") {
    const picked = [];
    const used = new Set();
    const take = (pred) => {
      const arr = shuffleArray(pool.filter((q) => pred(q) && !used.has(q.id)));
      const q = arr[0];
      if (q) {
        used.add(q.id);
        picked.push(q);
      }
    };
    take((q) => q.interview_phase === "kira_video");
    take((q) => q.interview_phase === "kira_written");
    take((q) => q.interview_phase === "alumni_live");
    const rest = shuffleArray(pool.filter((q) => !used.has(q.id)));
    while (picked.length < n && rest.length) {
      picked.push(rest.shift());
    }
    return picked.slice(0, n);
  }
  if (schoolId === "london_business_school") {
    const picked = [];
    const used = new Set();
    const kiraFirst = shuffleArray(pool.filter((q) => q.interview_phase === "kira_video")).slice(0, 1);
    kiraFirst.forEach((q) => {
      used.add(q.id);
      picked.push(q);
    });
    const rest = shuffleArray(pool.filter((q) => !used.has(q.id)));
    while (picked.length < n && rest.length) {
      picked.push(rest.shift());
    }
    return picked.slice(0, n);
  }
  if (schoolId === "wharton") {
    const picked = [];
    const used = new Set();
    const tbd = shuffleArray(pool.filter((q) => q.interview_phase === "tbd_debrief"));
    const oneOnOne = shuffleArray(pool.filter((q) => q.interview_phase === "one_on_one"));
    tbd.slice(0, 1).forEach((q) => {
      used.add(q.id);
      picked.push(q);
    });
    oneOnOne.slice(0, 1).forEach((q) => {
      if (!used.has(q.id)) {
        used.add(q.id);
        picked.push(q);
      }
    });
    const rest = pool.filter((q) => !used.has(q.id));
    const high = shuffleArray(rest.filter((q) => q.high_probability));
    const low = shuffleArray(rest.filter((q) => !q.high_probability));
    for (const q of high.concat(low)) {
      if (picked.length >= n) break;
      picked.push(q);
    }
    return picked.slice(0, n);
  }
  if (schoolId === "mit_sloan") {
    const picked = [];
    const used = new Set();
    const pre = shuffleArray(pool.filter((q) => q.interview_phase === "pre_interview_written"));
    pre.slice(0, 1).forEach((q) => {
      used.add(q.id);
      picked.push(q);
    });
    const rest = pool.filter((q) => !used.has(q.id));
    const high = shuffleArray(rest.filter((q) => q.high_probability));
    const low = shuffleArray(rest.filter((q) => !q.high_probability));
    for (const q of high.concat(low)) {
      if (picked.length >= n) break;
      picked.push(q);
    }
    return picked.slice(0, n);
  }
  if (schoolId === "hbs") {
    const reflections = pool.filter(
      (q) => q.interview_phase === "post_interview_reflection" || q.question_type === "written_reflection"
    );
    const ref = shuffleArray(reflections)[0];
    const restPool = pool.filter((q) => !reflections.some((r) => r.id === q.id));
    const high = shuffleArray(restPool.filter((q) => q.high_probability));
    const low = shuffleArray(restPool.filter((q) => !q.high_probability));
    const orderedRest = high.concat(low);
    const maxMain = ref ? Math.max(0, n - 1) : n;
    const main = orderedRest.slice(0, Math.min(orderedRest.length, maxMain));
    if (ref && main.length < n) return main.concat([ref]).slice(0, n);
    return main.slice(0, n);
  }
  const high = shuffleArray(pool.filter((q) => q.high_probability));
  const low = shuffleArray(pool.filter((q) => !q.high_probability));
  return high.concat(low).slice(0, n);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const registry = loadJson(path.join(dataset, "school_registry.json"));
const errors = [];
const warnings = [];

for (const entry of registry.schools) {
  const id = entry.id;
  const dir = path.join(dataset, id);
  const need = [
    "school_meta.json",
    "interview_room.json",
    "question_bank.json",
    "answer_framework.md",
  ];
  for (const f of need) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) errors.push(`${id}: missing ${f}`);
  }
  if (errors.some((e) => e.startsWith(id + ":"))) continue;

  const bank = loadJson(path.join(dir, "question_bank.json"));
  const ir = loadJson(path.join(dir, "interview_room.json"));
  const qs = bank.questions || [];
  const n = qs.length;

  if (bank.question_count !== n) {
    errors.push(`${id}: question_count ${bank.question_count} !== questions.length ${n}`);
  }
  const regCount = entry.listing?.question_bank_count;
  if (regCount != null && regCount !== n) {
    errors.push(`${id}: school_registry question_bank_count ${regCount} !== bank ${n}`);
  }
  if (bank.school_id && bank.school_id !== id) {
    errors.push(`${id}: question_bank school_id mismatch ${bank.school_id}`);
  }
  if (ir.school_id && ir.school_id !== id) {
    errors.push(`${id}: interview_room school_id mismatch ${ir.school_id}`);
  }

  const tq = ir.totalQuestions ?? 6;
  if (tq > n) {
    errors.push(`${id}: interview_room.totalQuestions ${tq} > pool size ${n}`);
  }

  for (const q of qs) {
    if (!q.id || !q.text) errors.push(`${id}: question missing id or text`);
  }

  if (ir.pickMode === "random_set") {
    const sets = ir.sets || [];
    if (!sets.length) errors.push(`${id}: random_set but no sets`);
    for (let si = 0; si < sets.length; si++) {
      const set = sets[si];
      if (!Array.isArray(set) || set.length !== tq) {
        errors.push(`${id}: set ${si} length ${set?.length} !== totalQuestions ${tq}`);
      }
    }
  } else {
    const ordered = pickOrderedQuestionPool(id, ir, qs);
    if (ordered.length !== Math.min(tq, n)) {
      errors.push(`${id}: pick length ${ordered.length} expected ${Math.min(tq, n)}`);
    }
  }

  if (id === "yale_som") {
    const v = qs.filter((q) => q.interview_phase === "video").length;
    const l = qs.filter((q) => q.interview_phase === "live_behavioral").length;
    if (v < 2) warnings.push(`${id}: fewer than 2 video-phase questions (${v})`);
    if (l < 1) warnings.push(`${id}: no live_behavioral questions`);
    for (let trial = 0; trial < 80; trial++) {
      const picked = pickOrderedQuestionPool(id, ir, qs);
      const want = Math.min(2, v, tq);
      for (let i = 0; i < want; i++) {
        if (picked[i].interview_phase !== "video") {
          errors.push(`${id}: trial ${trial} Q${i + 1} expected interview_phase video, got ${picked[i].interview_phase}`);
          trial = 999;
          break;
        }
      }
    }
  }

  if (id === "insead") {
    const phases = ["kira_video", "kira_written", "alumni_live"];
    for (const ph of phases) {
      if (!qs.some((q) => q.interview_phase === ph)) {
        warnings.push(`${id}: no question with interview_phase ${ph}`);
      }
    }
    const picked = pickOrderedQuestionPool(id, ir, qs);
    if (picked[0] && picked[0].interview_phase !== "kira_video") {
      errors.push(`${id}: first pick should be kira_video`);
    }
    if (picked[1] && picked[1].interview_phase !== "kira_written") {
      errors.push(`${id}: second pick should be kira_written`);
    }
    if (picked[2] && picked[2].interview_phase !== "alumni_live") {
      errors.push(`${id}: third pick should be alumni_live`);
    }
    if (!picked.some((q) => isWrittenResponseQuestion(q))) {
      errors.push(`${id}: session should include at least one written-capable question`);
    }
  }

  if (id === "london_business_school") {
    const picked = pickOrderedQuestionPool(id, ir, qs);
    if (picked[0] && picked[0].interview_phase !== "kira_video") {
      errors.push(`${id}: first pick should be kira_video`);
    }
  }

  if (id === "wharton") {
    const picked = pickOrderedQuestionPool(id, ir, qs);
    if (!picked[0] || picked[0].interview_phase !== "tbd_debrief") {
      errors.push(`${id}: first pick should be tbd_debrief`);
    }
    if (!picked[1] || picked[1].interview_phase !== "one_on_one") {
      errors.push(`${id}: second pick should be one_on_one`);
    }
  }

  if (id === "hbs") {
    if (!qs.some((q) => isWrittenResponseQuestion(q))) {
      errors.push(`${id}: expected at least one written reflection / written question`);
    }
    const picked = pickOrderedQuestionPool(id, ir, qs);
    const last = picked[picked.length - 1];
    if (!last || !isWrittenResponseQuestion(last)) {
      errors.push(`${id}: last pick should be written reflection`);
    }
  }

  if (id === "mit_sloan") {
    if (!qs.some((q) => q.question_type === "data_task")) {
      errors.push(`${id}: expected at least one data_task question`);
    }
    const picked = pickOrderedQuestionPool(id, ir, qs);
    if (!picked[0] || picked[0].interview_phase !== "pre_interview_written") {
      errors.push(`${id}: first pick should be pre_interview_written`);
    }
  }
}

if (warnings.length) {
  console.warn("Warnings:");
  for (const w of warnings) console.warn("  —", w);
}
if (errors.length) {
  console.error("MBA Interview Room validation FAILED:\n");
  for (const e of errors) console.error(" ", e);
  process.exit(1);
}
console.log(
  `OK — ${registry.schools.length} schools, datasets and pick-order rules validated.`
);
