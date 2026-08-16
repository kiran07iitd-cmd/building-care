import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { f as fetchStarred, B as BuildingPhoto, u as unstarBuilding } from "./BuildingPhoto-BrayumXI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./router-s0w5cXDd.mjs";
import { P as Plus, S as Search, U as User, a as LoaderCircle, M as MapPin, b as Star } from "../_libs/lucide-react.mjs";

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
import "./building-photo-CFfezIdh.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function roleBadge(role) {
  if (role === "primary") return "👑 Primary Host";
  if (role === "host") return "🔑 Host";
  if (role === "resident") return "🏠 Resident";
  return null;
}
function StarredCard({
  b,
  role,
  onUnstar
}) {
  const navigate = useNavigate();
  const badge = roleBadge(role);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "cursor-pointer overflow-hidden p-0 transition hover:border-primary hover:shadow-md", onClick: () => navigate({
    to: "/building/$id",
    params: {
      id: b.id
    }
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BuildingPhoto, { path: b.photo_url, alt: b.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-semibold text-white", children: b.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-xs text-white/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
          " ",
          b.location
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "icon", className: "absolute right-2 top-2 h-8 w-8", "aria-label": "Unstar", onClick: (e) => {
        e.stopPropagation();
        onUnstar(b.id);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-yellow-400 text-yellow-500" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground", children: b.unique_code }),
      badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: badge })
    ] })
  ] });
}
function Dashboard() {
  const navigate = useNavigate();
  const {
    activeRole
  } = useAuth();
  const [loading, setLoading] = reactExports.useState(true);
  const [buildings, setBuildings] = reactExports.useState([]);
  const [roles, setRoles] = reactExports.useState({});
  const load = async () => {
    setLoading(true);
    try {
      const ids = await fetchStarred();
      if (!ids.length) {
        setBuildings([]);
        setRoles({});
        return;
      }
      const {
        data: u
      } = await supabase.auth.getUser();
      const uid = u.user?.id;
      const [{
        data: bs,
        error: be
      }, {
        data: hosts
      }, {
        data: rus
      }] = await Promise.all([supabase.from("buildings").select("id,name,location,unique_code,photo_url").in("id", ids), supabase.from("hosts").select("building_id,is_primary,status").eq("user_id", uid).eq("status", "active").in("building_id", ids), supabase.from("room_users").select("room_id,status").eq("user_id", uid).eq("status", "active")]);
      if (be) {
        toast.error("Couldn't load starred buildings");
        return;
      }
      const roleMap = {};
      (hosts || []).forEach((h) => {
        roleMap[h.building_id] = h.is_primary ? "primary" : "host";
      });
      if (rus?.length) {
        const {
          data: rooms
        } = await supabase.from("rooms").select("id,building_id").in("id", rus.map((r) => r.room_id));
        (rooms || []).forEach((r) => {
          if (!roleMap[r.building_id] && ids.includes(r.building_id)) {
            roleMap[r.building_id] = "resident";
          }
        });
      }
      setBuildings(bs || []);
      setRoles(roleMap);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const handleUnstar = async (id) => {
    const prev = buildings;
    setBuildings((cur) => cur.filter((b) => b.id !== id));
    try {
      await unstarBuilding(id);
      toast.success("Removed from starred");
    } catch {
      setBuildings(prev);
      toast.error("Couldn't unstar. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        activeRole === "host" && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register-building", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Register Building"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/search", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-1 h-4 w-4" }),
          " Search"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-1 h-4 w-4" }),
          " Profile"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "⭐ My Buildings" }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : buildings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-3xl", children: "⭐" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold", children: "No buildings starred yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mb-5 max-w-sm text-sm text-muted-foreground", children: "Search your building from the search page and star it to see it here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
        to: "/search"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-1 h-4 w-4" }),
        " Search Buildings"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: buildings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(StarredCard, { b, role: roles[b.id] ?? null, onUnstar: handleUnstar }, b.id)) })
  ] });
}
export {
  Dashboard as component
};
