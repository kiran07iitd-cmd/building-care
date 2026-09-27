BEGIN;

-- The UI only needs to look up a building when the caller knows its code.
-- Remove table-wide reads and expose member reads through scoped policies.
DROP POLICY IF EXISTS buildings_select_all_auth ON public.buildings;
CREATE POLICY buildings_select_member ON public.buildings
FOR SELECT TO authenticated
USING (
  created_by = (SELECT auth.uid())
  OR public.is_host_of(id)
  OR public.is_resident_of(id)
);

DROP POLICY IF EXISTS rooms_select_auth ON public.rooms;
CREATE POLICY rooms_select_member ON public.rooms
FOR SELECT TO authenticated
USING (
  public.is_host_of(building_id)
  OR public.is_resident_of(building_id)
);

-- Building creation is handled by the authenticated server function, which
-- creates both the building and its primary host as one trusted operation.
DROP POLICY IF EXISTS buildings_insert_auth ON public.buildings;
DROP POLICY IF EXISTS buildings_insert_host ON public.buildings;
REVOKE INSERT ON TABLE public.buildings FROM PUBLIC, anon, authenticated;

CREATE TABLE public.building_code_lookup_rate_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_started_at timestamptz NOT NULL,
  attempt_count integer NOT NULL CHECK (attempt_count > 0)
);

ALTER TABLE public.building_code_lookup_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.building_code_lookup_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.building_code_lookup_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_building_code_lookup(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempts integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authenticated user required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.building_code_lookup_rate_limits (user_id, window_started_at, attempt_count)
  VALUES (_user_id, now(), 1)
  ON CONFLICT (user_id) DO UPDATE
  SET window_started_at = CASE
        WHEN public.building_code_lookup_rate_limits.window_started_at < now() - interval '15 minutes'
          THEN now()
        ELSE public.building_code_lookup_rate_limits.window_started_at
      END,
      attempt_count = CASE
        WHEN public.building_code_lookup_rate_limits.window_started_at < now() - interval '15 minutes'
          THEN 1
        ELSE public.building_code_lookup_rate_limits.attempt_count + 1
      END
  RETURNING attempt_count INTO attempts;

  RETURN attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_building_code_lookup(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_building_code_lookup(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.lookup_building_by_code(search_code text)
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  unique_code text,
  photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_id uuid := auth.uid();
  normalized_code text := upper(regexp_replace(btrim(search_code), '\s+', '', 'g'));
  attempts integer;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF normalized_code !~ '^B-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$' THEN
    RETURN;
  END IF;

  attempts := public.consume_building_code_lookup(caller_id);

  IF attempts > 10 THEN
    RAISE EXCEPTION 'Too many building-code lookups; try again later' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT b.id, b.name, b.location, b.unique_code, b.photo_url
  FROM public.buildings AS b
  WHERE b.unique_code = normalized_code
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_building_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_building_by_code(text) TO authenticated;

-- Retire the previous arbitrary-list lookup, which had no rate limit.
DROP FUNCTION IF EXISTS public.get_buildings_by_codes(text[]);

-- Every chat thread must belong to an active resident of the referenced
-- building. A resident may write only as themselves; hosts may write only
-- while active in that building.
DROP POLICY IF EXISTS "chat select resident or host" ON public.chat_messages;
DROP POLICY IF EXISTS "chat insert resident or host" ON public.chat_messages;
DROP POLICY IF EXISTS "chat update read flags" ON public.chat_messages;
DROP POLICY IF EXISTS chat_select_policy ON public.chat_messages;
DROP POLICY IF EXISTS chat_insert_policy ON public.chat_messages;
DROP POLICY IF EXISTS chat_update_policy ON public.chat_messages;

CREATE POLICY chat_select_member_thread ON public.chat_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.room_users AS ru
    JOIN public.rooms AS r ON r.id = ru.room_id
    WHERE r.building_id = chat_messages.building_id
      AND ru.user_id = chat_messages.resident_id
      AND ru.status = 'active'
  )
  AND (
    (resident_id = (SELECT auth.uid()) AND public.is_resident_of(building_id))
    OR public.is_host_of(building_id)
  )
);

CREATE POLICY chat_insert_member_thread ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.room_users AS ru
    JOIN public.rooms AS r ON r.id = ru.room_id
    WHERE r.building_id = chat_messages.building_id
      AND ru.user_id = chat_messages.resident_id
      AND ru.status = 'active'
  )
  AND (
    (resident_id = (SELECT auth.uid()) AND public.is_resident_of(building_id))
    OR public.is_host_of(building_id)
  )
);

REVOKE UPDATE ON TABLE public.chat_messages FROM PUBLIC, anon, authenticated;

COMMIT;