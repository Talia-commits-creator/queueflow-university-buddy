import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, Bell, Loader2, MinusCircle } from "lucide-react";
import type { TicketStatus } from "@/lib/queue-data";

const MAP: Record<TicketStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  waiting:     { label: "Waiting",          cls: "bg-secondary text-secondary-foreground", Icon: Clock },
  approaching: { label: "Approaching turn", cls: "bg-warning/15 text-warning-foreground border border-warning/30", Icon: Bell },
  serving:     { label: "Being served",     cls: "bg-accent/20 text-foreground border border-accent/40", Icon: Loader2 },
  completed:   { label: "Completed",        cls: "bg-success/15 text-success-foreground border border-success/25", Icon: CheckCircle2 },
  skipped:     { label: "Skipped",          cls: "bg-destructive/10 text-destructive border border-destructive/20", Icon: MinusCircle },
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const { label, cls, Icon } = MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", cls, className)}>
      <Icon className={cn("h-3.5 w-3.5", status === "serving" && "animate-spin")} />
      {label}
    </span>
  );
}
