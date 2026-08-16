CREATE OR REPLACE FUNCTION public.delete_building(building_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_primary_host BOOLEAN;
BEGIN
  -- Check if the calling user is the primary host of the building
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

  -- Delete all associated data
  
  -- 1. room users (references rooms, room_users does not have building_id directly)
  DELETE FROM public.room_users
  WHERE room_id IN (SELECT id FROM public.rooms WHERE building_id = building_id_to_delete);
  
  -- 2. room maintenance status
  DELETE FROM public.room_maintenance_status
  WHERE building_id = building_id_to_delete;

  -- 3. host requests and votes
  DELETE FROM public.host_request_votes
  WHERE host_id IN (SELECT id FROM public.hosts WHERE building_id = building_id_to_delete)
     OR request_id IN (SELECT id FROM public.host_requests WHERE building_id = building_id_to_delete);
     
  DELETE FROM public.host_requests
  WHERE building_id = building_id_to_delete;

  -- 4. chat messages
  DELETE FROM public.chat_messages
  WHERE building_id = building_id_to_delete;

  -- 5. building contacts
  DELETE FROM public.building_contacts
  WHERE building_id = building_id_to_delete;

  -- 6. monthly maintenance
  DELETE FROM public.monthly_maintenance
  WHERE building_id = building_id_to_delete;

  -- 7. maintenance categories
  DELETE FROM public.maintenance_categories
  WHERE building_id = building_id_to_delete;

  -- 8. room join requests
  DELETE FROM public.room_join_requests
  WHERE building_id = building_id_to_delete;

  -- 9. starred buildings
  DELETE FROM public.starred_buildings
  WHERE building_id = building_id_to_delete;

  -- 10. notifications
  DELETE FROM public.notifications
  WHERE building_id = building_id_to_delete;

  -- 11. hosts
  DELETE FROM public.hosts
  WHERE building_id = building_id_to_delete;

  -- 12. rooms
  DELETE FROM public.rooms
  WHERE building_id = building_id_to_delete;

  -- 13. the building itself
  DELETE FROM public.buildings
  WHERE id = building_id_to_delete;
END;
$$;
