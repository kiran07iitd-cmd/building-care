-- ============================================================================
-- SQL Script for Supabase SQL Editor: Role-Based Building Registration RLS
-- ============================================================================

-- Drop old insert policy if present
DROP POLICY IF EXISTS "buildings_insert_auth" ON public.buildings;
DROP POLICY IF EXISTS "buildings_insert_host" ON public.buildings;

-- Enforce that only users whose active role in user_metadata is 'host' can insert into buildings
CREATE POLICY "buildings_insert_host" ON public.buildings
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND (
    (COALESCE(auth.jwt()->'user_metadata'->>'role', auth.jwt()->'raw_user_meta_data'->>'role', '')) = 'host'
  )
);
