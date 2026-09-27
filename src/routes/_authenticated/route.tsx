import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("post_auth_path", location.href);
      }
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  ),
});
