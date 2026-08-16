import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Badge } from "./badge-B-q03HH0.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./router-s0w5cXDd.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-pXddDSBH.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dn_c42EA.mjs";
import { a as LoaderCircle, c as ChevronRight, L as LogOut, C as Crown, H as House, B as Building2, S as Search, T as Trash2 } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
function ProfilePage() {
  const {
    signOut,
    user,
    activeRole
  } = useAuth();
  const [loading, setLoading] = reactExports.useState(true);
  const [profile, setProfile] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [mobile, setMobile] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [myBuildings, setMyBuildings] = reactExports.useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = reactExports.useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = reactExports.useState("");
  const [confirmText, setConfirmText] = reactExports.useState("");
  const [deleting, setDeleting] = reactExports.useState(false);
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
      const {
        error
      } = await supabase.rpc("delete_building", {
        building_id_to_delete: selectedBuildingId
      });
      if (error) {
        console.error("Delete building error:", error);
        if (error.message && error.message.includes("function delete_building")) {
          toast.error("Database migration required: Please run the SQL migration (delete_building_rpc.sql) on your Supabase dashboard SQL Editor.", {
            duration: 6e3
          });
        } else {
          toast.error(error.message || "Failed to delete building. Please try again.");
        }
        return;
      }
      toast.success(`Building "${selectedBuildingName}" deleted successfully`);
      setIsDeleteModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };
  const load = async () => {
    setLoading(true);
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const uid = u.user.id;
    const [{
      data: p
    }, {
      data: hosts
    }, {
      data: rus
    }] = await Promise.all([supabase.from("profiles").select("*").eq("id", uid).maybeSingle(), supabase.from("hosts").select("building_id,is_primary,status").eq("user_id", uid).eq("status", "active"), supabase.from("room_users").select("room_id,status").eq("user_id", uid).eq("status", "active")]);
    setProfile(p);
    setName(p?.name || "");
    setMobile(p?.mobile || "");
    const buildingIds = /* @__PURE__ */ new Set();
    const roleMap = /* @__PURE__ */ new Map();
    (hosts || []).forEach((h) => {
      buildingIds.add(h.building_id);
      roleMap.set(h.building_id, h.is_primary ? "👑 Primary Host" : "🔑 Host");
    });
    if (rus && rus.length) {
      const {
        data: rooms
      } = await supabase.from("rooms").select("id,building_id").in("id", rus.map((r) => r.room_id));
      (rooms || []).forEach((r) => {
        buildingIds.add(r.building_id);
        if (!roleMap.has(r.building_id)) roleMap.set(r.building_id, "🏠 Resident");
      });
    }
    if (buildingIds.size) {
      const {
        data: bs
      } = await supabase.from("buildings").select("id,name,location").in("id", Array.from(buildingIds));
      setMyBuildings((bs || []).map((b) => ({
        ...b,
        role: roleMap.get(b.id) || ""
      })));
    } else {
      setMyBuildings([]);
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const save = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) return toast.error("Enter a valid mobile number");
    setSaving(true);
    const {
      error
    } = await supabase.from("profiles").update({
      name: name.trim(),
      mobile: mobile.trim()
    }).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save changes. Please try again.");
    toast.success("Profile updated");
    setEditing(false);
    load();
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Profile" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => signOut(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-1 h-4 w-4" }),
        " Sign out"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 p-5", children: !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Name", value: profile?.name || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Email", value: profile?.email || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Mobile", value: profile?.mobile || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Google", value: profile?.google_account || "Not linked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Member since", value: profile ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditing(true), children: "Edit Profile" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mobile, onChange: (e) => setMobile(e.target.value), placeholder: "Required for host verification" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: profile?.email || "", disabled: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Email cannot be changed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          "Save"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(false), disabled: saving, children: "Cancel" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "🔐 Current Login Mode" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Session Mode:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: activeRole === "host" ? "default" : "secondary", className: "gap-1 px-2.5 py-0.5 text-xs font-semibold", children: activeRole === "host" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5 text-amber-300" }),
            " Host Mode"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-3.5 w-3.5 text-blue-500" }),
            " Living Person Mode"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: activeRole === "host" ? "You are logged in under Host Mode. You can register new buildings and manage properties." : "You are logged in under Living Person Mode. Building registration is disabled. To switch modes, sign out and select Host on the login page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => signOut(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-1 h-3.5 w-3.5" }),
        " Switch Mode (Logout)"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "⚙️ My Account Actions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
      activeRole === "host" && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register-building", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-4 w-4" }),
        " 🏢 Register New Building"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/search", className: activeRole !== "host" ? "sm:col-span-2" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4" }),
        " 🔍 Search & Join Building"
      ] }) }),
      primaryHostedBuildings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2", onClick: () => {
        setSelectedBuildingId(primaryHostedBuildings[0].id);
        setConfirmText("");
        setIsDeleteModalOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        " 🗑️ Remove Registered Building"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "My Buildings" }),
    myBuildings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-center text-sm text-muted-foreground", children: "You're not a host or resident in any building yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: myBuildings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
      id: b.id
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 transition hover:border-primary hover:shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: b.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: b.location })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-accent px-2 py-0.5 text-xs", children: b.role })
    ] }) }) }, b.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDeleteModalOpen, onOpenChange: setIsDeleteModalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-5 w-5" }),
          " Delete Registered Building"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "pt-2 text-sm text-muted-foreground", children: [
          "This action is ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "permanent" }),
          " and cannot be undone. It will delete the building and all its associated data (rooms, residents, announcements, maintenance categories, monthly maintenance, and payments) from both the website and backend."
        ] })
      ] }),
      primaryHostedBuildings.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "building-select", children: "Select Building to Delete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBuildingId, onValueChange: (val) => {
          setSelectedBuildingId(val);
          setConfirmText("");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "building-select", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select building" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: primaryHostedBuildings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id, children: [
            "🏢 ",
            b.name
          ] }, b.id)) })
        ] })
      ] }),
      selectedBuildingName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold block mb-1", children: "⚠️ Warning:" }),
          "You are deleting ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold underline", children: selectedBuildingName }),
          ". This action is irreversible."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "To verify, type the name of the building below:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded bg-muted p-2 font-mono text-xs select-all text-center font-bold text-foreground", children: selectedBuildingName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "Type the exact building name to confirm", value: confirmText, onChange: (e) => setConfirmText(e.target.value), disabled: deleting })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsDeleteModalOpen(false), disabled: deleting, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: handleDeleteBuilding, disabled: deleting || confirmText.trim() !== selectedBuildingName.trim(), children: deleting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          " Deleting..."
        ] }) : "Delete Building" })
      ] })
    ] }) })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b py-2 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value })
  ] });
}
export {
  ProfilePage as component
};
