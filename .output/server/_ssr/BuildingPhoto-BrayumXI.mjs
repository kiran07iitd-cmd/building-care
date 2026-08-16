import { s as supabase } from "./client-DjU25MuW.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as buildingPhotoSignedUrl } from "./building-photo-CFfezIdh.mjs";
import { B as Building2 } from "../_libs/lucide-react.mjs";
async function fetchStarred() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await supabase.from("starred_buildings").select("building_id").eq("user_id", u.user.id);
  if (error) return [];
  return (data || []).map((r) => r.building_id);
}
async function starBuilding(buildingId) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase.from("starred_buildings").insert({ user_id: u.user.id, building_id: buildingId });
  if (error && !error.message.includes("duplicate")) throw error;
}
async function unstarBuilding(buildingId) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase.from("starred_buildings").delete().eq("user_id", u.user.id).eq("building_id", buildingId);
  if (error) throw error;
}
function BuildingPhoto({
  path,
  alt,
  iconClassName = "h-12 w-12"
}) {
  const [url, setUrl] = reactExports.useState(null);
  const [failed, setFailed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    setFailed(false);
    setUrl(null);
    buildingPhotoSignedUrl(path).then((u) => {
      if (active) setUrl(u);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [path]);
  if (url && !failed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: url,
        alt,
        loading: "lazy",
        className: "h-full w-full object-cover",
        onError: () => setFailed(true)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: `${iconClassName} opacity-90` }) });
}
export {
  BuildingPhoto as B,
  fetchStarred as f,
  starBuilding as s,
  unstarBuilding as u
};
