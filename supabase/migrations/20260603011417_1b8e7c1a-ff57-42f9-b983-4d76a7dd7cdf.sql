-- 1) maintenance_categories
CREATE TABLE public.maintenance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  per_room_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  qr_code_image TEXT,
  upi_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_categories TO authenticated;
GRANT ALL ON public.maintenance_categories TO service_role;
ALTER TABLE public.maintenance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_select_auth" ON public.maintenance_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "mc_write_host" ON public.maintenance_categories
  FOR ALL TO authenticated
  USING (public.is_host_of(building_id))
  WITH CHECK (public.is_host_of(building_id));

-- 2) monthly_maintenance
CREATE TABLE public.monthly_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  building_id UUID NOT NULL,
  month TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  per_room_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_maintenance TO authenticated;
GRANT ALL ON public.monthly_maintenance TO service_role;
ALTER TABLE public.monthly_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mm_select_auth" ON public.monthly_maintenance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "mm_write_host" ON public.monthly_maintenance
  FOR ALL TO authenticated
  USING (public.is_host_of(building_id))
  WITH CHECK (public.is_host_of(building_id));

-- 3) room_maintenance_status
CREATE TABLE public.room_maintenance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_maintenance_id UUID NOT NULL,
  room_id UUID NOT NULL,
  category_id UUID NOT NULL,
  building_id UUID NOT NULL,
  month TEXT NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  penalty_applied BOOLEAN NOT NULL DEFAULT false,
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'not_paid',
  payment_requested_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(monthly_maintenance_id, room_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_maintenance_status TO authenticated;
GRANT ALL ON public.room_maintenance_status TO service_role;
ALTER TABLE public.room_maintenance_status ENABLE ROW LEVEL SECURITY;

-- Hosts can do anything in their building
CREATE POLICY "rms_host_all" ON public.room_maintenance_status
  FOR ALL TO authenticated
  USING (public.is_host_of(building_id))
  WITH CHECK (public.is_host_of(building_id));

-- Flat owners can SELECT their own assigned room's bills
CREATE POLICY "rms_owner_select" ON public.room_maintenance_status
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.room_users ru
    WHERE ru.room_id = room_maintenance_status.room_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  ));

-- Flat owners can mark their own bill as pending_verification
CREATE POLICY "rms_owner_request_payment" ON public.room_maintenance_status
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.room_users ru
    WHERE ru.room_id = room_maintenance_status.room_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.room_users ru
    WHERE ru.room_id = room_maintenance_status.room_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  ));

-- 4) Helper: recalc per_room_amount for a building
CREATE OR REPLACE FUNCTION public.recalc_per_room_amounts(_building_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
REVOKE EXECUTE ON FUNCTION public.recalc_per_room_amounts(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalc_per_room_amounts(UUID) TO authenticated, service_role;

-- 5) Trigger on rooms to recalc when active count changes
CREATE OR REPLACE FUNCTION public.rooms_recalc_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP TRIGGER IF EXISTS rooms_recalc_after_change ON public.rooms;
CREATE TRIGGER rooms_recalc_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.rooms_recalc_trigger();

-- 6) Storage policies for maintenance-qr bucket (bucket created via tool)
CREATE POLICY "maint_qr_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'maintenance-qr');
CREATE POLICY "maint_qr_host_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'maintenance-qr'
    AND public.is_host_of(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "maint_qr_host_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'maintenance-qr'
    AND public.is_host_of(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "maint_qr_host_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'maintenance-qr'
    AND public.is_host_of(((storage.foldername(name))[1])::uuid)
  );
