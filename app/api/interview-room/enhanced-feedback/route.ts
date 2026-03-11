import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  prompts1,
  type EnhancedPerAnswerPayload,
  type EnhancedSessionPayload
} from "./prompts1";

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function POST(req: Request) {
  try {
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "AI feedback is not configured." },
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

      const messages = prompts1.buildEnhancedAnswerReviewMessages(payload);

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

    const answers: EnhancedSessionPayload["answers"] = sessionPayload.answers.filter((a) => {
      return a && typeof a.questionId === "string" && typeof a.questionText === "string" && typeof a.transcript === "string";
    });

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
