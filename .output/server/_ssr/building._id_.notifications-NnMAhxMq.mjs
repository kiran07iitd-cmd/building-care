import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button, c as cn } from "./button-BXrfXN_b.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as inr } from "./money-DTY0MBx9.mjs";
import { a as notifIcon, t as timeAgo, c as createNotifications } from "./notifications-DFJ9lDCe.mjs";
import { a as LoaderCircle, c as ChevronRight, y as CheckCheck } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function NotificationsPage() {
  const {
    id
  } = useParams({
    strict: false
  });
  if (!id) return null;
  const [loading, setLoading] = reactExports.useState(true);
  const [buildingName, setBuildingName] = reactExports.useState("");
  const [isHost, setIsHost] = reactExports.useState(false);
  const [notifs, setNotifs] = reactExports.useState([]);
  const [verify, setVerify] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [rejectOpen, setRejectOpen] = reactExports.useState(false);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const load = async () => {
    setLoading(true);
    const {
      data: u
    } = await supabase.auth.getUser();
    const uid = u.user?.id;
    const [{
      data: b
    }, {
      data: hosts
    }, {
      data: ns
    }] = await Promise.all([supabase.from("buildings").select("name").eq("id", id).maybeSingle(), supabase.from("hosts").select("user_id,status").eq("building_id", id), supabase.from("notifications").select("*").eq("building_id", id).eq("receiver_id", uid).order("created_at", {
      ascending: false
    }).limit(100)]);
    setBuildingName(b?.name ?? "");
    setIsHost(!!hosts?.find((h) => h.user_id === uid && h.status === "active"));
    setNotifs(ns || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, [id]);
  const markRead = async (n) => {
    if (n.is_read) return;
    await supabase.from("notifications").update({
      is_read: true
    }).eq("id", n.id);
    setNotifs((cur) => cur.map((x) => x.id === n.id ? {
      ...x,
      is_read: true
    } : x));
  };
  const markAllRead = async () => {
    const {
      data: u
    } = await supabase.auth.getUser();
    await supabase.from("notifications").update({
      is_read: true
    }).eq("building_id", id).eq("receiver_id", u.user?.id).eq("is_read", false);
    setNotifs((cur) => cur.map((x) => ({
      ...x,
      is_read: true
    })));
    toast.success("All marked as read");
  };
  const openVerify = async (n) => {
    await markRead(n);
    if (!n.related_room_id || !n.related_category_id || !n.related_month) {
      toast.error("Missing details");
      return;
    }
    const [{
      data: rms
    }, {
      data: room
    }, {
      data: cat
    }] = await Promise.all([supabase.from("room_maintenance_status").select("id,total_due,payment_status,payment_requested_at").eq("room_id", n.related_room_id).eq("category_id", n.related_category_id).eq("month", n.related_month).maybeSingle(), supabase.from("rooms").select("room_number").eq("id", n.related_room_id).maybeSingle(), supabase.from("maintenance_categories").select("name").eq("id", n.related_category_id).maybeSingle()]);
    if (!rms) return toast.error("Bill no longer exists");
    if (rms.payment_status !== "pending_verification") {
      toast.message("Already handled");
      load();
      return;
    }
    setVerify({
      statusId: rms.id,
      roomNumber: room?.room_number || "?",
      categoryName: cat?.name || "?",
      month: n.related_month,
      totalDue: Number(rms.total_due),
      requestedAt: rms.payment_requested_at,
      notifId: n.id
    });
  };
  const doVerify = async () => {
    if (!verify) return;
    setBusy(true);
    const {
      data: u
    } = await supabase.auth.getUser();
    const {
      data: host
    } = await supabase.from("hosts").select("id,user_id").eq("building_id", id).eq("user_id", u.user?.id).eq("status", "active").maybeSingle();
    const {
      error
    } = await supabase.from("room_maintenance_status").update({
      payment_status: "paid",
      verified_at: (/* @__PURE__ */ new Date()).toISOString(),
      verified_by: host?.id ?? null
    }).eq("id", verify.statusId);
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const roomId = await getRoomIdFromStatus(verify.statusId);
    if (roomId) {
      const {
        data: ru
      } = await supabase.from("room_users").select("user_id").eq("room_id", roomId).eq("status", "active");
      const ownerIds = (ru || []).map((r) => r.user_id);
      if (ownerIds.length) {
        await createNotifications(ownerIds.map((uid) => ({
          building_id: id,
          receiver_id: uid,
          type: "payment_verified",
          title: "Payment Verified ✅",
          message: `Your payment for ${verify.categoryName} ${verify.month} has been verified by host. Blue tick applied.`,
          related_month: verify.month
        })));
      }
    }
    setBusy(false);
    setVerify(null);
    toast.success("Payment verified");
    load();
  };
  const doReject = async () => {
    if (!verify) return;
    setBusy(true);
    const {
      error
    } = await supabase.from("room_maintenance_status").update({
      payment_status: "not_paid",
      payment_requested_at: null
    }).eq("id", verify.statusId);
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const roomId = await getRoomIdFromStatus(verify.statusId);
    if (roomId) {
      const {
        data: ru
      } = await supabase.from("room_users").select("user_id").eq("room_id", roomId).eq("status", "active");
      const ownerIds = (ru || []).map((r) => r.user_id);
      if (ownerIds.length) {
        await createNotifications(ownerIds.map((uid) => ({
          building_id: id,
          receiver_id: uid,
          type: "payment_rejected",
          title: "Payment Rejected ❌",
          message: `Your payment request for ${verify.categoryName} ${verify.month} was rejected.${rejectReason ? ` Reason: ${rejectReason}.` : ""} Please pay again.`,
          related_month: verify.month
        })));
      }
    }
    setBusy(false);
    setRejectOpen(false);
    setRejectReason("");
    setVerify(null);
    toast.success("Payment rejected");
    load();
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] });
  }
  const unreadCount = notifs.filter((n) => !n.is_read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
        id
      }, className: "hover:text-foreground", children: buildingName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Notifications" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: unreadCount > 0 ? `${unreadCount} unread` : "All caught up" })
      ] }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: markAllRead, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "mr-1 h-4 w-4" }),
        " Mark all read"
      ] })
    ] }),
    notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-muted-foreground", children: "No notifications yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: notifs.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `p-4 transition-colors ${!n.is_read ? "border-primary/40 bg-primary/5" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: notifIcon(n.type) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: n.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: timeAgo(n.created_at) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-muted-foreground", children: n.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
          isHost && n.type === "payment_request" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => openVerify(n), children: "View & Verify" }),
          !n.is_read && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => markRead(n), children: "Mark read" })
        ] })
      ] })
    ] }) }, n.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!verify && !rejectOpen, onOpenChange: (o) => !o && setVerify(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Verify Payment Request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "⚠️ Please check your UPI / Bank account history before verifying." })
      ] }),
      verify && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-md border bg-muted/30 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Room" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: verify.roomNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: verify.categoryName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: verify.month })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: inr(verify.totalDue) })
        ] }),
        verify.requestedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Requested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(verify.requestedAt).toLocaleString("en-IN") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col-reverse gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setVerify(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => setRejectOpen(true), disabled: busy, children: "❌ Reject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: doVerify, disabled: busy, children: [
          busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "✅ Verify Payment"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: rejectOpen, onOpenChange: setRejectOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Provide an optional reason. Status will revert to Not Paid." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Reason for rejection (optional)", value: rejectReason, onChange: (e) => setRejectReason(e.target.value), rows: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: doReject, disabled: busy, children: [
          busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Confirm Reject"
        ] })
      ] })
    ] }) })
  ] });
}
async function getRoomIdFromStatus(statusId) {
  const {
    data
  } = await supabase.from("room_maintenance_status").select("room_id").eq("id", statusId).maybeSingle();
  return data?.room_id ?? null;
}
export {
  NotificationsPage as component
};
