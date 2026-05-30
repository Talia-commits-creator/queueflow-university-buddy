import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "staff";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  setHydrated: () => void;
  login: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; error: string };
  logout: () => void;
}

const ACCOUNTS: Array<AuthUser & { password: string }> = [
  { email: "student@university.edu", password: "student123", name: "Amelia Chen", role: "student" },
  { email: "staff@university.edu", password: "staff123", name: "Jordan Müller", role: "staff" },
];

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      login: (email, password) => {
        const found = ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
        );
        if (!found) return { ok: false, error: "Invalid email or password." };
        const user: AuthUser = { email: found.email, name: found.name, role: found.role };
        set({ user });
        return { ok: true, user };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "queuesmart-auth-v1",
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const DEMO_ACCOUNTS = ACCOUNTS.map(({ password, ...rest }) => ({ ...rest, password }));
