import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildMbaAnswerReviewMessages,
  buildMbaSessionSummaryMessages,
  extractJsonFromResponse,
  type MbaPerAnswerPayload,
  type MbaSessionPayload,
} from "@/lib/mba-interview/mba-feedback-prompts";

const RATE_LIMIT_PER_IP = 50;
const MAX_TRANSCRIPT_CHARS = 8000;

type RateEntry = {
  count: number;
  day: string;
};

const rateStore = new Map<string, RateEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim());
    if (parts[0]) return parts[0];
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function checkRateLimit(req: Request) {
  const ip = getClientIp(req);
  const today = new Date().toISOString().slice(0, 10);
  const existing = rateStore.get(ip);
  if (!existing || existing.day !== today) {
    rateStore.set(ip, { count: 1, day: today });
    return { ok: true };
  }
  if (existing.count >= RATE_LIMIT_PER_IP) {
    return { ok: false };
  }
  existing.count += 1;
  rateStore.set(ip, existing);
  return { ok: true };
}

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  const allowed: string[] = [`https://${host}`, `http://${host}`];
  if (host.startsWith("localhost")) {
    allowed.push("http://localhost:3000");
  }
  return allowed.some((base) => origin.startsWith(base));
}

function truncateTranscript(text: string): string {
  if (!text) return text;
  if (text.length <= MAX_TRANSCRIPT_CHARS) return text;
  return text.slice(0, MAX_TRANSCRIPT_CHARS);
}

function getOpenAIClient(): { client: OpenAI | null } {
  const rawKey =
    process.env.OPENAI_API_KEY ||
    (process.env as Record<string, string | undefined>).Open_AI_Key ||
    process.env.OPENAI_API_KEY_PROD ||
    "";
  const key = rawKey.trim();
  if (!key) return { client: null };
  return { client: new OpenAI({ apiKey: key }) };
}

export async function POST(req: Request) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { error: "Unauthorized origin for MBA interview AI request." },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(req);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "AI feedback limit reached for today." },
        { status: 429 }
      );
    }

    const { client } = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        {
          error: "AI feedback is not configured.",
          hint: "Add OPENAI_API_KEY to the deployment environment.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid or missing JSON body." }, { status: 400 });
    }

    const type = (body as Record<string, unknown>).type;
    if (type !== "per_answer" && type !== "session") {
      return NextResponse.json(
        { error: "Missing or invalid 'type': must be 'per_answer' or 'session'." },
        { status: 400 }
      );
    }

    if (type === "per_answer") {
      const payload = (body as { payload?: MbaPerAnswerPayload }).payload;
      if (
        !payload ||
        !payload.questionId ||
        !payload.questionText ||
        !payload.transcript ||
        !payload.expectedAnswerMap ||
        !payload.schoolDisplayName ||
        !payload.schoolInterviewSummary
      ) {
        return NextResponse.json(
          {
            error:
              "per_answer requires questionId, questionText, transcript, expectedAnswerMap, schoolDisplayName, schoolInterviewSummary.",
          },
          { status: 400 }
        );
      }

      const safe: MbaPerAnswerPayload = {
        ...payload,
        transcript: truncateTranscript(payload.transcript),
      };

      const messages = buildMbaAnswerReviewMessages(safe);
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        max_tokens: 1600,
      });

      const content = completion.choices?.[0]?.message?.content?.trim() ?? "";
      const json = extractJsonFromResponse(content);
      if (!json || typeof json !== "object") {
        return NextResponse.json(
          { error: "Could not parse model response as JSON." },
          { status: 502 }
        );
      }
      return NextResponse.json(json);
    }

    const sessionPayload = (body as { payload?: MbaSessionPayload }).payload;
    if (
      !sessionPayload ||
      !Array.isArray(sessionPayload.answers) ||
      !sessionPayload.schoolDisplayName ||
      !sessionPayload.schoolInterviewSummary
    ) {
      return NextResponse.json(
        {
          error:
            "session requires answers array, schoolDisplayName, and schoolInterviewSummary.",
        },
        { status: 400 }
      );
    }

    const answers = sessionPayload.answers
      .filter(
        (a) =>
          a &&
          typeof a.questionId === "string" &&
          typeof a.questionText === "string" &&
          typeof a.transcript === "string"
      )
      .map((a) => ({
        ...a,
        transcript: truncateTranscript(a.transcript),
      }));

    if (answers.length === 0) {
      return NextResponse.json(
        { error: "session requires at least one answer with ids and transcripts." },
        { status: 400 }
      );
    }

    const payload: MbaSessionPayload = {
      schoolDisplayName: sessionPayload.schoolDisplayName,
      schoolInterviewSummary: sessionPayload.schoolInterviewSummary,
      answers,
    };

    const messages = buildMbaSessionSummaryMessages(payload);
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const json = extractJsonFromResponse(content);
    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Could not parse model response as JSON." },
        { status: 502 }
      );
    }
    return NextResponse.json(json);
  } catch (err) {
    console.error("MBA interview AI error:", err);
    return NextResponse.json(
      {
        error: "MBA interview AI request failed.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
