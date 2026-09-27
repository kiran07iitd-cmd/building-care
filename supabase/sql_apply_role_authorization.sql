-- Active host/resident mode is user-selectable and must not authorize writes.
-- Require an authenticated user to create buildings only for their own account.

-- Drop old insert policy if present
DROP POLICY IF EXISTS "buildings_insert_auth" ON public.buildings;
DROP POLICY IF EXISTS "buildings_insert_host" ON public.buildings;

CREATE POLICY "buildings_insert_auth" ON public.buildings
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = created_by
);
