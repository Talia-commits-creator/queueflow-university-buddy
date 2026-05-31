import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "staff";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
  studentId?: string;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  accounts: StoredAccount[];
  hydrated: boolean;
  setHydrated: () => void;
  login: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; error: string };
  register: (input: { name: string; studentId: string; email: string; password: string }) =>
    | { ok: true; user: AuthUser }
    | { ok: false; error: string };
  logout: () => void;
}

const SEED_ACCOUNTS: StoredAccount[] = [
  { email: "student@university.edu", password: "student123", name: "Amelia Chen", role: "student", studentId: "STU824103" },
  { email: "staff@university.edu", password: "staff123", name: "Jordan Müller", role: "staff" },
];

function mergeSeeds(existing: StoredAccount[] | undefined): StoredAccount[] {
  const list = existing ? [...existing] : [];
  for (const seed of SEED_ACCOUNTS) {
    if (!list.some((a) => a.email.toLowerCase() === seed.email.toLowerCase())) {
      list.push(seed);
    }
  }
  return list;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: mergeSeeds([]),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      login: (email, password) => {
        const accounts = get().accounts;
        const found = accounts.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
        );
        if (!found) return { ok: false, error: "Invalid email or password." };
        const user: AuthUser = {
          email: found.email,
          name: found.name,
          role: found.role,
          studentId: found.studentId,
        };
        set({ user });
        return { ok: true, user };
      },
      register: ({ name, studentId, email, password }) => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const trimmedId = studentId.trim();
        if (!trimmedName || !trimmedId || !trimmedEmail || !password) {
          return { ok: false, error: "Please fill out every field." };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return { ok: false, error: "Please use a valid university email." };
        }
        if (password.length < 6) {
          return { ok: false, error: "Password must be at least 6 characters." };
        }
        const accounts = get().accounts;
        if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const newAccount: StoredAccount = {
          email: trimmedEmail,
          password,
          name: trimmedName,
          studentId: trimmedId,
          role: "student",
        };
        const user: AuthUser = {
          email: newAccount.email,
          name: newAccount.name,
          role: "student",
          studentId: newAccount.studentId,
        };
        set({ accounts: [...accounts, newAccount], user });
        return { ok: true, user };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "queuesmart-auth-v2",
      partialize: (s) => ({ user: s.user, accounts: s.accounts }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.accounts = mergeSeeds(state.accounts);
          state.setHydrated();
        }
      },
    }
  )
);

export const DEMO_ACCOUNTS = SEED_ACCOUNTS.map((a) => ({ ...a }));
