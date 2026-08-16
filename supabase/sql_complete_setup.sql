-- Consolidated Database Schema and Setup for BuildingCare Application
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Run this as database owner/service role.

-- Enable extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1) Create Storage Buckets
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-qr', 'maintenance-qr', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('building-photos', 'building-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2) Table Definitions
-- ==========================================

-- profiles: mirrors the auth.users table (FK to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  mobile TEXT,
  google_account TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- buildings: registered buildings
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  unique_code TEXT UNIQUE NOT NULL,
  host_count INT NOT NULL DEFAULT 1 CHECK (host_count BETWEEN 1 AND 5),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- hosts: maps hosts (managers) to buildings
CREATE TABLE IF NOT EXISTS public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(building_id, user_id)
);

-- rooms: rooms inside buildings
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- host_requests: for adding hosts or changing host count
CREATE TABLE IF NOT EXISTS public.host_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_user_email TEXT,
  new_user_mobile TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- host_request_votes: votes for host requests
CREATE TABLE IF NOT EXISTS public.host_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.host_requests(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, host_id)
);

-- room_users: assigns tenants to specific rooms
CREATE TABLE IF NOT EXISTS public.room_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- maintenance_categories: maintenance cost configurations
CREATE TABLE IF NOT EXISTS public.maintenance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  per_room_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  qr_code_image TEXT,
  upi_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- monthly_maintenance: published billing periods
CREATE TABLE IF NOT EXISTS public.monthly_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.maintenance_categories(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  per_room_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, month)
);

-- room_maintenance_status: tracks room bill statuses
CREATE TABLE IF NOT EXISTS public.room_maintenance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_maintenance_id UUID NOT NULL REFERENCES public.monthly_maintenance(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.maintenance_categories(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_applied BOOLEAN NOT NULL DEFAULT false,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'not_paid',
  payment_requested_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(monthly_maintenance_id, room_id)
);

-- notifications: system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_room_id UUID,
  related_category_id UUID,
  related_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- starred_buildings: starred buildings for dashboard shortcuts
CREATE TABLE IF NOT EXISTS public.starred_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, building_id)
);

-- room_join_requests: requests from users to join a room
CREATE TABLE IF NOT EXISTS public.room_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  applicant_name TEXT NOT NULL DEFAULT '',
  applicant_email TEXT NOT NULL DEFAULT '',
  applicant_mobile TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT room_join_requests_status_check CHECK (status IN ('pending','approved','rejected'))
);

-- chat_messages: messaging between tenants and hosts
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  read_by_resident BOOLEAN NOT NULL DEFAULT false,
  read_by_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  to_host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- chat_message_reads: per-user read tracking for chats
CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

-- building_contacts: contacts list for emergency/maintenance services
CREATE TABLE IF NOT EXISTS public.building_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3) Index Definitions
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_buildings_unique_code ON public.buildings (unique_code);
CREATE INDEX IF NOT EXISTS idx_hosts_building_id ON public.hosts (building_id);
CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON public.hosts (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS room_users_one_active_per_room ON public.room_users(room_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON public.notifications(receiver_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_building ON public.notifications(building_id);
CREATE INDEX IF NOT EXISTS idx_starred_user ON public.starred_buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_rjr_building ON public.room_join_requests(building_id, status);
CREATE INDEX IF NOT EXISTS idx_rjr_user ON public.room_join_requests(requested_by, status);
CREATE UNIQUE INDEX IF NOT EXISTS rjr_one_pending_per_user_building ON public.room_join_requests(building_id, requested_by) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON public.chat_messages (building_id, resident_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_to_host_id ON public.chat_messages (to_host_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_message_id ON public.chat_message_reads (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_user_id ON public.chat_message_reads (user_id);
CREATE INDEX IF NOT EXISTS building_contacts_building_idx ON public.building_contacts(building_id);

-- ==========================================
-- 4) Helper Functions & Trigger Logic
-- ==========================================

-- A) handle_new_user: auto-create profiles on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile, google_account)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.email, ''), ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'mobile', ''), NULLIF(COALESCE(NEW.phone, ''), ''), ''),
    CASE WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN NEW.email ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- B) is_host_of: check if current user is an active host of a building
