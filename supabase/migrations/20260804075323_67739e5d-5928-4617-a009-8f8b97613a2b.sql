-- 1) hosts: restrict self-service updates to own row; block privilege changes from client
DROP POLICY IF EXISTS hosts_update_host ON public.hosts;
CREATE POLICY hosts_update_own ON public.hosts
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.is_host_of(building_id))
WITH CHECK (user_id = auth.uid() AND public.is_host_of(building_id));

CREATE OR REPLACE FUNCTION public.hosts_guard_privileged_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- auth.uid() is NULL for trusted server-side (service role) calls
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

DROP TRIGGER IF EXISTS hosts_guard_privileged_changes ON public.hosts;
CREATE TRIGGER hosts_guard_privileged_changes
BEFORE UPDATE ON public.hosts
FOR EACH ROW EXECUTE FUNCTION public.hosts_guard_privileged_changes();

-- also require WITH CHECK on buildings updates so hosts stay scoped to their building
DROP POLICY IF EXISTS buildings_update_host ON public.buildings;
CREATE POLICY buildings_update_host ON public.buildings
FOR UPDATE TO authenticated
USING (public.is_host_of(id))
WITH CHECK (public.is_host_of(id));

-- 2) storage: scope building-photos writes to hosts of the building folder
DROP POLICY IF EXISTS building_photos_auth_insert ON storage.objects;
DROP POLICY IF EXISTS building_photos_auth_update ON storage.objects;
DROP POLICY IF EXISTS building_photos_auth_delete ON storage.objects;

CREATE POLICY building_photos_host_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'building-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_host_of(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY building_photos_host_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'building-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_host_of(((storage.foldername(name))[1])::uuid)
)
WITH CHECK (
  bucket_id = 'building-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_host_of(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY building_photos_host_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'building-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_host_of(((storage.foldername(name))[1])::uuid)
);

-- 3) room_maintenance_status: residents may only request payment, never self-verify
DROP POLICY IF EXISTS rms_owner_request_payment ON public.room_maintenance_status;
CREATE POLICY rms_owner_request_payment ON public.room_maintenance_status
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.room_users ru
    WHERE ru.room_id = room_maintenance_status.room_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.room_users ru
    WHERE ru.room_id = room_maintenance_status.room_id
      AND ru.user_id = auth.uid()
      AND ru.status = 'active'
  )
  AND payment_status = 'pending_verification'
  AND verified_at IS NULL
  AND verified_by IS NULL
);

CREATE OR REPLACE FUNCTION public.rms_guard_resident_update()
RETURNS trigger
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

DROP TRIGGER IF EXISTS rms_guard_resident_update ON public.room_maintenance_status;
CREATE TRIGGER rms_guard_resident_update
BEFORE UPDATE ON public.room_maintenance_status
FOR EACH ROW EXECUTE FUNCTION public.rms_guard_resident_update();