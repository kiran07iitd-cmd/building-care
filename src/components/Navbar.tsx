import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Crown, Home, LogOut, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function Navbar() {
  const { signOut, user, activeRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate({ to: "/" });
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
          <Building2 className="h-6 w-6" />
          <span className="text-lg">BuildingCare</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Badge
              variant={activeRole === "host" ? "default" : "secondary"}
              className="hidden sm:inline-flex items-center gap-1 py-1 px-2.5 text-xs font-semibold"
            >
              {activeRole === "host" ? (
                <>
                  <Crown className="h-3.5 w-3.5 text-amber-300" /> Host Mode
                </>
              ) : (
                <>
                  <Home className="h-3.5 w-3.5 text-blue-500" /> Living Person Mode
                </>
              )}
            </Badge>
          )}

          <Link
            to="/dashboard"
            className="hidden sm:inline-flex rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>

          {user && activeRole === "host" && (
            <Link
              to="/register-building"
              className="hidden sm:inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Register Building
            </Link>
          )}

          {user && (
            <Link
              to="/profile"
              className="hidden sm:inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          )}

          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
