// Mock queue data + lightweight "AI" heuristics for QueueSmart.
// All client-side, no backend. Values feel realistic for an International Office.

export type TicketStatus = "waiting" | "approaching" | "serving" | "completed" | "skipped";

export interface Ticket {
  id: string;
  number: string; // e.g. "A-042"
  studentName: string;
  studentId: string;
  reason: string;
  status: TicketStatus;
  joinedAt: number;
  servedAt?: number;
  completedAt?: number;
}

const REASONS = [
  "Visa extension",
  "Residence permit",
  "Enrollment certificate",
  "Transcript request",
  "Exchange program",
  "Health insurance",
  "Internship approval",
];

const NAMES = [
  "Amelia Chen", "Noah Patel", "Sofia Rossi", "Liam O'Connor", "Yuki Tanaka",
  "Diego Hernández", "Aïcha Diallo", "Mateusz Kowalski", "Priya Sharma",
  "Lucas Müller", "Zara Ahmed", "Felipe Souza", "Hana Kim", "Omar El-Sayed",
  "Elena Petrova",
];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad(n: number) { return n.toString().padStart(3, "0"); }

const START_NUMBER = 38;

export function seedTickets(): Ticket[] {
  const now = Date.now();
  const tickets: Ticket[] = [];
  // 6 completed earlier today
  for (let i = 0; i < 6; i++) {
    const joined = now - (60 - i * 7) * 60_000;
    tickets.push({
      id: crypto.randomUUID(),
      number: `A-${pad(START_NUMBER - 6 + i)}`,
      studentName: rand(NAMES),
      studentId: `STU${100000 + Math.floor(Math.random() * 899999)}`,
      reason: rand(REASONS),
      status: "completed",
      joinedAt: joined,
      servedAt: joined + 8 * 60_000,
      completedAt: joined + 14 * 60_000,
    });
  }
  // 1 currently serving
  tickets.push({
    id: crypto.randomUUID(),
    number: `A-${pad(START_NUMBER)}`,
    studentName: rand(NAMES),
    studentId: `STU${100000 + Math.floor(Math.random() * 899999)}`,
    reason: rand(REASONS),
    status: "serving",
    joinedAt: now - 18 * 60_000,
    servedAt: now - 4 * 60_000,
  });
  // 7 waiting
  for (let i = 1; i <= 7; i++) {
    tickets.push({
      id: crypto.randomUUID(),
      number: `A-${pad(START_NUMBER + i)}`,
      studentName: rand(NAMES),
      studentId: `STU${100000 + Math.floor(Math.random() * 899999)}`,
      reason: rand(REASONS),
      status: i <= 2 ? "approaching" : "waiting",
      joinedAt: now - (14 - i) * 60_000,
    });
  }
  return tickets;
}

export function nextTicketNumber(tickets: Ticket[]): string {
  const max = tickets.reduce((m, t) => {
    const n = parseInt(t.number.split("-")[1] ?? "0", 10);
    return n > m ? n : m;
  }, START_NUMBER);
  return `A-${pad(max + 1)}`;
}

// AI: predict average minutes per student from completed tickets, fallback 6 min.
export function avgServiceMinutes(tickets: Ticket[]): number {
  const completed = tickets.filter(t => t.status === "completed" && t.servedAt && t.completedAt);
  if (!completed.length) return 6;
  const total = completed.reduce((s, t) => s + ((t.completedAt! - t.servedAt!) / 60_000), 0);
  return Math.max(3, Math.min(15, total / completed.length));
}

export function estimatedWaitMinutes(position: number, tickets: Ticket[]): number {
  // position is 0-indexed among waiting+approaching
  const avg = avgServiceMinutes(tickets);
  const congestionBoost = position > 5 ? 1.15 : 1;
  return Math.round(position * avg * congestionBoost);
}

// AI: congestion score 0-100
export function congestionScore(tickets: Ticket[]): number {
  const active = tickets.filter(t => t.status === "waiting" || t.status === "approaching").length;
  return Math.min(100, Math.round((active / 12) * 100));
}

export function peakHoursInsight(): { hours: string; suggestion: string }[] {
  return [
    { hours: "10:00 – 11:30", suggestion: "Highest demand window. Expect 12+ min wait." },
    { hours: "13:00 – 14:00", suggestion: "Quietest window — recommended for non-urgent visits." },
    { hours: "15:30 – 16:30", suggestion: "Secondary peak driven by afternoon classes ending." },
  ];
}

export function statusLabel(s: TicketStatus): string {
  return ({
    waiting: "Waiting",
    approaching: "Approaching turn",
    serving: "Being served",
    completed: "Completed",
    skipped: "Skipped",
  })[s];
}
