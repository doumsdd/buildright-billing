import type { Client, Invoice } from "./types";

export const mockClients: Client[] = [
  { id: "c1", companyName: "Nexity Promotion Lyon", contactName: "Claire Dubois", email: "c.dubois@nexity-lyon.fr", phone: "04 72 11 22 33", address: "12 Rue de la République, 69002 Lyon", siret: "44434567800012", vatNumber: "FR12444345678", createdAt: "2026-01-10" },
  { id: "c2", companyName: "Mairie de Villeurbanne", contactName: "Jean-Marc Petit", email: "services.techniques@villeurbanne.fr", phone: "04 78 03 67 67", address: "Place Lazare Goujon, 69100 Villeurbanne", siret: "21690266800013", vatNumber: "FR45216902668", createdAt: "2026-02-03" },
  { id: "c3", companyName: "OPAC du Rhône", contactName: "Sophie Laurent", email: "s.laurent@opac-rhone.fr", phone: "04 72 76 30 00", address: "2 Place de Francfort, 69003 Lyon", siret: "77964310200025", vatNumber: "FR78779643102", createdAt: "2026-02-20" },
  { id: "c4", companyName: "SCI Les Terrasses", contactName: "Marc Bernard", email: "marc.bernard@sci-terrasses.fr", phone: "06 12 34 56 78", address: "45 Chemin des Vignes, 69380 Lozanne", siret: "81234567900018", vatNumber: "FR33812345679", createdAt: "2026-03-15" },
  { id: "c5", companyName: "M. et Mme Moreau", contactName: "Pierre Moreau", email: "p.moreau@gmail.com", phone: "06 98 76 54 32", address: "8 Allée des Tilleuls, 69130 Écully", siret: "—", vatNumber: "—", createdAt: "2026-04-02" },
];

let n = 0;
const L = (description: string, quantity: number, unit: Invoice["lines"][number]["unit"], unitPriceHT: number, vatRate: 20 | 10 | 5.5 = 20) => ({ id: `l${++n}`, description, quantity, unit, unitPriceHT, vatRate });

export const mockInvoices: Invoice[] = [
  { id: "i1", number: "FAC-2026-001", clientId: "c1", projectName: "Résidence Le Belvédère — Lot gros œuvre", issueDate: "2026-04-05", dueDate: "2026-05-05", status: "paid", paidAt: "2026-04-28", createdAt: "2026-04-05", lines: [L("Terrassement et fouilles en pleine masse", 420, "m³", 28), L("Dalle béton armé ép. 20 cm", 380, "m²", 85), L("Main d'œuvre maçons", 120, "h", 45)] },
  { id: "i2", number: "FAC-2026-002", clientId: "c2", projectName: "Groupe scolaire Jean Moulin — Toiture", issueDate: "2026-04-18", dueDate: "2026-05-18", status: "paid", paidAt: "2026-05-15", createdAt: "2026-04-18", lines: [L("Dépose couverture existante", 650, "m²", 12), L("Couverture tuiles terre cuite", 650, "m²", 58), L("Zinguerie et gouttières", 140, "ml", 42)] },
  { id: "i3", number: "FAC-2026-003", clientId: "c3", projectName: "Réhabilitation Bât. C — Plomberie", issueDate: "2026-05-10", dueDate: "2026-06-10", status: "paid", paidAt: "2026-06-08", createdAt: "2026-05-10", lines: [L("Remplacement colonnes EU/EV", 24, "u", 890, 10), L("Plombier qualifié", 80, "h", 48, 10)] },
  { id: "i4", number: "FAC-2026-004", clientId: "c4", projectName: "Extension villa — Maçonnerie", issueDate: "2026-06-02", dueDate: "2026-07-02", status: "paid", paidAt: "2026-07-01", createdAt: "2026-06-02", lines: [L("Murs parpaings 20 cm", 145, "m²", 62), L("Chaînages et linteaux", 1, "forfait", 3200)] },
  { id: "i5", number: "FAC-2026-005", clientId: "c5", projectName: "Rénovation salle de bain", issueDate: "2026-07-08", dueDate: "2026-08-08", status: "cancelled", createdAt: "2026-07-08", lines: [L("Carrelage grès cérame", 18, "m²", 75, 10), L("Pose receveur et paroi", 1, "forfait", 1450, 10)] },
  { id: "i6", number: "FAC-2026-006", clientId: "c1", projectName: "Résidence Le Belvédère — Situation n°2", issueDate: "2026-07-20", dueDate: "2026-08-20", status: "overdue", createdAt: "2026-07-20", lines: [L("Élévation voiles béton", 520, "m²", 95), L("Coffrage et ferraillage", 1, "forfait", 18500)] },
  { id: "i7", number: "FAC-2026-007", clientId: "c3", projectName: "Isolation thermique par l'extérieur", issueDate: "2026-08-25", dueDate: "2026-09-25", status: "overdue", createdAt: "2026-08-25", lines: [L("ITE polystyrène 14 cm + enduit", 780, "m²", 98, 5.5), L("Échafaudage", 1, "forfait", 6200, 5.5)] },
  { id: "i8", number: "FAC-2026-008", clientId: "c2", projectName: "Voirie parking mairie", issueDate: "2026-09-15", dueDate: "2026-10-30", status: "sent", createdAt: "2026-09-15", lines: [L("Enrobé à chaud 6 cm", 1200, "m²", 32), L("Bordures T2", 260, "ml", 38), L("Marquage au sol", 1, "forfait", 1800)] },
  { id: "i9", number: "FAC-2026-009", clientId: "c4", projectName: "Extension villa — Charpente", issueDate: "2026-09-28", dueDate: "2026-10-28", status: "sent", createdAt: "2026-09-28", lines: [L("Charpente traditionnelle sapin", 85, "m²", 145), L("Charpentier", 40, "h", 52)] },
  { id: "i10", number: "FAC-2026-010", clientId: "c5", projectName: "Terrasse béton désactivé", issueDate: "2026-10-03", dueDate: "2026-11-03", status: "draft", createdAt: "2026-10-03", lines: [L("Béton désactivé ép. 12 cm", 42, "m²", 89, 10), L("Préparation du support", 1, "forfait", 950, 10)] },
];
