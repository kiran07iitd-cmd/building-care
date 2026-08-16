import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn, a as getManageHostsData, v as voteOnHostRequest, b as requestAddBuildingHost, c as requestHostLimitChange, d as transferHostPosition } from "./building-management.functions-CqYXvTLm.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dn_c42EA.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-BKQb_NCP.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRequireHost } from "./use-require-host-CFEB9FQj.mjs";

import "../_libs/seroval.mjs";
import { a as LoaderCircle, c as ChevronRight, q as UsersRound, l as UserPlus, r as ArrowRightLeft, k as Check, X } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "./client-DjU25MuW.mjs";
const errorMessage = (error) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
function ManageHostsPage() {
  const {
    id
  } = useParams({
    from: "/_authenticated/building/$id_/hosts"
  });
  useRequireHost(id);
  const navigate = useNavigate();
  const fetchHosts = useServerFn(getManageHostsData);
  const submitAddHostRequest = useServerFn(requestAddBuildingHost);
  const submitHostLimitRequest = useServerFn(requestHostLimitChange);
  const submitHostVote = useServerFn(voteOnHostRequest);
  const submitHostTransfer = useServerFn(transferHostPosition);
  const [loading, setLoading] = reactExports.useState(true);
  const [buildingName, setBuildingName] = reactExports.useState("");
  const [hostCount, setHostCount] = reactExports.useState(1);
  const [myUserId, setMyUserId] = reactExports.useState(null);
  const [myHostId, setMyHostId] = reactExports.useState(null);
  const [hosts, setHosts] = reactExports.useState([]);
  const [requests, setRequests] = reactExports.useState([]);
  const [votes, setVotes] = reactExports.useState([]);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addForm, setAddForm] = reactExports.useState({
    email: "",
    mobile: "",
    google: ""
  });
  const [addBusy, setAddBusy] = reactExports.useState(false);
  const [transferHost, setTransferHost] = reactExports.useState(null);
  const [transferForm, setTransferForm] = reactExports.useState({
    email: "",
    mobile: "",
    google: ""
  });
  const [transferBusy, setTransferBusy] = reactExports.useState(false);
  const [limitOpen, setLimitOpen] = reactExports.useState(false);
  const [newLimit, setNewLimit] = reactExports.useState("1");
  const [confirmTransfer, setConfirmTransfer] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHosts({
        data: {
          buildingId: id
        }
      });
      setMyUserId(data.myUserId);
      setMyHostId(data.myHostId);
      setBuildingName(data.buildingName);
      setHostCount(data.hostCount);
      setNewLimit(String(data.hostCount));
      setHosts(data.hosts);
      setRequests(data.requests);
      setVotes(data.votes);
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
      setAddForm({
        email: "",
        mobile: "",
        google: ""
      });
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
      await submitHostLimitRequest({
        data: {
          buildingId: id,
          limit
        }
      });
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
      await submitHostVote({
        data: {
          buildingId: id,
          requestId: request.id,
          vote: value
        }
      });
      toast.success(value === "agree" ? "Vote submitted" : "Request rejected");
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const startTransfer = (host) => {
    setTransferHost(host);
    setTransferForm({
      email: "",
      mobile: "",
      google: ""
    });
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
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setTransferBusy(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading hosts…"
    ] });
  }
  const requestVoteCount = (req) => {
    const rv = votes.filter((v) => v.request_id === req.id);
    return {
      agree: rv.filter((v) => v.vote === "agree").length,
      total: hosts.length,
      mine: rv.find((v) => v.host_id === myHostId)?.vote
    };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
        id
      }, className: "hover:text-foreground", children: buildingName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Hosts" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Manage Hosts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          hosts.length,
          " active host",
          hosts.length === 1 ? "" : "s",
          " · Limit ",
          hostCount
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setLimitOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "mr-1 h-4 w-4" }),
          " Change Host Limit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
          " Request Add Host"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: hosts.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: h.name || "(no name)" }),
          h.is_primary ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800", children: "👑 Primary Host" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700", children: "Host" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700", children: "Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          h.email,
          " · ",
          h.mobile || "no mobile"
        ] })
      ] }),
      h.user_id === myUserId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => startTransfer(h), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "mr-1 h-3.5 w-3.5" }),
        " Transfer My Position"
      ] })
    ] }, h.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "Pending Requests" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => vote(r, "disagree"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
            " Disagree"
          ] })
        ] })
      ] }) }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: setAddOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request to add a new host" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "All current hosts must agree before the new host is added." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitAddHost, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: addForm.email, onChange: (e) => setAddForm({
            ...addForm,
            email: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.mobile, onChange: (e) => setAddForm({
            ...addForm,
            mobile: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google Account email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: addForm.google, onChange: (e) => setAddForm({
            ...addForm,
            google: e.target.value
          }), required: true })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!transferHost, onOpenChange: (o) => {
      if (!o) {
        setTransferHost(null);
        setConfirmTransfer(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Transfer my host position" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "The new person must already be registered on BuildingCare." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: transferForm.email, onChange: (e) => setTransferForm({
            ...transferForm,
            email: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: transferForm.mobile, onChange: (e) => setTransferForm({
            ...transferForm,
            mobile: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google Account email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: transferForm.google, onChange: (e) => setTransferForm({
            ...transferForm,
            google: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTransferHost(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => setConfirmTransfer(true), children: "Transfer" })
      ] })
    ] }) }),
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
  ] });
}
export {
  ManageHostsPage as component
};
