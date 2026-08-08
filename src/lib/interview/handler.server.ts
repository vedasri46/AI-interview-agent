import { runInterviewTurn } from "./engine.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Content-Type": "application/json",
};

export function interviewOptions() {
  return new Response(null, { status: 204, headers: cors });
}

export async function handleInterviewRequest(request: Request): Promise<Response> {
  let body: { sessionId?: string; candidate?: unknown; message?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: cors });
  }

  if (!body?.sessionId || typeof body.sessionId !== "string") {
    return new Response(JSON.stringify({ error: "sessionId is required" }), { status: 400, headers: cors });
  }

  try {
    const result = await runInterviewTurn({
      sessionId: body.sessionId,
      candidate: body.candidate,
      message: typeof body.message === "string" ? body.message : undefined,
    });
    return new Response(JSON.stringify(result), { status: 200, headers: cors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("[interview]", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: cors });
  }
}