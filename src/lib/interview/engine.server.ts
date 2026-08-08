import { createClient } from "@supabase/supabase-js";

import { buildCandidateBriefing, candidates, type Candidate } from "./data";

const MIN_QUESTIONS = 8;
const MIN_DAYS = 4;
const MAX_QUESTIONS = 12;
const MODEL = "google/gemini-3.6-flash";

export type ChatMessage = { role: "assistant" | "user"; content: string };

export type Feedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: Feedback;
};

type SessionRow = {
  session_key: string;
  candidate: Candidate;
  messages: ChatMessage[];
  questions_asked: number;
  days_covered: number[];
  done: boolean;
  feedback: Feedback | null;
};

function db() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function systemPrompt(candidate: Candidate) {
  return `You are "Nova", a senior AI engineer conducting a live, spoken-style technical interview for the AI Cohort (a 31-day enterprise AI engineering program).

You are interviewing a real person. Behave like a human interviewer, not a quiz bot.

${buildCandidateBriefing(candidate)}

INTERVIEW RULES
1. Ask exactly ONE question per turn. Never bundle multiple questions.
2. Ground every question in a specific curriculum day the candidate actually completed. Reference what they built when it helps ("On day 10 you built a retrieval engine — ...").
3. Alternate between fresh topics and follow-ups. If an answer is vague, hand-wavy, buzzword-y, or wrong, ask a sharper follow-up on the SAME topic before moving on. If an answer is strong, escalate: trade-offs, failure modes, scaling, cost, evaluation, production incidents.
4. React briefly and naturally to what they just said (one short sentence) before asking the next question. Never grade them out loud, never say "correct" or "incorrect".
5. Cover at least ${MIN_DAYS} DIFFERENT curriculum days across at least ${MIN_QUESTIONS} questions. Prioritise topics they passed on the first try (push hard) and topics that took 3+ attempts (probe fundamentals).
6. If the candidate says "I don't know", accept it gracefully, give a one-line hint or move to an adjacent easier angle, and note it internally as a gap.
7. Keep replies under 90 words. Conversational, warm, but rigorous. No markdown headings, no bullet lists during the interview.
8. Stay in scope: RAG, embeddings, vector DBs, prompting, fine-tuning, chatbots, function calling, streaming, agents, MCP, evaluation, security, deployment, observability, production AI.

ENDING
- Do NOT end before ${MIN_QUESTIONS} questions and ${MIN_DAYS} distinct days.
- When told the interview must conclude, or once coverage is met and the conversation reaches a natural close, set done=true and produce feedback.
- Feedback must be specific to THIS conversation: quote or paraphrase their actual answers. No generic advice.

OUTPUT FORMAT
Return ONLY a JSON object, no prose, no code fences:
{
  "reply": "what you say to the candidate",
  "askedDay": <curriculum day number your question targets, or null if you are not asking a question>,
  "isQuestion": true|false,
  "done": false,
  "feedback": null
}
When finishing, use:
{
  "reply": "closing words to the candidate",
  "askedDay": null,
  "isQuestion": false,
  "done": true,
  "feedback": {
    "summary": "3-5 sentence assessment of technical depth, communication, and interview readiness",
    "strengths": ["concise, specific, evidence-based points"],
    "gaps": ["concise, specific weaknesses observed"],
    "next": ["concrete actionable next steps, e.g. specific topics to revisit or drills to run"]
  }
}`;
}

type ModelTurn = {
  reply: string;
  askedDay: number | null;
  isQuestion: boolean;
  done: boolean;
  feedback: Feedback | null;
};

function parseModelTurn(raw: string): ModelTurn {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return { reply: cleaned, askedDay: null, isQuestion: true, done: false, feedback: null };
    }
    parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  }
  const fb = parsed["feedback"] as Feedback | null | undefined;
  return {
    reply: String(parsed["reply"] ?? "").trim(),
    askedDay: typeof parsed["askedDay"] === "number" ? (parsed["askedDay"] as number) : null,
    isQuestion: parsed["isQuestion"] !== false,
    done: parsed["done"] === true,
    feedback: fb && typeof fb === "object" ? fb : null,
  };
}

async function callModel(messages: { role: string; content: string }[]): Promise<ModelTurn> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("The interviewer is busy right now. Please retry in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "";
  return parseModelTurn(content);
}

function fallbackFeedback(): Feedback {
  return {
    summary: "The interview concluded. A detailed assessment could not be generated for this session.",
    strengths: [],
    gaps: [],
    next: [],
  };
}

