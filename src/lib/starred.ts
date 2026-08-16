import { supabase } from "@/integrations/supabase/client";

export async function fetchStarred(): Promise<string[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await supabase
    .from("starred_buildings")
    .select("building_id")
    .eq("user_id", u.user.id);
  if (error) return [];
  return (data || []).map((r) => r.building_id);
}

export async function starBuilding(buildingId: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("starred_buildings")
    .insert({ user_id: u.user.id, building_id: buildingId });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function unstarBuilding(buildingId: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("starred_buildings")
    .delete()
    .eq("user_id", u.user.id)
    .eq("building_id", buildingId);
  if (error) throw error;
}
