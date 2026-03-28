-- Allow admins to fully manage contest photos (view, approve, delete)
CREATE POLICY "Admins can manage contest photos"
ON public.contest_photos
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

-- Allow admins to manage photo votes
DROP POLICY IF EXISTS "Admins can manage photo votes" ON public.photo_votes;
CREATE POLICY "Admins can manage photo votes"
ON public.photo_votes
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));