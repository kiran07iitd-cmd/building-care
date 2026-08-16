import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { f as fetchStarred, B as BuildingPhoto, u as unstarBuilding, s as starBuilding } from "./BuildingPhoto-BrayumXI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as looksLikeBuildingCode, n as normalizeBuildingCode } from "./building-code-BRTuCI6i.mjs";
import { A as ArrowLeft, a as LoaderCircle, S as Search, M as MapPin, b as Star } from "../_libs/lucide-react.mjs";

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
function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = reactExports.useState("");
  const [results, setResults] = reactExports.useState([]);
  const [searching, setSearching] = reactExports.useState(false);
  const [starred, setStarred] = reactExports.useState([]);
  reactExports.useEffect(() => {
    fetchStarred().then(setStarred).catch(() => {
    });
  }, []);
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const q = query.trim();
    if (!looksLikeBuildingCode(q)) {
      setSearching(false);
      setResults([]);
      toast.info("Please enter the building code (e.g. B-7X4K92) to search.");
      return;
    }
    const code = normalizeBuildingCode(q);
    const {
      data,
      error
    } = await supabase.from("buildings").select("id,name,location,unique_code,photo_url").eq("unique_code", code).limit(1);
    setSearching(false);
    if (error) return toast.error("Search failed. Please try again.");
    setResults(data || []);
    if (!data?.length) toast.info(`No building found for code ${code}. Ask your host to verify the code.`);
  };
  const toggleStar = async (b, e) => {
    e.stopPropagation();
    const isStarred = starred.includes(b.id);
    const next = isStarred ? starred.filter((x) => x !== b.id) : [...starred, b.id];
    setStarred(next);
    try {
      if (isStarred) await unstarBuilding(b.id);
      else await starBuilding(b.id);
      toast.success(isStarred ? "Removed from starred" : "Starred");
    } catch {
      setStarred(starred);
      toast.error("Couldn't update star. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-3xl px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " Dashboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-2xl font-bold", children: "Search Buildings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-5 text-sm text-muted-foreground", children: "Enter an exact building code (e.g. B-7X4K92). Search by name is disabled — please ask your host for the code." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSearch, className: "mb-6 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Enter building code (B-7X4K92)", value: query, onChange: (e) => setQuery(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: searching, className: "min-w-[44px]", children: searching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }) })
    ] }),
    results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-sm text-muted-foreground", children: "Start searching to find a building." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: results.map((b) => {
      const isStarred = starred.includes(b.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "cursor-pointer overflow-hidden p-0 transition hover:border-primary hover:shadow-sm", onClick: () => navigate({
        to: "/building/$id",
        params: {
          id: b.id
        }
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BuildingPhoto, { path: b.photo_url, alt: b.name, iconClassName: "h-10 w-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-semibold text-white", children: b.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-xs text-white/90", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
              " ",
              b.location
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "icon", className: "absolute right-2 top-2 h-8 w-8", onClick: (e) => toggleStar(b, e), "aria-label": "Star", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-500" : ""}` }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground", children: b.unique_code }) })
      ] }, b.id);
    }) })
  ] });
}
export {
  SearchPage as component
};
