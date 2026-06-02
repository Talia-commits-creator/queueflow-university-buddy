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
  /** Map of userKey (email) -> active ticket id. Scoped per user so sessions never inherit each other's tickets. */
  myTicketByUser: Record<string, string>;
  hydrated: boolean;
  init: () => void;
  getMyTicketId: (userKey: string | null | undefined) => string | null;
  joinQueue: (input: { userKey: string; studentName: string; studentId: string; reason: string }) => Ticket;
  leaveQueue: (userKey: string) => void;
  callNext: () => void;
  markServed: (id: string) => void;
  skip: (id: string) => void;
  tick: () => void;
}

export const useQueue = create<QueueState>()(
  persist(
    (set, get) => ({
      tickets: [],
      myTicketByUser: {},
      hydrated: false,
      init: () => {
        if (get().tickets.length === 0) {
          set({ tickets: seedTickets(), hydrated: true });
        } else {
          set({ hydrated: true });
        }
      },
      getMyTicketId: (userKey) => {
        if (!userKey) return null;
        return get().myTicketByUser[userKey] ?? null;
      },
      joinQueue: ({ userKey, studentName, studentId, reason }) => {
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
        set({
          tickets: [...tickets, ticket],
          myTicketByUser: { ...get().myTicketByUser, [userKey]: ticket.id },
        });
        return ticket;
      },
      leaveQueue: (userKey) => {
        const id = get().myTicketByUser[userKey];
        if (!id) return;
        const { [userKey]: _, ...rest } = get().myTicketByUser;
        set({
          tickets: get().tickets.filter((t) => t.id !== id),
          myTicketByUser: rest,
        });
      },
      callNext: () => {
        const tickets = [...get().tickets];
        const serving = tickets.find((t) => t.status === "serving");
        if (serving) {
          serving.status = "completed";
          serving.completedAt = Date.now();
        }
        const next = tickets
          .filter((t) => t.status === "waiting" || t.status === "approaching")
          .sort((a, b) => a.joinedAt - b.joinedAt)[0];
        if (next) {
          next.status = "serving";
          next.servedAt = Date.now();
        }
        set({ tickets });
      },
      markServed: (id) => {
        const tickets = get().tickets.map((t) =>
          t.id === id ? { ...t, status: "completed" as TicketStatus, completedAt: Date.now() } : t
        );
        set({ tickets });
      },
      skip: (id) => {
        const tickets = get().tickets.map((t) =>
          t.id === id ? { ...t, status: "skipped" as TicketStatus } : t
        );
        set({ tickets });
      },
      tick: () => {
        const tickets = [...get().tickets];
        const waiting = tickets
          .filter((t) => t.status === "waiting")
          .sort((a, b) => a.joinedAt - b.joinedAt);
        waiting.slice(0, 2).forEach((t) => { t.status = "approaching"; });
        set({ tickets });
      },
    }),
    {
      name: "queuesmart-store-v2",
      partialize: (s) => ({ tickets: s.tickets, myTicketByUser: s.myTicketByUser }),
    }
  )
);
