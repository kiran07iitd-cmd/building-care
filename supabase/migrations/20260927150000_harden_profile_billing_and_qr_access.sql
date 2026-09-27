BEGIN;

-- Profile identity fields are populated by the auth trigger and must not be
-- writable through the public client API.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, mobile) ON TABLE public.profiles TO authenticated;

-- Keep public-client building edits to display fields only. Ownership, host
-- limits, and registration fields are controlled by trusted server code.
REVOKE UPDATE ON TABLE public.buildings FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, location, photo_url) ON TABLE public.buildings TO authenticated;

-- Host membership mutations are performed only by authenticated server
-- functions after checking the caller's active membership and request state.
DROP POLICY IF EXISTS hosts_update_own ON public.hosts;
DROP POLICY IF EXISTS hosts_update_host ON public.hosts;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.hosts FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS host_requests_insert_host ON public.host_requests;
DROP POLICY IF EXISTS host_requests_update_host ON public.host_requests;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.host_requests FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS votes_insert_self_host ON public.host_request_votes;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.host_request_votes FROM PUBLIC, anon, authenticated;

-- Join requests require the building code and the state transition is handled
-- by server functions, not caller-controlled table updates.
DROP POLICY IF EXISTS rjr_insert_own ON public.room_join_requests;
DROP POLICY IF EXISTS rjr_update_host ON public.room_join_requests;
DROP POLICY IF EXISTS rjr_delete_own_pending ON public.room_join_requests;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.room_join_requests FROM PUBLIC, anon, authenticated;

-- Billing recalculation is trigger/server-only; exposing this SECURITY DEFINER
-- function lets any authenticated user mutate another building's billing data.
REVOKE ALL ON FUNCTION public.recalc_per_room_amounts(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recalc_per_room_amounts(uuid) TO service_role;

-- The application issues signed URLs for this bucket, so it must not be public.
UPDATE storage.buckets
SET public = false
WHERE id = 'maintenance-qr';

DROP POLICY IF EXISTS maint_qr_public_read ON storage.objects;
DROP POLICY IF EXISTS maint_qr_auth_read ON storage.objects;
CREATE POLICY maint_qr_member_read ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'maintenance-qr'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_host_of(((storage.foldername(name))[1])::uuid)
      OR public.is_resident_of(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);

DROP POLICY IF EXISTS maint_qr_host_insert ON storage.objects;
CREATE POLICY maint_qr_host_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'maintenance-qr'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_host_of(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);

DROP POLICY IF EXISTS maint_qr_host_update ON storage.objects;
CREATE POLICY maint_qr_host_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'maintenance-qr'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_host_of(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
)
WITH CHECK (
  bucket_id = 'maintenance-qr'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_host_of(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);

DROP POLICY IF EXISTS maint_qr_host_delete ON storage.objects;
CREATE POLICY maint_qr_host_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'maintenance-qr'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_host_of(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);

-- Notifications must be sent by a building member to another member of that
-- same building, preventing cross-building spoofing and inbox injection.
DROP POLICY IF EXISTS notif_insert_auth ON public.notifications;
DROP POLICY IF EXISTS notif_insert_member ON public.notifications;
CREATE POLICY notif_insert_member ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  (
    public.is_host_of(building_id)
    OR public.is_resident_of(building_id)
  )
  AND (
    EXISTS (
      SELECT 1
      FROM public.hosts AS h
      WHERE h.building_id = notifications.building_id
        AND h.user_id = notifications.receiver_id
        AND h.status = 'active'
    )
    OR EXISTS (
      SELECT 1
      FROM public.room_users AS ru
      JOIN public.rooms AS r ON r.id = ru.room_id
      WHERE r.building_id = notifications.building_id
        AND ru.user_id = notifications.receiver_id
        AND ru.status = 'active'
    )
  )
);

ALTER FUNCTION public.delete_building(uuid) SET search_path = public;
REVOKE ALL ON FUNCTION public.delete_building(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_building(uuid) TO authenticated;

COMMIT;