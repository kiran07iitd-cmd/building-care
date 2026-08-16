ALTER TABLE public.room_maintenance_status REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_categories REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_maintenance_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;