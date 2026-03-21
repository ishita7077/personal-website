/**
 * Server-only enhanced prompts for Interview Room OpenAI-backed feedback.
 * Keeps prompt text and logic out of the client bundle.
 */

export type EnhancedPerAnswerPayload = {
  questionText: string;
  transcript: string;
  questionIndex?: number;
};

export type EnhancedSessionPayload = {
  answers: Array<{ questionText: string; transcript: string }>;
};

function buildEnhancedAnswerReviewMessages(payload: EnhancedPerAnswerPayload) {
  const { questionText, transcript } = payload;
  return [
    {
      role: "system" as const,
      content:
        "You are an expert MBA admissions coach with deep experience in behavioral interviews and school-fit questions. " +
        "You analyze interview answers with precision and empathy. " +
        "Respond with strict JSON only, matching the exact schema requested. " +
        "Ground every claim in the candidate's actual words. Do not invent facts or experiences. " +
        "Be specific: quote or paraphrase from the transcript when citing strengths or gaps. " +
        "Use the full 1–5 scoring range; reserve 1 for answers that barely address the question or are incoherent."
    },
    {
      role: "user" as const,
      content:
        "Analyze this single interview answer.\n\n" +
        "Question:\n" +
        questionText +
        "\n\nVerbatim transcript of the candidate's answer:\n" +
        transcript +
        "\n\n" +
        "Provide:\n" +
        "1. A concise summary (1–2 sentences) of what the candidate actually said and how it landed.\n" +
        "2. A conversation flow graph: the real sequence of ideas (opening → middle → close) using short phrases from the transcript, not placeholders.\n" +
        "3. Scores 1–5 for: clarity, specificity, structure, question_fit, impact.\n" +
        "4. Strengths: only concrete strengths evident from the transcript (no gaps here).\n" +
        "5. Gaps and missed_opportunities: what was weak or missing (no strengths here).\n" +
        "6. Coaching: opening_fix, structure_fix, content_fix — actionable and specific.\n" +
        "7. Rewrite: a clearer, tighter version faithful to what they said (or empty string if not useful).\n\n" +
        "Output strict JSON only, no markdown or commentary. Use this exact schema (replace placeholders with your analysis):\n" +
        '{"question_id":"","question_text":"<same as question above>","question_type":"goals|behavioral|values|leadership|closing|other",' +
        '"transcript_quality":"high|medium|low","summary":"1-2 sentences","conversation_flow_graph":{"format":"text_graph","text":"Start: [theme]\\n→ ...\\n→ End: [theme]"},' +
        '"scores":{"clarity":1-5,"specificity":1-5,"structure":1-5,"question_fit":1-5,"impact":1-5},' +
        '"strengths":["concrete strength only"],"gaps":["concrete gap only"],"missed_opportunities":["..."],' +
        '"coaching":{"opening_fix":"...","structure_fix":"...","content_fix":"..."},' +
        '"rewrite":"clearer version or empty string"}'
    }
  ];
}

function buildEnhancedSessionSummaryMessages(payload: EnhancedSessionPayload) {
  const { answers } = payload;
  const transcriptBlock = answers
    .map(
      (a, i) =>
        `--- Answer ${i + 1} ---\nQuestion: ${a.questionText}\nTranscript:\n${a.transcript}`
    )
    .join("\n\n");

  return [
    {
      role: "system" as const,
      content:
        "You are an expert Haas MBA interview coach summarizing a full mock interview session. " +
        "You see the full transcripts for every answer. Synthesize patterns, strengths, and gaps across the session. " +
        "Be specific: reference what the candidate actually said. Do not use generic labels like 'rambling' unless clearly evident. " +
        "Write in a calm, encouraging tone and keep the structure simple. " +
        "Output strict JSON only, matching the exact schema requested."
    },
    {
      role: "user" as const,
      content:
        "Below are the questions and verbatim transcripts for each answer in this session.\n\n" +
        transcriptBlock +
        "\n\n" +
        "Produce a simple session summary with:\n" +
        "- overall_summary: 3–6 sentences on how the session went and the main themes across answers.\n" +
        "- top_strengths: array of concrete strengths (from the transcripts).\n" +
        "- top_opportunities: array of concrete issues or growth areas.\n" +
        "- next_steps: array of concrete practice steps for future sessions.\n\n" +
        "Important:\n" +
        "- Still give a useful summary even if some answers are short, noisy, or clearly just test inputs.\n" +
        "- Do not output bullet markers ('-', '•') inside strings.\n\n" +
        "Output strict JSON only. Schema:\n" +
        '{"overall_summary":"string","top_strengths":["string"],"top_opportunities":["string"],"next_steps":["string"]}'
    }
  ];
}

 function extractJsonFromResponse(text: string): unknown {
  if (!text) return null;
  const trimmed = String(text).trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;

  const slice = trimmed.slice(first, last + 1);
  try {
    return JSON.parse(slice);
  } catch {
    try {
      const fixed = slice.replace(/,(\s*[}\]])/g, "$1");
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
 }

export const enhancedPrompts = {
  buildEnhancedAnswerReviewMessages,
  buildEnhancedSessionSummaryMessages,
  extractJsonFromResponse
};
