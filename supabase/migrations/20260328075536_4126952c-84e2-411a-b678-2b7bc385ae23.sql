DROP POLICY IF EXISTS "Admins can manage photo contests" ON public.photo_contests;

CREATE POLICY "Admins and super admin can manage photo contests"
ON public.photo_contests
FOR ALL
TO public
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.is_super_admin(auth.uid())
);