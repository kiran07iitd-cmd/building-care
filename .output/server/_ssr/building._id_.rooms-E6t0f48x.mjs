import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn, n as addRoomToBuilding, o as toggleRoomActive, q as removeRoomUser, w as searchAssignableUser, x as assignUserToRoom, y as getManageRoomsData } from "./building-management.functions-CqYXvTLm.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button, c as cn } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-BKQb_NCP.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRequireHost } from "./use-require-host-CFEB9FQj.mjs";

import "../_libs/seroval.mjs";
import { c as ChevronRight, A as ArrowLeft, P as Plus, H as House, l as UserPlus, z as UserMinus, a as LoaderCircle, S as Search } from "../_libs/lucide-react.mjs";

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
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "./client-DjU25MuW.mjs";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const errorMessage = (e) => e instanceof Error ? e.message : "Something went wrong. Please try again.";
function ManageRoomsPage() {
  const {
    id
  } = useParams({
    from: "/_authenticated/building/$id_/rooms"
  });
  useRequireHost(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchRooms = useServerFn(getManageRoomsData);
  const createRoom = useServerFn(addRoomToBuilding);
  const setRoomActive = useServerFn(toggleRoomActive);
  const unassignRoomUser = useServerFn(removeRoomUser);
  const findUser = useServerFn(searchAssignableUser);
  const assignRoomUser = useServerFn(assignUserToRoom);
  const query = useQuery({
    queryKey: ["rooms", id],
    queryFn: async () => {
      try {
        return await fetchRooms({
          data: {
            buildingId: id
          }
        });
      } catch (e) {
        toast.error(errorMessage(e));
        navigate({
          to: "/building/$id",
          params: {
            id
          }
        });
        throw e;
      }
    },
    staleTime: 30 * 1e3
  });
  const buildingName = query.data?.buildingName ?? "";
  const rooms = query.data?.rooms ?? [];
  const assignments = query.data?.assignments ?? {};
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r) => r.is_active).length;
  const inactiveRooms = totalRooms - activeRooms;
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["rooms", id]
  });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [newRoom, setNewRoom] = reactExports.useState("");
  const [addError, setAddError] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const submitAdd = async (e) => {
    e.preventDefault();
    const num = newRoom.trim();
    setAddError(null);
    if (!num) return setAddError("Room number is required");
    if (rooms.some((r) => r.room_number.toLowerCase() === num.toLowerCase())) {
      return setAddError(`Room ${num} already exists in this building`);
    }
    setAdding(true);
    try {
      await createRoom({
        data: {
          buildingId: id,
          roomNumber: num
        }
      });
      toast.success(`Room ${num} added successfully!`);
      setNewRoom("");
      setAddOpen(false);
      invalidate();
    } catch (e2) {
      setAddError(errorMessage(e2));
    } finally {
      setAdding(false);
    }
  };
  const [confirmToggle, setConfirmToggle] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(null);
  const doToggle = async (room) => {
    setBusy(room.id);
    try {
      await setRoomActive({
        data: {
          buildingId: id,
          roomId: room.id,
          isActive: !room.is_active
        }
      });
      toast.success(room.is_active ? "Room deactivated" : "Room activated");
      setConfirmToggle(null);
      invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };
  const [confirmRemove, setConfirmRemove] = reactExports.useState(null);
  const doRemoveUser = async (room) => {
    setBusy(room.id);
    try {
      await unassignRoomUser({
        data: {
          buildingId: id,
          roomId: room.id
        }
      });
      toast.success(`User removed from Room ${room.room_number}`);
      setConfirmRemove(null);
      invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };
  const [assignRoom, setAssignRoom] = reactExports.useState(null);
  const [assignEmail, setAssignEmail] = reactExports.useState("");
  const [searching, setSearching] = reactExports.useState(false);
  const [foundUser, setFoundUser] = reactExports.useState(null);
  const [assignError, setAssignError] = reactExports.useState(null);
  const openAssign = (room) => {
    setAssignRoom(room);
    setAssignEmail("");
    setFoundUser(null);
    setAssignError(null);
  };
  const searchUser = async () => {
    const email = assignEmail.trim().toLowerCase();
    setAssignError(null);
    setFoundUser(null);
    if (!email) return setAssignError("Enter an email");
    setSearching(true);
    try {
      const data = await findUser({
        data: {
          buildingId: id,
          email
        }
      });
      setFoundUser({
        id: data.id,
        email: data.email ?? email,
        name: data.name
      });
    } catch (e) {
      setAssignError(errorMessage(e));
    } finally {
      setSearching(false);
    }
  };
  const confirmAssign = async () => {
    if (!assignRoom || !foundUser) return;
    setBusy(assignRoom.id);
    try {
      await assignRoomUser({
        data: {
          buildingId: id,
          roomId: assignRoom.id,
          userId: foundUser.id
        }
      });
      toast.success(`User assigned to Room ${assignRoom.room_number} successfully!`);
      setAssignRoom(null);
      setFoundUser(null);
      setAssignEmail("");
      invalidate();
    } catch (e) {
      setAssignError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
        id
      }, className: "hover:text-foreground", children: buildingName || "Building" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Manage Rooms" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate({
          to: "/building/$id",
          params: {
            id
          }
        }), "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Manage Rooms" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setAddOpen(true);
        setAddError(null);
        setNewRoom("");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " Add Room"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Rooms", value: totalRooms, loading: query.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Rooms", value: activeRooms, loading: query.isLoading, tone: "green" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Inactive Rooms", value: inactiveRooms, loading: query.isLoading, tone: "red" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: Array.from({
      length: 5
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-40" })
    ] }, i)) }) : rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 px-4 py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No rooms added yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: 'Click "Add Room" to add the first room' }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " Add Room"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: rooms.map((r) => {
      const a = assignments[r.id];
      const isBusy = busy === r.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              "Room ",
              r.room_number
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: r.is_active ? "🟢 Active" : "🔴 Inactive" })
          ] }),
          a ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: a.name || "(no name)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-0.5", children: [
              a.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "✉️ ",
                a.email
              ] }),
              a.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "📞 ",
                a.mobile
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Not Assigned" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openAssign(r), disabled: isBusy, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-3.5 w-3.5" }),
            a ? "Replace" : "Assign User"
          ] }),
          a && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setConfirmRemove(r), disabled: isBusy, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "mr-1 h-3.5 w-3.5" }),
            " Remove"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: r.is_active ? "destructive" : "default", onClick: () => setConfirmToggle(r), disabled: isBusy, children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : r.is_active ? "Deactivate" : "Activate" })
        ] })
      ] }, r.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => !adding && setAddOpen(o), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add New Room" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "e.g. 101, A-201, GF-01" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitAdd, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Room number", value: newRoom, onChange: (e) => {
          setNewRoom(e.target.value);
          setAddError(null);
        }, autoFocus: true }),
        addError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: addError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setAddOpen(false), disabled: adding, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: adding, children: [
            adding && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
            "Add Room"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!confirmToggle, onOpenChange: (o) => !o && setConfirmToggle(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          confirmToggle?.is_active ? "Deactivate" : "Activate",
          " Room ",
          confirmToggle?.room_number,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: confirmToggle?.is_active ? "This room will be excluded from maintenance calculations. Amount per room will be recalculated." : "This room will be included in maintenance calculations. Amount per room will be recalculated." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: !!busy, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: (e) => {
          e.preventDefault();
          confirmToggle && doToggle(confirmToggle);
        }, disabled: !!busy, children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : confirmToggle?.is_active ? "Deactivate" : "Activate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!confirmRemove, onOpenChange: (o) => !o && setConfirmRemove(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Remove User from Room ",
          confirmRemove?.room_number,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          confirmRemove && assignments[confirmRemove.id]?.email,
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "will be removed from this room. They will lose access to bills."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: !!busy, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: (e) => {
          e.preventDefault();
          confirmRemove && doRemoveUser(confirmRemove);
        }, disabled: !!busy, children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Remove User" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!assignRoom, onOpenChange: (o) => !o && setAssignRoom(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Assign User to Room ",
          assignRoom?.room_number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "User must be registered on BuildingCare." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "owner@example.com", value: assignEmail, onChange: (e) => {
            setAssignEmail(e.target.value);
            setFoundUser(null);
            setAssignError(null);
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: searchUser, disabled: searching, children: [
            searching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
            "Search"
          ] })
        ] }),
        foundUser && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-accent/50 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            "✅ ",
            foundUser.name || "(no name)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: foundUser.email })
        ] }),
        assignError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: assignError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAssignRoom(null), disabled: !!busy, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: confirmAssign, disabled: !foundUser || !!busy, children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : null,
          "Assign This User"
        ] })
      ] })
    ] }) })
  ] });
}
function StatCard({
  label,
  value,
  loading,
  tone
}) {
  const color = tone === "green" ? "text-green-600" : tone === "red" ? "text-red-600" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mx-auto mt-2 h-7 w-10" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-2xl font-bold ${color}`, children: value })
  ] });
}
export {
  ManageRoomsPage as component
};
