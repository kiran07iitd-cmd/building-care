import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImagePlus, X, Loader2, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { uploadBuildingPhoto } from "@/lib/building-photo";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { registerNewBuilding } from "@/lib/building-management.functions";

export const Route = createFileRoute("/_authenticated/register-building")({
  head: () => ({ meta: [{ title: "Register Building — BuildingCare" }] }),
  component: RegisterBuilding,
});

function RegisterBuilding() {
  const { activeRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [hostCount, setHostCount] = useState("1");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createBuildingFn = useServerFn(registerNewBuilding);

  const onPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      return toast.error("Only JPG, PNG or WEBP images allowed");
    }
    if (f.size > 5 * 1024 * 1024) {
      return toast.error("Image too large (max 5MB)");
    }
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return toast.error("Name and location are required");
    if (activeRole !== "host") {
      return toast.error("403 Forbidden: Only hosts can register buildings");
    }
    setBusy(true);

    try {
      const result = await createBuildingFn({
        data: {
          name: name.trim(),
          location: location.trim(),
          hostCount: parseInt(hostCount, 10),
          activeRole,
        },
      });

      if (!result?.building) {
        throw new Error("Failed to create building");
      }

      const buildingId = result.building.id;
      const code = result.building.unique_code;

      if (photo) {
        try {
          const { path } = await uploadBuildingPhoto(photo, buildingId);
          await supabase.from("buildings").update({ photo_url: path }).eq("id", buildingId);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "try again later";
          toast.error(`Photo upload failed: ${message}`);
        }
      }

      toast.success(`Building created! Share code ${code} with residents.`);
      navigate({ to: "/building/$id", params: { id: buildingId } });
    } catch (err: any) {
      console.error("Register building error:", err);
      const errMsg = err?.message || err?.error || "Could not create building";
      if (errMsg.includes("403") || errMsg.toLowerCase().includes("forbidden")) {
        toast.error("403 Forbidden: Only active hosts can register buildings");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setBusy(false);
    }
  };

  // 403 Forbidden State when active role is not Host
  if (activeRole !== "host") {
    return (
      <div className="container mx-auto max-w-xl px-4 py-12">
        <Card className="border-destructive/30 p-6 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-destructive">403 Forbidden</h2>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Access Restricted to Host Mode
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Building registration is only permitted when logged in with the active role set to{" "}
            <strong className="text-foreground">Host</strong>. Your current session is set to{" "}
            <strong className="text-foreground">Living Person Mode</strong>.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            To register a new building, please sign out and select <strong>Host</strong> on the login
            screen.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={async () => {
                await signOut();
                toast.success("Signed out. Select Host on the login screen.");
                navigate({ to: "/auth" });
              }}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out & Log In as Host
            </Button>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Link
        to="/profile"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Profile
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Register New Building</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bn">Building Name</Label>
              <Input id="bn" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bl">Location</Label>
              <Input
                id="bl"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label>Number of Hosts allowed</Label>
              <Select value={hostCount} onValueChange={setHostCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Building Photo (optional)</Label>
              {photoPreview ? (
                <div className="relative mt-2 overflow-hidden rounded-md border">
                  <img src={photoPreview} alt="Preview" className="h-40 w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={clearPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-accent/30">
                  <ImagePlus className="mb-1 h-5 w-5" />
                  Click to upload (JPG/PNG/WEBP, max 5MB)
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onPhotoSelect}
                  />
                </label>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {busy ? "Creating…" : "Create Building"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

