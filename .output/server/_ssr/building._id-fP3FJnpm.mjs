import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as buildingPhotoSignedUrl, u as uploadBuildingPhoto } from "./building-photo-CFfezIdh.mjs";
import { c as createNotifications, n as notifyAllHosts } from "./notifications-DFJ9lDCe.mjs";
import { u as useServerFn, g as getMaintenanceData, s as saveMaintenanceCategory, t as toggleMaintenanceCategory, a as getManageHostsData, b as requestAddBuildingHost, c as requestHostLimitChange, v as voteOnHostRequest, d as transferHostPosition, e as getBuildingDirectory, f as getMonthlyBillingData, h as decidePaymentVerification, i as resetMonthlyBilling, j as ensureMyBills, k as getBuildingResidents, l as getBillingStats, p as promoteResidentToHost } from "./building-management.functions-CqYXvTLm.mjs";
import { c as currentMonth, a as categoryIcon, i as inr, m as monthLabel } from "./money-DTY0MBx9.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dn_c42EA.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-BKQb_NCP.mjs";
import { Q as QRCode } from "../_libs/qrcode.mjs";

import "../_libs/seroval.mjs";
import { a as LoaderCircle, c as ChevronRight, B as Building2, M as MapPin, e as Camera, W as Wrench, f as Users, g as Bell, h as MessageCircle, i as Phone, j as Mail, k as Check, X, l as UserPlus, P as Plus, m as LifeBuoy, Q as QrCode, n as Copy, o as Image, p as Pencil, q as UsersRound, r as ArrowRightLeft, A as ArrowLeft, s as Send, R as RotateCcw, t as CircleCheck, u as Clock, v as CircleX, T as Trash2 } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/unenv.mjs";


import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
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
import "./server-CRlammpZ.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./auth-middleware-1oyI6D-P.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";

import "../_libs/dijkstrajs.mjs";
import "../_libs/pngjs.mjs";



