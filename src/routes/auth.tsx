import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Crown, Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

function getSafePostAuthPath(): string {
  const requestedPath =
    window.sessionStorage.getItem("post_auth_path") ??
    new URLSearchParams(window.location.search).get("redirect");
  if (!requestedPath || !requestedPath.startsWith("/") || requestedPath.startsWith("//")) {
    return "/dashboard";
  }

  const target = new URL(requestedPath, window.location.origin);
  if (target.origin !== window.location.origin || target.pathname === "/auth") {
    return "/dashboard";
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

function completeAuthRedirect() {
  const targetPath = getSafePostAuthPath();
  window.sessionStorage.removeItem("post_auth_path");
  window.location.replace(targetPath);
}

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — BuildingCare" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<"host" | "resident">("resident");
  const [dob, setDob] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const normalizePhone = (v: string) => {
    const digits = v.replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const smsError = (msg: string) =>
    /phone|sms|provider|not enabled|unsupported/i.test(msg)
      ? "SMS sign-in isn't enabled on this app yet. Please use email or Google for now."
      : msg;

  const syncUserRole = async (targetRole: "host" | "resident") => {
    localStorage.setItem("active_role", targetRole);
    try {
      await supabase.auth.updateUser({
        data: { role: targetRole },
      });
    } catch (err) {
      console.error("Error updating user role metadata:", err);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizePhone(otpPhone);
    if (phone.length < 8) return toast.error("Enter a valid mobile number with country code");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) return toast.error(smsError(error.message));
    setOtpSent(true);
    toast.success("Code sent! Check your messages.");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(otpPhone),
      token: otpCode.trim(),
      type: "sms",
    });
    if (error) {
      setBusy(false);
      return toast.error(smsError(error.message));
    }
    await syncUserRole(role);
    setBusy(false);
    toast.success(`Signed in as ${role === "host" ? "Host" : "Living Person"}!`);
    completeAuthRedirect();
  };

  const calcAge = (isoDate: string) => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return -1;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const checkOAuthRole = async () => {
      if (!loading && user) {
        const storedRole = localStorage.getItem("oauth_role") as "host" | "resident" | null;
        if (storedRole && (storedRole === "host" || storedRole === "resident")) {
          localStorage.removeItem("oauth_role");
          localStorage.setItem("active_role", storedRole);
          
          setBusy(true);
          try {
            await supabase.auth.updateUser({
              data: { role: storedRole },
            });
            toast.success(`Signed in as ${storedRole === "host" ? "Host Mode" : "Living Person Mode"}`);
          } catch (err) {
            console.error("Error setting OAuth role:", err);
          } finally {
            setBusy(false);
          }
        }
        completeAuthRedirect();
      }
    };
    checkOAuthRole();
  }, [user, loading]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      localStorage.setItem("oauth_role", role);
      localStorage.setItem("active_role", role);
      const redirectToUrl = `${window.location.origin}/auth?redirect=${encodeURIComponent(getSafePostAuthPath())}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl,
        },
      });
      if (error) {
        toast.error(error.message || "Google sign-in failed");
        setBusy(false);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await syncUserRole(role);
    setBusy(false);
    toast.success(`Welcome back! Logged in as ${role === "host" ? "Host" : "Living Person"}.`);
    completeAuthRedirect();
  };

  const handleForgot = async () => {
    if (!email) return toast.error("Enter your email above first");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent! Check your email.");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return toast.error("Please enter your date of birth");
    const age = calcAge(dob);
    if (age < 0) return toast.error("Invalid date of birth");
    if (age < 18) return toast.error("You must be at least 18 years old to register");
    setBusy(true);
    localStorage.setItem("active_role", role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(getSafePostAuthPath())}`,
        data: { name, mobile, role, date_of_birth: dob },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success(`Account created as ${role === "host" ? "Host" : "Living Person"}!`);
      completeAuthRedirect();
      return;
    }
    toast.success("Account created. Check your email to confirm it, then sign in.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-primary">
          <Building2 className="h-7 w-7" />
          <span className="text-xl font-semibold">BuildingCare</span>
        </div>
        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in to BuildingCare</CardTitle>
            <CardDescription>
              Choose a view. Access to each building is controlled by its membership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strict Login Mode Selection */}
            <div className="rounded-lg border bg-muted/40 p-3">
              <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1. Select Login Mode:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("resident")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition cursor-pointer ${
                    role === "resident"
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "border-border bg-card hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <Home className="mb-1 h-5 w-5" />
                  <span className="text-xs font-bold">Living Person</span>
                  <span className="mt-0.5 text-[10px] opacity-80">Resident View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition cursor-pointer ${
                    role === "host"
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "border-border bg-card hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <Crown className="mb-1 h-5 w-5" />
                  <span className="text-xs font-bold">Host</span>
                  <span className="mt-0.5 text-[10px] opacity-80">Management View</span>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                {role === "host"
                  ? "Host mode shows building registration and management controls."
                  : "Living Person mode shows resident and building-join controls."}
              </p>
            </div>

            {/* Google Authentication */}
            <Button
              onClick={handleGoogle}
              variant="outline"
              className="w-full gap-2 font-medium"
              disabled={busy}
            >
              Continue with Google as {role === "host" ? "Host" : "Living Person"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or authenticate with</span>
              </div>
            </div>

            {/* Email / Phone Tabs */}
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="phone" className="pt-2">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <Label htmlFor="op">Mobile number</Label>
                      <Input
                        id="op"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        We'll text you a 6-digit code. Include country code.
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                      Send code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <Label htmlFor="oc">Enter the 6-digit code</Label>
                      <Input
                        id="oc"
                        inputMode="numeric"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sent to {normalizePhone(otpPhone)}
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                      Verify & Sign In as {role === "host" ? "Host" : "Living Person"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                      }}
                      disabled={busy}
                      className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      Use a different number
                    </button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="login" className="pt-2">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label htmlFor="le">Email</Label>
                    <Input
                      id="le"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lp">Password</Label>
                    <Input
                      id="lp"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    Login as {role === "host" ? "Host" : "Living Person"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleForgot}
                    disabled={busy}
                    className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="pt-2">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <Label htmlFor="rn">Name</Label>
                    <Input
                      id="rn"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="re">Email</Label>
                    <Input
                      id="re"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rm">Mobile Number</Label>
                    <Input
                      id="rm"
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rdob">Date of Birth</Label>
                    <Input
                      id="rdob"
                      type="date"
                      required
                      value={dob}
                      max={
                        new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) => setDob(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      You must be 18 or older to register.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="rp">Password</Label>
                    <Input
                      id="rp"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    Create Account as {role === "host" ? "Host" : "Living Person"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

