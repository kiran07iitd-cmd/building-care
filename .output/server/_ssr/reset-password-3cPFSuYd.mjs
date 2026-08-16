import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-B-aHHzDY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Building2 } from "../_libs/lucide-react.mjs";

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
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  reactExports.useEffect(() => {
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated! Please sign in.");
    await supabase.auth.signOut();
    navigate({
      to: "/auth"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-center gap-2 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-7 w-7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-semibold", children: "BuildingCare" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Reset your password" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !ready ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Open this page from the password reset link in your email." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "np", children: "New password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "np", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp", children: "Confirm password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cp", type: "password", required: true, minLength: 6, value: confirm, onChange: (e) => setConfirm(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: busy, children: "Update password" })
      ] }) })
    ] })
  ] }) });
}
export {
  ResetPasswordPage as component
};
