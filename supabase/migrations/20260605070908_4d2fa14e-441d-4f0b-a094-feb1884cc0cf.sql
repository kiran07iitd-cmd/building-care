CREATE TABLE public.starred_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  building_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, building_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.starred_buildings TO authenticated;
GRANT ALL ON public.starred_buildings TO service_role;

ALTER TABLE public.starred_buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "starred_select_own" ON public.starred_buildings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "starred_insert_own" ON public.starred_buildings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "starred_delete_own" ON public.starred_buildings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_starred_user ON public.starred_buildings(user_id);