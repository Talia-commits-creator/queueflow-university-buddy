import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Smartphone, Sparkles, ShieldCheck, BarChart3, Users, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QueueSmart — Skip the waiting room" },
      { name: "description", content: "Digital queue management for the International Office. Join from your phone, watch your position live, and arrive only when it's your turn." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Smartphone, title: "Join from anywhere", body: "Take a number from your phone. No paper tickets, no crowded hallway." },
  { icon: Clock, title: "Live position & ETA", body: "See exactly how many students are ahead and your AI-predicted wait time." },
  { icon: Sparkles, title: "AI peak-hour guidance", body: "Recommendations on when to visit so you spend minutes, not hours." },
  { icon: ShieldCheck, title: "Privacy by design", body: "Data minimization, transparent processing, and a published ethics policy." },
];

const STATS = [
  { label: "Avg. wait reduced", value: "−63%" },
  { label: "Students served / day", value: "180+" },
  { label: "Satisfaction", value: "4.8 / 5" },
];

function Landing() {
  const { user } = useAuth();
  const primaryHref = user ? (user.role === "staff" ? "/staff" : "/student") : "/login";
  const primaryLabel = user ? (user.role === "staff" ? "Open staff dashboard" : "Open my queue") : "Sign in to continue";
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live pilot · International Office
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
              The queue, <span className="text-accent">reimagined</span> for university life.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              QueueSmart replaces paper tickets and crowded waiting rooms with a calm, mobile-first experience — backed by AI that predicts wait times and surfaces the quietest hours to visit.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/student" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-medium shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5">
                Join the queue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/staff" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-medium text-foreground hover:bg-secondary transition-colors">
                Staff dashboard
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero card mockup */}
          <div className="animate-fade-in">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 bg-accent/10 rounded-[2rem] blur-2xl" aria-hidden />
              <div className="relative rounded-3xl border border-border bg-card shadow-elevated p-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>International Office</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Your number</p>
                  <p className="mt-1 text-6xl font-semibold tracking-tight text-foreground">A-042</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[11px] text-muted-foreground">Ahead of you</p>
                    <p className="text-xl font-semibold">4</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[11px] text-muted-foreground">Est. wait</p>
                    <p className="text-xl font-semibold">~ 18 min</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-accent/15 border border-accent/30 p-3 text-sm flex items-start gap-2">
                  <Sparkles className="h-4 w-4 mt-0.5 text-accent-foreground/70 shrink-0" />
                  <span>AI suggests visiting after 13:00 today — predicted wait drops to 4 min.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-4">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-4">
          <RoleCard
            to="/student"
            icon={Users}
            title="For students"
            body="Join the queue, follow your position live, and arrive only when you're next."
            cta="Open student view"
          />
          <RoleCard
            to="/staff"
            icon={BarChart3}
            title="For staff"
            body="Call the next student, manage active tickets, and unlock AI-powered insights about your office."
            cta="Open staff dashboard"
          />
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  to, icon: Icon, title, body, cta,
}: { to: "/student" | "/staff"; icon: typeof Users; title: string; body: string; cta: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 inline-block text-sm font-medium text-primary">{cta} →</span>
    </Link>
  );
}
