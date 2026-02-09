
-- Table to track visitor sessions
CREATE TABLE public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  last_active_at timestamp with time zone NOT NULL DEFAULT now(),
  device_type text,
  browser text,
  os text,
  screen_width integer,
  screen_height integer,
  language text,
  referrer text,
  user_agent text,
  is_logged_in boolean DEFAULT false,
  user_id uuid
);

-- Table to track visitor page views and events
CREATE TABLE public.visitor_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  event_type text NOT NULL DEFAULT 'page_view',
  page_path text,
  page_title text,
  element_text text,
  element_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for anonymous tracking)
CREATE POLICY "Anyone can insert visitor sessions"
ON public.visitor_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update own visitor session"
ON public.visitor_sessions FOR UPDATE
USING (visitor_id = visitor_id);

CREATE POLICY "Anyone can insert visitor events"
ON public.visitor_events FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view visitor sessions"
ON public.visitor_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view visitor events"
ON public.visitor_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete (cleanup)
CREATE POLICY "Admins can delete visitor sessions"
ON public.visitor_sessions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete visitor events"
ON public.visitor_events FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_visitor_sessions_started_at ON public.visitor_sessions(started_at DESC);
CREATE INDEX idx_visitor_sessions_visitor_id ON public.visitor_sessions(visitor_id);
CREATE INDEX idx_visitor_events_session_id ON public.visitor_events(session_id);
CREATE INDEX idx_visitor_events_created_at ON public.visitor_events(created_at DESC);
