import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  prompts1,
  type EnhancedPerAnswerPayload,
  type EnhancedSessionPayload
} from "./prompts1";

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

function getOpenAIClient(): { client: OpenAI | null; source: string } {
  const rawKey =
    process.env.OPENAI_API_KEY ||
    // fallback names in case the env var was configured differently on Vercel
    (process.env as any).Open_AI_Key ||
    process.env.OPENAI_API_KEY_PROD ||
    "";

  const key = rawKey.trim();
  if (!key) {
    return { client: null, source: "missing" };
  }

  return { client: new OpenAI({ apiKey: key }), source: "env" };
}

export async function POST(req: Request) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { error: "Unauthorized origin for AI feedback request." },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(req);
    if (!rate.ok) {
      return NextResponse.json(
        {
          error: "AI feedback limit reached for today.",
          hint:
            "If you need additional access for serious practice, please reach out with a short note on how you're using Interview Room."
        },
        { status: 429 }
      );
    }

    const { client } = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        {
          error: "AI feedback is not configured.",
          hint:
            "Server could not see an OpenAI API key in the environment. Add a valid key to your deployment configuration and redeploy."
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing JSON body." },
        { status: 400 }
      );
    }

    const type = (body as Record<string, unknown>).type;
    if (type !== "per_answer" && type !== "session") {
      return NextResponse.json(
        { error: "Missing or invalid 'type': must be 'per_answer' or 'session'." },
        { status: 400 }
      );
    }

    if (type === "per_answer") {
      const payload = (body as any).payload as EnhancedPerAnswerPayload | undefined;
      if (
        !payload ||
        !payload.questionId ||
        !payload.questionText ||
        !payload.transcript ||
        !payload.expectedAnswerMap
      ) {
        return NextResponse.json(
          { error: "per_answer requires a valid payload with questionId, questionText, transcript, and expectedAnswerMap." },
          { status: 400 }
        );
      }

      const safePayload: EnhancedPerAnswerPayload = {
        ...payload,
        transcript: truncateTranscript(payload.transcript)
      };

      const messages = prompts1.buildEnhancedAnswerReviewMessages(safePayload);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        max_tokens: 1600
      });

      const content =
        completion.choices?.[0]?.message?.content?.trim() ?? "";
      const json = prompts1.extractJsonFromResponse(content);
      if (!json || typeof json !== "object") {
        return NextResponse.json(
          { error: "Could not parse model response as JSON." },
          { status: 502 }
        );
      }

      return NextResponse.json(json);
    }

    // type === 'session'
    const sessionPayload = (body as any).payload as EnhancedSessionPayload | undefined;
    if (!sessionPayload || !Array.isArray(sessionPayload.answers)) {
      return NextResponse.json(
        { error: "session requires a payload with an answers array." },
        { status: 400 }
      );
    }

    const answers: EnhancedSessionPayload["answers"] = sessionPayload.answers
      .filter((a) => {
        return (
          a &&
          typeof a.questionId === "string" &&
          typeof a.questionText === "string" &&
          typeof a.transcript === "string"
        );
      })
      .map((a) => ({
        ...a,
        transcript: truncateTranscript(a.transcript)
      }));

    if (answers.length === 0) {
      return NextResponse.json(
        { error: "session requires at least one well-formed answer with questionId, questionText, and transcript." },
        { status: 400 }
      );
    }

    const payload: EnhancedSessionPayload = { answers };
    const messages = prompts1.buildEnhancedSessionSummaryMessages(payload);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 2000
    });

    const content = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const json = prompts1.extractJsonFromResponse(content);
    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Could not parse model response as JSON." },
        { status: 502 }
      );
    }

    return NextResponse.json(json);
  } catch (err) {
    console.error("AI feedback API error:", err);
    return NextResponse.json(
      {
        error: "AI feedback request failed.",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}
