
-- 1. Notifications insert: only members of the building
DROP POLICY IF EXISTS notif_insert_auth ON public.notifications;
CREATE POLICY notif_insert_member ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_host_of(building_id)
    OR EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = notifications.building_id
        AND ru.user_id = auth.uid()
        AND ru.status = 'active'
    )
  );

-- 2. Hosts SELECT: self, host of building, or active resident
DROP POLICY IF EXISTS hosts_select_auth ON public.hosts;
CREATE POLICY hosts_select_member ON public.hosts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_host_of(building_id)
    OR EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = hosts.building_id
        AND ru.user_id = auth.uid()
        AND ru.status = 'active'
    )
  );

-- 3. Maintenance categories SELECT (contains upi_id / qr)
DROP POLICY IF EXISTS mc_select_auth ON public.maintenance_categories;
CREATE POLICY mc_select_member ON public.maintenance_categories
  FOR SELECT TO authenticated
  USING (
    public.is_host_of(building_id)
    OR EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = maintenance_categories.building_id
        AND ru.user_id = auth.uid()
        AND ru.status = 'active'
    )
  );

-- 4. Monthly maintenance SELECT
DROP POLICY IF EXISTS mm_select_auth ON public.monthly_maintenance;
CREATE POLICY mm_select_member ON public.monthly_maintenance
  FOR SELECT TO authenticated
  USING (
    public.is_host_of(building_id)
    OR EXISTS (
      SELECT 1 FROM public.room_users ru
      JOIN public.rooms r ON r.id = ru.room_id
      WHERE r.building_id = monthly_maintenance.building_id
        AND ru.user_id = auth.uid()
        AND ru.status = 'active'
    )
  );

-- 5. Room users SELECT
DROP POLICY IF EXISTS room_users_select_auth ON public.room_users;
CREATE POLICY room_users_select_member ON public.room_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_users.room_id AND public.is_host_of(r.building_id)
    )
  );

-- 6. Lock down maintenance-qr storage bucket to authenticated reads
DROP POLICY IF EXISTS "maint_qr_public_read" ON storage.objects;
CREATE POLICY "maint_qr_auth_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance-qr');

-- 7. Revoke EXECUTE from trigger-only SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rooms_recalc_trigger() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recalc_per_room_amounts(uuid) FROM PUBLIC;
-- is_host_of is used inside RLS policies, so it must remain callable by authenticated.
-- Restrict to authenticated only (drop anon/public).
REVOKE EXECUTE ON FUNCTION public.is_host_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_host_of(uuid) TO authenticated;
