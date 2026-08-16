-- Chat messages between a resident and the building's hosts.
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  read_by_resident boolean NOT NULL DEFAULT false,
  read_by_host boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_thread_idx
  ON public.chat_messages (building_id, resident_id, created_at);

GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Resident sees their own thread; hosts of the building see all threads.
CREATE POLICY "chat select resident or host"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    resident_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hosts h
      WHERE h.building_id = chat_messages.building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  );

-- Resident may send in their own thread; hosts may send in any thread of their building.
CREATE POLICY "chat insert resident or host"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (resident_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.hosts h
        WHERE h.building_id = chat_messages.building_id
          AND h.user_id = auth.uid()
          AND h.status = 'active'
      )
    )
  );

-- Allow marking as read.
CREATE POLICY "chat update read flags"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (
    resident_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hosts h
      WHERE h.building_id = chat_messages.building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  )
  WITH CHECK (
    resident_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hosts h
      WHERE h.building_id = chat_messages.building_id
        AND h.user_id = auth.uid()
        AND h.status = 'active'
    )
  );
