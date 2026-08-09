import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import {
  ExperiencePreview,
  Features,
  FinalCta,
  HowItWorks,
  Stats,
} from "@/components/home/Sections";
import { interviewTurn, listCandidates } from "@/lib/interview.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — AI Cohort Interview Agent" },
      {
        name: "description",
        content:
          "Pick a cohort learner and run an adaptive, multi-turn AI technical interview grounded in the missions they actually completed.",
      },
      { property: "og:title", content: "Nova — AI Cohort Interview Agent" },
      {
        property: "og:description",
        content: "Adaptive AI technical interviews grounded in each learner's 31-day cohort journey.",
      },
    ],
  }),
  component: Index,
});

type Feedback = { summary: string; strengths: string[]; gaps: string[]; next: string[] };
type Turn = { role: "assistant" | "user"; content: string };

function Index() {
  const fetchCandidates = useServerFn(listCandidates);
  const sendTurn = useServerFn(interviewTurn);

  const { data: people, isPending } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => fetchCandidates(),
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy, feedback]);

  useEffect(() => {
    if (sessionId && !busy && !feedback) inputRef.current?.focus();
  }, [sessionId, busy, feedback]);

  const active = people?.find((p) => p.id === selected);

  async function start(candidateId: string) {
    const id = crypto.randomUUID();
    setSelected(candidateId);
    setSessionId(id);
    setTurns([]);
    setFeedback(null);
    setBusy(true);
    try {
      const res = await sendTurn({ data: { sessionId: id, candidateId } });
      setTurns([{ role: "assistant", content: res.reply }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the interview");
      setSessionId(null);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || !sessionId || busy) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await sendTurn({ data: { sessionId, message: text } });
      setTurns((t) => [...t, { role: "assistant", content: res.reply }]);
      if (res.done && res.feedback) setFeedback(res.feedback);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The interviewer did not respond");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSelected(null);
    setSessionId(null);
    setTurns([]);
    setFeedback(null);
    setInput("");
  }

  function goToCandidates() {
    document.getElementById("candidates")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-x-clip px-5 py-8 md:px-8">
      <Toaster position="top-center" />

      {!sessionId && <Navbar onStart={goToCandidates} />}

      {sessionId && (
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Nova</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              AI Cohort interview agent · 31 days · 8 modules
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <RotateCcw className="size-4" /> New interview
        </button>
      </header>
      )}

      {!sessionId ? (
        <div>
          <Hero onStart={goToCandidates} onExplore={goToCandidates} />
          <Features />
          <HowItWorks />
          <ExperiencePreview />
          <Stats />

          <section id="candidates" className="scroll-mt-24 py-14 md:py-20">
          <h2 className="text-2xl font-bold md:text-4xl">Choose a candidate</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Nova reads a learner's cohort record — completed missions, retry counts, skipped days — and
            runs an adaptive, multi-turn interview with follow-ups, then closes with structured feedback.
          </p>

          {isPending ? (
            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading cohort…
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {people?.map((p) => (
                <button
                  key={p.id}
                  onClick={() => void start(p.id)}
                  disabled={busy}
                  className="group glass-panel rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.jobRole}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                    <Chip>{p.yearsExperience} yrs exp</Chip>
                    <Chip>{p.missionsPassed} missions passed</Chip>
                    <Chip>{p.signals.missionsFirstTry} first-try</Chip>
                    {p.skipped > 0 && <Chip tone="warn">{p.skipped} skipped</Chip>}
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {p.topics.slice(0, 4).join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="glass-panel mt-12 rounded-2xl p-5">
            <h3 className="text-sm font-semibold">API contract</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The same agent is exposed over HTTP for evaluators.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-background/70 p-4 text-xs leading-relaxed text-muted-foreground">
{`POST /api/interview
{ "sessionId": "abc-123", "candidate": { ...candidate.json } }
-> { "reply": "...", "done": false }

POST /api/interview
{ "sessionId": "abc-123", "message": "..." }
-> { "reply": "...", "done": true,
     "feedback": { "summary": "...", "strengths": [], "gaps": [], "next": [] } }`}
            </pre>
          </div>
          </section>

          <FinalCta onStart={goToCandidates} />
        </div>
      ) : (
        <section className="mt-6 flex flex-1 flex-col">
          {active && (
            <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 text-sm">
              <span className="font-semibold">{active.name}</span>
              <span className="text-muted-foreground">{active.jobRole}</span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                session {sessionId.slice(0, 8)}
              </span>
            </div>
          )}

          <div className="mt-4 flex-1 space-y-4 overflow-y-auto pb-4">
            {turns.map((t, i) => (
              <div
                key={i}
                className={`flex animate-rise ${t.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    t.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground md:max-w-[70%]"
                      : "glass-panel max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed md:max-w-[75%]"
                  }
                >
                  {t.role === "assistant" && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                      Nova
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{t.content}</p>
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="glass-panel flex items-center gap-2 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Nova is thinking…
                </div>
              </div>
            )}

            {feedback && <FeedbackCard feedback={feedback} />}
            <div ref={endRef} />
          </div>

          {!feedback && (
            <div className="glass-panel sticky bottom-0 flex items-end gap-2 rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Answer out loud, like you would in a real interview…"
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                aria-label="Send answer"
              >
                <Send className="size-4" />
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "warn" }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 ${
        tone === "warn"
          ? "border-warn/40 text-warn"
          : "border-border bg-surface-raised text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const sections: { label: string; items: string[] }[] = [
    { label: "Strengths", items: feedback.strengths },
    { label: "Gaps", items: feedback.gaps },
    { label: "Next steps", items: feedback.next },
  ];
  return (
    <div className="glass-panel animate-rise rounded-2xl border-primary/40 p-5">
      <h2 className="text-lg font-bold">Interview feedback</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feedback.summary}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {sections.map((s) => (
          <div key={s.label}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{s.label}</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {s.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
