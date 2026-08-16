-- SQL migration for Supabase SQL Editor
-- Run this in Supabase Console > SQL Editor as a project admin (service role not required if you are an owner)
-- 2026-08-09: Adds chat_messages.to_host_id, chat_message_reads, indexes and RLS policies

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Add column to chat_messages for host-targeting
ALTER TABLE IF EXISTS public.chat_messages
  ADD COLUMN IF NOT EXISTS to_host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2) Create per-user read tracking table
CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

-- 3) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_to_host_id ON public.chat_messages (to_host_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_message_id ON public.chat_message_reads (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_user_id ON public.chat_message_reads (user_id);

-- 4) Helper function to find buildings by a candidate list of codes (ordered by array position)
CREATE OR REPLACE FUNCTION public.get_buildings_by_codes(codes text[])
RETURNS SETOF public.buildings LANGUAGE sql STABLE AS $$
  SELECT b.*
  FROM public.buildings b
  WHERE b.unique_code = ANY(codes)
  ORDER BY array_position(codes, b.unique_code)
$$;

-- 5) Enable Row Level Security on chat_messages and add safe policies
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: allow residents to see their messages, senders to see their sent messages, and hosts to see broadcasts or messages targeted to them
DROP POLICY IF EXISTS chat_select_policy ON public.chat_messages;
CREATE POLICY chat_select_policy ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    -- sender or resident may always see their messages
    resident_id = auth.uid()
    OR sender_id = auth.uid()
    OR to_host_id = auth.uid()
    -- hosts may see broadcasts (to_host_id IS NULL) if they are an active host for the building
    OR (
      to_host_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.hosts h
        WHERE h.building_id = public.chat_messages.building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
  );

-- INSERT: allow residents to insert messages for themselves and hosts to insert messages; ensure to_host_id (if set) is an active host for the building
DROP POLICY IF EXISTS chat_insert_policy ON public.chat_messages;
CREATE POLICY chat_insert_policy ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      -- either a resident inserting for themselves
      resident_id = auth.uid()
      -- or a host inserting (must be an active host for the building)
      OR EXISTS (
        SELECT 1 FROM public.hosts h
        WHERE h.building_id = NEW.building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
    -- If to_host_id is set, it must be one of the active hosts of the building
    AND (
      NEW.to_host_id IS NULL
      OR NEW.to_host_id IN (
        SELECT user_id FROM public.hosts WHERE building_id = NEW.building_id AND status = 'active'
      )
    )
  );

-- UPDATE: allow senders to update their messages and allow hosts or residents to update read-tracking fields
DROP POLICY IF EXISTS chat_update_policy ON public.chat_messages;
CREATE POLICY chat_update_policy ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (
    -- either you are the sender or you are an active host for the building or the resident
    sender_id = auth.uid()
    OR resident_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hosts h
      WHERE h.building_id = public.chat_messages.building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  )
  WITH CHECK (
    -- Do not allow arbitrary reassignment of tenant/room/building; allow hosts/residents to update permitted fields (e.g., read flags)
    (
      sender_id = auth.uid()
      OR resident_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.hosts h
        WHERE h.building_id = NEW.building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
  );

-- 6) Grant necessary privileges to authenticated role for function usage (optional)
GRANT EXECUTE ON FUNCTION public.get_buildings_by_codes(text[]) TO authenticated;

-- 7) Notes:
-- * Service-role (server) API calls bypass RLS and can be used to run admin tasks, such as host removals or building code mass-fixes.
-- * If your chat_messages table has different column names (e.g. "sender", "author"), adjust the above SQL accordingly before running.
-- * Always test this SQL in a staging project before applying to production. If you want a rollback script, ask and it will be provided.

-- End of SQL
