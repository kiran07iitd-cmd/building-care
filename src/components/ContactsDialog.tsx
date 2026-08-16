import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Phone } from "lucide-react";
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

type Contact = {
  id: string;
  building_id: string;
  name: string;
  service_type: string;
  phone: string;
  note: string | null;
  is_active: boolean;
};

const SERVICE_TYPES = [
  "Plumber",
  "Electrician",
  "Cleaner",
  "Security",
  "Carpenter",
  "Lift Technician",
  "Painter",
  "Gas Supply",
  "Emergency",
  "Other",
];

const serviceIcon = (t: string) => {
  const n = t.toLowerCase();
  if (n.includes("plumb")) return "🚰";
  if (n.includes("electric")) return "💡";
  if (n.includes("clean") || n.includes("sweep")) return "🧹";
  if (n.includes("security") || n.includes("guard")) return "🛡️";
  if (n.includes("carpent")) return "🪚";
  if (n.includes("lift") || n.includes("elevator")) return "🛗";
  if (n.includes("paint")) return "🎨";
  if (n.includes("gas")) return "🔥";
  if (n.includes("emergen")) return "🚨";
  return "📞";
};

export function ContactsDialog({
  buildingId,
  isHost,
  open,
  onOpenChange,
}: {
  buildingId: string;
  isHost: boolean;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    service_type: "Plumber",
    phone: "",
    note: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("building_contacts")
      .select("id, building_id, name, service_type, phone, note, is_active")
      .eq("building_id", buildingId)
      .order("service_type", { ascending: true });
    if (error) toast.error(error.message);
    setContacts((data as Contact[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, buildingId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", service_type: "Plumber", phone: "", note: "" });
    setFormOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({
      name: c.name,
      service_type: c.service_type,
      phone: c.phone,
      note: c.note ?? "",
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Contact name required");
    if (!form.phone.trim()) return toast.error("Phone number required");
    setSaving(true);
    const payload = {
      building_id: buildingId,
      name: form.name.trim(),
      service_type: form.service_type.trim(),
      phone: form.phone.trim(),
      note: form.note.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("building_contacts").update(payload).eq("id", editing.id)
      : await supabase.from("building_contacts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Contact updated" : "Contact added");
    setFormOpen(false);
    load();
  };

  const remove = async (c: Contact) => {
    setBusy(c.id);
    const { error } = await supabase.from("building_contacts").delete().eq("id", c.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Contact removed");
    load();
  };

  const visible = isHost ? contacts : contacts.filter((c) => c.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>{isHost ? "Contact List" : "Help & Contacts"}</DialogTitle>
              <DialogDescription>
                {isHost
                  ? "Add useful service contacts (plumber, electrician, cleaner, security…) for residents."
                  : "Useful contacts shared by your building host. Tap a number to call."}
              </DialogDescription>
            </div>
            {isHost && (
              <Button size="sm" onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" /> Add Contact
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : visible.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {isHost
              ? 'No contacts yet. Click "Add Contact" to add a plumber, electrician, cleaner or security number.'
              : "Your host has not added any contacts yet."}
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((c) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{serviceIcon(c.service_type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.service_type}</p>
                    <a
                      href={`tel:${c.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </a>
                    {c.note && (
                      <p className="mt-1 text-xs text-muted-foreground break-words">{c.note}</p>
                    )}
                  </div>
                </div>
                {isHost && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(c)}
                      disabled={busy === c.id}
                    >
                      {busy === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {isHost && (
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Contact" : "Add Contact"}</DialogTitle>
                <DialogDescription>
                  Residents will see this in the Help section of their building page.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <Label>Service type *</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Phone number *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Input
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="e.g. Available 9am–8pm"
                    maxLength={120}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