CREATE OR REPLACE FUNCTION public.is_host_of(_building_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hosts
    WHERE building_id = _building_id AND user_id = auth.uid() AND status = 'active'
  );
$$;

-- C) is_resident_of: check if current user is an active resident of a building
CREATE OR REPLACE FUNCTION public.is_resident_of(_building_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_users ru
    JOIN public.rooms r ON r.id = ru.room_id
    WHERE r.building_id = _building_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  );
$$;

-- D) generate_building_code: auto-generates a unique building code prefixing with "B-"
CREATE OR REPLACE FUNCTION public.generate_building_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    out := out || substr(alphabet, floor(random()*length(alphabet))::int + 1, 1);
  END LOOP;
  RETURN concat('B-', out);
END;
$$;

-- E) get_buildings_by_codes: gets buildings matching a list of code candidates ordered by array order
CREATE OR REPLACE FUNCTION public.get_buildings_by_codes(codes TEXT[])
RETURNS SETOF public.buildings
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT b.*
  FROM public.buildings b
  WHERE b.unique_code = ANY(codes)
  ORDER BY array_position(codes, b.unique_code);
$$;

-- F) recalc_per_room_amounts: recalculates per-room fee split based on active room count
CREATE OR REPLACE FUNCTION public.recalc_per_room_amounts(_building_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  active_count INT;
BEGIN
  SELECT COUNT(*) INTO active_count
    FROM public.rooms
   WHERE building_id = _building_id AND is_active = true;

  IF active_count > 0 THEN
    UPDATE public.maintenance_categories
       SET per_room_amount = ROUND(total_amount / active_count, 2)
     WHERE building_id = _building_id AND is_active = true;
  ELSE
    UPDATE public.maintenance_categories
       SET per_room_amount = 0
     WHERE building_id = _building_id AND is_active = true;
  END IF;
END;
$$;

-- G) rooms_recalc_trigger: recalculate on room status updates
CREATE OR REPLACE FUNCTION public.rooms_recalc_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.recalc_per_room_amounts(NEW.building_id);
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      PERFORM public.recalc_per_room_amounts(NEW.building_id);
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.recalc_per_room_amounts(OLD.building_id);
  END IF;
  RETURN NULL;
END;
$$;

-- H) rjr_touch_updated_at: generic touch updated_at helper
CREATE OR REPLACE FUNCTION public.rjr_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- I) hosts_guard_privileged_changes: blocks critical host privilege modifications from client
CREATE OR REPLACE FUNCTION public.hosts_guard_privileged_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NEW.is_primary IS DISTINCT FROM OLD.is_primary THEN
      RAISE EXCEPTION 'Primary host changes require host consensus';
    END IF;
    IF NEW.building_id IS DISTINCT FROM OLD.building_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Host ownership cannot be reassigned';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- J) rms_guard_resident_update: stops tenants from self-verifying payments or altering bills
CREATE OR REPLACE FUNCTION public.rms_guard_resident_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_host_of(NEW.building_id) THEN
    IF NEW.building_id IS DISTINCT FROM OLD.building_id
       OR NEW.room_id IS DISTINCT FROM OLD.room_id
       OR NEW.category_id IS DISTINCT FROM OLD.category_id
       OR NEW.monthly_maintenance_id IS DISTINCT FROM OLD.monthly_maintenance_id
       OR NEW.month IS DISTINCT FROM OLD.month
       OR NEW.amount_due IS DISTINCT FROM OLD.amount_due
       OR NEW.penalty_amount IS DISTINCT FROM OLD.penalty_amount
       OR NEW.penalty_applied IS DISTINCT FROM OLD.penalty_applied
       OR NEW.total_due IS DISTINCT FROM OLD.total_due
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
       OR NEW.verified_by IS DISTINCT FROM OLD.verified_by THEN
      RAISE EXCEPTION 'Residents may only submit a payment request';
    END IF;
    IF OLD.payment_status = 'paid' THEN
      RAISE EXCEPTION 'Verified payments cannot be modified';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- K) delete_building: cascades clean deletion of a building and its linked sub-tables (Primary Host restricted)
