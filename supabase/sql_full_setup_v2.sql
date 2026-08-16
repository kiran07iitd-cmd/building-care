-- Full DB schema and RLS setup for BuildingCare app (v2)
-- Run in Supabase Console → SQL Editor as project owner (service role recommended).
-- This script creates tables first, then functions and policies that reference them.
-- It is defensive (IF NOT EXISTS) but assumes a blank or partially-populated schema.

-- IMPORTANT: Test in a staging project before running in production.

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- buildings
-- =========================
CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  unique_code text UNIQUE,
  photo_url text,
  host_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_buildings_unique_code ON public.buildings (unique_code);

-- =========================
-- profiles (lightweight mirror for user info)
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  name text,
  email text,
  mobile text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- hosts
-- =========================
CREATE TABLE IF NOT EXISTS public.hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active', -- 'active', 'removed', 'pending'
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hosts_building_id ON public.hosts (building_id);
CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON public.hosts (user_id);

-- =========================
-- Guard trigger for hosts (created after hosts table exists)
-- =========================
CREATE OR REPLACE FUNCTION public.hosts_guard_privileged_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- If this is a client-side (non-service) call, restrict certain changes
  IF auth.uid() IS NOT NULL THEN
    IF NEW.is_primary IS DISTINCT FROM OLD.is_primary THEN
      RAISE EXCEPTION 'Primary host changes require privileged operation';
    END IF;
    IF NEW.building_id IS DISTINCT FROM OLD.building_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Host ownership cannot be reassigned';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS hosts_guard_privileged_changes ON public.hosts;
CREATE TRIGGER hosts_guard_privileged_changes
BEFORE UPDATE ON public.hosts
FOR EACH ROW EXECUTE FUNCTION public.hosts_guard_privileged_changes();

-- =========================
-- Helper: is_host_of - created after hosts table
-- =========================
CREATE OR REPLACE FUNCTION public.is_host_of(bid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hosts h
    WHERE h.building_id = bid
      AND h.user_id = auth.uid()
      AND h.status = 'active'
  );
$$;

-- =========================
-- chat_messages
-- =========================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  to_host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read_by_host boolean DEFAULT false,
  read_by_resident boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_building_id ON public.chat_messages (building_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_to_host_id ON public.chat_messages (to_host_id);

-- =========================
-- chat_message_reads
-- =========================
CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

-- Add FK to chat_messages if possible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='chat_messages'
  ) THEN
    BEGIN
      ALTER TABLE public.chat_message_reads
        ADD CONSTRAINT IF NOT EXISTS fk_chat_message_reads_message
        FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      -- already exists, ignore
      NULL;
    END;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_chat_message_reads_message_id ON public.chat_message_reads (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_user_id ON public.chat_message_reads (user_id);

-- =========================
-- host_requests and votes
-- =========================
CREATE TABLE IF NOT EXISTS public.host_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_user_email text,
  new_user_mobile text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid
);

CREATE TABLE IF NOT EXISTS public.host_request_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.host_requests(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  vote text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- room_join_requests
-- =========================
CREATE TABLE IF NOT EXISTS public.room_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name text,
  applicant_email text,
  applicant_mobile text,
  room_number text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid
);

-- =========================
-- notifications
-- =========================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  related_room_id uuid,
  related_category_id uuid,
  related_month text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- generate_building_code helper
-- =========================
CREATE OR REPLACE FUNCTION public.generate_building_code()
RETURNS text LANGUAGE plpgsql VOLATILE SECURITY DEFINER AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    out := out || substr(alphabet, floor(random()*length(alphabet))::int + 1, 1);
  END LOOP;
  RETURN concat('B-', out);
END;
$$;
GRANT EXECUTE ON FUNCTION public.generate_building_code() TO authenticated;

-- =========================
-- get_buildings_by_codes helper
-- =========================
CREATE OR REPLACE FUNCTION public.get_buildings_by_codes(codes text[])
RETURNS SETOF public.buildings LANGUAGE sql STABLE AS $$
  SELECT b.*
  FROM public.buildings b
  WHERE b.unique_code = ANY(codes)
  ORDER BY array_position(codes, b.unique_code)
$$;
GRANT EXECUTE ON FUNCTION public.get_buildings_by_codes(text[]) TO authenticated;

-- =========================
-- RLS policies (create after tables exist)
-- =========================
-- Hosts table RLS: allow hosts to update their own row (protected by trigger)
ALTER TABLE IF EXISTS public.hosts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hosts_update_own ON public.hosts;
CREATE POLICY hosts_update_own ON public.hosts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_host_of(building_id))
  WITH CHECK (user_id = auth.uid() AND public.is_host_of(building_id));

-- Chat messages RLS
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chat_select_policy ON public.chat_messages;
CREATE POLICY chat_select_policy ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    resident_id = auth.uid()
    OR sender_id = auth.uid()
    OR to_host_id = auth.uid()
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

DROP POLICY IF EXISTS chat_insert_policy ON public.chat_messages;
CREATE POLICY chat_insert_policy ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      resident_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.hosts h
        WHERE h.building_id = NEW.building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
    AND (
      NEW.to_host_id IS NULL
      OR NEW.to_host_id IN (
        SELECT user_id FROM public.hosts WHERE building_id = NEW.building_id AND status = 'active'
      )
    )
  );

DROP POLICY IF EXISTS chat_update_policy ON public.chat_messages;
CREATE POLICY chat_update_policy ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (
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
    sender_id = auth.uid()
    OR resident_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hosts h
      WHERE h.building_id = NEW.building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  );

-- Chat message reads RLS
ALTER TABLE IF EXISTS public.chat_message_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cmr_insert_policy ON public.chat_message_reads;
CREATE POLICY cmr_insert_policy ON public.chat_message_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cmr_select_policy ON public.chat_message_reads;
CREATE POLICY cmr_select_policy ON public.chat_message_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- End of v2 script
