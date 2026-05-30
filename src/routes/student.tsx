import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueue } from "@/lib/queue-store";
import { estimatedWaitMinutes, statusLabel, type Ticket } from "@/lib/queue-data";
import { StatusBadge } from "@/components/StatusBadge";
import { CardSkeleton } from "@/components/Skeletons";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/lib/auth-store";
import { Sparkles, LogOut, Clock, Users, History, ChevronRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student — QueueSmart" },
      { name: "description", content: "Join the International Office queue and follow your live position." },
    ],
  }),
  component: () => (
    <RequireRole role="student">
      <StudentPage />
    </RequireRole>
  ),
});

function StudentPage() {
  const { tickets, myTicketId, init, hydrated, joinQueue, leaveQueue, tick } = useQueue();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    init();
    setMounted(true);
    const id = setInterval(tick, 12_000);
    return () => clearInterval(id);
  }, [init, tick]);

  const myTicket = tickets.find((t) => t.id === myTicketId) ?? null;

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">International Office</h1>
        <p className="text-sm text-muted-foreground mt-1">Live queue · updates automatically</p>
      </header>

      {myTicket ? (
        <ActiveTicket ticket={myTicket} tickets={tickets} onLeave={() => {
          leaveQueue();
          toast.success("You've left the queue.");
        }} />
      ) : (
        <JoinForm
          defaultName={useAuth.getState().user?.name ?? ""}
          onJoin={(payload) => {
            const t = joinQueue(payload);
            toast.success(`You're in! Your number is ${t.number}.`);
          }}
        />
      )}

      <HistorySection tickets={tickets} />
    </div>
  );
}

function ActiveTicket({ ticket, tickets, onLeave }: { ticket: Ticket; tickets: Ticket[]; onLeave: () => void }) {
  const ordered = useMemo(
    () => tickets.filter((t) => t.status === "waiting" || t.status === "approaching" || t.status === "serving")
      .sort((a, b) => a.joinedAt - b.joinedAt),
    [tickets]
  );
  const position = ordered.findIndex((t) => t.id === ticket.id);
  const ahead = Math.max(0, position - (ordered[0]?.status === "serving" ? 1 : 0));
  const eta = estimatedWaitMinutes(ahead, tickets);

  return (
    <section className="animate-slide-up">
      <div className="rounded-3xl border border-border bg-card shadow-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your number</p>
            <p className="mt-1 text-5xl sm:text-6xl font-semibold tracking-tight">{ticket.number}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat icon={Users} label="Ahead of you" value={ahead.toString()} />
          <Stat icon={Clock} label="Est. wait" value={ahead === 0 ? "Now" : `~ ${eta} min`} />
        </div>

        <div className="mt-5 rounded-2xl bg-accent/10 border border-accent/25 p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-foreground/70" />
          <div className="text-sm">
            <p className="font-medium">AI prediction</p>
            <p className="text-muted-foreground mt-0.5">
              {ticket.status === "serving"
                ? "You're being served right now. Please head to the counter."
                : ticket.status === "approaching"
                ? "You're approaching your turn — be ready within the next few minutes."
                : `Based on current pace (~${Math.round(eta / Math.max(ahead, 1))} min per student), you'll be called in about ${eta} minutes.`}
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="mt-6 inline-flex items-center gap-2 text-sm text-destructive hover:underline"
        >
          <LogOut className="h-4 w-4" /> Leave the queue
        </button>
      </div>

      <LivePreview tickets={tickets} myId={ticket.id} />
    </section>
  );
}

function LivePreview({ tickets, myId }: { tickets: Ticket[]; myId: string }) {
  const active = tickets
    .filter((t) => t.status === "waiting" || t.status === "approaching" || t.status === "serving")
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .slice(0, 6);

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Now in line</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live
        </span>
      </div>
      <ul className="divide-y divide-border">
        {active.map((t) => (
          <li
            key={t.id}
            className={`py-2.5 flex items-center justify-between text-sm ${t.id === myId ? "font-semibold text-foreground" : "text-muted-foreground"}`}
          >
            <span className="tabular-nums">{t.number}</span>
            <StatusBadge status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function JoinForm({ onJoin, defaultName = "" }: { onJoin: (p: { studentName: string; studentId: string; reason: string }) => void; defaultName?: string }) {
  const [name, setName] = useState(defaultName);
  const [id, setId] = useState("");
  const [reason, setReason] = useState("Visa extension");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Visa extension", "Residence permit", "Enrollment certificate",
    "Transcript request", "Exchange program", "Health insurance", "Other",
  ];

  return (
    <section className="animate-slide-up rounded-3xl border border-border bg-card shadow-card p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Join the queue</h2>
      <p className="text-sm text-muted-foreground mt-1">Takes 10 seconds. You'll get your number instantly.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !id.trim()) return;
          setLoading(true);
          setTimeout(() => {
            onJoin({ studentName: name.trim(), studentId: id.trim(), reason });
            setLoading(false);
          }, 500);
        }}
      >
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Amelia Chen"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </Field>
        <Field label="Student ID">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            placeholder="e.g. STU824103"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </Field>
        <Field label="Reason for visit">
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  reason === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-medium shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Securing your spot..." : "Get my number"}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>
        <p className="text-[11px] text-muted-foreground text-center">
          By joining, you agree to QueueSmart's minimal-data policy. See{" "}
          <a href="/ethics" className="underline">AI Ethics</a>.
        </p>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function HistorySection({ tickets }: { tickets: Ticket[] }) {
  const history = tickets.filter((t) => t.status === "completed").slice(-5).reverse();
  return (
    <section className="rounded-3xl border border-border bg-card shadow-soft p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">Recently served</h2>
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No history yet today.</p>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((t) => (
            <li key={t.id} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium tabular-nums">{t.number}</p>
                <p className="text-xs text-muted-foreground">{t.reason}</p>
              </div>
              <span className="text-xs text-muted-foreground">{statusLabel(t.status)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
