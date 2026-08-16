import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Guards host-only routes. Redirects to the building overview if the current
 * user is not an active host of the given building.
 */
export function useRequireHost(buildingId: string) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        if (!cancelled) navigate({ to: "/auth" });
        return;
      }
      const { data, error } = await supabase
        .from("hosts")
        .select("id")
        .eq("building_id", buildingId)
        .eq("user_id", uid)
        .eq("status", "active")
        .maybeSingle();
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