CREATE OR REPLACE FUNCTION public.delete_building(building_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_primary_host BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.hosts
    WHERE building_id = building_id_to_delete
      AND user_id = auth.uid()
      AND is_primary = true
      AND status = 'active'
  ) INTO is_primary_host;

  IF NOT is_primary_host THEN
    RAISE EXCEPTION 'Only the primary host can delete this building';
  END IF;

  -- Delete all building-related records
  DELETE FROM public.room_users
  WHERE room_id IN (SELECT id FROM public.rooms WHERE building_id = building_id_to_delete);
  
  DELETE FROM public.room_maintenance_status
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.host_request_votes
  WHERE host_id IN (SELECT id FROM public.hosts WHERE building_id = building_id_to_delete)
     OR request_id IN (SELECT id FROM public.host_requests WHERE building_id = building_id_to_delete);
     
  DELETE FROM public.host_requests
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.chat_messages
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.building_contacts
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.monthly_maintenance
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.maintenance_categories
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.room_join_requests
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.starred_buildings
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.notifications
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.hosts
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.rooms
  WHERE building_id = building_id_to_delete;

  DELETE FROM public.buildings
  WHERE id = building_id_to_delete;
END;
$$;

-- ==========================================
-- 5) Trigger Attachments
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS hosts_guard_privileged_changes ON public.hosts;
CREATE TRIGGER hosts_guard_privileged_changes
BEFORE UPDATE ON public.hosts
FOR EACH ROW EXECUTE FUNCTION public.hosts_guard_privileged_changes();

DROP TRIGGER IF EXISTS rooms_recalc_after_change ON public.rooms;
CREATE TRIGGER rooms_recalc_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.rooms_recalc_trigger();

DROP TRIGGER IF EXISTS rjr_updated_at ON public.room_join_requests;
CREATE TRIGGER rjr_updated_at
BEFORE UPDATE ON public.room_join_requests
FOR EACH ROW EXECUTE FUNCTION public.rjr_touch_updated_at();

DROP TRIGGER IF EXISTS building_contacts_updated_at ON public.building_contacts;
CREATE TRIGGER building_contacts_updated_at
BEFORE UPDATE ON public.building_contacts
FOR EACH ROW EXECUTE FUNCTION public.rjr_touch_updated_at();

DROP TRIGGER IF EXISTS rms_guard_resident_update ON public.room_maintenance_status;
CREATE TRIGGER rms_guard_resident_update
BEFORE UPDATE ON public.room_maintenance_status
FOR EACH ROW EXECUTE FUNCTION public.rms_guard_resident_update();

-- ==========================================
-- 6) Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_maintenance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starred_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_contacts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7) RLS Policy Definitions
-- ==========================================

-- A) profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- B) buildings Policies
DROP POLICY IF EXISTS "buildings_select_all_auth" ON public.buildings;
CREATE POLICY "buildings_select_all_auth" ON public.buildings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "buildings_insert_auth" ON public.buildings;
CREATE POLICY "buildings_insert_auth" ON public.buildings FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "buildings_update_host" ON public.buildings;
CREATE POLICY "buildings_update_host" ON public.buildings FOR UPDATE TO authenticated USING (public.is_host_of(id)) WITH CHECK (public.is_host_of(id));

-- C) hosts Policies
DROP POLICY IF EXISTS "hosts_select_auth" ON public.hosts;
CREATE POLICY "hosts_select_auth" ON public.hosts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "hosts_insert_self_or_host" ON public.hosts;
CREATE POLICY "hosts_insert_self_or_host" ON public.hosts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_host_of(building_id));

DROP POLICY IF EXISTS "hosts_update_own" ON public.hosts;
CREATE POLICY "hosts_update_own" ON public.hosts FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.is_host_of(building_id)) WITH CHECK (user_id = auth.uid() AND public.is_host_of(building_id));

-- D) rooms Policies
DROP POLICY IF EXISTS "rooms_select_auth" ON public.rooms;
CREATE POLICY "rooms_select_auth" ON public.rooms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "rooms_write_host" ON public.rooms;
CREATE POLICY "rooms_write_host" ON public.rooms FOR ALL TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

-- E) host_requests Policies
DROP POLICY IF EXISTS "host_requests_select_host" ON public.host_requests;
CREATE POLICY "host_requests_select_host" ON public.host_requests FOR SELECT TO authenticated USING (public.is_host_of(building_id));

