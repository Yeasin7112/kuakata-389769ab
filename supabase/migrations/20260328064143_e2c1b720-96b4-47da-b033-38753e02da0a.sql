
DROP POLICY "Admins can manage banners" ON public.banners;

CREATE POLICY "Admins can manage banners" ON public.banners
FOR ALL TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
