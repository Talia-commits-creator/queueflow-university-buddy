import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedTickets,
  nextTicketNumber,
  type Ticket,
  type TicketStatus,
} from "./queue-data";

interface QueueState {
  tickets: Ticket[];
  myTicketId: string | null;
  hydrated: boolean;
  init: () => void;
  joinQueue: (input: { studentName: string; studentId: string; reason: string }) => Ticket;
  leaveQueue: () => void;
  callNext: () => void;
  markServed: (id: string) => void;
  skip: (id: string) => void;
  tick: () => void;
}

export const useQueue = create<QueueState>()(
  persist(
    (set, get) => ({
      tickets: [],
      myTicketId: null,
      hydrated: false,
      init: () => {
        if (get().tickets.length === 0) {
          set({ tickets: seedTickets(), hydrated: true });
        } else {
          set({ hydrated: true });
        }
      },
      joinQueue: ({ studentName, studentId, reason }) => {
        const tickets = get().tickets;
        const ticket: Ticket = {
          id: crypto.randomUUID(),
          number: nextTicketNumber(tickets),
          studentName,
          studentId,
          reason,
          status: "waiting",
          joinedAt: Date.now(),
        };
        set({ tickets: [...tickets, ticket], myTicketId: ticket.id });
        return ticket;
      },
      leaveQueue: () => {
        const id = get().myTicketId;
        if (!id) return;
        set({
          tickets: get().tickets.filter(t => t.id !== id),
          myTicketId: null,
        });
      },
      callNext: () => {
        const tickets = [...get().tickets];
        // finish current serving
        const serving = tickets.find(t => t.status === "serving");
        if (serving) {
          serving.status = "completed";
          serving.completedAt = Date.now();
        }
        const next = tickets
          .filter(t => t.status === "waiting" || t.status === "approaching")
          .sort((a, b) => a.joinedAt - b.joinedAt)[0];
        if (next) {
          next.status = "serving";
          next.servedAt = Date.now();
        }
        set({ tickets });
      },
      markServed: (id) => {
        const tickets = get().tickets.map(t =>
          t.id === id ? { ...t, status: "completed" as TicketStatus, completedAt: Date.now() } : t
        );
        set({ tickets });
      },
      skip: (id) => {
        const tickets = get().tickets.map(t =>
          t.id === id ? { ...t, status: "skipped" as TicketStatus } : t
        );
        set({ tickets });
      },
      tick: () => {
        // promote first 2 waiting -> approaching
        const tickets = [...get().tickets];
        const waiting = tickets
          .filter(t => t.status === "waiting")
          .sort((a, b) => a.joinedAt - b.joinedAt);
        waiting.slice(0, 2).forEach(t => { t.status = "approaching"; });
        set({ tickets });
      },
    }),
    {
      name: "queuesmart-store-v1",
      partialize: (s) => ({ tickets: s.tickets, myTicketId: s.myTicketId }),
    }
  )
);
