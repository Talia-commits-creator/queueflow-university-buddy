import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueue } from "@/lib/queue-store";
import { avgServiceMinutes, peakHoursInsight } from "@/lib/queue-data";
import { CardSkeleton } from "@/components/Skeletons";
import { Sparkles, TrendingUp, Clock4, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Queue Analytics — QueueSmart" },
      { name: "description", content: "AI-powered analytics: peak hours, congestion patterns, and service performance." },
    ],
  }),
  component: AnalyticsPage,
});

// Synthetic 24h hourly volume for demo charting
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08–19
const VOLUME = [4, 9, 18, 22, 19, 11, 7, 14, 17, 13, 8, 3];

function AnalyticsPage() {
  const { tickets, init, hydrated } = useQueue();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { init(); setMounted(true); }, [init]);

  const completed = useMemo(() => tickets.filter(t => t.status === "completed"), [tickets]);
  const avg = useMemo(() => avgServiceMinutes(tickets), [tickets]);
  const insights = peakHoursInsight();

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  const maxV = Math.max(...VOLUME);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Queue analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights powered by historical patterns and on-device AI heuristics.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label="Tickets today" value={tickets.length.toString()} />
        <Kpi icon={Clock4} label="Avg. service time" value={`${avg.toFixed(1)} min`} />
        <Kpi icon={CalendarDays} label="Completed" value={completed.length.toString()} />
        <Kpi icon={Sparkles} label="Peak window" value="10–11:30" />
      </section>

      {/* Hourly volume chart */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold">Hourly volume</h2>
            <p className="text-xs text-muted-foreground">Tickets issued · today (synthetic demo data)</p>
          </div>
          <span className="text-xs text-muted-foreground">08:00 → 19:00</span>
        </div>
        <div className="flex items-end gap-2 h-44">
          {VOLUME.map((v, i) => (
            <div key={HOURS[i]} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md bg-primary/85 hover:bg-primary transition-all"
                style={{ height: `${(v / maxV) * 100}%`, minHeight: 4 }}
                title={`${v} tickets at ${HOURS[i]}:00`}
              />
              <span className="text-[10px] text-muted-foreground tabular-nums">{HOURS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI peak hours */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-foreground/70" />
          <h2 className="font-semibold">AI peak-hour recommendations</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {insights.map((i) => (
            <li key={i.hours} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold">{i.hours}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{i.suggestion}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
