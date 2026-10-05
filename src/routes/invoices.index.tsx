import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, statusLabel } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { computeTotals, effectiveStatus, formatDate, formatEUR } from "@/lib/invoice-calc";
import type { InvoiceStatus } from "@/lib/types";

export const Route = createFileRoute("/invoices/")({
  head: () => ({
    meta: [
      { title: "Invoices — guestBTP" },
      { name: "description", content: "Filter and track all construction invoices by status, client and date." },
      { property: "og:title", content: "Invoices — guestBTP" },
      { property: "og:description", content: "All your construction invoices in one place." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { invoices, clients } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [client, setClient] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const clientName = (id: string) => clients.find((c) => c.id === id)?.companyName ?? "—";

  const rows = useMemo(() =>
    invoices
      .map((i) => ({ ...i, eff: effectiveStatus(i), totals: computeTotals(i.lines) }))
      .filter((i) => status === "all" || i.eff === status)
      .filter((i) => client === "all" || i.clientId === client)
      .filter((i) => !from || i.issueDate >= from)
      .filter((i) => !to || i.issueDate <= to)
      .filter((i) => `${i.number} ${i.projectName} ${clientName(i.clientId)}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoices, clients, q, status, client, from, to]);

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${rows.length} of ${invoices.length} invoices`}
        actions={<Button asChild><Link to="/invoices/new"><Plus /> New invoice</Link></Button>} />

      <Card className="mb-4"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Number, project, client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(statusLabel) as InvoiceStatus[]).map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={client} onValueChange={setClient}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="date" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </CardContent></Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader><TableRow className="bg-muted">
            <TableHead>Number</TableHead><TableHead>Client / Project</TableHead><TableHead>Issued</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total HT</TableHead><TableHead className="text-right">Total TTC</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate({ to: "/invoices/$id", params: { id: r.id } })}>
                <TableCell className="font-mono font-semibold"><Link to="/invoices/$id" params={{ id: r.id }}>{r.number}</Link></TableCell>
                <TableCell><div className="font-medium">{clientName(r.clientId)}</div><div className="max-w-xs truncate text-xs text-muted-foreground">{r.projectName}</div></TableCell>
                <TableCell>{formatDate(r.issueDate)}</TableCell>
                <TableCell>{formatDate(r.dueDate)}</TableCell>
                <TableCell><StatusBadge status={r.eff} /></TableCell>
                <TableCell className="text-right">{formatEUR(r.totals.totalHT)}</TableCell>
                <TableCell className="text-right font-semibold">{formatEUR(r.totals.totalTTC)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-3 md:hidden">
        {rows.map((r) => (
          <Link key={r.id} to="/invoices/$id" params={{ id: r.id }}>
            <Card className="border-l-4 border-l-primary"><CardContent className="p-4">
              <div className="flex items-center justify-between"><span className="font-mono font-semibold">{r.number}</span><StatusBadge status={r.eff} /></div>
              <div className="mt-1 font-medium">{clientName(r.clientId)}</div>
              <div className="truncate text-sm text-muted-foreground">{r.projectName}</div>
              <div className="mt-2 flex items-end justify-between text-sm">
                <span className="text-muted-foreground">Due {formatDate(r.dueDate)}</span>
                <span className="font-display text-lg font-bold">{formatEUR(r.totals.totalTTC)}</span>
              </div>
            </CardContent></Card>
          </Link>
        ))}
      </div>
      {rows.length === 0 && <p className="py-10 text-center text-muted-foreground">No invoices match these filters.</p>}
    </div>
  );
}
