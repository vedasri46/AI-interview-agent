export type Verdict = "strong" | "partial" | "weak" | "unanswered";

export type QuestionResult = {
  n: number;
  day: number | null;
  topic: string;
  verdict: Verdict;
  score: number;
};

export type Scores = {
  overall: number;
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
};

export type FeedbackShape = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  scores?: Partial<Scores> | null;
  questions?: QuestionResult[] | null;
  topics?: { topic: string; score: number }[] | null;
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  strong: "Strong / Correct",
  partial: "Partially correct",
  weak: "Weak / Incomplete",
  unanswered: "Incorrect / Unanswered",
};

/** Chart palette pulled from the app's existing chart tokens. */
export const VERDICT_COLORS: Record<Verdict, string> = {
  strong: "var(--chart-1)",
  partial: "var(--chart-2)",
  weak: "var(--chart-4)",
  unanswered: "var(--chart-5)",
};

/** Hex fallbacks, used where CSS variables cannot be resolved (PDF canvas). */
export const VERDICT_HEX: Record<Verdict, string> = {
  strong: "#3ddc97",
  partial: "#4cc9f0",
  weak: "#f6c667",
  unanswered: "#ef6f6c",
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function verdictOf(score: number): Verdict {
  if (score >= 75) return "strong";
  if (score >= 50) return "partial";
  if (score >= 25) return "weak";
  return "unanswered";
}

export type SummaryAnalytics = {
  hasData: boolean;
  questions: QuestionResult[];
  topics: { topic: string; score: number }[];
  breakdown: { key: Verdict; label: string; value: number }[];
  scores: Scores | null;
};

/**
 * Normalises whatever analytics the interview engine returned with the feedback.
 * Nothing is invented: topics and the overall score are derived from the
 * per-question results only when the model did not supply them.
 */
export function buildAnalytics(feedback: FeedbackShape): SummaryAnalytics {
  const questions: QuestionResult[] = (feedback.questions ?? [])
    .filter((q) => q && typeof q.score === "number")
    .map((q, i) => {
      const score = clamp(q.score);
      return {
        n: typeof q.n === "number" ? q.n : i + 1,
        day: typeof q.day === "number" ? q.day : null,
        topic: (q.topic || "General").toString(),
        verdict: (["strong", "partial", "weak", "unanswered"] as Verdict[]).includes(q.verdict)
          ? q.verdict
          : verdictOf(score),
        score,
      };
    });

  let topics = (feedback.topics ?? [])
    .filter((t) => t && typeof t.score === "number" && t.topic)
    .map((t) => ({ topic: t.topic, score: clamp(t.score) }));

  if (!topics.length && questions.length) {
    const grouped = new Map<string, number[]>();
    for (const q of questions) {
      grouped.set(q.topic, [...(grouped.get(q.topic) ?? []), q.score]);
    }
    topics = [...grouped.entries()].map(([topic, list]) => ({
      topic,
      score: clamp(list.reduce((a, b) => a + b, 0) / list.length),
    }));
  }

  const counts = questions.reduce<Record<Verdict, number>>(
    (acc, q) => ({ ...acc, [q.verdict]: acc[q.verdict] + 1 }),
    { strong: 0, partial: 0, weak: 0, unanswered: 0 },
  );
  const breakdown = (Object.keys(counts) as Verdict[])
    .map((key) => ({ key, label: VERDICT_LABELS[key], value: counts[key] }))
    .filter((d) => d.value > 0);

  const s = feedback.scores ?? null;
  const avg = questions.length
    ? clamp(questions.reduce((a, q) => a + q.score, 0) / questions.length)
    : 0;

  const scores: Scores | null =
    s || questions.length
      ? {
          overall: clamp(s?.overall ?? avg),
          technical: clamp(s?.technical ?? avg),
          communication: clamp(s?.communication ?? avg),
          confidence: clamp(s?.confidence ?? avg),
          problemSolving: clamp(s?.problemSolving ?? avg),
        }
      : null;

  return {
    hasData: questions.length > 0 || topics.length > 0 || !!s,
    questions,
    topics,
    breakdown,
    scores,
  };
}