DROP POLICY IF EXISTS "host_requests_insert_host" ON public.host_requests;
CREATE POLICY "host_requests_insert_host" ON public.host_requests FOR INSERT TO authenticated WITH CHECK (public.is_host_of(building_id) AND auth.uid() = requested_by);

DROP POLICY IF EXISTS "host_requests_update_host" ON public.host_requests;
CREATE POLICY "host_requests_update_host" ON public.host_requests FOR UPDATE TO authenticated USING (public.is_host_of(building_id));

-- F) host_request_votes Policies
DROP POLICY IF EXISTS "votes_select_host" ON public.host_request_votes;
CREATE POLICY "votes_select_host" ON public.host_request_votes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.host_requests hr WHERE hr.id = request_id AND public.is_host_of(hr.building_id)));

DROP POLICY IF EXISTS "votes_insert_self_host" ON public.host_request_votes;
CREATE POLICY "votes_insert_self_host" ON public.host_request_votes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.hosts h WHERE h.id = host_id AND h.user_id = auth.uid() AND h.status = 'active'));

-- G) room_users Policies
DROP POLICY IF EXISTS "room_users_select_auth" ON public.room_users;
CREATE POLICY "room_users_select_auth" ON public.room_users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "room_users_write_host" ON public.room_users;
CREATE POLICY "room_users_write_host" ON public.room_users FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_users.room_id AND public.is_host_of(r.building_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_users.room_id AND public.is_host_of(r.building_id)));

-- H) maintenance_categories Policies
DROP POLICY IF EXISTS "mc_select_auth" ON public.maintenance_categories;
CREATE POLICY "mc_select_auth" ON public.maintenance_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mc_write_host" ON public.maintenance_categories;
CREATE POLICY "mc_write_host" ON public.maintenance_categories FOR ALL TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

-- I) monthly_maintenance Policies
DROP POLICY IF EXISTS "mm_select_auth" ON public.monthly_maintenance;
CREATE POLICY "mm_select_auth" ON public.monthly_maintenance FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mm_write_host" ON public.monthly_maintenance;
CREATE POLICY "mm_write_host" ON public.monthly_maintenance FOR ALL TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

-- J) room_maintenance_status Policies
DROP POLICY IF EXISTS "rms_host_all" ON public.room_maintenance_status;
CREATE POLICY "rms_host_all" ON public.room_maintenance_status FOR ALL TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

DROP POLICY IF EXISTS "rms_owner_select" ON public.room_maintenance_status;
CREATE POLICY "rms_owner_select" ON public.room_maintenance_status FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.room_users ru WHERE ru.room_id = room_maintenance_status.room_id AND ru.user_id = auth.uid() AND ru.status = 'active'));

DROP POLICY IF EXISTS "rms_owner_request_payment" ON public.room_maintenance_status;
CREATE POLICY "rms_owner_request_payment" ON public.room_maintenance_status FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.room_users ru WHERE ru.room_id = room_maintenance_status.room_id AND ru.user_id = auth.uid() AND ru.status = 'active')) WITH CHECK (EXISTS (SELECT 1 FROM public.room_users ru WHERE ru.room_id = room_maintenance_status.room_id AND ru.user_id = auth.uid() AND ru.status = 'active') AND payment_status = 'pending_verification' AND verified_at IS NULL AND verified_by IS NULL);

-- K) notifications Policies
DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (receiver_id = auth.uid());

DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());

DROP POLICY IF EXISTS "notif_insert_auth" ON public.notifications;
CREATE POLICY "notif_insert_auth" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- L) starred_buildings Policies
DROP POLICY IF EXISTS "starred_select_own" ON public.starred_buildings;
CREATE POLICY "starred_select_own" ON public.starred_buildings FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "starred_insert_own" ON public.starred_buildings;
CREATE POLICY "starred_insert_own" ON public.starred_buildings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "starred_delete_own" ON public.starred_buildings;
CREATE POLICY "starred_delete_own" ON public.starred_buildings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- M) room_join_requests Policies
DROP POLICY IF EXISTS "rjr_select_own_or_host" ON public.room_join_requests;
CREATE POLICY "rjr_select_own_or_host" ON public.room_join_requests FOR SELECT TO authenticated USING (requested_by = auth.uid() OR public.is_host_of(building_id));

