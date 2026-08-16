import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as Outlet, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Badge } from "./badge-B-q03HH0.mjs";
import { u as useAuth } from "./router-s0w5cXDd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Building2, C as Crown, H as House, P as Plus, U as User, L as LogOut } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-DjU25MuW.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
function Navbar() {
  const { signOut, user, activeRole } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate({ to: "/" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex h-16 items-center justify-between px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2 font-semibold text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "BuildingCare" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-2 sm:gap-3", children: [
      user && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: activeRole === "host" ? "default" : "secondary",
          className: "hidden sm:inline-flex items-center gap-1 py-1 px-2.5 text-xs font-semibold",
          children: activeRole === "host" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5 text-amber-300" }),
            " Host Mode"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-3.5 w-3.5 text-blue-500" }),
            " Living Person Mode"
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/dashboard",
          className: "hidden sm:inline-flex rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
          children: "Dashboard"
        }
      ),
      user && activeRole === "host" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/register-building",
          className: "hidden sm:inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            "Register Building"
          ]
        }
      ),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/profile",
          className: "hidden sm:inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
            "Profile"
          ]
        }
      ),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: handleLogout, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-1 h-4 w-4" }),
        " Logout"
      ] })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
] });
export {
  SplitComponent as component
};
