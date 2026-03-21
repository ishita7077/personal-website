import type { DatasetQuestion, QuestionBankFile } from "./types";

export type SessionPickOptions = {
  count: number;
  preferHighProbability: boolean;
  /** Deterministic seed for tests (optional) */
  seed?: number;
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks a mock-interview question list from the frozen dataset.
 * Prefers high_probability items when requested, then fills from the rest.
 */
export function pickSessionQuestions(
  bank: QuestionBankFile,
  options: SessionPickOptions
): DatasetQuestion[] {
  const { count, preferHighProbability, seed } = options;
  const rand = seed != null ? mulberry32(seed) : Math.random;

  const high = bank.questions.filter((q) => q.high_probability);
  const rest = bank.questions.filter((q) => !q.high_probability);

  if (!preferHighProbability) {
    return shuffle(bank.questions, rand).slice(0, Math.min(count, bank.questions.length));
  }

  const shHigh = shuffle(high, rand);
  const shRest = shuffle(rest, rand);
  const out: DatasetQuestion[] = [];
  for (const q of shHigh) {
    if (out.length >= count) break;
    out.push(q);
  }
  for (const q of shRest) {
    if (out.length >= count) break;
    out.push(q);
  }
  return out;
}

export function mapQuestionTypeForModel(q: DatasetQuestion): string {
  const t = q.question_type.toLowerCase();
  if (t.includes("goal")) return "goals";
  if (t.includes("reflection") || t.includes("written")) return "values";
  if (t.includes("team") || t.includes("tbd")) return "leadership";
  if (t.includes("video") || t.includes("kira")) return "other";
  if (t.includes("behavioral")) return "behavioral";
  return "other";
}
