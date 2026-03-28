
-- 1. badges: Add admin CRUD policy
CREATE POLICY "Admins can manage badges"
ON public.badges
FOR ALL TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. community_answers: Add admin manage policy
CREATE POLICY "Admins can manage community answers"
ON public.community_answers
FOR ALL TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. community_questions: Add admin manage policy
CREATE POLICY "Admins can manage community questions"
ON public.community_questions
FOR ALL TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. visitor_sessions: Fix INSERT for anonymous users (currently requires auth but anon should insert)
DROP POLICY IF EXISTS "Anyone can insert visitor sessions" ON public.visitor_sessions;
CREATE POLICY "Anyone can insert visitor sessions"
ON public.visitor_sessions
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- 5. visitor_sessions: Fix UPDATE for anonymous
DROP POLICY IF EXISTS "Visitors can update their session" ON public.visitor_sessions;
CREATE POLICY "Visitors can update their session"
ON public.visitor_sessions
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);
