BEGIN;

DROP POLICY IF EXISTS hosts_insert_self_or_host ON public.hosts;
REVOKE INSERT ON TABLE public.hosts FROM PUBLIC, anon, authenticated;

COMMIT;