CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_key TEXT NOT NULL UNIQUE,
  candidate JSONB NOT NULL DEFAULT '{}'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  days_covered INTEGER[] NOT NULL DEFAULT '{}',
  done BOOLEAN NOT NULL DEFAULT false,
  feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public interview sessions are readable" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can start an interview session" ON public.interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can continue an interview session" ON public.interview_sessions FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX idx_interview_sessions_session_key ON public.interview_sessions (session_key);