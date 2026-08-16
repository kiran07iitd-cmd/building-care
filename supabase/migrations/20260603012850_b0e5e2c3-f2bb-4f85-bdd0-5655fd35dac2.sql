
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_room_id UUID,
  related_category_id UUID,
  related_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_receiver ON public.notifications(receiver_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_building ON public.notifications(building_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (receiver_id = auth.uid());

CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Any authenticated user can create notifications (needed for flat owners notifying hosts,
-- and hosts notifying flat owners). The receiver_id and content are determined by app logic.
CREATE POLICY "notif_insert_auth"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
