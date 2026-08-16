import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildingCare — Manage your building maintenance easily" },
      {
        name: "description",
        content: "BuildingCare helps hosts and residents manage building maintenance, rooms, and bills in one place.",
      },
      { property: "og:title", content: "BuildingCare" },
      { property: "og:description", content: "Manage your building maintenance easily." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Building2 className="h-6 w-6" />
          <span className="text-lg">BuildingCare</span>
        </div>
        <Link to="/auth">
          <Button variant="ghost">Login</Button>
        </Link>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Manage your building maintenance easily
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            BuildingCare helps hosts and residents track rooms, bills, and maintenance — all in one simple place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
