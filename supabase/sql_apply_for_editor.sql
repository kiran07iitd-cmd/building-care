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

-- 4) Enable Row Level Security on chat_messages and add member-scoped policies
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: residents can read their own active building thread; active hosts can
-- read threads only when the resident is an active member of that building.
DROP POLICY IF EXISTS chat_select_policy ON public.chat_messages;
CREATE POLICY chat_select_policy ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = chat_messages.building_id
        AND ru.user_id = chat_messages.resident_id
        AND ru.status = 'active'
    )
    AND (
      (resident_id = (SELECT auth.uid()) AND public.is_resident_of(building_id))
      OR public.is_host_of(building_id)
    )
  );

-- INSERT: sender must be the authenticated active resident or an active host;
-- hosts may only message a real active resident thread in their building.
DROP POLICY IF EXISTS chat_insert_policy ON public.chat_messages;
CREATE POLICY chat_insert_policy ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = chat_messages.building_id
        AND ru.user_id = chat_messages.resident_id
        AND ru.status = 'active'
    )
    AND (
      (resident_id = (SELECT auth.uid()) AND public.is_resident_of(building_id))
      OR public.is_host_of(building_id)
    )
  );

-- The current client does not update chat messages; revoke UPDATE rather than
-- allowing callers to rewrite message content or thread ownership.
DROP POLICY IF EXISTS chat_update_policy ON public.chat_messages;
REVOKE UPDATE ON TABLE public.chat_messages FROM PUBLIC, anon, authenticated;

-- 5) Notes:
-- * Service-role (server) API calls bypass RLS and can be used to run admin tasks, such as host removals or building code mass-fixes.
-- * If your chat_messages table has different column names (e.g. "sender", "author"), adjust the above SQL accordingly before running.
-- * Always test this SQL in a staging project before applying to production. If you want a rollback script, ask and it will be provided.

-- End of SQL
