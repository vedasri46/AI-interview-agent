import { ArrowRight, Bot, Sparkles, User } from "lucide-react";

export function Hero({ onStart, onExplore }: { onStart: () => void; onExplore: () => void }) {
  return (
    <section id="top" className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-2 lg:gap-10">
      <div className="animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" /> AI-Powered Interview Practice
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-[1.05] md:text-6xl">
          Practice Smarter.
          <br />
          <span className="bg-gradient-to-r from-primary to-[oklch(0.72_0.16_290)] bg-clip-text text-transparent">
            Interview Better.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Experience realistic AI-powered technical interviews, receive intelligent feedback, and build
          confidence for your next opportunity.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Start Interview <ArrowRight className="size-4" />
          </button>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Explore Candidates
          </button>
        </div>
      </div>

      <div className="relative animate-rise">
        <div className="pointer-events-none absolute inset-x-0 -inset-y-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 via-transparent to-[oklch(0.6_0.18_290)]/20 blur-2xl" />
        <div className="glass-panel relative rounded-3xl p-5 shadow-2xl shadow-background/50">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warn/70" />
            <span className="size-2.5 rounded-full bg-primary/70" />
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">live session</span>
          </div>
          <div className="space-y-3 pt-4">
            <Bubble role="ai">Let's start with your retrieval pipeline. How did you chunk documents?</Bubble>
            <Bubble role="me">I used semantic chunking with overlap, then embedded each chunk…</Bubble>
            <Bubble role="ai">Good — what breaks when chunks get too large?</Bubble>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Nova is listening…
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ role, children }: { role: "ai" | "me"; children: React.ReactNode }) {
  const ai = role === "ai";
  return (
    <div className={`flex items-start gap-2 ${ai ? "" : "flex-row-reverse"}`}>
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg ${
          ai ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"
        }`}
      >
        {ai ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
      </span>
      <p
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed md:text-sm ${
          ai
            ? "rounded-tl-sm bg-surface-raised text-foreground"
            : "rounded-tr-sm bg-primary text-primary-foreground"
        }`}
      >
        {children}
      </p>
    </div>
  );
}