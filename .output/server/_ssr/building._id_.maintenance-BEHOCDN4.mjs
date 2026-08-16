import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn, g as getMaintenanceData, m as applyCurrentMonthPenalties, t as toggleMaintenanceCategory, s as saveMaintenanceCategory } from "./building-management.functions-CqYXvTLm.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as categoryIcon, i as inr, c as currentMonth } from "./money-DTY0MBx9.mjs";
import { u as useRequireHost } from "./use-require-host-CFEB9FQj.mjs";

import "../_libs/seroval.mjs";
import { a as LoaderCircle, c as ChevronRight, P as Plus, o as Image, p as Pencil } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./server-CRlammpZ.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./auth-middleware-1oyI6D-P.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
const errorMessage = (error) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
function MaintenancePage() {
  const {
    id
  } = useParams({
    from: "/_authenticated/building/$id_/maintenance"
  });
  useRequireHost(id);
  const navigate = useNavigate();
  const fetchMaintenance = useServerFn(getMaintenanceData);
  const saveCategory = useServerFn(saveMaintenanceCategory);
  const setCategoryActive = useServerFn(toggleMaintenanceCategory);
  const applyPenaltiesToMonth = useServerFn(applyCurrentMonthPenalties);
  const [loading, setLoading] = reactExports.useState(true);
  const [buildingName, setBuildingName] = reactExports.useState("");
  const [activeRoomCount, setActiveRoomCount] = reactExports.useState(0);
  const [categories, setCategories] = reactExports.useState([]);
  const [qrUrls, setQrUrls] = reactExports.useState({});
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    total_amount: "",
    penalty_amount: "",
    upi_id: ""
  });
  const [qrFile, setQrFile] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(null);
  const [penaltyBusy, setPenaltyBusy] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenance({
        data: {
          buildingId: id
        }
      });
      setBuildingName(data.buildingName);
      setActiveRoomCount(data.activeRoomCount);
      setCategories(data.categories);
      setQrUrls(data.qrUrls);
    } catch (error) {
      toast.error(errorMessage(error));
      navigate({
        to: "/building/$id",
        params: {
          id
        }
      });
      return;
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, [id]);
  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      total_amount: "",
      penalty_amount: "",
      upi_id: ""
    });
    setQrFile(null);
    setDialogOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      total_amount: String(c.total_amount),
      penalty_amount: String(c.penalty_amount),
      upi_id: c.upi_id ?? ""
    });
    setQrFile(null);
    setDialogOpen(true);
  };
  const save = async (e) => {
    e.preventDefault();
    const total = parseFloat(form.total_amount);
    const penalty = parseFloat(form.penalty_amount);
    if (!form.name.trim()) return toast.error("Category name required");
    if (isNaN(total) || total < 0) return toast.error("Valid total amount required");
    if (isNaN(penalty) || penalty < 0) return toast.error("Valid penalty amount required");
    setSaving(true);
    let qrPath = editing?.qr_code_image ?? null;
    if (qrFile) {
      const ext = qrFile.name.split(".").pop() || "png";
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const {
        error: upErr
      } = await supabase.storage.from("maintenance-qr").upload(path, qrFile, {
        upsert: false,
        contentType: qrFile.type
      });
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
          qrCodeImage: qrPath
        }
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
  const toggleActive = async (c) => {
    setBusy(c.id);
    try {
      await setCategoryActive({
        data: {
          buildingId: id,
          categoryId: c.id,
          isActive: !c.is_active
        }
      });
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
      const result = await applyPenaltiesToMonth({
        data: {
          buildingId: id,
          month
        }
      });
      if (result.updated === 0) toast.message("No unpaid rooms this month");
      else toast.success(`Penalties applied to ${result.updated} room(s)`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPenaltyBusy(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading maintenance…"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
        id
      }, className: "hover:text-foreground", children: buildingName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Maintenance" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Maintenance Categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          activeRoomCount,
          " active room",
          activeRoomCount === 1 ? "" : "s",
          " · Per-room amounts auto-calculate"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
          id
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Back to Building" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: applyPenalties, disabled: penaltyBusy, children: [
          penaltyBusy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Apply Penalties"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add Category"
        ] })
      ] })
    ] }),
    categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: 'No categories yet. Click "Add Category" to create your first one.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: categoryIcon(c.name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: c.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`, children: c.is_active ? "Active" : "Inactive" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inr(c.total_amount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Per room" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: inr(c.per_room_amount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Penalty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: inr(c.penalty_amount) })
        ] }),
        c.upi_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "UPI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: c.upi_id })
        ] })
      ] }),
      qrUrls[c.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: qrUrls[c.id], alt: "QR", className: "mt-3 h-24 w-24 rounded border object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex h-24 w-24 items-center justify-center rounded border text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEdit(c), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-1 h-3.5 w-3.5" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: c.is_active ? "destructive" : "default", onClick: () => toggleActive(c), disabled: busy === c.id, children: busy === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : c.is_active ? "Deactivate" : "Activate" })
      ] })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Category" : "Add Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Per-room amount = total ÷ ",
          activeRoomCount || 0,
          " active rooms"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }), placeholder: "e.g. Light Bill", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total amount (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.total_amount, onChange: (e) => setForm({
              ...form,
              total_amount: e.target.value
            }), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Penalty amount (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.penalty_amount, onChange: (e) => setForm({
              ...form,
              penalty_amount: e.target.value
            }), required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UPI ID (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.upi_id, onChange: (e) => setForm({
            ...form,
            upi_id: e.target.value
          }), placeholder: "name@bank" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "QR code image (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", accept: "image/*", onChange: (e) => setQrFile(e.target.files?.[0] || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
            saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            editing ? "Update" : "Add"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  MaintenancePage as component
};
