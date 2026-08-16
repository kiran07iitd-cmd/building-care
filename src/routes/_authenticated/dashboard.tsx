import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Loader2, User, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchStarred, unstarBuilding } from "@/lib/starred";
import { BuildingPhoto } from "@/components/BuildingPhoto";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BuildingCare" }] }),
  component: Dashboard,
});

type Building = {
  id: string;
  name: string;
  location: string;
  unique_code: string;
  photo_url: string | null;
};

function roleBadge(role: string | null) {
  if (role === "primary") return "👑 Primary Host";
  if (role === "host") return "🔑 Host";
  if (role === "resident") return "🏠 Resident";
  return null;
}

function StarredCard({
  b,
  role,
  onUnstar,
}: {
  b: Building;
  role: string | null;
  onUnstar: (id: string) => void;
}) {
  const navigate = useNavigate();
  const badge = roleBadge(role);
  return (
    <Card
      className="cursor-pointer overflow-hidden p-0 transition hover:border-primary hover:shadow-md"
      onClick={() => navigate({ to: "/building/$id", params: { id: b.id } })}
    >
      <div className="relative h-40 w-full">
        <BuildingPhoto path={b.photo_url} alt={b.name} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="truncate font-semibold text-white">{b.name}</h3>
          <p className="flex items-center gap-1 text-xs text-white/90">
            <MapPin className="h-3 w-3" /> {b.location}
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8"
          aria-label="Unstar"
          onClick={(e) => {
            e.stopPropagation();
            onUnstar(b.id);
          }}
        >
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
          {b.unique_code}
        </span>
        {badge && <span className="text-xs font-medium text-muted-foreground">{badge}</span>}
      </div>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const ids = await fetchStarred();
      if (!ids.length) {
        setBuildings([]);
        setRoles({});
        return;
      }
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;

      const [{ data: bs, error: be }, { data: hosts }, { data: rus }] = await Promise.all([
        supabase
          .from("buildings")
          .select("id,name,location,unique_code,photo_url")
          .in("id", ids),
        supabase
          .from("hosts")
          .select("building_id,is_primary,status")
          .eq("user_id", uid!)
          .eq("status", "active")
          .in("building_id", ids),
        supabase
          .from("room_users")
          .select("room_id,status")
          .eq("user_id", uid!)
          .eq("status", "active"),
      ]);
      if (be) {
        toast.error("Couldn't load starred buildings");
        return;
      }
      const roleMap: Record<string, string> = {};
      (hosts || []).forEach((h) => {
        roleMap[h.building_id] = h.is_primary ? "primary" : "host";
      });
      if (rus?.length) {
        const { data: rooms } = await supabase
          .from("rooms")
          .select("id,building_id")
          .in("id", rus.map((r) => r.room_id));
        (rooms || []).forEach((r) => {
          if (!roleMap[r.building_id] && ids.includes(r.building_id)) {
            roleMap[r.building_id] = "resident";
          }
        });
      }
      setBuildings((bs as Building[]) || []);
      setRoles(roleMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnstar = async (id: string) => {
    const prev = buildings;
    setBuildings((cur) => cur.filter((b) => b.id !== id));
    try {
      await unstarBuilding(id);
      toast.success("Removed from starred");
    } catch {
      setBuildings(prev);
      toast.error("Couldn't unstar. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          {activeRole === "host" && (
            <Link to="/register-building">
              <Button className="gap-1">
                <Plus className="h-4 w-4" /> Register Building
              </Button>
            </Link>
          )}
          <Link to="/search">
            <Button variant="outline">
              <Search className="mr-1 h-4 w-4" /> Search
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">
              <User className="mr-1 h-4 w-4" /> Profile
            </Button>
          </Link>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold">⭐ My Buildings</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : buildings.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-2 text-3xl">⭐</div>
          <h3 className="mb-2 font-semibold">No buildings starred yet</h3>
          <p className="mx-auto mb-5 max-w-sm text-sm text-muted-foreground">
            Search your building from the search page and star it to see it here.
          </p>
          <Button onClick={() => navigate({ to: "/search" })}>
            <Search className="mr-1 h-4 w-4" /> Search Buildings
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <StarredCard key={b.id} b={b} role={roles[b.id] ?? null} onUnstar={handleUnstar} />
          ))}
        </div>
      )}
    </div>
  );
}
