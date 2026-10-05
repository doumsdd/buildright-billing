import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { Client, ClientInput, Invoice, InvoiceInput, InvoiceStatus } from "./types";
import { mockClients, mockInvoices } from "./mock-data";
import { canTransition, isEditable } from "./invoice-calc";

interface State { clients: Client[]; invoices: Invoice[] }
type Action =
  | { type: "load"; state: State }
  | { type: "createClient"; client: Client }
  | { type: "updateClient"; id: string; data: ClientInput }
  | { type: "createInvoice"; invoice: Invoice }
  | { type: "updateDraft"; id: string; data: InvoiceInput }
  | { type: "transition"; id: string; to: InvoiceStatus };

export class BusinessRuleError extends Error {}

export function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "load": return a.state;
    case "createClient": return { ...state, clients: [...state.clients, a.client] };
    case "updateClient":
      return { ...state, clients: state.clients.map((c) => (c.id === a.id ? { ...c, ...a.data } : c)) };
    case "createInvoice": return { ...state, invoices: [...state.invoices, a.invoice] };
    case "updateDraft": {
      const inv = state.invoices.find((i) => i.id === a.id);
      if (!inv || !isEditable(inv.status)) throw new BusinessRuleError("Only draft invoices can be edited.");
      return { ...state, invoices: state.invoices.map((i) => (i.id === a.id ? { ...i, ...a.data } : i)) };
    }
    case "transition": {
      const inv = state.invoices.find((i) => i.id === a.id);
      if (!inv) throw new BusinessRuleError("Invoice not found.");
      if (!canTransition(inv.status, a.to)) throw new BusinessRuleError(`Cannot change status from ${inv.status} to ${a.to}.`);
      return {
        ...state,
        invoices: state.invoices.map((i) =>
          i.id === a.id ? { ...i, status: a.to, paidAt: a.to === "paid" ? new Date().toISOString().slice(0, 10) : i.paidAt } : i,
        ),
      };
    }
  }
}

const KEY = "guestbtp-state-v1";
const initial: State = { clients: mockClients, invoices: mockInvoices };

interface Ctx extends State {
  createClient: (d: ClientInput) => Client;
  updateClient: (id: string, d: ClientInput) => void;
  createInvoice: (d: InvoiceInput, status: "draft" | "sent") => Invoice;
  updateDraftInvoice: (id: string, d: InvoiceInput) => void;
  transitionStatus: (id: string, to: InvoiceStatus) => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "load", state: JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  // Validate synchronously so callers get an error before dispatching
  const run = (a: Action) => { reducer(state, a); dispatch(a); };

  const value: Ctx = {
    ...state,
    createClient: (d) => {
      const client = { ...d, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) };
      run({ type: "createClient", client });
      return client;
    },
    updateClient: (id, data) => run({ type: "updateClient", id, data }),
    createInvoice: (d, status) => {
      const year = new Date().getFullYear();
      const seq = state.invoices.filter((i) => i.number.includes(`-${year}-`)).length + 1;
      const invoice: Invoice = { ...d, id: crypto.randomUUID(), number: `FAC-${year}-${String(seq).padStart(3, "0")}`, status, createdAt: new Date().toISOString().slice(0, 10) };
      run({ type: "createInvoice", invoice });
      return invoice;
    },
    updateDraftInvoice: (id, data) => run({ type: "updateDraft", id, data }),
    transitionStatus: (id, to) => run({ type: "transition", id, to }),
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
