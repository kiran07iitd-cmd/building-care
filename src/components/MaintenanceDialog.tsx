import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Pencil, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { inr, categoryIcon } from "@/lib/money";
import {
  getMaintenanceData,
  saveMaintenanceCategory,
  toggleMaintenanceCategory,
} from "@/lib/building-management.functions";

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

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";

export function MaintenanceDialog({
  buildingId,
  open,
  onOpenChange,
}: {
  buildingId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const fetchMaintenance = useServerFn(getMaintenanceData);
  const saveCategory = useServerFn(saveMaintenanceCategory);
  const setCategoryActive = useServerFn(toggleMaintenanceCategory);

  const [loading, setLoading] = useState(true);
  const [activeRoomCount, setActiveRoomCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    total_amount: "",
    penalty_amount: "",
    upi_id: "",
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenance({ data: { buildingId } });
      setActiveRoomCount(data.activeRoomCount);
      setCategories(data.categories as Category[]);
      setQrUrls(data.qrUrls);
    } catch (e) {
      toast.error(errorMessage(e));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, buildingId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", total_amount: "", penalty_amount: "", upi_id: "" });
    setQrFile(null);
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: "",
      total_amount: String(c.total_amount),
      penalty_amount: String(c.penalty_amount),
      upi_id: c.upi_id ?? "",
    });
    setQrFile(null);
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(form.total_amount);
    const penalty = parseFloat(form.penalty_amount);
    if (!form.name.trim()) return toast.error("Maintenance name required");
    if (isNaN(total) || total < 0) return toast.error("Valid total amount required");
    if (isNaN(penalty) || penalty < 0) return toast.error("Valid penalty amount required");

    setSaving(true);
    let qrPath = editing?.qr_code_image ?? null;
    if (qrFile) {
      const ext = qrFile.name.split(".").pop() || "png";
      const path = `${buildingId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("maintenance-qr")
        .upload(path, qrFile, { upsert: false, contentType: qrFile.type });
      if (upErr) {
        setSaving(false);
        return toast.error(upErr.message);
      }
      qrPath = path;
    }

    const name = form.description.trim()
      ? `${form.name.trim()} — ${form.description.trim()}`
      : form.name.trim();

    try {
      await saveCategory({
        data: {
          buildingId,
          categoryId: editing?.id,
          name,
          totalAmount: total,
          penaltyAmount: penalty,
          upiId: form.upi_id.trim() || null,
          qrCodeImage: qrPath,
        },
      });
      toast.success(editing ? "Maintenance updated" : "Maintenance added successfully");
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    setBusy(c.id);
    try {
      await setCategoryActive({
        data: { buildingId, categoryId: c.id, isActive: !c.is_active },
      });
      toast.success(c.is_active ? "Deactivated" : "Activated");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>Manage Maintenance</DialogTitle>
              <DialogDescription>
                {activeRoomCount} active room{activeRoomCount === 1 ? "" : "s"} · Per-room amount
                auto-calculates from total ÷ active rooms
              </DialogDescription>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add Maintenance
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : categories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No maintenance yet. Click "Add Maintenance" to add one (e.g. Light Bill, Water, Cleaning).
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((c) => (
              <Card key={c.id} className="p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{categoryIcon(c.name)}</span>
                    <h3 className="font-semibold truncate">{c.name}</h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-0.5 text-sm">
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
                      <span className="font-mono text-xs truncate max-w-[140px]">{c.upi_id}</span>
                    </div>
                  )}
                </div>
                {qrUrls[c.id] ? (
                  <img
                    src={qrUrls[c.id]}
                    alt="QR"
                    className="mt-2 h-20 w-20 rounded border object-contain"
                  />
                ) : (
                  <div className="mt-2 flex h-20 w-20 items-center justify-center rounded border text-xs text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="mt-2 flex gap-2">
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

        {/* Add / edit form dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Maintenance" : "Add Maintenance"}</DialogTitle>
              <DialogDescription>
                Fill in details for this maintenance charge. Per-room = total ÷ {activeRoomCount || 0}{" "}
                active rooms.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div>
                <Label>Name / Type *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Light Bill, Water, Cleaning, Security"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <Label>Details / Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Common area electricity for Nov 2025"
                  maxLength={120}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Total amount (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.total_amount}
                    onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                    placeholder="e.g. 5000"
                    required
                  />
                </div>
                <div>
                  <Label>Late penalty (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.penalty_amount}
                    onChange={(e) => setForm({ ...form, penalty_amount: e.target.value })}
                    placeholder="e.g. 100"
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
                  maxLength={80}
                />
              </div>
              <div>
                <Label>QR code image (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                >
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
      </DialogContent>
    </Dialog>
  );
}
