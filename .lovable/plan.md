# guestBTP — Construction Billing App

A billing app for construction companies, built for a portfolio. It has an industrial look, uses sample data, and has no login.

## Design
- Palette: anthracite #2C3E50 (sidebar, headings), construction yellow #F39C12 (primary actions, highlights), green #27AE60 (paid), red #E74C3C (overdue and errors).
- Industrial style: dense layout, firm borders, a subtle hazard-stripe accent on the header, a condensed display font (Barlow Condensed) for headings and Barlow for body text.
- Logo: a hard-hat icon next to the word "guestBTP". Header shows a user avatar placeholder ("Chef de chantier").

## Pages
1. **Dashboard (/)** — 4 stat cards (revenue collected, outstanding, overdue, invoices this month), a monthly revenue bar chart, a pie chart of invoices by status, and a list of the 5 most recent invoices.
2. **Clients (/clients)** — searchable list (a table on desktop, cards on mobile), plus a "New client" form and an edit form that open in a side sheet. Fields: company name, contact, email, phone, address, SIRET, VAT number.
3. **Invoices (/invoices)** — list with filters for status, client, date range and search. Shows as a table on desktop and cards on mobile.
4. **New invoice (/invoices/new)** — a 3-step form:
   1. Pick the client, then set the project/site name, issue date and due date.
   2. Add line items (description, quantity, unit such as m², h, u or forfait, unit price HT, VAT rate of 20%, 10% or 5.5%). Totals update as you type.
   3. Review, then save as a draft or send.
5. **Invoice detail (/invoices/$id)** — header, client block, line items, and HT/VAT/TTC totals with a breakdown per VAT rate. Status buttons offer only the changes the rules allow, and invoices that are paid or cancelled can't be edited. There is no delete button anywhere.

## Business rules
- Allowed status changes: draft → sent or cancelled; sent → paid, overdue or cancelled; overdue → paid or cancelled. Paid and cancelled are final.
- Only draft invoices can be edited. Paid and cancelled invoices are read-only, and the app enforces this, not just the screen.
- No way to delete an invoice exists in the app at all.
- A sent invoice whose due date has passed shows as overdue.

## Sample data
- 5 realistic construction clients (for example, a property developer, a town hall, a public housing office, and private owners).
- 10 invoices covering every status, with typical line items such as masonry, concrete slab, roofing, plumbing and labour hours.

## Navigation and screen sizes
- Left sidebar with icons for Dashboard, Clients and Invoices. On desktop it shrinks to an icon strip; on mobile it slides in from the side.
- Designed for mobile first: tables become cards on small screens.

## Technical details
- Tech stack differences: the project runs on TanStack Start (React 19, Vite, file-based TanStack Router). It cannot use React Router v6, so routes are files under `src/routes/` and links use TanStack Router's `<Link>`. Everything else stays as requested: TypeScript, Tailwind v4, shadcn/ui, Recharts and Lucide.
- Types follow the OpenAPI field names (`Client`, `Invoice`, `InvoiceLine`, `InvoiceStatus`) and live in `src/lib/types.ts`. The sample data is in `src/lib/mock-data.ts`.
- One store (React context with a reducer, saved to localStorage so changes survive a refresh) handles all data changes. It offers `createClient`, `updateClient`, `createInvoice`, `updateDraftInvoice` and `transitionStatus`, and has no delete action. A `canTransition(from, to)` helper and a read-only guard both throw an error when a rule is broken.
- `src/lib/invoice-calc.ts` holds the pure functions for the HT, VAT and TTC totals, rounded to the cent. Vitest tests cover these calculations and the status-change rules.
- Every page gets its own title and description (`head()` meta). Design tokens are defined in `src/styles.css` using oklch.
