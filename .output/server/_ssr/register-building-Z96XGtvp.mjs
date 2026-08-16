import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-B-aHHzDY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dn_c42EA.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as uploadBuildingPhoto } from "./building-photo-CFfezIdh.mjs";
import { u as useAuth } from "./router-s0w5cXDd.mjs";
import { u as useServerFn, r as registerNewBuilding } from "./building-management.functions-CqYXvTLm.mjs";

import "../_libs/seroval.mjs";
import { d as ShieldAlert, L as LogOut, A as ArrowLeft, X, I as ImagePlus, a as LoaderCircle } from "../_libs/lucide-react.mjs";

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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./server-CRlammpZ.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./auth-middleware-1oyI6D-P.mjs";
import "../_libs/zod.mjs";
function RegisterBuilding() {
  const {
    activeRole,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = reactExports.useState("");
  const [location, setLocation] = reactExports.useState("");
  const [hostCount, setHostCount] = reactExports.useState("1");
  const [photo, setPhoto] = reactExports.useState(null);
  const [photoPreview, setPhotoPreview] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const createBuildingFn = useServerFn(registerNewBuilding);
  const onPhotoSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      return toast.error("Only JPG, PNG or WEBP images allowed");
    }
    if (f.size > 5 * 1024 * 1024) {
      return toast.error("Image too large (max 5MB)");
    }
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };
  const clearPhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return toast.error("Name and location are required");
    if (activeRole !== "host") {
      return toast.error("403 Forbidden: Only hosts can register buildings");
    }
    setBusy(true);
    try {
      const result = await createBuildingFn({
        data: {
          name: name.trim(),
          location: location.trim(),
          hostCount: parseInt(hostCount, 10),
          activeRole
        }
      });
      if (!result?.building) {
        throw new Error("Failed to create building");
      }
      const buildingId = result.building.id;
      const code = result.building.unique_code;
      if (photo) {
        try {
          const {
            path
          } = await uploadBuildingPhoto(photo, buildingId);
          await supabase.from("buildings").update({
            photo_url: path
          }).eq("id", buildingId);
        } catch (err) {
          const message = err instanceof Error ? err.message : "try again later";
          toast.error(`Photo upload failed: ${message}`);
        }
      }
      toast.success(`Building created! Share code ${code} with residents.`);
      navigate({
        to: "/building/$id",
        params: {
          id: buildingId
        }
      });
    } catch (err) {
      console.error("Register building error:", err);
      const errMsg = err?.message || err?.error || "Could not create building";
      if (errMsg.includes("403") || errMsg.toLowerCase().includes("forbidden")) {
        toast.error("403 Forbidden: Only active hosts can register buildings");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setBusy(false);
    }
  };
  if (activeRole !== "host") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto max-w-xl px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-destructive/30 p-6 text-center shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-destructive", children: "403 Forbidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: "Access Restricted to Host Mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: [
        "Building registration is only permitted when logged in with the active role set to",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Host" }),
        ". Your current session is set to",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Living Person Mode" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto mt-2 max-w-md text-xs text-muted-foreground", children: [
        "To register a new building, please sign out and select ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Host" }),
        " on the login screen."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: async () => {
          await signOut();
          toast.success("Signed out. Select Host on the login screen.");
          navigate({
            to: "/auth"
          });
        }, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          "Sign Out & Log In as Host"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Back to Dashboard" }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-xl px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/profile", className: "mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " Profile"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Register New Building" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bn", children: "Building Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "bn", required: true, value: name, onChange: (e) => setName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bl", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "bl", required: true, value: location, onChange: (e) => setLocation(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Hosts allowed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hostCount, onValueChange: setHostCount, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: n }, n)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Building Photo (optional)" }),
          photoPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 overflow-hidden rounded-md border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photoPreview, alt: "Preview", className: "h-40 w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "icon", className: "absolute right-2 top-2 h-8 w-8", onClick: clearPhoto, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-accent/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "mb-1 h-5 w-5" }),
            "Click to upload (JPG/PNG/WEBP, max 5MB)",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "image/jpeg,image/png,image/webp", onChange: onPhotoSelect })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: busy, children: [
          busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
          busy ? "Creating…" : "Create Building"
        ] })
      ] }) })
    ] })
  ] });
}
export {
  RegisterBuilding as component
};
