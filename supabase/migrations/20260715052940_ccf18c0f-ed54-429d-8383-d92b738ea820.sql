
CREATE TABLE public.room_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  applicant_name TEXT NOT NULL DEFAULT '',
  applicant_email TEXT NOT NULL DEFAULT '',
  applicant_mobile TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT room_join_requests_status_check CHECK (status IN ('pending','approved','rejected'))
);

CREATE INDEX idx_rjr_building ON public.room_join_requests(building_id, status);
CREATE INDEX idx_rjr_user ON public.room_join_requests(requested_by, status);
CREATE UNIQUE INDEX rjr_one_pending_per_user_building
  ON public.room_join_requests(building_id, requested_by)
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_join_requests TO authenticated;
GRANT ALL ON public.room_join_requests TO service_role;

ALTER TABLE public.room_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rjr_select_own_or_host" ON public.room_join_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.is_host_of(building_id));

CREATE POLICY "rjr_insert_own" ON public.room_join_requests
  FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() AND status = 'pending');

CREATE POLICY "rjr_update_host" ON public.room_join_requests
  FOR UPDATE TO authenticated
  USING (public.is_host_of(building_id))
  WITH CHECK (public.is_host_of(building_id));

CREATE POLICY "rjr_delete_own_pending" ON public.room_join_requests
  FOR DELETE TO authenticated
  USING (requested_by = auth.uid() AND status = 'pending');

CREATE OR REPLACE FUNCTION public.rjr_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER rjr_updated_at
  BEFORE UPDATE ON public.room_join_requests
  FOR EACH ROW EXECUTE FUNCTION public.rjr_touch_updated_at();
