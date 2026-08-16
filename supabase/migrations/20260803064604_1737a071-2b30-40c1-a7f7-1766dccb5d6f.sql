REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rooms_recalc_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rjr_touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_per_room_amounts(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_host_of(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_host_of(uuid) TO authenticated;