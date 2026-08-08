import { createFileRoute } from "@tanstack/react-router";

import { handleInterviewRequest, interviewOptions } from "@/lib/interview/handler.server";

// Mirror of POST /api/interview that stays reachable on published deployments.
export const Route = createFileRoute("/api/public/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => handleInterviewRequest(request),
      OPTIONS: async () => interviewOptions(),
    },
  },
});