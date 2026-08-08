import { createServerFn } from "@tanstack/react-start";

export const listCandidates = createServerFn({ method: "GET" }).handler(async () => {
  const { candidates } = await import("./interview/data");
  return candidates.map((c) => ({
    ...c.member,
    missionsPassed: c.missions.filter((m) => m.passed).length,
    skipped: c.missions.filter((m) => m.skipped).length,
    signals: c.signals,
    topics: c.missions.filter((m) => m.passed).map((m) => m.title),
  }));
});

export const interviewTurn = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string; candidateId?: string; message?: string }) => input)
  .handler(async ({ data }) => {
    const { runInterviewTurn } = await import("./interview/engine.server");
    return runInterviewTurn({
      sessionId: data.sessionId,
      candidate: data.candidateId ? { id: data.candidateId } : undefined,
      message: data.message,
    });
  });