import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth, type Role } from "@/lib/auth-store";
import { GraduationCap, Loader2, LogIn, ShieldCheck, UserRound, Users, UserPlus } from "lucide-react";

const roleHome = (role: Role) => (role === "staff" ? "/staff" : "/student");

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search['redirect'] === "string" ? { redirect: search['redirect'] } : {},
  head: () => ({
    meta: [
      { title: "Sign in — QueueSmart" },
      { name: "description", content: "Sign in to QueueSmart to access your student or staff dashboard." },
      { property: "og:title", content: "Sign in — QueueSmart" },
      { property: "og:description", content: "Sign in to QueueSmart to access your student or staff dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, hydrated, login } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) {
      const target = redirect && redirect.startsWith(roleHome(user.role)) ? redirect : roleHome(user.role);
      navigate({ to: target });
    }
  }, [hydrated, user, navigate, redirect]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(`Welcome, ${res.user.name}`);
      const target = redirect && redirect.startsWith(roleHome(res.user.role)) ? redirect : roleHome(res.user.role);
      navigate({ to: target });
    }, 400);
  };

  const fillDemo = (role: "student" | "staff") => {
    if (role === "student") {
      setEmail("student@university.edu");
      setPassword("student123");
    } else {
      setEmail("staff@university.edu");
      setPassword("staff123");
    }
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
      <div className="animate-slide-up hidden lg:block">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure access
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Welcome back to <span className="text-accent">QueueSmart</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          Sign in to join the queue, follow your live position, or manage the International Office counter. Role-based access keeps every action safe and accountable.
        </p>
        <div className="mt-8 grid gap-3 max-w-md">
          <DemoCard
            icon={UserRound}
            title="Student demo"
            email="student@university.edu"
            password="student123"
            onUse={() => fillDemo("student")}
          />
          <DemoCard
            icon={Users}
            title="Staff demo"
            email="staff@university.edu"
            password="staff123"
            onUse={() => fillDemo("staff")}
          />
        </div>
      </div>

      <div className="animate-fade-in">
        <div className="rounded-3xl border border-border bg-card shadow-elevated p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-soft">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">QueueSmart</p>
              <p className="text-xs text-muted-foreground">International Office portal</p>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-semibold">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Use your university credentials.</p>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground/80">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-medium shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5 lg:hidden grid gap-2">
            <button
              onClick={() => fillDemo("student")}
              className="text-xs rounded-lg border border-border bg-background px-3 py-2 hover:bg-secondary transition-colors text-left"
            >
              Use student demo · student@university.edu
            </button>
            <button
              onClick={() => fillDemo("staff")}
              className="text-xs rounded-lg border border-border bg-background px-3 py-2 hover:bg-secondary transition-colors text-left"
            >
              Use staff demo · staff@university.edu
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-border bg-background/50 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">New student?</p>
            <Link to="/signup" className="inline-flex items-center gap-1.5 mt-0.5 text-sm font-medium text-foreground hover:text-accent transition-colors">
              <UserPlus className="h-3.5 w-3.5" /> Create a student account
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground text-center">
            By signing in you agree to the{" "}
            <Link to="/ethics" className="underline">privacy &amp; AI ethics policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoCard({
  icon: Icon, title, email, password, onUse,
}: { icon: typeof UserRound; title: string; email: string; password: string; onUse: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex items-center gap-3">
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{email} · {password}</p>
      </div>
      <button
        onClick={onUse}
        className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 hover:bg-secondary transition-colors"
      >
        Use
      </button>
    </div>
  );
}
