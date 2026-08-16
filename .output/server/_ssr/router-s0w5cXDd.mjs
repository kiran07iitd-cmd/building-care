import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { V as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";

import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
const Ctx = reactExports.createContext({
  user: null,
  session: null,
  loading: true,
  activeRole: "resident",
  setActiveRole: async () => {
  },
  signOut: async () => {
  }
});
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeRole, setActiveRoleState] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("active_role");
      if (stored === "host" || stored === "resident") return stored;
    }
    return "resident";
  });
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        const storedRole = localStorage.getItem("active_role");
        const metaRole = s.user.user_metadata?.role;
        const initialRole = storedRole || metaRole || "resident";
        setActiveRoleState(initialRole);
        localStorage.setItem("active_role", initialRole);
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const storedRole = localStorage.getItem("active_role");
        const metaRole = data.session.user.user_metadata?.role;
        const initialRole = storedRole || metaRole || "resident";
        setActiveRoleState(initialRole);
        localStorage.setItem("active_role", initialRole);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const setActiveRole = async (newRole) => {
    setActiveRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_role", newRole);
    }
    if (session?.user) {
      try {
        await supabase.auth.updateUser({
          data: { role: newRole }
        });
      } catch (err) {
        console.error("Failed to sync active role to user metadata:", err);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Ctx.Provider,
    {
      value: {
        user: session?.user ?? null,
        session,
        loading,
        activeRole,
        setActiveRole,
        signOut: async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          if (typeof window !== "undefined") {
            localStorage.removeItem("active_role");
          }
          await supabase.auth.signOut();
        }
      },
      children
    }
  );
}
const useAuth = () => reactExports.useContext(Ctx);
const appCss = "/assets/styles-DdBhnPn9.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Go home"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/auth",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Sign in"
        }
      )
    ] })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$e = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BuildingCare" },
      { name: "description", content: "Building Maintenance Manager" },
      { name: "theme-color", content: "#2563EB" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "BuildingCare" },
      { property: "og:title", content: "BuildingCare" },
      { property: "og:description", content: "Building Maintenance Manager" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$e.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true })
  ] }) });
}
const $$splitComponentImporter$d = () => import("./index-QfgLdYvV.mjs");
const Route$d = createFileRoute()({
  head: () => ({
    meta: [{
      title: "BuildingCare — Manage your building maintenance easily"
    }, {
      name: "description",
      content: "BuildingCare helps hosts and residents manage building maintenance, rooms, and bills in one place."
    }, {
      property: "og:title",
      content: "BuildingCare"
    }, {
      property: "og:description",
      content: "Manage your building maintenance easily."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./route-B2ay8kLN.mjs");
const Route$c = createFileRoute()({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({
      to: "/auth"
    });
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./auth-DXGEoOVd.mjs");
const Route$b = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Sign in — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./reset-password-3cPFSuYd.mjs");
const Route$a = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Reset password — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./dashboard-C2YRO4Jo.mjs");
const Route$9 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Dashboard — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./profile-CGgcSwMT.mjs");
const Route$8 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Profile — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./register-building-Z96XGtvp.mjs");
const Route$7 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Register Building — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./search-CnN7Yw5g.mjs");
const Route$6 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Search Buildings — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./building._id-fP3FJnpm.mjs");
const Route$5 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Building — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./building._id_.chat-CVpIluId.mjs");
const Route$4 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Chat — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./building._id_.hosts-gKy10CoX.mjs");
const Route$3 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Manage Hosts — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./building._id_.maintenance-BEHOCDN4.mjs");
const Route$2 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Maintenance — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./building._id_.notifications-NnMAhxMq.mjs");
const Route$1 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Notifications — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./building._id_.rooms-E6t0f48x.mjs");
const Route = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Manage Rooms — BuildingCare"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$e
});
const AuthenticatedRouteRoute = Route$c.update({
  id: "/_authenticated",
  getParentRoute: () => Route$e
});
const AuthRoute = Route$b.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$e
});
const ResetPasswordRoute = Route$a.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$e
});
const AuthenticatedDashboardRoute = Route$9.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProfileRoute = Route$8.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRegisterBuildingRoute = Route$7.update({
  id: "/register-building",
  path: "/register-building",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedSearchRoute = Route$6.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdRoute = Route$5.update({
  id: "/building/$id",
  path: "/building/$id",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdChatRoute = Route$4.update({
  id: "/building/$id_/chat",
  path: "/building/$id/chat",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdHostsRoute = Route$3.update({
  id: "/building/$id_/hosts",
  path: "/building/$id/hosts",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdMaintenanceRoute = Route$2.update({
  id: "/building/$id_/maintenance",
  path: "/building/$id/maintenance",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdNotificationsRoute = Route$1.update({
  id: "/building/$id_/notifications",
  path: "/building/$id/notifications",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedBuildingIdRoomsRoute = Route.update({
  id: "/building/$id_/rooms",
  path: "/building/$id/rooms",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedDashboardRoute,
  AuthenticatedProfileRoute,
  AuthenticatedRegisterBuildingRoute,
  AuthenticatedSearchRoute,
  AuthenticatedBuildingIdRoute,
  AuthenticatedBuildingIdChatRoute,
  AuthenticatedBuildingIdHostsRoute,
  AuthenticatedBuildingIdMaintenanceRoute,
  AuthenticatedBuildingIdNotificationsRoute,
  AuthenticatedBuildingIdRoomsRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
  ResetPasswordRoute
};
const routeTree = Route$e._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  router as r,
  useAuth as u
};
