import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { GraduationCap, Loader2, UserPlus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create student account — QueueSmart" },
      { name: "description", content: "Register a QueueSmart student account to join the International Office queue from your phone." },
      { property: "og:title", content: "Create student account — QueueSmart" },
      { property: "og:description", content: "Register a QueueSmart student account to join the International Office queue from your phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, hydrated, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) {
      navigate({ to: user.role === "staff" ? "/staff" : "/student" });
    }
  }, [hydrated, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = register({ name, studentId, email, password });
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(`Welcome to QueueSmart, ${res.user.name.split(" ")[0]}`);
      navigate({ to: "/student" });
    }, 400);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
      <div className="animate-slide-up hidden lg:block">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <ShieldCheck className="h-3.5 w-3.5" /> Student registration
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Join <span className="text-accent">QueueSmart</span> in under a minute.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          Create your student account to take a queue number from anywhere on campus, watch your live position, and arrive only when it's your turn.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted-foreground max-w-md">
          {[
            "Personal account secured by password",
            "Your name shown to staff when called",
            "Queue history kept private to you",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-muted-foreground">
          Staff accounts are provisioned by the International Office and cannot be created here.
        </p>
      </div>

      <div className="animate-fade-in">
        <div className="rounded-3xl border border-border bg-card shadow-elevated p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-soft">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Create student account</p>
              <p className="text-xs text-muted-foreground">For enrolled students only</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                placeholder="e.g. Amelia Chen"
                className="input"
              />
            </Field>
            <Field label="Student ID">
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                maxLength={20}
                placeholder="e.g. STU824103"
                className="input"
              />
            </Field>
            <Field label="University email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@university.edu"
                className="input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="input"
              />
            </Field>

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`.input{margin-top:.375rem;width:100%;border-radius:.75rem;border:1px solid hsl(var(--input));background:hsl(var(--background));padding:.625rem .875rem;font-size:.875rem;outline:none;transition:box-shadow .15s}.input:focus{box-shadow:0 0 0 2px hsl(var(--ring))}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}
