import { Bot, Brain, ClipboardList, LineChart, MessagesSquare } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Interviews",
    body: "Practice realistic technical interviews with an intelligent AI interviewer.",
  },
  {
    icon: MessagesSquare,
    title: "Adaptive Conversations",
    body: "The interviewer responds to your answers and adjusts the conversation naturally.",
  },
  {
    icon: LineChart,
    title: "Real-Time Feedback",
    body: "Understand your strengths and identify areas where you can improve.",
  },
  {
    icon: ClipboardList,
    title: "Structured Practice",
    body: "Practice across multiple technical topics and progressively challenging questions.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-14 md:py-20">
      <h2 className="max-w-2xl text-2xl font-bold md:text-4xl">
        Everything You Need to Prepare With Confidence
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="glass-panel group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-primary/50"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Choose Your Interview", body: "Select the candidate/interview configuration." },
  {
    n: "02",
    title: "Talk With AI",
    body: "Answer technical questions naturally as if you're in a real interview.",
  },
  { n: "03", title: "Improve", body: "Review your performance and identify areas for improvement." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 md:py-20">
      <h2 className="text-2xl font-bold md:text-4xl">How it works</h2>
      <div className="relative mt-8 grid gap-4 md:grid-cols-3">
        <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        {steps.map((s) => (
          <div key={s.n} className="glass-panel relative rounded-2xl p-5">
            <span className="grid size-12 place-items-center rounded-2xl border border-primary/40 bg-background font-display text-sm font-bold text-primary">
              {s.n}
            </span>
            <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExperiencePreview() {
  const convo = [
    { role: "ai", text: "Can you explain how a vector database works?" },
    { role: "me", text: "I would use embeddings to represent the data..." },
    { role: "ai", text: "Good. Now let's explore the trade-offs involved in similarity search." },
  ] as const;

  return (
    <section className="grid items-center gap-8 py-14 md:py-20 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold md:text-4xl">The interview experience</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
          Every question builds on your last answer. Nova probes deeper where you're strong and returns to
          fundamentals where you're not — just like a real technical panel.
        </p>
      </div>
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-2 pb-4 text-xs text-muted-foreground">
          <Bot className="size-4 text-primary" /> Preview of a real session
        </div>
        <div className="space-y-3">
          {convo.map((m, i) => (
            <div key={i} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "me"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-surface-raised"
                }`}
              >
                {m.role === "ai" && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                    AI Interviewer
                  </p>
                )}
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  "AI-Powered Practice",
  "Technical Questions",
  "Adaptive Conversations",
  "Realistic Interview Experience",
];

export function Stats() {
  return (
    <section className="glass-panel grid gap-4 rounded-3xl p-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s} className="text-center">
          <p className="font-display text-sm font-semibold text-primary md:text-base">{s}</p>
        </div>
      ))}
    </section>
  );
}

export function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="my-14 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/12 via-surface to-[oklch(0.4_0.12_290)]/20 p-8 text-center md:my-20 md:p-14">
      <h2 className="text-2xl font-bold md:text-4xl">Ready to Test Your Interview Skills?</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
        Start practicing with an AI interviewer and build confidence one question at a time.
      </p>
      <button
        onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
      >
        Start Interview
      </button>
    </section>
  );
}