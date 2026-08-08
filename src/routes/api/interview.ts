import { createFileRoute } from "@tanstack/react-router";

import { handleInterviewRequest, interviewOptions } from "@/lib/interview/handler.server";

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => handleInterviewRequest(request),
      OPTIONS: async () => interviewOptions(),
    },
  },
});