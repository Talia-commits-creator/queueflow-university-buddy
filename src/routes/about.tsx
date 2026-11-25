import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Target, Code2, Lightbulb, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About QueueSmart — Capstone project" },
      { name: "description", content: "QueueSmart is a capstone educational-technology project digitizing the International Office queue, combining UX research, AI, and modern web engineering." },
      { property: "og:title", content: "About QueueSmart — Capstone project" },
      { property: "og:description", content: "QueueSmart is a capstone educational-technology project digitizing the International Office queue, combining UX research, AI, and modern web engineering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-10">
      <header className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">About the project</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          QueueSmart began as a question: why do students still spend hours collecting paper tickets and waiting in hallways? This is our answer — a capstone project blending educational technology, human-centered design, and pragmatic AI.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        <Card icon={Target} title="The problem">
          The International Office serves hundreds of students per week for visas, certificates, and exchange paperwork. Physical queues create congestion, anxiety, and lost study time.
        </Card>
        <Card icon={Lightbulb} title="The opportunity">
          A mobile-first digital queue lets students wait from anywhere, gives staff real-time visibility, and surfaces AI-powered insights to reduce peak-hour pressure.
        </Card>
        <Card icon={GraduationCap} title="Educational technology lens">
          Designed for adoption in a university department: simple onboarding, accessible color contrast, no specialized hardware, no app install.
        </Card>
        <Card icon={Code2} title="How it's built">
          React, TanStack Router, Tailwind v4, Zustand for state, and a Fredoka typography system. AI features run client-side as transparent heuristics — no opaque models, no third-party tracking.
        </Card>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <h2 className="font-semibold text-lg">Roadmap</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {[
            ["v1 – pilot (now)", "International Office single counter, mock-data demo, AI ethics published."],
            ["v2 – multi-counter", "Multiple parallel counters, staff authentication, real-time websockets."],
            ["v3 – university-wide", "Generalize to other offices (Registrar, Financial Aid), SSO, accessibility audit."],
            ["v4 – inclusive AI", "Calibrated wait-time models per visit reason, multilingual interface, screen-reader-first review."],
          ].map(([phase, body]) => (
            <li key={phase} className="grid sm:grid-cols-[180px_1fr] gap-2">
              <span className="font-medium text-foreground">{phase}</span>
              <span className="text-muted-foreground">{body}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/student" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-medium shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5">
          Try the student view <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/ethics" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 font-medium hover:bg-secondary transition-colors">
          Read our AI ethics
        </Link>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{children}</p>
    </div>
  );
}
