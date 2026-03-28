ALTER TABLE public.photo_contests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage photo contests" ON public.photo_contests;

CREATE POLICY "Admins can manage photo contests"
ON public.photo_contests
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));