export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled" | "overdue";
export type Unit = "m²" | "m³" | "ml" | "h" | "u" | "forfait";
export type VatRate = 20 | 10 | 5.5;

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  vatNumber: string;
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unit: Unit;
  unitPriceHT: number;
  vatRate: VatRate;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  createdAt: string;
  paidAt?: string;
}

export type ClientInput = Omit<Client, "id" | "createdAt">;
export type InvoiceInput = Omit<Invoice, "id" | "number" | "createdAt" | "status" | "paidAt">;
