
-- PROFILES (mirrors the "users" table in the spec; FK to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  mobile TEXT,
  google_account TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile, google_account)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    CASE WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN NEW.email ELSE NULL END
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BUILDINGS
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  unique_code TEXT UNIQUE NOT NULL,
  host_count INT NOT NULL DEFAULT 1 CHECK (host_count BETWEEN 1 AND 5),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.buildings TO authenticated;
GRANT ALL ON public.buildings TO service_role;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- HOSTS
CREATE TABLE public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(building_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.hosts TO authenticated;
GRANT ALL ON public.hosts TO service_role;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a host of the building?
CREATE OR REPLACE FUNCTION public.is_host_of(_building_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hosts
    WHERE building_id = _building_id AND user_id = auth.uid() AND status = 'active'
  );
$$;

-- Buildings policies
CREATE POLICY "buildings_select_all_auth" ON public.buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "buildings_insert_auth" ON public.buildings FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "buildings_update_host" ON public.buildings FOR UPDATE TO authenticated USING (public.is_host_of(id));

-- Hosts policies
CREATE POLICY "hosts_select_auth" ON public.hosts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hosts_insert_self_or_host" ON public.hosts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_host_of(building_id));
CREATE POLICY "hosts_update_host" ON public.hosts FOR UPDATE TO authenticated USING (public.is_host_of(building_id));

-- ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select_auth" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "rooms_write_host" ON public.rooms FOR ALL TO authenticated
  USING (public.is_host_of(building_id)) WITH CHECK (public.is_host_of(building_id));

-- HOST REQUESTS
CREATE TABLE public.host_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  new_user_email TEXT,
  new_user_mobile TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.host_requests TO authenticated;
GRANT ALL ON public.host_requests TO service_role;
ALTER TABLE public.host_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "host_requests_select_host" ON public.host_requests FOR SELECT TO authenticated USING (public.is_host_of(building_id));
CREATE POLICY "host_requests_insert_host" ON public.host_requests FOR INSERT TO authenticated
  WITH CHECK (public.is_host_of(building_id) AND auth.uid() = requested_by);
CREATE POLICY "host_requests_update_host" ON public.host_requests FOR UPDATE TO authenticated USING (public.is_host_of(building_id));

-- HOST REQUEST VOTES
CREATE TABLE public.host_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.host_requests(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, host_id)
);
GRANT SELECT, INSERT, UPDATE ON public.host_request_votes TO authenticated;
GRANT ALL ON public.host_request_votes TO service_role;
ALTER TABLE public.host_request_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_host" ON public.host_request_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.host_requests hr WHERE hr.id = request_id AND public.is_host_of(hr.building_id)));
CREATE POLICY "votes_insert_self_host" ON public.host_request_votes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.hosts h WHERE h.id = host_id AND h.user_id = auth.uid() AND h.status = 'active'));
