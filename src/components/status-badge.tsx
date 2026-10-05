import type { InvoiceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  sent: "bg-accent text-accent-foreground border-primary",
  paid: "bg-success text-success-foreground border-success",
  overdue: "bg-destructive text-destructive-foreground border-destructive",
  cancelled: "bg-secondary/10 text-secondary border-secondary/40 line-through",
};
export const statusLabel: Record<InvoiceStatus, string> = {
  draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider", styles[status], className)}>
      {statusLabel[status]}
    </span>
  );
}
