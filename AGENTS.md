<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules

- All data changes go through the store in `src/lib/store.tsx`, which checks the business rules in its reducer. This keeps the rules enforced no matter which screen calls it.
- The invoice-status and total calculations live in `src/lib/invoice-calc.ts` as pure functions, so tests can cover them.
- The store has no delete action for invoices. The billing rules forbid deleting an invoice.
- Recharts charts render only after the page has loaded in the browser. Otherwise they measure zero width during server rendering and come out blank.
