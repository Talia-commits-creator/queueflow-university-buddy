import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth-store";
import { CardSkeleton } from "@/components/Skeletons";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hydrated && !user) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } as never });
    }
  }, [mounted, hydrated, user, navigate]);

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== role) {
    return <AccessDenied requiredRole={role} />;
  }

  return <>{children}</>;
}

function AccessDenied({ requiredRole }: { requiredRole: Role }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 animate-fade-in">
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-card text-center">
        <span className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-destructive/10 text-destructive mb-5">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          This page is restricted to <strong className="text-foreground">{requiredRole}</strong> accounts.
          Your current session does not have the required permissions.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-medium shadow-soft hover:shadow-elevated transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
