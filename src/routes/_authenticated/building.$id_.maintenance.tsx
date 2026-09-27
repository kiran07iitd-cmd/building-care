import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, Plus, Pencil, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { inr, categoryIcon, currentMonth } from "@/lib/money";
import {
  applyCurrentMonthPenalties,
  getMaintenanceData,
  saveMaintenanceCategory,
  toggleMaintenanceCategory,
} from "@/lib/building-management.functions";
import { useRequireHost } from "@/hooks/use-require-host";
import { getImageFileError } from "@/lib/image-file";

export const Route = createFileRoute("/_authenticated/building/$id_/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — BuildingCare" }] }),
  component: MaintenancePage,
});

type Category = {
  id: string;
  building_id: string;
  name: string;
  total_amount: number;
  per_room_amount: number;
  penalty_amount: number;
  qr_code_image: string | null;
  upi_id: string | null;
  is_active: boolean;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

function MaintenancePage() {
  const { id } = useParams({ from: "/_authenticated/building/$id_/maintenance" });
  useRequireHost(id);
  const navigate = useNavigate();
  const fetchMaintenance = useServerFn(getMaintenanceData);
  const saveCategory = useServerFn(saveMaintenanceCategory);
  const setCategoryActive = useServerFn(toggleMaintenanceCategory);
  const applyPenaltiesToMonth = useServerFn(applyCurrentMonthPenalties);
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState("");
  const [activeRoomCount, setActiveRoomCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    total_amount: "",
    penalty_amount: "",
    upi_id: "",
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [penaltyBusy, setPenaltyBusy] = useState(false);

  const onQrFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const validationError = file ? getImageFileError(file) : null;
    if (validationError) {
      event.target.value = "";
      toast.error(validationError);
      return;
    }
    setQrFile(file);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenance({ data: { buildingId: id } });
      setBuildingName(data.buildingName);
      setActiveRoomCount(data.activeRoomCount);
      setCategories(data.categories as Category[]);
      setQrUrls(data.qrUrls);
    } catch (error) {
      toast.error(errorMessage(error));
      navigate({ to: "/building/$id", params: { id } });
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", total_amount: "", penalty_amount: "", upi_id: "" });
    setQrFile(null);
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      total_amount: String(c.total_amount),
      penalty_amount: String(c.penalty_amount),
      upi_id: c.upi_id ?? "",
    });
    setQrFile(null);
    setDialogOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(form.total_amount);
    const penalty = parseFloat(form.penalty_amount);
    if (!form.name.trim()) return toast.error("Category name required");
    if (isNaN(total) || total < 0) return toast.error("Valid total amount required");
    if (isNaN(penalty) || penalty < 0) return toast.error("Valid penalty amount required");
    if (qrFile) {
      const validationError = getImageFileError(qrFile);
      if (validationError) return toast.error(validationError);
    }

    setSaving(true);
    let qrPath = editing?.qr_code_image ?? null;
    if (qrFile) {
      const ext = qrFile.name.split(".").pop() || "png";
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("maintenance-qr")
        .upload(path, qrFile, { upsert: false, contentType: qrFile.type });
      if (upErr) {
        setSaving(false);
        return toast.error(upErr.message);
      }
      qrPath = path;
    }

    try {
      await saveCategory({
        data: {
          buildingId: id,
          categoryId: editing?.id,
          name: form.name.trim(),
          totalAmount: total,
          penaltyAmount: penalty,
          upiId: form.upi_id.trim() || null,
          qrCodeImage: qrPath,
        },
      });
      toast.success(editing ? "Category updated" : "Category added successfully");
      setDialogOpen(false);
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    setBusy(c.id);
    try {
      await setCategoryActive({ data: { buildingId: id, categoryId: c.id, isActive: !c.is_active } });
      toast.success(c.is_active ? "Deactivated" : "Activated");
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const applyPenalties = async () => {
    if (!confirm("Apply penalties to all unpaid rooms for the current month?")) return;
    setPenaltyBusy(true);
    const month = currentMonth();
    try {
      const result = await applyPenaltiesToMonth({ data: { buildingId: id, month } });
      if (result.updated === 0) toast.message("No unpaid rooms this month");
      else toast.success(`Penalties applied to ${result.updated} room(s)`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPenaltyBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading maintenance…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/building/$id" params={{ id }} className="hover:text-foreground">
          {buildingName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Maintenance</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Categories</h1>
          <p className="text-sm text-muted-foreground">
            {activeRoomCount} active room{activeRoomCount === 1 ? "" : "s"} · Per-room amounts auto-calculate
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/building/$id" params={{ id }}>
            <Button variant="outline">Back to Building</Button>
          </Link>

          <Button variant="outline" onClick={applyPenalties} disabled={penaltyBusy}>
            {penaltyBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Apply Penalties
          </Button>
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No categories yet. Click "Add Category" to create your first one.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcon(c.name)}</span>
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{inr(c.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per room</span>
                  <span className="font-semibold text-primary">{inr(c.per_room_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="font-medium">{inr(c.penalty_amount)}</span>
                </div>
                {c.upi_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI</span>
                    <span className="font-mono text-xs">{c.upi_id}</span>
                  </div>
                )}
              </div>
              {qrUrls[c.id] ? (
                <img
                  src={qrUrls[c.id]}
                  alt="QR"
                  className="mt-3 h-24 w-24 rounded border object-contain"
                />
              ) : (
                <div className="mt-3 flex h-24 w-24 items-center justify-center rounded border text-xs text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant={c.is_active ? "destructive" : "default"}
                  onClick={() => toggleActive(c)}
                  disabled={busy === c.id}
                >
                  {busy === c.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : c.is_active ? (
                    "Deactivate"
                  ) : (
                    "Activate"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              Per-room amount = total ÷ {activeRoomCount || 0} active rooms
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div>
              <Label>Category name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Light Bill"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Total amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Penalty amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.penalty_amount}
                  onChange={(e) => setForm({ ...form, penalty_amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>UPI ID (optional)</Label>
              <Input
                value={form.upi_id}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                placeholder="name@bank"
              />
            </div>
            <div>
              <Label>QR code image (optional, max 4 MB)</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onQrFileSelect}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
