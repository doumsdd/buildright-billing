import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, statusLabel } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { computeTotals, effectiveStatus, formatDate, formatEUR } from "@/lib/invoice-calc";
import type { InvoiceStatus } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — guestBTP" },
      { name: "description", content: "Revenue, outstanding payments and recent invoices for your construction business." },
      { property: "og:title", content: "Dashboard — guestBTP" },
      { property: "og:description", content: "Construction billing KPIs at a glance." },
    ],
  }),
  component: Dashboard,
});

const statusColor: Record<InvoiceStatus, string> = {
  paid: "var(--success)", sent: "var(--primary)", overdue: "var(--destructive)", draft: "var(--chart-5)", cancelled: "var(--secondary)",
};

function Dashboard() {
  const { invoices, clients } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = useMemo(() => {
    const rows = invoices.map((i) => ({ ...i, eff: effectiveStatus(i), ttc: computeTotals(i.lines).totalTTC }));
    const sum = (f: (r: (typeof rows)[number]) => boolean) => rows.filter(f).reduce((a, r) => a + r.ttc, 0);
    const now = new Date();
    const thisMonth = rows.filter((r) => { const d = new Date(r.issueDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const months = Array.from({ length: 7 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 6 + k, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, name: d.toLocaleDateString("en-GB", { month: "short" }), billed: 0, paid: 0 };
    });
    for (const r of rows) {
      if (r.eff === "cancelled" || r.eff === "draft") continue;
      const d = new Date(r.issueDate); const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) { m.billed += r.ttc; if (r.eff === "paid") m.paid += r.ttc; }
    }
    const byStatus = (["paid", "sent", "overdue", "draft", "cancelled"] as InvoiceStatus[])
      .map((s) => ({ status: s, name: statusLabel[s], value: rows.filter((r) => r.eff === s).length })).filter((x) => x.value);
    const recent = [...rows].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 5);
    return {
      paid: sum((r) => r.eff === "paid"), outstanding: sum((r) => r.eff === "sent"), overdue: sum((r) => r.eff === "overdue"),
      overdueCount: rows.filter((r) => r.eff === "overdue").length, thisMonth, months, byStatus, recent,
    };
  }, [invoices]);

  const kpis = [
    { label: "Revenue collected", value: formatEUR(data.paid), icon: Banknote, tone: "bg-success text-success-foreground" },
    { label: "Outstanding", value: formatEUR(data.outstanding), icon: Clock, tone: "bg-primary text-primary-foreground" },
    { label: `Overdue (${data.overdueCount})`, value: formatEUR(data.overdue), icon: AlertTriangle, tone: "bg-destructive text-destructive-foreground" },
    { label: "Invoices this month", value: String(data.thisMonth), icon: FileText, tone: "bg-secondary text-secondary-foreground" },
  ];
  const clientName = (id: string) => clients.find((c) => c.id === id)?.companyName ?? "—";

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your billing activity" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-l-4 border-l-primary">
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-11 w-11 place-items-center rounded-sm ${k.tone}`}><k.icon className="h-5 w-5" /></span>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="truncate font-display text-2xl font-bold text-secondary">{k.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display uppercase">Monthly revenue (TTC)</CardTitle></CardHeader>
          <CardContent className="h-72">
            {mounted && <ResponsiveContainer width="100%" height={256}>
              <BarChart data={data.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                <Bar dataKey="billed" name="Billed" fill="var(--secondary)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="paid" name="Collected" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display uppercase">Invoices by status</CardTitle></CardHeader>
          <CardContent className="h-72">
            {mounted && <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {data.byStatus.map((s) => <Cell key={s.status} fill={statusColor[s.status]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {data.byStatus.map((s) => (
                <span key={s.status} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: statusColor[s.status] }} />{s.name} ({s.value})</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase">Recent invoices</CardTitle>
          <Link to="/invoices" className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary">View all <ArrowRight className="h-4 w-4" /></Link>
        </CardHeader>
        <CardContent className="divide-y">
          {data.recent.map((r) => (
            <Link key={r.id} to="/invoices/$id" params={{ id: r.id }} className="flex items-center gap-3 py-3 hover:bg-muted/50">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm font-semibold">{r.number}</div>
                <div className="truncate text-sm text-muted-foreground">{clientName(r.clientId)} · {formatDate(r.issueDate)}</div>
              </div>
              <StatusBadge status={r.eff} />
              <div className="w-28 text-right font-semibold">{formatEUR(r.ttc)}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
