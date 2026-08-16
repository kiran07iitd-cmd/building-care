import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SessionRole = "host" | "resident";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  activeRole: SessionRole;
  setActiveRole: (role: SessionRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  activeRole: "resident",
  setActiveRole: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<SessionRole>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("active_role") as SessionRole | null;
      if (stored === "host" || stored === "resident") return stored;
    }
    return "resident";
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        const storedRole = localStorage.getItem("active_role") as SessionRole | null;
        const metaRole = s.user.user_metadata?.role as SessionRole | undefined;
        const initialRole = storedRole || metaRole || "resident";
        setActiveRoleState(initialRole);
        localStorage.setItem("active_role", initialRole);
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const storedRole = localStorage.getItem("active_role") as SessionRole | null;
        const metaRole = data.session.user.user_metadata?.role as SessionRole | undefined;
        const initialRole = storedRole || metaRole || "resident";
        setActiveRoleState(initialRole);
        localStorage.setItem("active_role", initialRole);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setActiveRole = async (newRole: SessionRole) => {
    setActiveRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_role", newRole);
    }
    if (session?.user) {
      try {
        await supabase.auth.updateUser({
          data: { role: newRole },
        });
      } catch (err) {
        console.error("Failed to sync active role to user metadata:", err);
      }
    }
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        activeRole,
        setActiveRole,
        signOut: async () => {
          // Stop in-flight protected queries before the session disappears,
          // then drop cached protected data so Back can't restore it.
          await queryClient.cancelQueries();
          queryClient.clear();
          if (typeof window !== "undefined") {
            localStorage.removeItem("active_role");
          }
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
