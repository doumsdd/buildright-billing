import { computeTotals, formatEUR } from "@/lib/invoice-calc";
import type { InvoiceLine } from "@/lib/types";

export function InvoiceTotals({ lines }: { lines: InvoiceLine[] }) {
  const t = computeTotals(lines);
  return (
    <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
      <Row label="Total HT" value={formatEUR(t.totalHT)} />
      {t.vatBreakdown.map((v) => (
        <Row key={v.rate} label={`VAT ${v.rate}% on ${formatEUR(v.base)}`} value={formatEUR(v.vat)} muted />
      ))}
      <Row label="Total VAT" value={formatEUR(t.totalVAT)} />
      <div className="flex items-center justify-between rounded-sm bg-secondary px-3 py-2 text-secondary-foreground">
        <span className="font-display font-semibold uppercase tracking-wider">Total TTC</span>
        <span className="font-display text-xl font-bold text-primary">{formatEUR(t.totalTTC)}</span>
      </div>
    </div>
  );
}
function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={`flex justify-between ${muted ? "text-xs text-muted-foreground" : ""}`}><span>{label}</span><span className="font-medium">{value}</span></div>;
}
