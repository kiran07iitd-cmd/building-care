import { r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { t as toast } from "../_libs/sonner.mjs";
function useRequireHost(buildingId) {
  const navigate = useNavigate();
  const [checking, setChecking] = reactExports.useState(true);
  const [isHost, setIsHost] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        if (!cancelled) navigate({ to: "/auth" });
        return;
      }
      const { data, error } = await supabase.from("hosts").select("id").eq("building_id", buildingId).eq("user_id", uid).eq("status", "active").maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Only active hosts of this building can access that page");
        navigate({ to: "/building/$id", params: { id: buildingId } });
        return;
      }
      setIsHost(true);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [buildingId, navigate]);
  return { checking, isHost };
}
export {
  useRequireHost as u
};
