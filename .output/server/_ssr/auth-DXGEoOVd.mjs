import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { B as Button, c as cn } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-B-aHHzDY.mjs";
import { R as Root2, L as List, T as Trigger, C as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./router-s0w5cXDd.mjs";
import { B as Building2, H as House, C as Crown, a as LoaderCircle } from "../_libs/lucide-react.mjs";

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
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
function AuthPage() {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [busy, setBusy] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [mobile, setMobile] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("resident");
  const [dob, setDob] = reactExports.useState("");
  const [otpPhone, setOtpPhone] = reactExports.useState("");
  const [otpCode, setOtpCode] = reactExports.useState("");
  const [otpSent, setOtpSent] = reactExports.useState(false);
  const normalizePhone = (v) => {
    const digits = v.replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };
  const smsError = (msg) => /phone|sms|provider|not enabled|unsupported/i.test(msg) ? "SMS sign-in isn't enabled on this app yet. Please use email or Google for now." : msg;
  const syncUserRole = async (targetRole) => {
    localStorage.setItem("active_role", targetRole);
    try {
      await supabase.auth.updateUser({
        data: {
          role: targetRole
        }
      });
    } catch (err) {
      console.error("Error updating user role metadata:", err);
    }
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const phone = normalizePhone(otpPhone);
    if (phone.length < 8) return toast.error("Enter a valid mobile number with country code");
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithOtp({
      phone
    });
    setBusy(false);
    if (error) return toast.error(smsError(error.message));
    setOtpSent(true);
    toast.success("Code sent! Check your messages.");
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    const {
      error
    } = await supabase.auth.verifyOtp({
      phone: normalizePhone(otpPhone),
      token: otpCode.trim(),
      type: "sms"
    });
    if (error) {
      setBusy(false);
      return toast.error(smsError(error.message));
    }
    await syncUserRole(role);
    setBusy(false);
    toast.success(`Signed in as ${role === "host" ? "Host" : "Living Person"}!`);
    navigate({
      to: "/dashboard"
    });
  };
  const calcAge = (isoDate) => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return -1;
    const now = /* @__PURE__ */ new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || m === 0 && now.getDate() < d.getDate()) age--;
    return age;
  };
  reactExports.useEffect(() => {
    const checkOAuthRole = async () => {
      if (!loading && user) {
        const storedRole = localStorage.getItem("oauth_role");
        if (storedRole && (storedRole === "host" || storedRole === "resident")) {
          localStorage.removeItem("oauth_role");
          localStorage.setItem("active_role", storedRole);
          setBusy(true);
          try {
            await supabase.auth.updateUser({
              data: {
                role: storedRole
              }
            });
            toast.success(`Signed in as ${storedRole === "host" ? "Host Mode" : "Living Person Mode"}`);
          } catch (err) {
            console.error("Error setting OAuth role:", err);
          } finally {
            setBusy(false);
          }
        }
        navigate({
          to: "/dashboard"
        });
      }
    };
    checkOAuthRole();
  }, [user, loading, navigate]);
  const handleGoogle = async () => {
    setBusy(true);
    try {
      localStorage.setItem("oauth_role", role);
      localStorage.setItem("active_role", role);
      const redirectToUrl = `${window.location.origin}/auth`;
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl
        }
      });
      if (error) {
        toast.error(error.message || "Google sign-in failed");
        setBusy(false);
      }
    } catch (e) {
      toast.error(e?.message || "Google sign-in failed");
      setBusy(false);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await syncUserRole(role);
    setBusy(false);
    toast.success(`Welcome back! Logged in as ${role === "host" ? "Host" : "Living Person"}.`);
    navigate({
      to: "/dashboard"
    });
  };
  const handleForgot = async () => {
    if (!email) return toast.error("Enter your email above first");
    setBusy(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent! Check your email.");
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!dob) return toast.error("Please enter your date of birth");
    const age = calcAge(dob);
    if (age < 0) return toast.error("Invalid date of birth");
    if (age < 18) return toast.error("You must be at least 18 years old to register");
    setBusy(true);
    localStorage.setItem("active_role", role);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          name,
          mobile,
          role,
          date_of_birth: dob
        }
      }
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Account created as ${role === "host" ? "Host" : "Living Person"}!`);
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-center gap-2 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-7 w-7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-semibold", children: "BuildingCare" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: "Sign in to BuildingCare" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Choose your login mode to determine your active session privileges" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "1. Select Login Mode:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setRole("resident"), className: `flex flex-col items-center justify-center rounded-lg border p-3 text-center transition cursor-pointer ${role === "resident" ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold" : "border-border bg-card hover:bg-accent text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "mb-1 h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold", children: "Living Person" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-[10px] opacity-80", children: "Resident View" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setRole("host"), className: `flex flex-col items-center justify-center rounded-lg border p-3 text-center transition cursor-pointer ${role === "host" ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold" : "border-border bg-card hover:bg-accent text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "mb-1 h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold", children: "Host" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-[10px] opacity-80", children: "Management View" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground text-center", children: role === "host" ? "👑 Host mode allows registering new buildings and building management." : "🏠 Living Person mode restricts building registration to resident view." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleGoogle, variant: "outline", className: "w-full gap-2 font-medium", disabled: busy, children: [
          "Continue with Google as ",
          role === "host" ? "Host" : "Living Person"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-border" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "or authenticate with" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "login", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "login", children: "Login" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "phone", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "register", children: "Register" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "phone", className: "pt-2", children: !otpSent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSendOtp, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "op", children: "Mobile number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "op", type: "tel", required: true, placeholder: "+91 98765 43210", value: otpPhone, onChange: (e) => setOtpPhone(e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "We'll text you a 6-digit code. Include country code." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: busy, children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
              "Send code"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleVerifyOtp, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "oc", children: "Enter the 6-digit code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "oc", inputMode: "numeric", required: true, maxLength: 6, value: otpCode, onChange: (e) => setOtpCode(e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                "Sent to ",
                normalizePhone(otpPhone)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: busy, children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
              "Verify & Sign In as ",
              role === "host" ? "Host" : "Living Person"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setOtpSent(false);
              setOtpCode("");
            }, disabled: busy, className: "w-full text-center text-sm text-primary hover:underline disabled:opacity-50", children: "Use a different number" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "login", className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "le", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "le", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lp", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "lp", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: busy, children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
              "Login as ",
              role === "host" ? "Host" : "Living Person"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleForgot, disabled: busy, className: "w-full text-center text-sm text-primary hover:underline disabled:opacity-50", children: "Forgot password?" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "register", className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegister, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rn", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "rn", required: true, value: name, onChange: (e) => setName(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "re", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "re", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rm", children: "Mobile Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "rm", type: "tel", required: true, value: mobile, onChange: (e) => setMobile(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rdob", children: "Date of Birth" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "rdob", type: "date", required: true, value: dob, max: new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() - 18)).toISOString().split("T")[0], onChange: (e) => setDob(e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "You must be 18 or older to register." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rp", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "rp", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: busy, children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
              "Create Account as ",
              role === "host" ? "Host" : "Living Person"
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AuthPage as component
};
