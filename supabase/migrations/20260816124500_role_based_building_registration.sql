-- Role-based authorization for building registration
-- Only users with an active 'host' role in their JWT user_metadata can insert new buildings

-- 1. Drop existing insert policies on buildings
DROP POLICY IF EXISTS "buildings_insert_auth" ON public.buildings;
DROP POLICY IF EXISTS "buildings_insert_host" ON public.buildings;

-- 2. Create strict role-based insert policy on public.buildings
CREATE POLICY "buildings_insert_host" ON public.buildings
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND (
    (COALESCE(auth.jwt()->'user_metadata'->>'role', auth.jwt()->'raw_user_meta_data'->>'role', '')) = 'host'
  )
);
