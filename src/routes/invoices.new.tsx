import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Save, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { InvoiceTotals } from "@/components/invoice-totals";
import { useStore } from "@/lib/store";
import { formatDate, formatEUR, lineHT } from "@/lib/invoice-calc";
import type { InvoiceLine, Unit, VatRate } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({
    meta: [
      { title: "New invoice — guestBTP" },
      { name: "description", content: "Create a construction invoice in three steps with automatic HT, VAT and TTC totals." },
      { property: "og:title", content: "New invoice — guestBTP" },
      { property: "og:description", content: "Three-step invoice builder for construction work." },
    ],
  }),
  component: NewInvoice,
});

const UNITS: Unit[] = ["m²", "m³", "ml", "h", "u", "forfait"];
const RATES: VatRate[] = [20, 10, 5.5];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const newLine = (): InvoiceLine => ({ id: crypto.randomUUID(), description: "", quantity: 1, unit: "u", unitPriceHT: 0, vatRate: 20 });

function NewInvoice() {
  const { clients, createInvoice } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const today = new Date();
  const [clientId, setClientId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [issueDate, setIssueDate] = useState(iso(today));
  const [dueDate, setDueDate] = useState(iso(new Date(today.getTime() + 30 * 864e5)));
  const [lines, setLines] = useState<InvoiceLine[]>([newLine()]);

  const step1Ok = clientId && projectName.trim() && issueDate && dueDate && dueDate >= issueDate;
  const step2Ok = lines.length > 0 && lines.every((l) => l.description.trim() && l.quantity > 0 && l.unitPriceHT >= 0);
  const upd = (id: string, p: Partial<InvoiceLine>) => setLines(lines.map((l) => (l.id === id ? { ...l, ...p } : l)));

  const submit = (status: "draft" | "sent") => {
    const inv = createInvoice({ clientId, projectName, issueDate, dueDate, lines }, status);
    toast.success(`${inv.number} ${status === "draft" ? "saved as draft" : "sent"}`);
    navigate({ to: "/invoices/$id", params: { id: inv.id } });
  };
  const client = clients.find((c) => c.id === clientId);
  const steps = ["Client & project", "Line items", "Review"];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="New invoice" />
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 rounded-sm border-b-4 bg-card px-3 py-2 text-sm", i <= step ? "border-primary" : "border-border text-muted-foreground")}>
            <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-sm font-display font-bold", i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className="hidden font-medium sm:inline">{s}</span>
          </li>
        ))}
      </ol>

      <Card><CardContent className="p-4 md:p-6">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="project">Project / site name *</Label>
              <Input id="project" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Résidence Les Chênes — Lot maçonnerie" />
            </div>
            <div className="space-y-1.5"><Label htmlFor="issue">Issue date *</Label><Input id="issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label htmlFor="due">Due date *</Label><Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              {dueDate < issueDate && <p className="text-xs text-destructive">Due date must be after issue date.</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {lines.map((l, idx) => (
              <div key={l.id} className="grid grid-cols-2 gap-2 rounded-sm border bg-muted/40 p-3 md:grid-cols-12 md:items-end">
                <div className="col-span-2 space-y-1 md:col-span-4"><Label className="text-xs">Description #{idx + 1}</Label><Input value={l.description} onChange={(e) => upd(l.id, { description: e.target.value })} placeholder="Dalle béton ép. 15 cm" /></div>
                <div className="space-y-1 md:col-span-1"><Label className="text-xs">Qty</Label><Input type="number" min={0} step="any" value={l.quantity} onChange={(e) => upd(l.id, { quantity: Number(e.target.value) })} /></div>
                <div className="space-y-1 md:col-span-2"><Label className="text-xs">Unit</Label>
                  <Select value={l.unit} onValueChange={(v) => upd(l.id, { unit: v as Unit })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1 md:col-span-2"><Label className="text-xs">Unit price HT</Label><Input type="number" min={0} step="0.01" value={l.unitPriceHT} onChange={(e) => upd(l.id, { unitPriceHT: Number(e.target.value) })} /></div>
                <div className="space-y-1 md:col-span-1"><Label className="text-xs">VAT</Label>
                  <Select value={String(l.vatRate)} onValueChange={(v) => upd(l.id, { vatRate: Number(v) as VatRate })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end">
                  <span className="font-semibold">{formatEUR(lineHT(l))}</span>
                  <Button variant="ghost" size="icon" aria-label="Remove line" disabled={lines.length === 1} onClick={() => setLines(lines.filter((x) => x.id !== l.id))}><Trash2 /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={() => setLines([...lines, newLine()])}><Plus /> Add line</Button>
            <div className="pt-4"><InvoiceTotals lines={lines} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><div className="text-xs uppercase text-muted-foreground">Client</div><div className="font-semibold">{client?.companyName}</div><div className="text-sm text-muted-foreground">{client?.address}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Project</div><div className="font-semibold">{projectName}</div><div className="text-sm text-muted-foreground">Issued {formatDate(issueDate)} · Due {formatDate(dueDate)}</div></div>
            </div>
            <div className="divide-y rounded-sm border">
              {lines.map((l) => (
                <div key={l.id} className="flex justify-between gap-3 p-3 text-sm">
                  <div><div className="font-medium">{l.description}</div><div className="text-muted-foreground">{l.quantity} {l.unit} × {formatEUR(l.unitPriceHT)} · VAT {l.vatRate}%</div></div>
                  <div className="font-semibold">{formatEUR(lineHT(l))}</div>
                </div>
              ))}
            </div>
            <InvoiceTotals lines={lines} />
          </div>
        )}
      </CardContent></Card>

      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft /> Back</Button>
        {step < 2 ? (
          <Button disabled={step === 0 ? !step1Ok : !step2Ok} onClick={() => setStep(step + 1)}>Next <ChevronRight /></Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit("draft")}><Save /> Save draft</Button>
            <Button onClick={() => submit("sent")}><Send /> Send invoice</Button>
          </div>
        )}
      </div>
    </div>
  );
}
