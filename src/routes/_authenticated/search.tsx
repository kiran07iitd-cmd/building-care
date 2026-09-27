import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Search as SearchIcon, Loader2, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { fetchStarred, starBuilding, unstarBuilding } from "@/lib/starred";
import { BuildingPhoto } from "@/components/BuildingPhoto";
import { toast } from "sonner";
import { looksLikeBuildingCode, normalizeBuildingCode } from "@/lib/building-code";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Search Buildings — BuildingCare" }] }),
  component: SearchPage,
});

type Building = {
  id: string;
  name: string;
  location: string;
  unique_code: string;
  photo_url: string | null;
};

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Building[]>([]);
  const [searching, setSearching] = useState(false);
  const [starred, setStarred] = useState<string[]>([]);

  useEffect(() => {
    fetchStarred()
      .then(setStarred)
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const q = query.trim();

    // Enforce exact building-code-only search
    if (!looksLikeBuildingCode(q)) {
      setSearching(false);
      setResults([]);
      toast.info("Please enter the building code (e.g. B-7X4K92) to search.");
      return;
    }

    const code = normalizeBuildingCode(q);
    const { data, error } = await supabase.rpc("lookup_building_by_code", {
      search_code: code,
    });

    setSearching(false);
    if (error) return toast.error("Search failed. Please try again.");
    setResults((data as Building[]) || []);
    if (!data?.length)
      toast.info(`No building found for code ${code}. Ask your host to verify the code.`);
  };

  const toggleStar = async (b: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    const isStarred = starred.includes(b.id);
    const next = isStarred ? starred.filter((x) => x !== b.id) : [...starred, b.id];
    setStarred(next);
    try {
      if (isStarred) await unstarBuilding(b.id);
      else await starBuilding(b.id);
      toast.success(isStarred ? "Removed from starred" : "Starred");
    } catch {
      setStarred(starred);
      toast.error("Couldn't update star. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Search Buildings</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Enter an exact building code (e.g. B-7X4K92). Search by name is disabled — please ask your
        host for the code.
      </p>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          placeholder="Enter building code (B-7X4K92)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={searching} className="min-w-[44px]">
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </Button>
      </form>

      {results.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Start searching to find a building.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((b) => {
            const isStarred = starred.includes(b.id);
            return (
              <Card
                key={b.id}
                className="cursor-pointer overflow-hidden p-0 transition hover:border-primary hover:shadow-sm"
                onClick={() =>
                  navigate({
                    to: "/building/$id",
                    params: { id: b.id },
                    search: { code: b.unique_code },
                  })
                }
              >
                <div className="relative h-40 w-full">
                  <BuildingPhoto path={b.photo_url} alt={b.name} iconClassName="h-10 w-10" />
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
                    onClick={(e) => toggleStar(b, e)}
                    aria-label="Star"
                  >
                    <Star
                      className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-500" : ""}`}
                    />
                  </Button>
                </div>
                <div className="px-3 py-2">
                  <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                    {b.unique_code}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
