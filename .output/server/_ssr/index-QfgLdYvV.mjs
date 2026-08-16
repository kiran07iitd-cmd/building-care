import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Building2 } from "../_libs/lucide-react.mjs";

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
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "container mx-auto flex items-center justify-between px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "BuildingCare" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", children: "Login" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "container mx-auto px-4 py-20 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight sm:text-5xl", children: "Manage your building maintenance easily" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg text-muted-foreground", children: "BuildingCare helps hosts and residents track rooms, bills, and maintenance — all in one simple place." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", children: "Login" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", children: "Register" }) })
      ] })
    ] }) })
  ] });
}
export {
  Landing as component
};
