# TicketFlow Web

Initial **Next.js App Router** frontend scaffold for TicketFlow, in `apps/web`.

- TypeScript (strict), Tailwind CSS 4, reusable shadcn-style button primitive.
- Responsive event discovery, search, filters, sorting, empty results and demo detail pages.
- Uses clearly labelled fictional demo events while the Express events API is not yet implemented.
- This does **not** create reservations, charge payments, fetch live prices or expose real tickets.

## Commands

From repository root:

```bash
pnpm install
pnpm --filter @ticketflow/web dev
pnpm --filter @ticketflow/web typecheck
pnpm --filter @ticketflow/web lint
```

App URL: http://localhost:3000

## Next development steps

1. Add API contract and public events endpoints to Express.
2. Replace demo event data with TanStack Query, loading/error states and a typed API client.
3. Connect Better Auth session flow and enforce email verification on the API.
4. Implement transactional bookings/inventory, tests and payment simulation before enabling ticket purchase.
