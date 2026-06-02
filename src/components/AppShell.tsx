import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Users, BarChart3, ShieldCheck, Info, Menu, X, LogOut, LogIn, Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/use-theme";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof Users };

const PUBLIC_NAV: NavItem[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/ethics", label: "AI Ethics", icon: ShieldCheck },
];

const STUDENT_NAV: NavItem[] = [
  { to: "/student", label: "My Queue", icon: Users },
  { to: "/ethics", label: "AI Ethics", icon: ShieldCheck },
  { to: "/about", label: "About", icon: Info },
];

const STAFF_NAV: NavItem[] = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ethics", label: "AI Ethics", icon: ShieldCheck },
  { to: "/about", label: "About", icon: Info },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, hydrated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [pathname]);

  const nav = user ? (user.role === "staff" ? STAFF_NAV : STUDENT_NAV) : PUBLIC_NAV;

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:-rotate-3">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-semibold text-lg tracking-tight">
              Queue<span className="text-accent">Smart</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {hydrated && user ? (
              <>
                <div className="text-right leading-tight">
                  <p className="text-xs font-medium truncate max-w-[160px]">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </>
            ) : !isLoginPage ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium shadow-soft hover:shadow-elevated transition-all"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
            ) : null}
          </div>

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
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
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
              <div className="border-t border-border mt-2 pt-2">
                {hydrated && user ? (
                  <>
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user.name}</span> · {user.role}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : !isLoginPage ? (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground bg-primary/10"
                  >
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                ) : null}
              </div>
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
