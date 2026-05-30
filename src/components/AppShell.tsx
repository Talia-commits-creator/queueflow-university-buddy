import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Users, BarChart3, ShieldCheck, Info, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: GraduationCap },
  { to: "/student", label: "Student", icon: Users },
  { to: "/staff", label: "Staff", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ethics", label: "AI Ethics", icon: ShieldCheck },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:-rotate-3">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-semibold text-lg tracking-tight">
              Queue<span className="text-accent">Smart</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.slice(1).map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <div className="px-3 py-2 flex flex-col">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      active ? "bg-secondary text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 page-transition">{children}</main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} QueueSmart — International Office pilot</span>
          <span>Built for students, designed for staff.</span>
        </div>
      </footer>
    </div>
  );
}
