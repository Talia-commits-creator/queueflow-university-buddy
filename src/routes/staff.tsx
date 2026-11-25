import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueue } from "@/lib/queue-store";
import { avgServiceMinutes, congestionScore, type Ticket } from "@/lib/queue-data";
import { StatusBadge } from "@/components/StatusBadge";
import { CardSkeleton } from "@/components/Skeletons";
import { RequireRole } from "@/components/RequireRole";
import {
  PlayCircle, CheckCircle2, SkipForward, Search, Users, Clock, Activity, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard — QueueSmart" },
      { name: "description", content: "Manage the International Office queue: call the next student, mark served, and follow live AI insights." },
      { property: "og:title", content: "Staff Dashboard — QueueSmart" },
      { property: "og:description", content: "Manage the International Office queue: call the next student, mark served, and follow live AI insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireRole role="staff">
      <StaffPage />
    </RequireRole>
  ),
});

type Filter = "active" | "completed" | "all";

function StaffPage() {
  const { tickets, init, hydrated, callNext, markServed, skip } = useQueue();
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("active");

  useEffect(() => {
    init();
    setMounted(true);
  }, [init]);

  const stats = useMemo(() => {
    const active = tickets.filter((t) => t.status === "waiting" || t.status === "approaching").length;
    const serving = tickets.find((t) => t.status === "serving") ?? null;
    const completed = tickets.filter((t) => t.status === "completed").length;
    return { active, serving, completed, avg: avgServiceMinutes(tickets), cong: congestionScore(tickets) };
  }, [tickets]);

  const filtered = useMemo(() => {
    let arr = [...tickets];
    if (filter === "active") arr = arr.filter((t) => t.status === "waiting" || t.status === "approaching" || t.status === "serving");
    if (filter === "completed") arr = arr.filter((t) => t.status === "completed" || t.status === "skipped");
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter((t) =>
        t.number.toLowerCase().includes(s) ||
        t.studentName.toLowerCase().includes(s) ||
        t.studentId.toLowerCase().includes(s) ||
        t.reason.toLowerCase().includes(s)
      );
    }
    return arr.sort((a, b) => a.joinedAt - b.joinedAt);
  }, [tickets, filter, q]);

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Staff dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">International Office · Counter 1</p>
        </div>
        <button
          onClick={() => {
            callNext();
            toast.success("Calling next student");
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-medium shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5"
        >
          <PlayCircle className="h-4 w-4" />
          Call next
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="In queue" value={stats.active.toString()} hint="waiting + approaching" />
        <StatCard icon={Activity} label="Now serving" value={stats.serving?.number ?? "—"} hint={stats.serving ? stats.serving.reason : "Nobody at the counter"} />
        <StatCard icon={CheckCircle2} label="Served today" value={stats.completed.toString()} hint="completed tickets" />
        <StatCard icon={Clock} label="Avg. service" value={`${stats.avg.toFixed(1)} min`} hint="AI-derived" />
      </section>

      {/* AI strip */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-foreground/70" />
          <h2 className="font-semibold text-sm">AI congestion insight</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.cong}%`,
                  background:
                    stats.cong > 75 ? "var(--color-destructive)" :
                    stats.cong > 40 ? "var(--color-warning)" : "var(--color-success)",
                }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Congestion is{" "}
              <strong className="text-foreground">
                {stats.cong > 75 ? "high" : stats.cong > 40 ? "moderate" : "low"}
              </strong>
              . {stats.cong > 75
                ? "Consider opening a second counter or sending overflow notices."
                : stats.cong > 40
                ? "Steady pace — focus on efficient handovers."
                : "Quiet window — a good time for follow-ups and admin."}
            </p>
          </div>
          <div className="text-right tabular-nums">
            <p className="text-3xl font-semibold">{stats.cong}</p>
            <p className="text-[11px] text-muted-foreground">/ 100</p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by number, name, ID, or reason"
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-soft">
          {(["active", "completed", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Queue table */}
      <section className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="grid place-items-center h-12 w-14 rounded-xl bg-secondary font-semibold tabular-nums text-sm shrink-0">
                    {t.number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.studentId} · {t.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <StatusBadge status={t.status} />
                  {(t.status === "waiting" || t.status === "approaching" || t.status === "serving") && (
                    <div className="flex items-center gap-1">
                      <IconBtn label="Mark served" onClick={() => { markServed(t.id); toast.success(`${t.number} served`); }}>
                        <CheckCircle2 className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Skip" onClick={() => { skip(t.id); toast(`Skipped ${t.number}`); }}>
                        <SkipForward className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{hint}</p>
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="p-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto grid place-items-center h-12 w-12 rounded-2xl bg-secondary text-muted-foreground mb-4">
        <Users className="h-5 w-5" />
      </div>
      <p className="font-medium">No tickets match your filters</p>
      <p className="text-sm text-muted-foreground mt-1">Try clearing the search or switching tabs.</p>
    </div>
  );
}

export type { Ticket };
