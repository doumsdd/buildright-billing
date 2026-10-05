import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Send, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge, statusLabel } from "@/components/status-badge";
import { InvoiceTotals } from "@/components/invoice-totals";
import { useStore } from "@/lib/store";
import { TRANSITIONS, effectiveStatus, formatDate, formatEUR, isReadOnly, lineHT } from "@/lib/invoice-calc";
import type { InvoiceStatus } from "@/lib/types";

export const Route = createFileRoute("/invoices/$id")({
  head: () => ({
    meta: [
      { title: "Invoice detail — guestBTP" },
      { name: "description", content: "Invoice lines, VAT breakdown and status history." },
      { property: "og:title", content: "Invoice detail — guestBTP" },
      { property: "og:description", content: "View and update the status of a construction invoice." },
    ],
  }),
  component: InvoiceDetail,
});

const actionMeta: Record<InvoiceStatus, { label: string; icon: typeof Send; variant: "default" | "outline" | "destructive" }> = {
  sent: { label: "Mark as sent", icon: Send, variant: "default" },
  paid: { label: "Mark as paid", icon: CheckCircle2, variant: "default" },
  overdue: { label: "Mark overdue", icon: AlertTriangle, variant: "outline" },
  cancelled: { label: "Cancel invoice", icon: XCircle, variant: "destructive" },
  draft: { label: "Draft", icon: Send, variant: "outline" },
};

function InvoiceDetail() {
  const { id } = Route.useParams();
  const { invoices, clients, transitionStatus } = useStore();
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold">Invoice not found</h1>
      <Button asChild className="mt-4"><Link to="/invoices">Back to invoices</Link></Button>
    </div>
  );
  const client = clients.find((c) => c.id === inv.clientId);
  const eff = effectiveStatus(inv);
  // If sent but past due, the actual stored status is still "sent" — allowed actions come from stored status
  const actions = TRANSITIONS[inv.status].filter((s) => !(eff === "overdue" && s === "overdue"));
  const locked = isReadOnly(inv.status);

  const doTransition = (to: InvoiceStatus) => {
    try { transitionStatus(inv.id, to); toast.success(`Invoice marked as ${statusLabel[to].toLowerCase()}`); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/invoices" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All invoices</Link>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3"><h1 className="font-mono text-2xl font-bold text-secondary md:text-3xl">{inv.number}</h1><StatusBadge status={eff} /></div>
          <p className="mt-1 text-muted-foreground">{inv.projectName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((to) => {
            const m = actionMeta[to];
            const btn = <Button variant={m.variant}><m.icon /> {m.label}</Button>;
            const final = to === "paid" || to === "cancelled";
            if (!final) return <span key={to} onClick={() => doTransition(to)}>{btn}</span>;
            return (
              <AlertDialog key={to}>
                <AlertDialogTrigger asChild>{btn}</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{m.label}?</AlertDialogTitle>
                    <AlertDialogDescription>This is final. A {statusLabel[to].toLowerCase()} invoice becomes read-only and its status can no longer change.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Go back</AlertDialogCancel><AlertDialogAction onClick={() => doTransition(to)}>Confirm</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          })}
        </div>
      </div>

      {locked && (
        <div className="mb-4 flex items-center gap-2 rounded-sm border border-secondary/30 bg-muted p-3 text-sm">
          <Lock className="h-4 w-4" /> This invoice is {statusLabel[inv.status].toLowerCase()} and is read-only. Invoices can never be deleted.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="font-display uppercase">Client</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-semibold">{client?.companyName}</div>
            <div>{client?.contactName}</div>
            <div className="text-muted-foreground">{client?.address}</div>
            <div className="text-muted-foreground">{client?.email}</div>
            <div className="pt-2 text-xs text-muted-foreground">SIRET {client?.siret} · VAT {client?.vatNumber}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="font-display uppercase">Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Info label="Issue date" value={formatDate(inv.issueDate)} />
            <Info label="Due date" value={formatDate(inv.dueDate)} />
            <Info label="Paid on" value={inv.paidAt ? formatDate(inv.paidAt) : "—"} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="font-display uppercase">Line items</CardTitle></CardHeader>
        <CardContent>
          <div className="hidden grid-cols-12 gap-2 border-b pb-2 text-xs font-semibold uppercase text-muted-foreground md:grid">
            <div className="col-span-5">Description</div><div className="col-span-2 text-right">Qty</div><div className="col-span-2 text-right">Unit price HT</div><div className="col-span-1 text-right">VAT</div><div className="col-span-2 text-right">Total HT</div>
          </div>
          <div className="divide-y">
            {inv.lines.map((l) => (
              <div key={l.id} className="grid grid-cols-2 gap-1 py-3 text-sm md:grid-cols-12 md:gap-2">
                <div className="col-span-2 font-medium md:col-span-5">{l.description}</div>
                <div className="text-muted-foreground md:col-span-2 md:text-right md:text-foreground">{l.quantity} {l.unit}</div>
                <div className="text-right md:col-span-2">{formatEUR(l.unitPriceHT)}</div>
                <div className="text-muted-foreground md:col-span-1 md:text-right">{l.vatRate}%</div>
                <div className="text-right font-semibold md:col-span-2">{formatEUR(lineHT(l))}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4"><InvoiceTotals lines={inv.lines} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div>;
}
