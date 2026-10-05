import { describe, it, expect } from "vitest";
import { computeTotals, canTransition, effectiveStatus } from "@/lib/invoice-calc";
import { reducer, BusinessRuleError } from "@/lib/store";
import { mockClients, mockInvoices } from "@/lib/mock-data";

describe("totals", () => {
  it("computes HT/VAT/TTC with mixed rates", () => {
    const t = computeTotals([
      { id: "a", description: "", quantity: 2, unit: "u", unitPriceHT: 100, vatRate: 20 },
      { id: "b", description: "", quantity: 1, unit: "u", unitPriceHT: 50, vatRate: 5.5 },
    ]);
    expect(t.totalHT).toBe(250);
    expect(t.totalVAT).toBe(42.75);
    expect(t.totalTTC).toBe(292.75);
  });
});

describe("status rules", () => {
  it("enforces transitions", () => {
    expect(canTransition("draft", "sent")).toBe(true);
    expect(canTransition("draft", "paid")).toBe(false);
    expect(canTransition("paid", "cancelled")).toBe(false);
    expect(canTransition("overdue", "paid")).toBe(true);
  });
  it("reducer rejects invalid transition and edits on non-drafts", () => {
    const s = { clients: mockClients, invoices: mockInvoices };
    expect(() => reducer(s, { type: "transition", id: "i1", to: "sent" })).toThrow(BusinessRuleError);
    expect(() => reducer(s, { type: "updateDraft", id: "i1", data: mockInvoices[0]! })).toThrow(BusinessRuleError);
  });
  it("sent past due is overdue", () => {
    expect(effectiveStatus({ status: "sent", dueDate: "2020-01-01" })).toBe("overdue");
  });
});
