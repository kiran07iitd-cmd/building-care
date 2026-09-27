-- Enforce the application upload limit at the storage service boundary.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'building-photos',
    'building-photos',
    true,
    4194304,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
  ),
  (
    'maintenance-qr',
    'maintenance-qr',
    false,
    4194304,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- These modes live in user-editable metadata, so they cannot authorize writes.
DROP POLICY IF EXISTS "buildings_insert_auth" ON public.buildings;
DROP POLICY IF EXISTS "buildings_insert_host" ON public.buildings;

-- Wrap direct auth.uid()/auth.jwt() policy calls in scalar subqueries so they
-- are evaluated once per statement rather than once for every candidate row.
DO $$
DECLARE
  policy_row record;
  policy_roles text;
  using_expression text;
  check_expression text;
  create_statement text;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        COALESCE(qual, '') ~* 'auth[.](uid|jwt)[[:space:]]*[(][[:space:]]*[)]'
        OR COALESCE(with_check, '') ~* 'auth[.](uid|jwt)[[:space:]]*[(][[:space:]]*[)]'
      )
  LOOP
    SELECT string_agg(
      CASE
        WHEN role_name = 'public' THEN 'PUBLIC'
        ELSE format('%I', role_name)
      END,
      ', ' ORDER BY role_position
    )
    INTO policy_roles
    FROM unnest(policy_row.roles) WITH ORDINALITY AS policy_role(role_name, role_position);

    using_expression := CASE
      WHEN policy_row.qual IS NULL THEN NULL
      ELSE regexp_replace(
        policy_row.qual,
        'auth[.](uid|jwt)[[:space:]]*[(][[:space:]]*[)]',
        '(SELECT auth.\1())',
        'gi'
      )
    END;
    check_expression := CASE
      WHEN policy_row.with_check IS NULL THEN NULL
      ELSE regexp_replace(
        policy_row.with_check,
        'auth[.](uid|jwt)[[:space:]]*[(][[:space:]]*[)]',
        '(SELECT auth.\1())',
        'gi'
      )
    END;

    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );

    create_statement := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename,
      policy_row.permissive,
      policy_row.cmd,
      policy_roles
    );
    IF using_expression IS NOT NULL THEN
      create_statement := create_statement || format(' USING (%s)', using_expression);
    END IF;
    IF check_expression IS NOT NULL THEN
      create_statement := create_statement || format(' WITH CHECK (%s)', check_expression);
    END IF;
    EXECUTE create_statement;
  END LOOP;
END;
$$;

CREATE POLICY "buildings_insert_auth" ON public.buildings
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = created_by);