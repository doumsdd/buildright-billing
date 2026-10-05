# BuildRight Billing

```markdown
# guestBTP - Construction Billing App

## 🎯 Project Overview
- Name: guestBTP
- Type: Billing/invoicing app for construction companies (BTP)
- Purpose: Portfolio project demonstrating modern full-stack architecture
- Language: English (default)

## 🎨 Design Requirements
- Theme: Industrial/construction style
- Palette: Anthracite gray (#2C3E50), Construction yellow (#F39C12), Success green (#27AE60), Error red (#E74C3C)
- UI Library: shadcn/ui + Tailwind CSS
- Logo: Simple text "guestBTP" with hard hat icon
- No authentication (skip login page)

## 📄 Pages to Build
1. **Dashboard** - KPIs, revenue charts, recent invoices
2. **Clients** - List + Create/Edit forms
3. **Invoices** - List with filters + Create multi-step form
4. **Invoice Detail** - View details, change status (no delete!)

## 🧭 Navigation
- Left sidebar with icons (Dashboard, Clients, Invoices)
- Top header with logo + user profile placeholder

## 💾 Data Strategy
- Use mock data (realistic construction company examples)
- 5 sample clients
- 10 sample invoices with various statuses
- Mock data structure aligned with OpenAPI spec

## 🔒 Business Rules (CRITICAL)
- ❌ Invoices CANNOT be deleted (only marked as paid/cancelled)
- ✅ Invoice statuses: draft → sent → paid | cancelled | overdue
- ✅ Auto-calculate HT/VAT/TTC
- ✅ Status transitions must be enforced
- ✅ Paid/cancelled invoices are read-only

## 🏗️ Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Recharts (for dashboard graphs)
- Lucide React (icons)
- React Router v6

## 📱 Responsive
- Mobile-first approach
- Sidebar collapses on mobile
- Tables become cards on small screens
```

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87606acb-0811-4664-9dbd-c3ebf53cd5aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
