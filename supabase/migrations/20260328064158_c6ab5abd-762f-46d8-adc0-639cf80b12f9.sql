
-- Fix ALL policies missing WITH CHECK for all admin-managed tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'ALL'
      AND with_check IS NULL
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO public USING (%s) WITH CHECK (%s)',
      r.policyname, r.tablename, r.qual, r.qual
    );
  END LOOP;
END $$;
