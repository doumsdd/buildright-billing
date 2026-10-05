import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Search, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { Client, ClientInput } from "@/lib/types";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — guestBTP" },
      { name: "description", content: "Manage your construction clients: developers, municipalities and private owners." },
      { property: "og:title", content: "Clients — guestBTP" },
      { property: "og:description", content: "Client directory for construction billing." },
    ],
  }),
  component: ClientsPage,
});

const empty: ClientInput = { companyName: "", contactName: "", email: "", phone: "", address: "", siret: "", vatNumber: "" };
const fields: { key: keyof ClientInput; label: string; type?: string; required?: boolean }[] = [
  { key: "companyName", label: "Company name", required: true },
  { key: "contactName", label: "Contact name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "siret", label: "SIRET" },
  { key: "vatNumber", label: "VAT number" },
];

function ClientsPage() {
  const { clients, invoices, createClient, updateClient } = useStore();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [form, setForm] = useState<ClientInput>(empty);

  const open = (c: Client | "new") => {
    setEditing(c);
    setForm(c === "new" ? empty : { ...c });
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing === "new") { createClient(form); toast.success("Client created"); }
    else if (editing) { updateClient(editing.id, form); toast.success("Client updated"); }
    setEditing(null);
  };
  const list = clients.filter((c) => `${c.companyName} ${c.contactName} ${c.email}`.toLowerCase().includes(q.toLowerCase()));
  const count = (id: string) => invoices.filter((i) => i.clientId === id).length;

  return (
    <div>
      <PageHeader title="Clients" subtitle={`${clients.length} clients`} actions={<Button onClick={() => open("new")}><Plus /> New client</Button>} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9 bg-card" placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="hidden md:block">
        <Table>
          <TableHeader><TableRow className="bg-muted">
            <TableHead>Company</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead className="text-center">Invoices</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.companyName}</TableCell>
                <TableCell>{c.contactName}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-center">{count(c.id)}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => open(c)}><Pencil /> Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-3 md:hidden">
        {list.map((c) => (
          <Card key={c.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div><div className="font-semibold">{c.companyName}</div><div className="text-sm text-muted-foreground">{c.contactName}</div></div>
                <Button size="icon" variant="ghost" onClick={() => open(c)} aria-label="Edit"><Pencil /></Button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{c.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{c.phone}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {list.length === 0 && <p className="py-10 text-center text-muted-foreground">No clients found.</p>}

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle className="font-display text-2xl uppercase">{editing === "new" ? "New client" : "Edit client"}</SheetTitle></SheetHeader>
          <form onSubmit={save} className="space-y-4 px-4 pb-6">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                <Input id={f.key} type={f.type ?? "text"} required={f.required} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <Button type="submit" className="w-full">Save client</Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
