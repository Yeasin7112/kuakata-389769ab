
-- Fix donations UPDATE missing WITH CHECK
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Admins can update donations"
ON public.donations FOR UPDATE TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix donations DELETE to use has_role
DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;
CREATE POLICY "Admins can delete donations"
ON public.donations FOR DELETE TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix donations SELECT to use has_role
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix community_chat_messages UPDATE missing WITH CHECK
DROP POLICY IF EXISTS "Admins can update community messages" ON public.community_chat_messages;
CREATE POLICY "Admins can manage community messages"
ON public.community_chat_messages FOR ALL TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix mosque_prayer_times: consolidate to ALL with WITH CHECK
DROP POLICY IF EXISTS "Admins can update mosque prayer times" ON public.mosque_prayer_times;
DROP POLICY IF EXISTS "Admins can delete mosque prayer times" ON public.mosque_prayer_times;
DROP POLICY IF EXISTS "Admins can insert mosque prayer times" ON public.mosque_prayer_times;
CREATE POLICY "Admins can manage mosque prayer times"
ON public.mosque_prayer_times FOR ALL TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
