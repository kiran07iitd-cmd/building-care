CREATE TABLE public.room_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE UNIQUE INDEX room_users_one_active_per_room
  ON public.room_users(room_id) WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_users TO authenticated;
GRANT ALL ON public.room_users TO service_role;

ALTER TABLE public.room_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_users_select_auth" ON public.room_users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "room_users_write_host" ON public.room_users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_users.room_id AND public.is_host_of(r.building_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_users.room_id AND public.is_host_of(r.building_id)));
