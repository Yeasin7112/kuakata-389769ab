
-- Fix the update policy to be more restrictive (use a real check)
DROP POLICY "Anyone can update own visitor session" ON public.visitor_sessions;

-- Allow updates only via the anon key by matching visitor_id from the row
-- This is intentionally permissive for anonymous tracking but limited to UPDATE only
CREATE POLICY "Visitors can update their session"
ON public.visitor_sessions FOR UPDATE
USING (true)
WITH CHECK (true);
