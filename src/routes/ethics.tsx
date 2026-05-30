import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, MinusCircle, UserCheck, AlertTriangle, Eye } from "lucide-react";

export const Route = createFileRoute("/ethics")({
  head: () => ({
    meta: [
      { title: "AI Ethics & Privacy — QueueSmart" },
      { name: "description", content: "How QueueSmart protects student data and uses AI responsibly: minimization, consent, transparency, and risk mitigation." },
    ],
  }),
  component: EthicsPage,
});

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Data privacy",
    body: "Student name and ID are stored only for the duration of the visit. No tracking cookies, no third-party analytics on queue data.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible AI",
    body: "Our wait-time predictions and congestion scores are deterministic heuristics over anonymized aggregate data — never used to profile individuals.",
  },
  {
    icon: MinusCircle,
    title: "Data minimization",
    body: "We collect only what's strictly necessary to manage the queue: name, student ID, reason for visit. Nothing more.",
  },
  {
    icon: UserCheck,
    title: "Informed consent",
    body: "Students are told what is collected, why, and for how long before joining the queue. Leaving the queue removes their entry immediately.",
  },
  {
    icon: AlertTriangle,
    title: "Risk mitigation",
    body: "AI predictions are advisory, not authoritative. Staff can always override AI suggestions. We monitor for bias in service-time estimates across reasons.",
  },
  {
    icon: Eye,
    title: "Transparency",
    body: "Every AI-derived value in the app is clearly labeled. Students and staff can see the inputs behind every recommendation.",
  },
];

function EthicsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-in">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Responsible AI commitment
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          AI Ethics & Privacy
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          QueueSmart was designed inside a university environment where trust, accessibility, and dignity matter. This page documents the principles we hold ourselves to.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        {PRINCIPLES.map((p) => (
          <article key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3">
              <p.icon className="h-5 w-5" />
            </span>
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-semibold text-lg">What we never do</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "Sell, share, or commercialize student data.",
            "Rank or score students based on personal attributes.",
            "Use AI to deny service — decisions remain with staff.",
            "Retain personal data beyond the operational window of a visit.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-secondary/60 p-6">
        <h2 className="font-semibold">Questions about your data?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Contact the International Office Data Protection contact or write to{" "}
          <a className="underline" href="mailto:privacy@queuesmart.university.example">privacy@queuesmart.university.example</a>.
        </p>
      </section>
    </div>
  );
}
