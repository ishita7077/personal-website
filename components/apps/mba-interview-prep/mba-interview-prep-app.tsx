"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  pickSessionQuestions,
  mapQuestionTypeForModel,
} from "@/lib/mba-interview/engine";
import type {
  DatasetQuestion,
  QuestionBankFile,
  SchoolMetaFile,
} from "@/lib/mba-interview/types";

type RegistrySchool = { id: string; display_name: string; data_dir: string };

type BundleResponse = {
  meta: SchoolMetaFile;
  questionBank: QuestionBankFile;
  answerFrameworkMd: string;
};

type AnswerReview = Record<string, unknown>;

export function MbaInterviewPrepApp() {
  const [schools, setSchools] = useState<RegistrySchool[] | null>(null);
  const [schoolId, setSchoolId] = useState<string>("berkeley_haas");
  const [bundle, setBundle] = useState<BundleResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchingSchools, setFetchingSchools] = useState(true);
  const [fetchingBundle, setFetchingBundle] = useState(false);

  const [questionCount, setQuestionCount] = useState(5);
  const [preferHigh, setPreferHigh] = useState(true);
  const [sessionQs, setSessionQs] = useState<DatasetQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [answerTranscripts, setAnswerTranscripts] = useState<string[]>([]);
  const [reviews, setReviews] = useState<AnswerReview[]>([]);
  const [sessionSummary, setSessionSummary] = useState<AnswerReview | null>(null);

  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showFramework, setShowFramework] = useState(false);

  const schoolInterviewSummary = useMemo(() => {
    if (!bundle?.meta) return "";
    const m = bundle.meta;
    return `${m.validated_interview_format} Distinctive: ${m.unique_elements}`;
  }, [bundle]);

  const current = sessionQs[idx];
  const started = sessionQs.length > 0;
  const awaitingMore = started && idx < sessionQs.length;
  const sessionComplete = started && idx >= sessionQs.length;

  const loadRegistry = useCallback(async () => {
    setFetchingSchools(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/mba-interview/schools");
      if (!res.ok) throw new Error("Failed to load schools");
      const data = await res.json();
      const list = data.schools as RegistrySchool[];
      setSchools(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load schools");
    } finally {
      setFetchingSchools(false);
    }
  }, []);

  const loadBundle = useCallback(async (id: string) => {
    if (!id) return;
    setFetchingBundle(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/mba-interview/school/${id}`);
      if (!res.ok) throw new Error("Failed to load school data");
      const data = (await res.json()) as BundleResponse;
      setBundle(data);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load school");
      setBundle(null);
    } finally {
      setFetchingBundle(false);
    }
  }, []);

  useEffect(() => {
    void loadRegistry();
  }, [loadRegistry]);

  useEffect(() => {
    if (schools && schools.length && !schools.some((s) => s.id === schoolId)) {
      setSchoolId(schools[0].id);
    }
  }, [schools, schoolId]);

  useEffect(() => {
    if (schoolId) void loadBundle(schoolId);
  }, [schoolId, loadBundle]);

  const startSession = () => {
    if (!bundle?.questionBank) return;
    setAiError(null);
    setSessionSummary(null);
    setReviews([]);
    setAnswerTranscripts([]);
    const qs = pickSessionQuestions(bundle.questionBank, {
      count: questionCount,
      preferHighProbability: preferHigh,
    });
    setSessionQs(qs);
    setIdx(0);
    setTranscript("");
  };

  const submitAnswer = async () => {
    if (!current || !bundle?.meta) return;
    const trimmed = transcript.trim();
    if (!trimmed) {
      setAiError("Add a written answer (simulating a transcript) before requesting feedback.");
      return;
    }
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/mba-interview/enhanced-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "per_answer",
          payload: {
            questionId: current.id,
            questionText: current.text,
            questionType: mapQuestionTypeForModel(current),
            transcript: trimmed,
            questionIndex: idx,
            expectedAnswerMap: current.expected_answer_map,
            schoolDisplayName: bundle.meta.display_name,
            schoolInterviewSummary,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error || "AI error");
      setReviews((r) => [...r, data as AnswerReview]);
      setAnswerTranscripts((t) => [...t, trimmed]);
      setTranscript("");
      setIdx((i) => i + 1);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setAiBusy(false);
    }
  };

  const runSessionSummary = async () => {
    if (!bundle?.meta || reviews.length === 0 || sessionQs.length === 0) return;
    if (answerTranscripts.length !== sessionQs.length) return;
    setAiBusy(true);
    setAiError(null);
    try {
      const answers = sessionQs.map((q, i) => ({
        questionId: q.id,
        questionText: q.text,
        questionType: mapQuestionTypeForModel(q),
        transcript: answerTranscripts[i] ?? "",
        expectedAnswerMap: q.expected_answer_map,
        answerReview: reviews[i] ?? null,
      }));

      const res = await fetch("/api/mba-interview/enhanced-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "session",
          payload: {
            schoolDisplayName: bundle.meta.display_name,
            schoolInterviewSummary,
            answers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error || "AI error");
      setSessionSummary(data as AnswerReview);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setAiBusy(false);
    }
  };

  const latestReview = reviews.length ? reviews[reviews.length - 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Multi-school practice
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">MBA Interview Prep</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          School-specific structure from the handoff packs in{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">mba_final_handoff_static/</code>.
          For timed video practice, use the{" "}
          <Link href="/mba-interview-room" className="text-[#c9600a] hover:underline">
            MBA Interview Room
          </Link>
          .
        </p>
      </header>

      {loadError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold">School</h2>
        {fetchingSchools || !schools ? (
          <p className="text-sm text-muted-foreground">Loading schools…</p>
        ) : (
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.display_name}
              </option>
            ))}
          </select>
        )}
        {fetchingBundle && (
          <p className="text-xs text-muted-foreground">Loading dataset for this school…</p>
        )}
        {bundle?.meta && (
          <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <p>
              <span className="font-medium text-foreground">Format: </span>
              {bundle.meta.validated_interview_format}
            </p>
            <p>
              <span className="font-medium text-foreground">Distinctive: </span>
              {bundle.meta.unique_elements}
            </p>
            <button
              type="button"
              className="text-[#c9600a] hover:underline mt-1"
              onClick={() => setShowFramework((v) => !v)}
            >
              {showFramework ? "Hide" : "Show"} answer framework (markdown)
            </button>
            {showFramework && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-[11px] whitespace-pre-wrap">
                {bundle.answerFrameworkMd}
              </pre>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold">Session setup</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground block text-xs">Questions</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={preferHigh}
              onChange={(e) => setPreferHigh(e.target.checked)}
            />
            Prefer high-probability prompts
          </label>
          <Button type="button" onClick={startSession} disabled={!bundle || fetchingBundle}>
            New mock session
          </Button>
        </div>
      </section>

      {started && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {sessionComplete ? "Session complete" : `Question ${idx + 1} of ${sessionQs.length}`}
            </h2>
            {current && (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                {current.interview_phase.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {awaitingMore && current && (
            <>
              <p className="text-sm leading-relaxed font-medium">{current.text}</p>
              <label className="block text-xs text-muted-foreground space-y-1">
                Your answer (type or paste transcript-style text)
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={10}
                  className="text-sm"
                  placeholder="Draft your spoken answer here…"
                />
              </label>
              <Button type="button" onClick={() => void submitAnswer()} disabled={aiBusy}>
                {aiBusy ? "Scoring…" : "Submit for feedback"}
              </Button>
            </>
          )}

          {latestReview && !sessionComplete && (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
              <p className="font-medium text-foreground">Latest feedback (JSON)</p>
              <pre className="overflow-auto max-h-48 text-[11px]">
                {JSON.stringify(latestReview, null, 2)}
              </pre>
            </div>
          )}

          {sessionComplete && (
            <div className="space-y-3">
              {reviews.length > 0 && (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
                  <p className="font-medium text-foreground">Final answer feedback</p>
                  <pre className="overflow-auto max-h-48 text-[11px]">
                    {JSON.stringify(reviews[reviews.length - 1], null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                You finished all questions. Generate a session-level summary from your transcripts
                and per-answer reviews.
              </p>
              <Button
                type="button"
                onClick={() => void runSessionSummary()}
                disabled={aiBusy || reviews.length !== sessionQs.length}
              >
                {aiBusy ? "Summarizing…" : "Generate session summary"}
              </Button>
              {sessionSummary && (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs">
                  <p className="font-medium text-foreground mb-2">Session summary</p>
                  <pre className="overflow-auto max-h-96 text-[11px]">
                    {JSON.stringify(sessionSummary, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {aiError && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
        </section>
      )}

      <footer className="text-xs text-muted-foreground border-t border-border pt-6 space-y-2">
        <p>
          AI feedback uses the same OpenAI configuration as Interview Room when{" "}
          <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code> is set.
        </p>
        <p>
          Dataset files live in <code className="bg-muted px-1 rounded">data/mba_interview_dataset/</code>.
          Regenerate with <code className="bg-muted px-1 rounded">node scripts/build-mba-dataset.mjs</code>.
        </p>
      </footer>
    </div>
  );
}
