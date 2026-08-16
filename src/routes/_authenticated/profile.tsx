import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ChevronRight, LogOut, Building2, Search, Trash2, Crown, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — BuildingCare" }] }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  mobile: string | null;
  google_account: string | null;
  created_at: string;
};

type MyBuilding = { id: string; name: string; location: string; role: string };

function ProfilePage() {
  const { signOut, user, activeRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [myBuildings, setMyBuildings] = useState<MyBuilding[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const primaryHostedBuildings = myBuildings.filter((b) => b.role === "👑 Primary Host");
  const selectedBuilding = primaryHostedBuildings.find((b) => b.id === selectedBuildingId);
  const selectedBuildingName = selectedBuilding ? selectedBuilding.name : "";

  const handleDeleteBuilding = async () => {
    if (!selectedBuildingId) return;
    if (confirmText.trim() !== selectedBuildingName.trim()) {
      return toast.error("Verification text does not match building name");
    }

    setDeleting(true);
    try {
      const { error } = await (supabase as any).rpc("delete_building", {
        building_id_to_delete: selectedBuildingId,
      });

      if (error) {
        console.error("Delete building error:", error);
        if (error.message && error.message.includes("function delete_building")) {
          toast.error(
            "Database migration required: Please run the SQL migration (delete_building_rpc.sql) on your Supabase dashboard SQL Editor.",
            { duration: 6000 }
          );
        } else {
          toast.error(error.message || "Failed to delete building. Please try again.");
        }
        return;
      }

      toast.success(`Building "${selectedBuildingName}" deleted successfully`);
      setIsDeleteModalOpen(false);
      load();
    } catch (err: any) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const uid = u.user.id;
    const [{ data: p }, { data: hosts }, { data: rus }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("hosts").select("building_id,is_primary,status").eq("user_id", uid).eq("status", "active"),
      supabase.from("room_users").select("room_id,status").eq("user_id", uid).eq("status", "active"),
    ]);
    setProfile(p as Profile);
    setName(p?.name || "");
    setMobile(p?.mobile || "");

    const buildingIds = new Set<string>();
    const roleMap = new Map<string, string>();
    (hosts || []).forEach((h) => {
      buildingIds.add(h.building_id);
      roleMap.set(h.building_id, h.is_primary ? "👑 Primary Host" : "🔑 Host");
    });
    if (rus && rus.length) {
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id,building_id")
        .in("id", rus.map((r) => r.room_id));
      (rooms || []).forEach((r) => {
        buildingIds.add(r.building_id);
        if (!roleMap.has(r.building_id)) roleMap.set(r.building_id, "🏠 Resident");
      });
    }
    if (buildingIds.size) {
      const { data: bs } = await supabase
        .from("buildings")
        .select("id,name,location")
        .in("id", Array.from(buildingIds));
      setMyBuildings(
        (bs || []).map((b) => ({ ...b, role: roleMap.get(b.id) || "" })),
      );
    } else {
      setMyBuildings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10)
      return toast.error("Enter a valid mobile number");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), mobile: mobile.trim() })
      .eq("id", profile!.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save changes. Please try again.");
    toast.success("Profile updated");
    setEditing(false);
    load();
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Profile</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="mr-1 h-4 w-4" /> Sign out
        </Button>
      </div>

      <Card className="mb-6 p-5">
        {!editing ? (
          <div className="space-y-2 text-sm">
            <Row label="Name" value={profile?.name || "—"} />
            <Row label="Email" value={profile?.email || "—"} />
            <Row label="Mobile" value={profile?.mobile || "—"} />
            <Row label="Google" value={profile?.google_account || "Not linked"} />
            <Row
              label="Member since"
              value={profile ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
            />
            <div className="pt-3">
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Required for host verification"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      <h2 className="mb-3 text-lg font-semibold">🔐 Current Login Mode</h2>
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Session Mode:</span>
              <Badge
                variant={activeRole === "host" ? "default" : "secondary"}
                className="gap-1 px-2.5 py-0.5 text-xs font-semibold"
              >
                {activeRole === "host" ? (
                  <>
                    <Crown className="h-3.5 w-3.5 text-amber-300" /> Host Mode
                  </>
                ) : (
                  <>
                    <Home className="h-3.5 w-3.5 text-blue-500" /> Living Person Mode
                  </>
                )}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeRole === "host"
                ? "You are logged in under Host Mode. You can register new buildings and manage properties."
                : "You are logged in under Living Person Mode. Building registration is disabled. To switch modes, sign out and select Host on the login page."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            <LogOut className="mr-1 h-3.5 w-3.5" /> Switch Mode (Logout)
          </Button>
        </div>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">⚙️ My Account Actions</h2>
      <Card className="mb-6 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {activeRole === "host" && (
            <Link to="/register-building">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" /> 🏢 Register New Building
              </Button>
            </Link>
          )}
          <Link to="/search" className={activeRole !== "host" ? "sm:col-span-2" : ""}>
            <Button variant="outline" className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" /> 🔍 Search & Join Building
            </Button>
          </Link>
          {primaryHostedBuildings.length > 0 && (
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2"
              onClick={() => {
                setSelectedBuildingId(primaryHostedBuildings[0].id);
                setConfirmText("");
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> 🗑️ Remove Registered Building
            </Button>
          )}
        </div>
      </Card>



      <h2 className="mb-3 text-lg font-semibold">My Buildings</h2>
      {myBuildings.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          You're not a host or resident in any building yet.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {myBuildings.map((b) => (
            <Link key={b.id} to="/building/$id" params={{ id: b.id }}>
              <Card className="p-4 transition hover:border-primary hover:shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="text-sm text-muted-foreground">{b.location}</p>
                  </div>
                  <span className="rounded bg-accent px-2 py-0.5 text-xs">{b.role}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Registered Building
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-muted-foreground">
              This action is <strong className="text-foreground">permanent</strong> and cannot be undone. It will delete the building and all its associated data (rooms, residents, announcements, maintenance categories, monthly maintenance, and payments) from both the website and backend.
            </DialogDescription>
          </DialogHeader>

          {primaryHostedBuildings.length > 1 && (
            <div className="space-y-2 py-2">
              <Label htmlFor="building-select">Select Building to Delete</Label>
              <Select value={selectedBuildingId} onValueChange={(val) => { setSelectedBuildingId(val); setConfirmText(""); }}>
                <SelectTrigger id="building-select" className="w-full">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {primaryHostedBuildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      🏢 {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedBuildingName && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-xs text-destructive">
                <span className="font-semibold block mb-1">⚠️ Warning:</span>
                You are deleting <span className="font-bold underline">{selectedBuildingName}</span>. This action is irreversible.
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  To verify, type the name of the building below:
                </Label>
                <div className="rounded bg-muted p-2 font-mono text-xs select-all text-center font-bold text-foreground">
                  {selectedBuildingName}
                </div>
                <Input
                  className="mt-1"
                  placeholder="Type the exact building name to confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={deleting}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBuilding}
              disabled={deleting || confirmText.trim() !== selectedBuildingName.trim()}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Building"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
