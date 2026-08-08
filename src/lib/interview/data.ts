import candidatesJson from "@/data/candidates.json";
import curriculumJson from "@/data/curriculum.json";

export type Mission = {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
};

export type CandidateMember = {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
};

export type Candidate = {
  member: CandidateMember;
  missions: Mission[];
  signals: { commitDays: number; missionsCompleted: number; missionsFirstTry: number };
};

export type CurriculumDay = {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
};

export type Curriculum = {
  cohort: string;
  modules: { n: number; title: string; days: number[] }[];
  days: CurriculumDay[];
};

export const curriculum = curriculumJson as Curriculum;
export const candidates = (candidatesJson as { candidates: Candidate[] }).candidates;

export function getCandidate(id: string): Candidate | undefined {
  return candidates.find((c) => c.member.id === id);
}

export function dayInfo(day: number): CurriculumDay | undefined {
  return curriculum.days.find((d) => d.day === day);
}

export function moduleForDay(day: number): string {
  const m = curriculum.modules.find((mod) => day >= mod.days[0]! && day <= mod.days[1]!);
  return m ? `Module ${m.n}: ${m.title}` : "Unknown module";
}

/** Candidate profile + matched curriculum context, formatted for the interviewer prompt. */
export function buildCandidateBriefing(candidate: Candidate): string {
  const { member, missions, signals } = candidate;

  const completed = missions.filter((m) => m.passed);
  const skipped = missions.filter((m) => m.skipped);
  const struggled = completed.filter((m) => (m.attempts ?? 1) >= 3);
  const confident = completed.filter((m) => (m.attempts ?? 1) === 1);

  const describe = (m: Mission) => {
    const info = dayInfo(m.day);
    const objectives = info?.objectives?.length
      ? `\n    objectives: ${info.objectives.join("; ")}`
      : "";
    const tools = info?.tools?.length ? `\n    tools: ${info.tools.join(", ")}` : "";
    const state = m.skipped ? "SKIPPED" : `passed after ${m.attempts ?? 1} attempt(s)`;
    return `  - Day ${m.day} — ${m.title} (${moduleForDay(m.day)}) [${state}]${objectives}${tools}`;
  };

  return [
    `COHORT: ${curriculum.cohort}`,
    ``,
    `CANDIDATE`,
    `  Name: ${member.name}`,
    `  Target role: ${member.jobRole}`,
    `  Experience: ${member.yearsExperience} years | Education: ${member.education}`,
    `  Cohort status: ${member.status}`,
    `  Signals: ${signals.commitDays} commit days, ${signals.missionsCompleted} missions completed, ${signals.missionsFirstTry} passed first try`,
    ``,
    `COMPLETED MISSIONS (these are FAIR GAME for questions):`,
    completed.map(describe).join("\n") || "  (none)",
    ``,
    confident.length
      ? `STRONG AREAS (first-try passes — push deeper, ask for trade-offs and failure modes):\n${confident
          .map((m) => `  - Day ${m.day} ${m.title}`)
          .join("\n")}`
      : "",
    struggled.length
      ? `SHAKY AREAS (3+ attempts — probe fundamentals carefully and supportively):\n${struggled
          .map((m) => `  - Day ${m.day} ${m.title} (${m.attempts} attempts)`)
          .join("\n")}`
      : "",
    skipped.length
      ? `SKIPPED TOPICS (do NOT interrogate; at most one gentle awareness question, and note as a gap in feedback):\n${skipped
          .map((m) => `  - Day ${m.day} ${m.title}`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}