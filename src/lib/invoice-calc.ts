import type { Invoice, InvoiceLine, InvoiceStatus } from "./types";

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const lineHT = (l: Pick<InvoiceLine, "quantity" | "unitPriceHT">) =>
  round2((l.quantity || 0) * (l.unitPriceHT || 0));

export function computeTotals(lines: InvoiceLine[]) {
  const byRate = new Map<number, { base: number; vat: number }>();
  let totalHT = 0;
  for (const l of lines) {
    const ht = lineHT(l);
    totalHT += ht;
    const e = byRate.get(l.vatRate) ?? { base: 0, vat: 0 };
    e.base = round2(e.base + ht);
    byRate.set(l.vatRate, e);
  }
  let totalVAT = 0;
  const vatBreakdown = [...byRate.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, e]) => {
      const vat = round2((e.base * rate) / 100);
      totalVAT += vat;
      return { rate, base: e.base, vat };
    });
  totalHT = round2(totalHT);
  totalVAT = round2(totalVAT);
  return { totalHT, totalVAT, totalTTC: round2(totalHT + totalVAT), vatBreakdown };
}

export const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

export const canTransition = (from: InvoiceStatus, to: InvoiceStatus) =>
  TRANSITIONS[from].includes(to);

export const isReadOnly = (s: InvoiceStatus) => s === "paid" || s === "cancelled";
export const isEditable = (s: InvoiceStatus) => s === "draft";

/** A sent invoice past its due date is effectively overdue. */
export function effectiveStatus(inv: Pick<Invoice, "status" | "dueDate">, today = new Date()): InvoiceStatus {
  if (inv.status === "sent" && new Date(inv.dueDate) < new Date(today.toDateString())) return "overdue";
  return inv.status;
}

export const formatEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