export async function runInterviewTurn(input: {
  sessionId: string;
  candidate?: unknown | undefined;
  message?: string | undefined;
}): Promise<InterviewResponse> {
  const supabase = db();
  const { sessionId } = input;

  const { data: existing, error: readError } = await supabase
    .from("interview_sessions")
    .select("session_key, candidate, messages, questions_asked, days_covered, done, feedback")
    .eq("session_key", sessionId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  let session = existing as SessionRow | null;

  // ---- Start of a new interview -------------------------------------------
  if (!session) {
    const candidate = resolveCandidate(input.candidate);
    const turn = await callModel([
      { role: "system", content: systemPrompt(candidate) },
      {
        role: "user",
        content:
          "[SYSTEM] The candidate has joined the call. Greet them by name in one short sentence, set expectations (a short conversational technical interview about what they built in the cohort), then ask your first question grounded in one of their completed days.",
      },
    ]);

    const messages: ChatMessage[] = [{ role: "assistant", content: turn.reply }];
    const { error } = await supabase.from("interview_sessions").insert({
      session_key: sessionId,
      candidate,
      messages,
      questions_asked: turn.isQuestion ? 1 : 0,
      days_covered: turn.askedDay ? [turn.askedDay] : [],
      done: false,
    });
    if (error) throw new Error(error.message);

    return { reply: turn.reply, done: false };
  }

  // ---- Already finished ----------------------------------------------------
  if (session.done) {
    return {
      reply: "Interview completed.",
      done: true,
      feedback: session.feedback ?? fallbackFeedback(),
    };
  }

  const userMessage = (input.message ?? "").trim();
  if (!userMessage) {
    const last = [...session.messages].reverse().find((m) => m.role === "assistant");
    return { reply: last?.content ?? "Could you share your answer?", done: false };
  }

  const history: ChatMessage[] = [...session.messages, { role: "user", content: userMessage }];

  const coverageMet =
    session.questions_asked >= MIN_QUESTIONS && session.days_covered.length >= MIN_DAYS;
  const mustFinish = session.questions_asked >= MAX_QUESTIONS;

  const director = mustFinish
    ? `[SYSTEM] You have asked ${session.questions_asked} questions covering days ${session.days_covered.join(", ")}. Conclude the interview now: set done=true and return the full feedback object.`
    : coverageMet
      ? `[SYSTEM] Coverage requirement met (${session.questions_asked} questions across days ${session.days_covered.join(", ")}). You may ask one or two final high-value questions, or wrap up now with done=true and full feedback.`
      : `[SYSTEM] Progress: ${session.questions_asked} questions asked across days ${session.days_covered.join(", ") || "none"}. You still need at least ${MIN_QUESTIONS} questions across ${MIN_DAYS} distinct days. Keep going — do NOT finish yet (done must be false).`;

  const turn = await callModel([
    { role: "system", content: systemPrompt(session.candidate) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: director },
  ]);

  const forcedContinue = turn.done && !coverageMet && !mustFinish;
  const done = mustFinish ? true : turn.done && !forcedContinue;

  const reply = turn.reply || (done ? "Interview completed." : "Could you expand on that a little?");
  const messages: ChatMessage[] = [...history, { role: "assistant", content: reply }];

  const daysCovered =
    turn.askedDay && !session.days_covered.includes(turn.askedDay)
      ? [...session.days_covered, turn.askedDay]
      : session.days_covered;

  const feedback = done ? (turn.feedback ?? fallbackFeedback()) : null;

  const { error } = await supabase
    .from("interview_sessions")
    .update({
      messages,
      questions_asked: session.questions_asked + (!done && turn.isQuestion ? 1 : 0),
      days_covered: daysCovered,
      done,
      feedback,
      updated_at: new Date().toISOString(),
    })
    .eq("session_key", sessionId);
  if (error) throw new Error(error.message);

  return done ? { reply, done: true, feedback: feedback ?? fallbackFeedback() } : { reply, done: false };
}

function resolveCandidate(raw: unknown): Candidate {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const inner = (obj["candidate"] as Record<string, unknown> | undefined) ?? obj;
    const member = inner["member"] as Record<string, unknown> | undefined;

    if (member?.["name"] && Array.isArray(inner["missions"])) {
      return {
        member: {
          id: String(member["id"] ?? "CAND-UNKNOWN"),
          name: String(member["name"]),
          jobRole: String(member["jobRole"] ?? "AI Engineer"),
          yearsExperience: Number(member["yearsExperience"] ?? 0),
          education: String(member["education"] ?? "N/A"),
          status: String(member["status"] ?? "COMPLETED"),
        },
        missions: inner["missions"] as Candidate["missions"],
        signals: (inner["signals"] as Candidate["signals"]) ?? {
          commitDays: 0,
          missionsCompleted: 0,
          missionsFirstTry: 0,
        },
      };
    }

    const id = member?.["id"] ?? obj["id"] ?? obj["candidateId"];
    if (typeof id === "string") {
      const known = candidates.find((c) => c.member.id === id);
      if (known) return known;
    }
  }
  const first = candidates[0];
  if (!first) throw new Error("No candidate data available");
  return first;
}