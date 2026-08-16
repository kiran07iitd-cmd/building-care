CREATE OR REPLACE FUNCTION public.is_resident_of(_building_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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

REVOKE EXECUTE ON FUNCTION public.is_resident_of(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_resident_of(uuid) TO authenticated, service_role;

CREATE TABLE public.building_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name text NOT NULL,
  service_type text NOT NULL,
  phone text NOT NULL,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX building_contacts_building_idx ON public.building_contacts(building_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.building_contacts TO authenticated;
GRANT ALL ON public.building_contacts TO service_role;

ALTER TABLE public.building_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts and residents can view building contacts"
ON public.building_contacts FOR SELECT TO authenticated
USING (public.is_host_of(building_id) OR public.is_resident_of(building_id));

CREATE POLICY "Hosts can add building contacts"
ON public.building_contacts FOR INSERT TO authenticated
WITH CHECK (public.is_host_of(building_id));

CREATE POLICY "Hosts can update building contacts"
ON public.building_contacts FOR UPDATE TO authenticated
USING (public.is_host_of(building_id))
WITH CHECK (public.is_host_of(building_id));

CREATE POLICY "Hosts can delete building contacts"
ON public.building_contacts FOR DELETE TO authenticated
USING (public.is_host_of(building_id));

CREATE TRIGGER building_contacts_updated_at
BEFORE UPDATE ON public.building_contacts
FOR EACH ROW EXECUTE FUNCTION public.rjr_touch_updated_at();