DROP POLICY IF EXISTS "rjr_insert_own" ON public.room_join_requests;
CREATE POLICY "rjr_insert_own" ON public.room_join_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "rjr_update_host" ON public.room_join_requests;
CREATE POLICY "rjr_update_host" ON public.room_join_requests FOR UPDATE TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

DROP POLICY IF EXISTS "rjr_delete_own_pending" ON public.room_join_requests;
CREATE POLICY "rjr_delete_own_pending" ON public.room_join_requests FOR DELETE TO authenticated USING (requested_by = auth.uid() AND status = 'pending');

-- N) chat_messages Policies
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
        WHERE h.building_id = building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
    AND (
      to_host_id IS NULL
      OR to_host_id IN (
        SELECT user_id FROM public.hosts WHERE building_id = building_id AND status = 'active'
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
      WHERE h.building_id = building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  );

-- O) chat_message_reads Policies
DROP POLICY IF EXISTS cmr_insert_policy ON public.chat_message_reads;
CREATE POLICY cmr_insert_policy ON public.chat_message_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cmr_select_policy ON public.chat_message_reads;
CREATE POLICY cmr_select_policy ON public.chat_message_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- P) building_contacts Policies
DROP POLICY IF EXISTS "Hosts and residents can view building contacts" ON public.building_contacts;
CREATE POLICY "Hosts and residents can view building contacts" ON public.building_contacts FOR SELECT TO authenticated USING (public.is_host_of(building_id) OR public.is_resident_of(building_id));

DROP POLICY IF EXISTS "Hosts can add building contacts" ON public.building_contacts;
CREATE POLICY "Hosts can add building contacts" ON public.building_contacts FOR INSERT TO authenticated WITH CHECK (public.is_host_of(building_id));

DROP POLICY IF EXISTS "Hosts can update building contacts" ON public.building_contacts;
CREATE POLICY "Hosts can update building contacts" ON public.building_contacts FOR UPDATE TO authenticated USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

DROP POLICY IF EXISTS "Hosts can delete building contacts" ON public.building_contacts;
CREATE POLICY "Hosts can delete building contacts" ON public.building_contacts FOR DELETE TO authenticated USING (public.is_host_of(building_id));

-- ==========================================
-- 8) Storage RLS Policies
-- ==========================================

-- maintenance-qr policies
DROP POLICY IF EXISTS "maint_qr_public_read" ON storage.objects;
CREATE POLICY "maint_qr_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'maintenance-qr');

DROP POLICY IF EXISTS "maint_qr_host_insert" ON storage.objects;
CREATE POLICY "maint_qr_host_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'maintenance-qr' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "maint_qr_host_update" ON storage.objects;
CREATE POLICY "maint_qr_host_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'maintenance-qr' AND public.is_host_of(((storage.foldername(name))[1])::uuid)) WITH CHECK (bucket_id = 'maintenance-qr' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "maint_qr_host_delete" ON storage.objects;
CREATE POLICY "maint_qr_host_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'maintenance-qr' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

-- building-photos policies
DROP POLICY IF EXISTS "building_photos_public_read" ON storage.objects;
CREATE POLICY "building_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'building-photos');

DROP POLICY IF EXISTS "building_photos_host_insert" ON storage.objects;
CREATE POLICY "building_photos_host_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'building-photos' AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "building_photos_host_update" ON storage.objects;
CREATE POLICY "building_photos_host_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'building-photos' AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND public.is_host_of(((storage.foldername(name))[1])::uuid)) WITH CHECK (bucket_id = 'building-photos' AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "building_photos_host_delete" ON storage.objects;
CREATE POLICY "building_photos_host_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'building-photos' AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND public.is_host_of(((storage.foldername(name))[1])::uuid));

-- ==========================================
-- 9) Realtime & Publications Setup
-- ==========================================
ALTER TABLE public.room_maintenance_status REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_categories REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.room_maintenance_status;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_categories;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END$$;

-- ==========================================
-- 10) Roles & Permissions Setup
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.is_host_of(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_resident_of(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_building_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_buildings_by_codes(TEXT[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recalc_per_room_amounts(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_building(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rooms_recalc_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rjr_touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hosts_guard_privileged_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rms_guard_resident_update() FROM PUBLIC, anon, authenticated;