const errorMessage$1 = (e) => e instanceof Error ? e.message : "Something went wrong. Please try again.";
function MaintenanceDialog({
  buildingId,
  open,
  onOpenChange
}) {
  const fetchMaintenance = useServerFn(getMaintenanceData);
  const saveCategory = useServerFn(saveMaintenanceCategory);
  const setCategoryActive = useServerFn(toggleMaintenanceCategory);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeRoomCount, setActiveRoomCount] = reactExports.useState(0);
  const [categories, setCategories] = reactExports.useState([]);
  const [qrUrls, setQrUrls] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(null);
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    total_amount: "",
    penalty_amount: "",
    upi_id: ""
  });
  const [qrFile, setQrFile] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMaintenance({ data: { buildingId } });
      setActiveRoomCount(data.activeRoomCount);
      setCategories(data.categories);
      setQrUrls(data.qrUrls);
    } catch (e) {
      toast.error(errorMessage$1(e));
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (open) load();
  }, [open, buildingId]);
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", total_amount: "", penalty_amount: "", upi_id: "" });
    setQrFile(null);
    setFormOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: "",
      total_amount: String(c.total_amount),
      penalty_amount: String(c.penalty_amount),
      upi_id: c.upi_id ?? ""
    });
    setQrFile(null);
    setFormOpen(true);
  };
  const save = async (e) => {
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
      const { error: upErr } = await supabase.storage.from("maintenance-qr").upload(path, qrFile, { upsert: false, contentType: qrFile.type });
      if (upErr) {
        setSaving(false);
        return toast.error(upErr.message);
      }
      qrPath = path;
    }
    const name = form.description.trim() ? `${form.name.trim()} — ${form.description.trim()}` : form.name.trim();
    try {
      await saveCategory({
        data: {
          buildingId,
          categoryId: editing?.id,
          name,
          totalAmount: total,
          penaltyAmount: penalty,
          upiId: form.upi_id.trim() || null,
          qrCodeImage: qrPath
        }
      });
      toast.success(editing ? "Maintenance updated" : "Maintenance added successfully");
      setFormOpen(false);
      load();
    } catch (e2) {
      toast.error(errorMessage$1(e2));
    } finally {
      setSaving(false);
    }
  };
  const toggleActive = async (c) => {
    setBusy(c.id);
    try {
      await setCategoryActive({
        data: { buildingId, categoryId: c.id, isActive: !c.is_active }
      });
      toast.success(c.is_active ? "Deactivated" : "Activated");
      load();
    } catch (e) {
      toast.error(errorMessage$1(e));
    } finally {
      setBusy(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manage Maintenance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          activeRoomCount,
          " active room",
          activeRoomCount === 1 ? "" : "s",
          " · Per-room amount auto-calculates from total ÷ active rooms"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " Add Maintenance"
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: 'No maintenance yet. Click "Add Maintenance" to add one (e.g. Light Bill, Water, Cleaning).' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: categoryIcon(c.name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold truncate", children: c.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`,
            children: c.is_active ? "Active" : "Inactive"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5 text-sm", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs truncate max-w-[140px]", children: c.upi_id })
        ] })
      ] }),
      qrUrls[c.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: qrUrls[c.id],
          alt: "QR",
          className: "mt-2 h-20 w-20 rounded border object-contain"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex h-20 w-20 items-center justify-center rounded border text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEdit(c), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-1 h-3.5 w-3.5" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: c.is_active ? "destructive" : "default",
            onClick: () => toggleActive(c),
            disabled: busy === c.id,
            children: busy === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : c.is_active ? "Deactivate" : "Activate"
          }
        )
      ] })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: setFormOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Maintenance" : "Add Maintenance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Fill in details for this maintenance charge. Per-room = total ÷ ",
          activeRoomCount || 0,
          " ",
          "active rooms."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name / Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              placeholder: "e.g. Light Bill, Water, Cleaning, Security",
              maxLength: 80,
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Details / Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.description,
              onChange: (e) => setForm({ ...form, description: e.target.value }),
              placeholder: "e.g. Common area electricity for Nov 2025",
              maxLength: 120
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total amount (₹) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: form.total_amount,
                onChange: (e) => setForm({ ...form, total_amount: e.target.value }),
                placeholder: "e.g. 5000",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Late penalty (₹) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: form.penalty_amount,
                onChange: (e) => setForm({ ...form, penalty_amount: e.target.value }),
                placeholder: "e.g. 100",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UPI ID (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.upi_id,
              onChange: (e) => setForm({ ...form, upi_id: e.target.value }),
              placeholder: "name@bank",
              maxLength: 80
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "QR code image (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "file",
              accept: "image/*",
              onChange: (e) => setQrFile(e.target.files?.[0] || null)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => setFormOpen(false),
              disabled: saving,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
            saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            editing ? "Update" : "Add"
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
const errorMessage = (error) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
function HostsDialog({
  buildingId,
  open,
  onOpenChange
}) {
  const id = buildingId;
  const fetchHosts = useServerFn(getManageHostsData);
  const submitAddHostRequest = useServerFn(requestAddBuildingHost);
  const submitHostLimitRequest = useServerFn(requestHostLimitChange);
  const submitHostVote = useServerFn(voteOnHostRequest);
  const submitHostTransfer = useServerFn(transferHostPosition);
  const [loading, setLoading] = reactExports.useState(true);
  const [hostCount, setHostCount] = reactExports.useState(1);
  const [myUserId, setMyUserId] = reactExports.useState(null);
  const [myHostId, setMyHostId] = reactExports.useState(null);
  const [hosts, setHosts] = reactExports.useState([]);
  const [requests, setRequests] = reactExports.useState([]);
  const [votes, setVotes] = reactExports.useState([]);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addForm, setAddForm] = reactExports.useState({ email: "", mobile: "", google: "" });
  const [addBusy, setAddBusy] = reactExports.useState(false);
  const [transferHost, setTransferHost] = reactExports.useState(null);
  const [transferForm, setTransferForm] = reactExports.useState({ email: "", mobile: "", google: "" });
  const [transferBusy, setTransferBusy] = reactExports.useState(false);
  const [limitOpen, setLimitOpen] = reactExports.useState(false);
  const [newLimit, setNewLimit] = reactExports.useState("1");
  const [confirmTransfer, setConfirmTransfer] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHosts({ data: { buildingId: id } });
      setMyUserId(data.myUserId);
      setMyHostId(data.myHostId);
      setHostCount(data.hostCount);
      setNewLimit(String(data.hostCount));
      setHosts(data.hosts);
      setRequests(data.requests);
      setVotes(data.votes);
    } catch (error) {
      toast.error(errorMessage(error));
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (open) load();
  }, [open, id]);
  const submitAddHost = async (e) => {
    e.preventDefault();
    if (!addForm.email || !addForm.mobile || !addForm.google) {
      return toast.error("All fields are required");
    }
    setAddBusy(true);
    try {
      await submitAddHostRequest({
        data: {
          buildingId: id,
          email: addForm.email.trim().toLowerCase(),
          mobile: addForm.mobile.trim(),
          google: addForm.google.trim().toLowerCase()
        }
      });
      toast.success("Request submitted. Awaiting host votes.");
      setAddOpen(false);
      setAddForm({ email: "", mobile: "", google: "" });
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAddBusy(false);
    }
  };
  const submitChangeLimit = async () => {
    const limit = Number.parseInt(newLimit, 10);
    try {
      await submitHostLimitRequest({ data: { buildingId: id, limit } });
      toast.success("Limit change request submitted");
      setLimitOpen(false);
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const vote = async (request, value) => {
    if (!myHostId) return;
    if (votes.some((v) => v.request_id === request.id && v.host_id === myHostId)) {
      return toast.error("You already voted");
    }
    try {
      await submitHostVote({ data: { buildingId: id, requestId: request.id, vote: value } });
      toast.success(value === "agree" ? "Vote submitted" : "Request rejected");
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const doTransfer = async () => {
    if (!transferHost) return;
    if (!transferForm.email || !transferForm.mobile || !transferForm.google) {
      return toast.error("All fields are required");
    }
    setTransferBusy(true);
    try {
      await submitHostTransfer({
        data: {
          buildingId: id,
          hostId: transferHost.id,
          email: transferForm.email.trim().toLowerCase(),
          mobile: transferForm.mobile.trim(),
          google: transferForm.google.trim().toLowerCase()
        }
      });
      toast.success("Host position transferred");
      setTransferHost(null);
      setConfirmTransfer(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setTransferBusy(false);
    }
  };
  const requestVoteCount = (req) => {
    const rv = votes.filter((v) => v.request_id === req.id);
    return {
      agree: rv.filter((v) => v.vote === "agree").length,
      total: hosts.length,
      mine: rv.find((v) => v.host_id === myHostId)?.vote
    };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manage Hosts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        hosts.length,
        " active host",
        hosts.length === 1 ? "" : "s",
        " · Limit ",
        hostCount
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading hosts…"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setLimitOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "mr-1 h-4 w-4" }),
          " Change Host Limit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
          " Request Add Host"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: hosts.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: h.name || h.email || "(no name)" }),
                h.is_primary ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800", children: "👑 Primary Host" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700", children: "Host" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700", children: "Active" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                h.email,
                " · ",
                h.mobile || "no mobile"
              ] })
            ] }),
            h.user_id === myUserId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => {
                  setTransferHost(h);
                  setTransferForm({ email: "", mobile: "", google: "" });
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "mr-1 h-3.5 w-3.5" }),
                  " Transfer My Position"
                ]
              }
            )
          ]
        },
        h.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Pending Requests" }),
      requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-sm text-muted-foreground", children: "No pending requests." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: requests.map((r) => {
        const c = requestVoteCount(r);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: r.request_type === "add_host" ? `Add new host: ${r.new_user_email}` : `Change host limit to ${r.new_user_email}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              c.agree,
              "/",
              c.total,
              " hosts agreed",
              c.mine && ` · You voted ${c.mine}`
            ] })
          ] }),
          !c.mine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => vote(r, "agree"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-3.5 w-3.5" }),
              " Agree"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "destructive",
                onClick: () => vote(r, "disagree"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
                  " Disagree"
                ]
              }
            )
          ] })
        ] }) }, r.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: setAddOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request to add a new host" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "All current hosts must agree before the new host is added." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitAddHost, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: addForm.email,
              onChange: (e) => setAddForm({ ...addForm, email: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: addForm.mobile,
              onChange: (e) => setAddForm({ ...addForm, mobile: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google Account email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: addForm.google,
              onChange: (e) => setAddForm({ ...addForm, google: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: addBusy, children: [
            addBusy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            "Submit Request"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: limitOpen, onOpenChange: setLimitOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Change host limit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Submits a request — all current hosts must agree." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "New limit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newLimit, onValueChange: setNewLimit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: n }, n)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLimitOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submitChangeLimit, children: "Submit Request" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!transferHost,
        onOpenChange: (o) => {
          if (!o) {
            setTransferHost(null);
            setConfirmTransfer(false);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Transfer my host position" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "The new person must already be registered on BuildingCare." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "email",
                  value: transferForm.email,
                  onChange: (e) => setTransferForm({ ...transferForm, email: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: transferForm.mobile,
                  onChange: (e) => setTransferForm({ ...transferForm, mobile: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google Account email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "email",
                  value: transferForm.google,
                  onChange: (e) => setTransferForm({ ...transferForm, google: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTransferHost(null), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => setConfirmTransfer(true), children: "Transfer" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: confirmTransfer, onOpenChange: setConfirmTransfer, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Transfer host position?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "You will lose host access to this building immediately. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogAction, { onClick: doTransfer, disabled: transferBusy, children: [
          transferBusy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Confirm Transfer"
        ] })
      ] })
    ] }) })
  ] }) });
}
function ChatDialog({
  buildingId,
  open,
  onOpenChange
}) {
  const [me, setMe] = reactExports.useState(null);
  const [role, setRole] = reactExports.useState(null);
  const [threads, setThreads] = reactExports.useState([]);
  const [activeResident, setActiveResident] = reactExports.useState(null);
  const [messages, setMessages] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const endRef = reactExports.useRef(null);
  const getDirectory = useServerFn(getBuildingDirectory);
  const loadHostThreads = async () => {
    const directory = await getDirectory({ data: { buildingId } });
    const residents = directory.residents;
    if (!residents.length) return setThreads([]);
    const residentIds = residents.map((r) => r.user_id);
    const { data: msgs } = await supabase.from("chat_messages").select("resident_id,content,created_at").eq("building_id", buildingId).in("resident_id", residentIds).order("created_at", { ascending: false });
    const lastByResident = {};
    (msgs || []).forEach((m) => {
      if (!lastByResident[m.resident_id])
        lastByResident[m.resident_id] = { content: m.content, at: m.created_at };
    });
    const list = residents.map((r) => ({
      resident_id: r.user_id,
      name: r.name,
      email: r.email,
      room_number: r.room_number,
      last_message: lastByResident[r.user_id]?.content ?? null,
      last_at: lastByResident[r.user_id]?.at ?? null
    }));
    list.sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""));
    setThreads(list);
  };
  reactExports.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setActiveResident(null);
    setMessages([]);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      if (!uid) {
        setRole("none");
        setLoading(false);
        return;
      }
      const { data: host } = await supabase.from("hosts").select("id").eq("building_id", buildingId).eq("user_id", uid).eq("status", "active").maybeSingle();
      if (host) {
        setRole("host");
        await loadHostThreads();
      } else {
        const { data: ru } = await supabase.from("room_users").select("room_id").eq("user_id", uid).eq("status", "active");
        const roomIds = (ru || []).map((r) => r.room_id);
        let isResident = false;
        if (roomIds.length) {
          const { data: rms } = await supabase.from("rooms").select("id").in("id", roomIds).eq("building_id", buildingId);
          isResident = !!(rms && rms.length);
        }
        if (isResident) {
          setRole("resident");
          setActiveResident(uid);
        } else {
          setRole("none");
        }
      }
      setLoading(false);
    })();
  }, [open, buildingId]);
  const loadMessages = async (resident_id) => {
    const { data, error } = await supabase.from("chat_messages").select("*").eq("building_id", buildingId).eq("resident_id", resident_id).order("created_at", { ascending: true });
    if (error) return;
    setMessages(data || []);
  };
  reactExports.useEffect(() => {
    if (!open || !activeResident) return;
    loadMessages(activeResident);
    const t = setInterval(() => loadMessages(activeResident), 4e3);
    return () => clearInterval(t);
  }, [activeResident, open, buildingId]);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const send = async () => {
    const body = text.trim();
    if (!body || !me || !activeResident) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      building_id: buildingId,
      resident_id: activeResident,
      sender_id: me,
      content: body
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
    loadMessages(activeResident);
    if (role === "host") loadHostThreads();
  };
  const activeThread = reactExports.useMemo(
    () => threads.find((t) => t.resident_id === activeResident) || null,
    [threads, activeResident]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: role === "resident" ? "Chat with Hosts" : "Messages" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "sr-only", children: "Direct messages between hosts and residents." })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-6 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : role === "none" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "You don't have access to chat in this building." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid h-[70vh] grid-cols-1 md:grid-cols-[240px_1fr]", children: [
      role === "host" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `border-r overflow-y-auto ${activeResident ? "hidden md:block" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs font-semibold text-muted-foreground", children: "RESIDENTS" }),
            threads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-muted-foreground", children: "No residents yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: threads.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: `flex w-full items-start gap-2 border-b px-3 py-2 text-left hover:bg-accent ${activeResident === t.resident_id ? "bg-accent" : ""}`,
                onClick: () => setActiveResident(t.resident_id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: (t.name || t.email || "?")[0]?.toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-medium", children: [
                      t.name || t.email || "Resident",
                      t.room_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
                        "· Room ",
                        t.room_number
                      ] })
                    ] }),
                    t.last_message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-xs text-muted-foreground", children: t.last_message })
                  ] })
                ]
              }
            ) }, t.resident_id)) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: role === "host" && !activeResident ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground", children: "Select a resident to start chatting." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b px-3 py-2", children: [
          role === "host" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "md:hidden",
              onClick: () => setActiveResident(null),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
            role === "resident" ? "Hosts" : activeThread?.name || activeThread?.email || "Resident",
            role === "host" && activeThread?.room_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs font-normal text-muted-foreground", children: [
              "Room ",
              activeThread.room_number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2 overflow-y-auto bg-muted/20 p-3", children: [
          messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "No messages yet. Say hi 👋" }) : messages.map((m) => {
            const mine = m.sender_id === me;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `flex ${mine ? "justify-end" : "justify-start"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-background border"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words", children: m.content }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `mt-1 text-[10px] ${mine ? "opacity-70" : "text-muted-foreground"}`,
                          children: new Date(m.created_at).toLocaleString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short"
                            }
                          )
                        }
                      )
                    ]
                  }
                )
              },
              m.id
            );
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-t p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: text,
              onChange: (e) => setText(e.target.value),
              placeholder: "Message…",
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: send, disabled: sending || !text.trim(), children: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] }) })
    ] })
  ] }) });
}
function MyBillsDialog({
  buildingId,
  open,
  onOpenChange
}) {
  const [loading, setLoading] = reactExports.useState(true);
  const [roomNumber, setRoomNumber] = reactExports.useState(null);
  const [roomId, setRoomId] = reactExports.useState(null);
  const [month, setMonth] = reactExports.useState(currentMonth());
  const [bills, setBills] = reactExports.useState([]);
  const [qrUrls, setQrUrls] = reactExports.useState({});
  const [payBill, setPayBill] = reactExports.useState(null);
  const [paying, setPaying] = reactExports.useState(false);
  const [loadError, setLoadError] = reactExports.useState(null);
  const ensureBills = useServerFn(ensureMyBills);
  const monthOptions = (() => {
    const o = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      o.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return o;
  })();
  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const uid = userData.user?.id;
      if (!uid) throw new Error("Please sign in again to view your bills.");
      const { data: ru, error: roomUserError } = await supabase.from("room_users").select("room_id").eq("user_id", uid).eq("status", "active");
      if (roomUserError) throw roomUserError;
      let myRoomId = null;
      if (ru && ru.length) {
        const { data: rms } = await supabase.from("rooms").select("id,room_number,building_id").in("id", ru.map((r) => r.room_id)).eq("building_id", buildingId);
        const mine = rms?.[0];
        if (mine) {
          myRoomId = mine.id;
          setRoomNumber(mine.room_number);
          setRoomId(mine.id);
        } else {
          setRoomNumber(null);
          setRoomId(null);
        }
      }
      if (!myRoomId) {
        setBills([]);
        return;
      }
      await ensureBills({ data: { buildingId, month } });
      const { data: rs, error: billError } = await supabase.from("room_maintenance_status").select(
        "id,category_id,amount_due,penalty_amount,total_due,payment_status"
      ).eq("room_id", myRoomId).eq("month", month);
      if (billError) throw billError;
      const catIds = [...new Set((rs || []).map((r) => r.category_id))];
      let catMap = {};
      if (catIds.length) {
        const { data: cats } = await supabase.from("maintenance_categories").select("id,name,upi_id,qr_code_image").in("id", catIds);
        catMap = Object.fromEntries(
          (cats || []).map((c) => [
            c.id,
            { name: c.name, upi_id: c.upi_id, qr_code_image: c.qr_code_image }
          ])
        );
      }
      const list = (rs || []).map((r) => ({
        id: r.id,
        category_id: r.category_id,
        category_name: catMap[r.category_id]?.name || "?",
        amount_due: Number(r.amount_due),
        penalty_amount: Number(r.penalty_amount),
        total_due: Number(r.total_due),
        payment_status: r.payment_status,
        upi_id: catMap[r.category_id]?.upi_id || null,
        qr_code_image: catMap[r.category_id]?.qr_code_image || null
      }));
      setBills(list);
      const urls = {};
      for (const bill of list) {
        if (bill.qr_code_image) {
          const { data: signed } = await supabase.storage.from("maintenance-qr").createSignedUrl(bill.qr_code_image, 3600);
          if (signed?.signedUrl) urls[bill.id] = signed.signedUrl;
        }
      }
      setQrUrls(urls);
    } catch (error) {
      setBills([]);
      setLoadError(error instanceof Error ? error.message : "Could not load live bills.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (!open) return;
    load();
    const channel = supabase.channel(`live-bills-${buildingId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_maintenance_status",
        filter: `building_id=eq.${buildingId}`
      },
      () => void load()
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "maintenance_categories",
        filter: `building_id=eq.${buildingId}`
      },
      () => void load()
    ).subscribe();
    const refresh = () => void load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const fallback = window.setInterval(refresh, 15e3);
    return () => {
      window.clearInterval(fallback);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      void supabase.removeChannel(channel);
    };
  }, [open, buildingId, month]);
  const requestVerify = async () => {
    if (!payBill) return;
    setPaying(true);
    const { error } = await supabase.from("room_maintenance_status").update({
      payment_status: "pending_verification",
      payment_requested_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", payBill.id);
    if (error) {
      setPaying(false);
      return toast.error(error.message);
    }
    await notifyAllHosts(buildingId, {
      type: "payment_request",
      title: "Payment Verification Request",
      message: `Room ${roomNumber} has paid ${payBill.category_name} for ${monthLabel(month)}. Please verify.`,
      related_room_id: roomId,
      related_category_id: payBill.category_id,
      related_month: month
    });
    setPaying(false);
    toast.success("Request sent! Waiting for host verification.");
    setPayBill(null);
    load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "My Maintenance Bills" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: roomNumber ? `Room ${roomNumber}` : "No room assigned" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex items-end justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: month, onValueChange: setMonth, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: monthOptions.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: monthLabel(m) }, m)) })
        ] })
      ] }) }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-8 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : loadError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: loadError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-3", variant: "outline", onClick: () => void load(), children: "Try Again" })
      ] }) : !roomNumber ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-muted-foreground", children: "You're not assigned to a room in this building. Contact a host to be added." }) : bills.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 text-muted-foreground", children: [
        "No bills published for ",
        monthLabel(month),
        " yet."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: bills.map((b) => {
        const statusColor = b.payment_status === "paid" ? "bg-blue-100 text-blue-700" : b.payment_status === "pending_verification" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
        const statusLabel = b.payment_status === "paid" ? "🔵 Paid" : b.payment_status === "pending_verification" ? "🟡 Pending" : "🔴 Not Paid";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: categoryIcon(b.category_name) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: b.category_name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`,
                children: statusLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inr(b.amount_due) })
            ] }),
            b.penalty_amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Penalty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700", children: inr(b.penalty_amount) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t pt-1 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: inr(b.total_due) })
            ] })
          ] }),
          b.payment_status === "not_paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "mt-3 w-full",
              onClick: () => setPayBill(b),
              children: "Pay Now"
            }
          )
        ] }, b.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!payBill, onOpenChange: (o) => !o && setPayBill(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          payBill?.category_name,
          " — ",
          inr(payBill?.total_due ?? 0)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Scan this QR code to pay via GPay / PhonePe / Paytm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
        payBill && qrUrls[payBill.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: qrUrls[payBill.id],
            alt: "UPI QR",
            className: "h-64 w-64 rounded border object-contain"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 w-64 items-center justify-center rounded border text-sm text-muted-foreground", children: "No QR code uploaded" }),
        payBill?.upi_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "UPI:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: payBill.upi_id })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPayBill(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: requestVerify, disabled: paying, children: [
          paying && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "I Have Paid — Send Verification Request"
        ] })
      ] })
    ] }) })
  ] });
}
function MonthlyBillingDialog({
  buildingId,
  open,
  onOpenChange
}) {
  const load = useServerFn(getMonthlyBillingData);
  const decide = useServerFn(decidePaymentVerification);
  const reset = useServerFn(resetMonthlyBilling);
  const [month, setMonth] = reactExports.useState(currentMonth());
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [activeRoomCount, setActiveRoomCount] = reactExports.useState(0);
  const [categories, setCategories] = reactExports.useState([]);
  const [rows, setRows] = reactExports.useState([]);
  const [busyId, setBusyId] = reactExports.useState(null);
  const [confirmReset, setConfirmReset] = reactExports.useState(false);
  const [resetting, setResetting] = reactExports.useState(false);
  const monthOptions = reactExports.useMemo(() => {
    const opts = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return opts;
  }, []);
  const refresh = reactExports.useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await load({ data: { buildingId, month } });
        setActiveRoomCount(res.activeRoomCount);
        setCategories(res.categories);
        setRows(res.rows);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load billing data");
      } finally {
        setLoading(false);
      }
    },
    [buildingId, month, load]
  );
  reactExports.useEffect(() => {
    if (!open) return;
    void refresh();
    const channel = supabase.channel(`monthly-billing-${buildingId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_maintenance_status",
        filter: `building_id=eq.${buildingId}`
      },
      () => void refresh(true)
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "maintenance_categories",
        filter: `building_id=eq.${buildingId}`
      },
      () => void refresh(true)
    ).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, buildingId, month, refresh]);
  const counts = {
    paid: rows.filter((r) => r.payment_status === "paid").length,
    pending: rows.filter((r) => r.payment_status === "pending_verification").length,
    unpaid: rows.filter((r) => r.payment_status === "not_paid").length
  };
  const collected = rows.filter((r) => r.payment_status === "paid").reduce((s, r) => s + r.total_due, 0);
  const expected = rows.reduce((s, r) => s + r.total_due, 0);
  const pendingRows = rows.filter((r) => r.payment_status === "pending_verification");
  const handleDecide = async (row, approve) => {
    setBusyId(row.id);
    try {
      await decide({ data: { buildingId, statusId: row.id, approve } });
      const { data: room } = await supabase.from("rooms").select("id").eq("building_id", buildingId).eq("room_number", row.room_number).maybeSingle();
      const { data: ru } = room ? await supabase.from("room_users").select("user_id").eq("room_id", room.id).eq("status", "active") : { data: null };
      const resident = ru?.[0];
      if (resident) {
        await createNotifications([
          {
            building_id: buildingId,
            receiver_id: resident.user_id,
            type: approve ? "payment_verified" : "payment_request",
            title: approve ? "Payment verified" : "Payment not verified",
            message: approve ? `Your ${row.category_name} payment of ${inr(row.total_due)} for ${monthLabel(month)} was verified.` : `Your ${row.category_name} payment for ${monthLabel(month)} was marked as not received. Please try again.`,
            related_category_id: row.category_id,
            related_month: month
          }
        ]);
      }
      toast.success(approve ? "Payment verified" : "Marked as not paid");
      await refresh(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };
  const handleReset = async () => {
    setResetting(true);
    try {
      await reset({ data: { buildingId, month } });
      toast.success(`${monthLabel(month)} billing reset`);
      setConfirmReset(false);
      await refresh(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[88vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Monthly Billing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Auto-generated from your Manage Maintenance charges. A fresh cycle starts automatically each month." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: month, onValueChange: setMonth, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: monthOptions.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: monthLabel(m) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setConfirmReset(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 h-4 w-4" }),
          " Reset This Month"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-10 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-3", variant: "outline", onClick: () => void refresh(), children: "Try Again" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active Rooms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold", children: activeRoomCount })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold text-yellow-700", children: counts.pending })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Verified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold text-blue-700", children: counts.paid })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xl font-bold", children: [
              inr(collected),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs font-normal text-muted-foreground", children: [
                "/ ",
                inr(expected)
              ] })
            ] })
          ] })
        ] }),
        pendingRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 text-sm font-semibold", children: [
            "Pending Verification (",
            pendingRows.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: pendingRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                    "Room ",
                    r.room_number,
                    " · ",
                    r.category_name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    inr(r.total_due),
                    r.payment_requested_at ? ` · ${new Date(r.payment_requested_at).toLocaleString("en-IN")}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      disabled: busyId === r.id,
                      onClick: () => void handleDecide(r, false),
                      children: "Reject"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      disabled: busyId === r.id,
                      onClick: () => void handleDecide(r, true),
                      children: busyId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Verify"
                    }
                  )
                ] })
              ]
            },
            r.id
          )) }) })
        ] }),
        categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "No active maintenance charges. Add one in Manage Maintenance first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: categories.map((c) => {
          const catRows = rows.filter((r) => r.category_id === c.id);
          const paid = catRows.filter((r) => r.payment_status === "paid").length;
          const pending = catRows.filter(
            (r) => r.payment_status === "pending_verification"
          ).length;
          const unpaid = catRows.filter((r) => r.payment_status === "not_paid").length;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: categoryIcon(c.name) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: c.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Per room " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: inr(c.per_room_amount) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
                " ",
                paid,
                " paid"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-yellow-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
                " ",
                pending,
                " pending"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-red-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5" }),
                " ",
                unpaid,
                " unpaid"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "Total ",
                inr(c.total_amount),
                " · Penalty ",
                inr(c.penalty_amount)
              ] })
            ] }),
            catRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: catRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `rounded-full px-2 py-0.5 text-xs font-medium ${r.payment_status === "paid" ? "bg-blue-100 text-blue-700" : r.payment_status === "pending_verification" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`,
                children: r.room_number
              },
              r.id
            )) })
          ] }, c.id);
        }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmReset, onOpenChange: (o) => !o && setConfirmReset(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Reset ",
          monthLabel(month),
          " billing?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This clears all bills and payment statuses for this month and regenerates them fresh from your current maintenance charges." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmReset(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => void handleReset(), disabled: resetting, children: [
          resetting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Reset Billing"
        ] })
      ] })
    ] }) })
  ] });
}
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
  "Other"
];
const serviceIcon = (t) => {
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
function ContactsDialog({
  buildingId,
  isHost,
  open,
  onOpenChange
}) {
  const [loading, setLoading] = reactExports.useState(true);
  const [contacts, setContacts] = reactExports.useState([]);
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    service_type: "Plumber",
    phone: "",
    note: ""
  });
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("building_contacts").select("id, building_id, name, service_type, phone, note, is_active").eq("building_id", buildingId).order("service_type", { ascending: true });
    if (error) toast.error(error.message);
    setContacts(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (open) load();
  }, [open, buildingId]);
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", service_type: "Plumber", phone: "", note: "" });
    setFormOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      service_type: c.service_type,
      phone: c.phone,
      note: c.note ?? ""
    });
    setFormOpen(true);
  };
  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Contact name required");
    if (!form.phone.trim()) return toast.error("Phone number required");
    setSaving(true);
    const payload = {
      building_id: buildingId,
      name: form.name.trim(),
      service_type: form.service_type.trim(),
      phone: form.phone.trim(),
      note: form.note.trim() || null
    };
    const { error } = editing ? await supabase.from("building_contacts").update(payload).eq("id", editing.id) : await supabase.from("building_contacts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Contact updated" : "Contact added");
    setFormOpen(false);
    load();
  };
  const remove = async (c) => {
    setBusy(c.id);
    const { error } = await supabase.from("building_contacts").delete().eq("id", c.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Contact removed");
    load();
  };
  const visible = isHost ? contacts : contacts.filter((c) => c.is_active);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isHost ? "Contact List" : "Help & Contacts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: isHost ? "Add useful service contacts (plumber, electrician, cleaner, security…) for residents." : "Useful contacts shared by your building host. Tap a number to call." })
      ] }),
      isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " Add Contact"
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: isHost ? 'No contacts yet. Click "Add Contact" to add a plumber, electrician, cleaner or security number.' : "Your host has not added any contacts yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: visible.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: serviceIcon(c.service_type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.service_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `tel:${c.phone}`,
              className: "mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                " ",
                c.phone
              ]
            }
          ),
          c.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground break-words", children: c.note })
        ] })
      ] }),
      isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEdit(c), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-1 h-3.5 w-3.5" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "destructive",
            onClick: () => remove(c),
            disabled: busy === c.id,
            children: busy === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-3.5 w-3.5" }),
              " Remove"
            ] })
          }
        )
      ] })
    ] }, c.id)) }),
    isHost && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: setFormOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Contact" : "Add Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Residents will see this in the Help section of their building page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              placeholder: "e.g. Ramesh Kumar",
              maxLength: 80,
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              className: "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
              value: form.service_type,
              onChange: (e) => setForm({ ...form, service_type: e.target.value }),
              children: SERVICE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.phone,
              onChange: (e) => setForm({ ...form, phone: e.target.value }),
              placeholder: "e.g. +91 98765 43210",
              maxLength: 20,
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Note (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.note,
              onChange: (e) => setForm({ ...form, note: e.target.value }),
              placeholder: "e.g. Available 9am–8pm",
              maxLength: 120
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => setFormOpen(false),
              disabled: saving,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
            saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            editing ? "Update" : "Add"
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
function BuildingCodeShareCard({ buildingCode, className }) {
  const [qrDataUrl, setQrDataUrl] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(buildingCode, {
      margin: 1,
      width: 220,
      color: { dark: "#0f172a", light: "#ffffff" }
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (!cancelled) setQrDataUrl(null);
    });
    return () => {
      cancelled = true;
    };
  }, [buildingCode]);
  reactExports.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(buildingCode);
      setCopied(true);
      toast.success("Building code copied");
    } catch {
      toast.error("Couldn't copy the building code");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-start sm:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5" }),
        " Building code"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Share this code with residents or show the QR code for quick joining." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-lg font-semibold tracking-wide", children: buildingCode })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: copyCode, children: [
        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-2 h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2 h-4 w-4" }),
        copied ? "Copied" : "Copy code"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[180px] items-center justify-center rounded-lg bg-white p-3 shadow-sm", children: qrDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: qrDataUrl,
        alt: `QR code for ${buildingCode}`,
        className: "h-[180px] w-[180px]"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[180px] w-[180px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground", children: "Generating QR…" }) })
  ] }) });
}
function BuildingPage() {
  const {
    id
  } = useParams({
    from: "/_authenticated/building/$id"
  });
  const [building, setBuilding] = reactExports.useState(null);
  const [isHost, setIsHost] = reactExports.useState(false);
  const [isPrimaryHost, setIsPrimaryHost] = reactExports.useState(false);
  const [rooms, setRooms] = reactExports.useState([]);
  const [photo, setPhoto] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [newRoom, setNewRoom] = reactExports.useState("");
  const [showRooms] = reactExports.useState(false);
  const [userId, setUserId] = reactExports.useState(null);
  const [isMember, setIsMember] = reactExports.useState(false);
  const [myRequest, setMyRequest] = reactExports.useState(null);
  const [joinRequests, setJoinRequests] = reactExports.useState([]);
  const [residents, setResidents] = reactExports.useState([]);
  const [promotingId, setPromotingId] = reactExports.useState(null);
  const [removingResidentId, setRemovingResidentId] = reactExports.useState(null);
  const [showResidents, setShowResidents] = reactExports.useState(false);
  const [showMaintenance, setShowMaintenance] = reactExports.useState(false);
  const [showHosts, setShowHosts] = reactExports.useState(false);
  const [showChat, setShowChat] = reactExports.useState(false);
  const [showContacts, setShowContacts] = reactExports.useState(false);
  const [showMyBills, setShowMyBills] = reactExports.useState(false);
  const [showMonthly, setShowMonthly] = reactExports.useState(false);
  const [billStats, setBillStats] = reactExports.useState({
    pending: 0,
    verified: 0,
    unpaid: 0
  });
  const fetchBillStats = useServerFn(getBillingStats);
  const fetchResidents = useServerFn(getBuildingResidents);
  const makeHost = useServerFn(promoteResidentToHost);
  const [joinOpen, setJoinOpen] = reactExports.useState(false);
  const [joinForm, setJoinForm] = reactExports.useState({
    room_number: "",
    name: "",
    email: "",
    mobile: ""
  });
  const [joinBusy, setJoinBusy] = reactExports.useState(false);
  const [decidingId, setDecidingId] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editName, setEditName] = reactExports.useState("");
  const [editLocation, setEditLocation] = reactExports.useState("");
  const [editPhoto, setEditPhoto] = reactExports.useState(null);
  const [editPreview, setEditPreview] = reactExports.useState(null);
  const [removePhoto, setRemovePhoto] = reactExports.useState(false);
  const [savingEdit, setSavingEdit] = reactExports.useState(false);
  const [unreadNotifs, setUnreadNotifs] = reactExports.useState(0);
  const load = async () => {
    setLoading(true);
    const {
      data: userData
    } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);
    const [{
      data: b,
      error: be
    }, {
      data: hosts
    }, {
      data: rs
    }] = await Promise.all([supabase.from("buildings").select("*").eq("id", id).maybeSingle(), supabase.from("hosts").select("user_id,status,is_primary").eq("building_id", id), supabase.from("rooms").select("id,room_number,is_active").eq("building_id", id).order("room_number")]);
    if (be) toast.error(be.message);
    setBuilding(b);
    setPhoto(await buildingPhotoSignedUrl(b?.photo_url));
    const myHost = hosts?.find((h) => h.user_id === uid && h.status === "active");
    const host = !!myHost;
    setIsHost(host);
    setIsPrimaryHost(!!myHost?.is_primary);
    setRooms(rs || []);
    if (uid && rs && rs.length) {
      const {
        data: myRoom
      } = await supabase.from("room_users").select("id,room_id").eq("user_id", uid).eq("status", "active").in("room_id", rs.map((r) => r.id));
      setIsMember(!!myRoom?.length);
    } else {
      setIsMember(false);
    }
    if (host) {
      const {
        data: reqs
      } = await supabase.from("room_join_requests").select("*").eq("building_id", id).eq("status", "pending").order("created_at", {
        ascending: false
      });
      setJoinRequests(reqs || []);
      setMyRequest(null);
    } else if (uid) {
      const {
        data: mine
      } = await supabase.from("room_join_requests").select("*").eq("building_id", id).eq("requested_by", uid).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle();
      setMyRequest(mine || null);
      setJoinRequests([]);
    }
    if (host) {
      try {
        const res = await fetchResidents({
          data: {
            buildingId: id
          }
        });
        setResidents(res.residents);
      } catch {
        setResidents([]);
      }
    } else {
      setResidents([]);
    }
    setLoading(false);
  };
  const openJoinDialog = async () => {
    if (!userId) return;
    const {
      data: profile
    } = await supabase.from("profiles").select("name,email,mobile").eq("id", userId).maybeSingle();
    setJoinForm({
      room_number: "",
      name: profile?.name || "",
      email: profile?.email || "",
      mobile: profile?.mobile || ""
    });
    setJoinOpen(true);
  };
  const submitJoinRequest = async (e) => {
    e.preventDefault();
    if (!userId) return;
    const room_number = joinForm.room_number.trim();
    if (!room_number) return toast.error("Room number is required");
    if (!joinForm.name.trim() || !joinForm.email.trim() || !joinForm.mobile.trim()) return toast.error("Name, email and mobile are required");
    setJoinBusy(true);
    try {
      const {
        error
      } = await supabase.from("room_join_requests").insert({
        building_id: id,
        requested_by: userId,
        room_number,
        applicant_name: joinForm.name.trim(),
        applicant_email: joinForm.email.trim(),
        applicant_mobile: joinForm.mobile.trim()
      });
      if (error) throw error;
      await notifyAllHosts(id, {
        type: "host_request",
        title: "New room join request",
        message: `${joinForm.name.trim()} (${joinForm.mobile.trim()}, ${joinForm.email.trim()}) wants to join Room ${room_number}.`
      });
      toast.success("Request sent to hosts");
      setJoinOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't submit request";
      toast.error(msg.includes("rjr_one_pending") ? "You already have a pending request for this building" : msg);
    } finally {
      setJoinBusy(false);
    }
  };
  const cancelMyRequest = async () => {
    if (!myRequest) return;
    const {
      error
    } = await supabase.from("room_join_requests").delete().eq("id", myRequest.id);
    if (error) return toast.error(error.message);
    toast.success("Request cancelled");
    load();
  };
  const approveRequest = async (req) => {
    if (!userId) return;
    setDecidingId(req.id);
    try {
      let room = rooms.find((r) => r.room_number.trim() === req.room_number.trim());
      if (!room) {
        const {
          data: newRm,
          error: rErr
        } = await supabase.from("rooms").insert({
          building_id: id,
          room_number: req.room_number.trim(),
          is_active: true
        }).select("id,room_number,is_active").single();
        if (rErr) throw rErr;
        room = newRm;
      } else if (!room.is_active) {
        await supabase.from("rooms").update({
          is_active: true
        }).eq("id", room.id);
      }
      const {
        error: ruErr
      } = await supabase.from("room_users").insert({
        room_id: room.id,
        user_id: req.requested_by,
        assigned_by: userId,
        status: "active"
      });
      if (ruErr) {
        if (ruErr.message.toLowerCase().includes("duplicate") || ruErr.code === "23505") {
          throw new Error(`Room ${req.room_number} already has an active member. Ask them to pick a different room.`);
        }
        throw ruErr;
      }
      const {
        error: uErr
      } = await supabase.from("room_join_requests").update({
        status: "approved",
        decided_by: userId,
        decided_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", req.id);
      if (uErr) throw uErr;
      await createNotifications([{
        building_id: id,
        receiver_id: req.requested_by,
        type: "payment_verified",
        title: "Join request approved",
        message: `You've been added to Room ${req.room_number}.`,
        related_room_id: room.id
      }]);
      toast.success(`Approved — ${req.applicant_name} added to Room ${req.room_number}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setDecidingId(null);
    }
  };
  const rejectRequest = async (req) => {
    if (!userId) return;
    setDecidingId(req.id);
    try {
      const {
        error
      } = await supabase.from("room_join_requests").update({
        status: "rejected",
        decided_by: userId,
        decided_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", req.id);
      if (error) throw error;
      await createNotifications([{
        building_id: id,
        receiver_id: req.requested_by,
        type: "payment_rejected",
        title: "Join request rejected",
        message: `Your request to join Room ${req.room_number} was rejected.`
      }]);
      toast.success("Request rejected");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setDecidingId(null);
    }
  };
  const promoteResident = async (r) => {
    if (!confirm(`Make ${r.name || "this resident"} a host of this building? They will get full host access.`)) return;
    setPromotingId(r.user_id);
    try {
      await makeHost({
        data: {
          buildingId: id,
          userId: r.user_id
        }
      });
      toast.success(`${r.name || "Resident"} is now a host`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not make this person a host");
    } finally {
      setPromotingId(null);
    }
  };
  const removeResident = async (r) => {
    if (!userId) return;
    if (!confirm(`Remove ${r.name || "this resident"} from Room ${r.room_number}? They will lose access to bills.`)) return;
    setRemovingResidentId(r.ru_id);
    try {
      const {
        error
      } = await supabase.from("room_users").update({
        status: "removed"
      }).eq("id", r.ru_id);
      if (error) throw error;
      await createNotifications([{
        building_id: id,
        receiver_id: r.user_id,
        type: "payment_rejected",
        title: "Removed from building",
        message: `You've been removed from Room ${r.room_number}.`,
        related_room_id: r.room_id
      }]);
      toast.success(`Removed ${r.name || "resident"} from Room ${r.room_number}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove resident");
    } finally {
      setRemovingResidentId(null);
    }
  };
  reactExports.useEffect(() => {
    load();
    const fetchUnread = async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const {
        count
      } = await supabase.from("notifications").select("id", {
        count: "exact",
        head: true
      }).eq("building_id", id).eq("receiver_id", u.user.id).eq("is_read", false);
      setUnreadNotifs(count ?? 0);
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 1e4);
    return () => clearInterval(t);
  }, [id]);
  reactExports.useEffect(() => {
    if (!isHost) return;
    let cancelled = false;
    const loadStats = async () => {
      try {
        const s = await fetchBillStats({
          data: {
            buildingId: id,
            month: currentMonth()
          }
        });
        if (!cancelled) setBillStats({
          pending: s.pending,
          verified: s.verified,
          unpaid: s.unpaid
        });
      } catch {
      }
    };
    void loadStats();
    const channel = supabase.channel(`bill-stats-${id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "room_maintenance_status",
      filter: `building_id=eq.${id}`
    }, () => void loadStats()).subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [id, isHost]);
  const addRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.trim()) return;
    const {
      error
    } = await supabase.from("rooms").insert({
      building_id: id,
      room_number: newRoom.trim(),
      is_active: true
    });
    if (error) return toast.error(error.message);
    toast.success("Room added");
    setNewRoom("");
    load();
  };
  const openEdit = () => {
    if (!building) return;
    setEditName(building.name);
    setEditLocation(building.location);
    setEditPhoto(null);
    setEditPreview(null);
    setRemovePhoto(false);
    setEditOpen(true);
  };
  const onEditPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) return toast.error("Only JPG, PNG or WEBP images allowed");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    setEditPhoto(f);
    setEditPreview(URL.createObjectURL(f));
    setRemovePhoto(false);
  };
  const saveEdit = async () => {
    if (!building) return;
    if (!editName.trim() || !editLocation.trim()) return toast.error("Name and location are required");
    setSavingEdit(true);
    try {
      const update = {
        name: editName.trim(),
        location: editLocation.trim()
      };
      if (editPhoto) {
        const {
          path
        } = await uploadBuildingPhoto(editPhoto, building.id);
        update.photo_url = path;
      } else if (removePhoto) {
        update.photo_url = null;
      }
      const {
        error
      } = await supabase.from("buildings").update(update).eq("id", building.id);
      if (error) throw error;
      toast.success("Building updated");
      setEditOpen(false);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't save changes";
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading building…"
    ] });
  }
  if (!building) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Building not found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "text-primary underline", children: "Back to dashboard" })
    ] });
  }
  const activeRooms = rooms.filter((r) => r.is_active).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: building.name })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mb-6 overflow-hidden rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[200px] w-full", children: [
      photo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photo, alt: building.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-16 w-16 opacity-90" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-4 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold drop-shadow", children: building.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-sm text-white/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            " ",
            building.location
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 inline-block rounded bg-white/20 px-2 py-0.5 font-mono text-xs backdrop-blur", children: building.unique_code })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${isHost ? "bg-primary/80 text-primary-foreground" : "bg-white/30 text-white"}`, children: isPrimaryHost ? isMember ? "Primary Host • Flat Owner" : "Primary Host" : isHost ? isMember ? "Host • Flat Owner" : "Host" : "Flat Owner" })
      ] }),
      isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", className: "absolute right-3 top-3", onClick: openEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "mr-1 h-4 w-4" }),
        " Edit"
      ] })
    ] }) }),
    isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BuildingCodeShareCard, { buildingCode: building.unique_code, className: "mb-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active Rooms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold", children: activeRooms })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pending Payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-yellow-700", children: billStats.pending })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Verified Payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-blue-700", children: billStats.verified })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Unpaid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-red-700", children: billStats.unpaid })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowMaintenance(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "mr-2 h-4 w-4" }),
          " Manage Maintenance"
        ] }),
        isPrimaryHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowHosts(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
          " Manage Hosts"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "relative", onClick: () => setShowMonthly(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "mr-2 h-4 w-4" }),
          " Monthly Billing",
          billStats.pending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs font-bold text-white", children: billStats.pending })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/building/$id/notifications", params: {
          id
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mr-2 h-4 w-4" }),
          " Notifications",
          unreadNotifs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white", children: unreadNotifs })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowChat(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "mr-2 h-4 w-4" }),
          " Chat with Residents"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: showResidents ? "default" : "outline", onClick: () => setShowResidents((v) => !v), "aria-expanded": showResidents, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
          "Residents (",
          residents.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowContacts(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mr-2 h-4 w-4" }),
          " Contact List"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Join Requests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            joinRequests.length,
            " pending"
          ] })
        ] }),
        joinRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No pending requests. Residents will appear here after asking to join." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: joinRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              req.applicant_name,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "→ Room ",
                req.room_number
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
                " ",
                req.applicant_email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                " ",
                req.applicant_mobile
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => approveRequest(req), disabled: decidingId === req.id, children: [
              decidingId === req.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-3.5 w-3.5" }),
              "Approve"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => rejectRequest(req), disabled: decidingId === req.id, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
              " Reject"
            ] })
          ] })
        ] }, req.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showResidents, onOpenChange: setShowResidents, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Residents (",
            residents.length,
            " active)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Approved residents in this building. Remove anyone to revoke their access." })
        ] }),
        residents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "No residents yet. Approved join requests will appear here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: residents.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              r.name || r.email || "(no name)",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "→ Room ",
                r.room_number
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
              r.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
                " ",
                r.email
              ] }),
              r.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                " ",
                r.mobile
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            r.is_host ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700", children: "Host" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => promoteResident(r), disabled: promotingId === r.user_id, children: [
              promotingId === r.user_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-3.5 w-3.5" }),
              "Make Host"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => removeResident(r), disabled: removingResidentId === r.ru_id, children: [
              removingResidentId === r.ru_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
              "Remove"
            ] })
          ] })
        ] }, r.ru_id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MaintenanceDialog, { buildingId: id, open: showMaintenance, onOpenChange: setShowMaintenance }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HostsDialog, { buildingId: id, open: showHosts, onOpenChange: setShowHosts }),
      showRooms && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold", children: "Rooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: addRoom, className: "mb-4 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Room number (e.g. 101)", value: newRoom, onChange: (e) => setNewRoom(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            " Add"
          ] })
        ] }),
        rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No rooms yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-md border", children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "Room ",
            r.room_number
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${r.is_active ? "text-primary" : "text-muted-foreground"}`, children: r.is_active ? "Active" : "Inactive" })
        ] }, r.id)) })
      ] })
    ] }),
    isMember && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-6 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "My Room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "View your monthly maintenance bills and pay using QR code." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowMyBills(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "mr-2 h-4 w-4" }),
          " View My Bills"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowChat(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "mr-2 h-4 w-4" }),
          " Chat with Host"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowContacts(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LifeBuoy, { className: "mr-2 h-4 w-4" }),
          " Help"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/building/$id/notifications", params: {
          id
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mr-2 h-4 w-4" }),
          " Notifications",
          unreadNotifs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white", children: unreadNotifs })
        ] }) })
      ] })
    ] }),
    !isHost && !isMember && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Join this building" }),
      myRequest?.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
          "Your request for Room ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: myRequest.room_number }),
          " is pending host approval."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: cancelMyRequest, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
          " Cancel Request"
        ] }) })
      ] }) : myRequest?.status === "rejected" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
          "Your previous request for Room ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: myRequest.room_number }),
          " was rejected. You can try again with a different room number."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openJoinDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
          " Request Again"
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Send a request to the hosts with your room number. Once they approve, you'll be added to that room and can view your bills." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openJoinDialog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
          " Request to Join"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: joinOpen, onOpenChange: setJoinOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request to join" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Provide your room number. Hosts will see your name, email and mobile to approve." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitJoinRequest, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Room number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 101", value: joinForm.room_number, onChange: (e) => setJoinForm({
            ...joinForm,
            room_number: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Your name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: joinForm.name, onChange: (e) => setJoinForm({
            ...joinForm,
            name: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: joinForm.email, onChange: (e) => setJoinForm({
            ...joinForm,
            email: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: joinForm.mobile, onChange: (e) => setJoinForm({
            ...joinForm,
            mobile: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setJoinOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: joinBusy, children: [
            joinBusy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            "Send Request"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Building" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Building Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editName, onChange: (e) => setEditName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editLocation, onChange: (e) => setEditLocation(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Building Photo" }),
          editPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 overflow-hidden rounded-md border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: editPreview, alt: "Preview", className: "h-40 w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "icon", className: "absolute right-2 top-2 h-8 w-8", onClick: () => {
              setEditPhoto(null);
              if (editPreview) URL.revokeObjectURL(editPreview);
              setEditPreview(null);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
          ] }) : building.photo_url && !removePhoto ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 overflow-hidden rounded-md border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photo, alt: "Current", className: "h-40 w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "icon", className: "absolute right-2 top-2 h-8 w-8", onClick: () => setRemovePhoto(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-accent/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "mb-1 h-5 w-5" }),
            "Click to upload (JPG/PNG/WEBP, max 5MB)",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "image/jpeg,image/png,image/webp", onChange: onEditPhoto })
          ] }),
          (editPreview || building.photo_url && !removePhoto) && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 inline-flex cursor-pointer text-xs text-primary hover:underline", children: [
            "Choose a different photo",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "image/jpeg,image/png,image/webp", onChange: onEditPhoto })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditOpen(false), disabled: savingEdit, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveEdit, disabled: savingEdit, children: [
          savingEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatDialog, { buildingId: id, open: showChat, onOpenChange: setShowChat }),
    isHost && /* @__PURE__ */ jsxRuntimeExports.jsx(MonthlyBillingDialog, { buildingId: id, open: showMonthly, onOpenChange: setShowMonthly }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MyBillsDialog, { buildingId: id, open: showMyBills, onOpenChange: setShowMyBills }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContactsDialog, { buildingId: id, isHost, open: showContacts, onOpenChange: setShowContacts })
  ] });
}
export {
  BuildingPage as component
};
