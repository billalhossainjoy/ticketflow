# TicketFlow — Figma to Next.js Implementation Handoff

Status: **Implementation planning draft — decisions below must be approved before integrating payments and reservations**
Date reviewed: 2026-11-19
Target: Frontend implementation for the **small TicketFlow portfolio MVP**
Base code branch: feat/web-auth-ui
Design file: https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr

> This document maps existing designs and repository code to **proposed** implementation work. It does not claim that screens, routes, business endpoints, Stripe integration, or E2E tests are finished.

## 1. Source reconciliation and release gates

Sources inspected:
- Figma pages: **02 — Customer & Authentication** (204 screen artboards), **03 — Organizer** (124), **04 — Admin** (40), **05 — Future Concepts** (4); 49 reusable component sets.
- Repository docs/architecture.md and docs/database/schema.dbml on main.
- Repository docs/requirements.md on main.
- Repository docs/frontend-ui-roadmap.md, apps/web files and package manifest on feat/web-auth-ui.

**Unresolved and blocking for API/booking integration:**

| Topic | Current sources | Required decision |
| --- | --- | --- |
| Tickets per booking | Requirements + frontend roadmap: 1–4; architecture + DBML: 1–5 | Approve one limit and matching database check/quantity selector. Do **not** implement a 4-ticket customer/event cap merely by adopting a 1–5 per-booking schema. |
| Customer/event active allocation | Requirements: 4 active tickets across bookings; architecture: one pending booking and 1–5 per booking | Explicitly approve aggregate allocation semantics and concurrency strategy. |
| Payment provider | Requirements/roadmap: simulated; newer architecture and Figma: Stripe **test mode** | For this handoff, Stripe test mode is the **recommended target**, pending explicit scope update to requirements and roadmap. |
| Organizer permissions | Requirements: application + admin approval; architecture: one provisioned organizer | For small MVP, provision one organizer server-side; mark application/admin screens **future**, not mandatory. |
| Cancellation/refunds | Broad requirements and Figma show customer/organizer cancellation; small architecture defers ordinary refunds | Do not expose cancellation controls in MVP. Keep **recovery refunds** for late/duplicate successful Stripe payments. |
| Checkout deadline | 10-minute booking hold; a provider payment/challenge can finish later | The server decides eligibility and late-success recovery; browser countdown is informational only. Never treat elapsed UI time or Stripe redirect as confirmation. |
| Deployment and origin | Existing Express/Better Auth API and proposed Next.js frontend | Approve public frontend/API hostnames, session-cookie origin strategy, trusted origins and CSRF protection before authentication integration. |

**Release recommendation (not an approved policy):** small MVP = Better Auth email/password and verification, browse published events, one organizer, create/publish events, ticket type/inventory, one-type reservations, Stripe test-mode Payment Element, durable payment recovery, issued admission tickets. Defer admin approval, check-in, ordinary booking/event cancellation, and broader analytics. Resolve the ticket quantity/aggregate cap separately first.

## 2. Actual implementation baseline (verified GitHub)

- Main currently contains Express API, Better Auth route under **/api/auth/**, PostgreSQL/Drizzle foundation, health/error/logging infrastructure. Event, booking, payment, admission endpoints described here **do not exist yet**.
- Frontend lives on **feat/web-auth-ui**, not main. App uses **Next.js 16.4.6**, React 19, TypeScript, Tailwind v4, Zod 4, React Hook Form, TanStack Query and a minimal Button primitive using class-variance-authority/Radix Slot.
- Actual frontend pages: /, /events/[id], /sign-in, /register, /verify-email. Discovery data is from apps/web/src/lib/demo-events.ts and authentication forms intentionally do not create real sessions.
- **Do not claim shadcn/ui is fully installed** from the existence of the Button primitive; import/generate the selected primitives when implementing each flow.
- Existing design system has 49 Figma component sets, not 49 React components. Component parity needs implementation.

### Recommended frontend organization (new code, not currently present)

~~~text
apps/web/src/
  app/
    (public)/page.tsx
    (public)/events/[eventId]/page.tsx
    (auth)/sign-in/page.tsx
    (auth)/register/page.tsx
    (auth)/verify-email/page.tsx
    (auth)/forgot-password/page.tsx
    (auth)/reset-password/page.tsx
    (customer)/bookings/page.tsx
    (customer)/bookings/[bookingId]/page.tsx
    (customer)/bookings/[bookingId]/checkout/page.tsx
    (customer)/bookings/[bookingId]/tickets/page.tsx
    (customer)/account/page.tsx
    (organizer)/organizer/page.tsx
    (organizer)/organizer/events/page.tsx
    (organizer)/organizer/events/new/page.tsx
    (organizer)/organizer/events/[eventId]/edit/page.tsx
    (organizer)/organizer/events/[eventId]/inventory/page.tsx
    (organizer)/organizer/bookings/page.tsx
    (organizer)/organizer/bookings/[bookingId]/page.tsx
  components/
    ui/                    # generated/adapted shadcn primitives
    layout/
    auth/
    events/
    booking/
    payment/
    admission/
    organizer/
  features/
    events/
    identity/
    bookings/
    payments/
    organizer/
  lib/
    api/
    auth/
    format/
    validation/
~~~

Route groups in parentheses do **not** appear in public URLs. Existing routes can be migrated incrementally; avoid renaming a working route without redirects or tested links.

## 3. Figma-to-route mapping (MVP)

Links reference a representative Figma artboard; each primary flow also has desktop/mobile and light/dark variants. The paths below are **proposed routes**, not all implemented.

| Priority | Route / view | Representative design | Code state | Server dependency |
| --- | --- | --- | --- | --- |
| P0 | / — discover/filter events | [Customer discovery](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=81-3) | Demo UI exists | Published event list/search |
| P0 | /events/[eventId] — details/selector | [Event details](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=91-336) | Demo page exists, reserve disabled | Event/ticket snapshots, atomic reservation |
| P0 | /sign-in, /register, /verify-email | [Sign in](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=286-3) | UI previews exist | Better Auth session and verification |
| P1 | /forgot-password, /reset-password | [Forgot password](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=338-26) | Not in app | Better Auth reset-email flow |
| P1 | /bookings/[bookingId]/checkout | [Reservation & payment](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=98-674), [card-entry](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=542-7617) | Not in app | Booking hold + payment intent |
| P1 | Checkout invalid / 3DS / delayed verification | [Invalid card](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=542-7809), [3DS](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=542-8001), [verification delayed](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=497-5028) | Design only | Stripe Elements/issuer + server reconcile |
| P1 | /bookings — list/empty | [My bookings](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=110-1115) | Not in app | Owner-protected booking list |
| P1 | /bookings/[bookingId] — status/history | [Confirmed details](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=110-1363), [reservation expired](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=288-7) | Not in app | Booking status/price snapshot |
| P1 | /bookings/[bookingId]/tickets | [Digital tickets](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=392-3506) | Not in app | Issued tickets, owner check |
| P1 | /organizer — dashboard | [Organizer dashboard](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=117-1642) | Not in app | Authenticated organizer summary |
| P1 | /organizer/events, /organizer/events/new | [My events](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=117-1907), [create](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=117-2219) | Not in app | Organizer events create/list |
| P1 | /organizer/events/[eventId]/edit | [Edit](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=117-2629), [publish blocked](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=508-8108) | Not in app | Optimistic event version, publish validations |
| P1 | /organizer/events/[eventId]/inventory | [Adjust](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=285-3), [below minimum](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=508-8594), [409 conflict](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=413-12277) | Not in app | Inventory adjustment/version |
| P1 | /organizer/bookings, /organizer/bookings/[bookingId] | [Booking list](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=124-4780), [refund recovery](https://www.figma.com/design/PBvjoXRhZIXkAbE8yWB4sr?node-id=518-9176) | Not in app | Scoped booking list and status |

### Deliberately **not** on the first-release route checklist

Admin approval and suspension, organizer application, customer booking cancellation/refund, organizer cancellation, event cancellation with paid-booking refunds, check-in and QR scanning, analytics prototypes. Designs exist; this does not authorize implementing them in the smaller MVP. Disable or omit navigation to deferred actions in the shipped UI.

## 4. Design-system component mapping

Prefer existing Tailwind v4 theme tokens; align light/dark semantic colors to Figma. Avoid embedding static color values per page.

| Figma component set | Web composition | Ownership |
| --- | --- | --- |
| Button / Primary, Outline, Destructive, Ghost | shadcn Button variants + disabled/loading | components/ui/button |
| Input field, Text Field, Textarea Field, Validation Message | Input, Label, Textarea, Form wrapper + RHF/Zod | components/ui + features/forms |
| Select, Select Field, Checkbox Field, Radio Field | Select, Checkbox, RadioGroup; controlled forms | components/ui |
| Card, Badge, Alert Banner, Toast | Card, Badge, Alert, Sonner/toast | components/ui |
| Dialog, Dialog / Booking Action | Dialog + AlertDialog for irreversible actions | components/ui |
| Tabs / Trigger, Tab Item, Navigation / Item | Tabs and semantic Link navigation | components/layout |
| Event Card, Event Status Badge, Filter Chip | EventCard + EventAvailabilityBadge + filters | components/events |
| Ticket Type Selector, Quantity Selector | TicketTypePicker + QuantityPicker, client state | components/booking |
| Reservation Countdown | Countdown component from authoritative expiresAt; no business transitions locally | components/booking |
| Booking Status Badge, Payment Outcome | Typed BookingStatusBadge / PaymentStatus | components/booking and payment |
| Digital Ticket Card | TicketCard; one admission ticket per ticket number | components/admission |
| Table / Row, Data Table Row, Pagination Control | Table and Pagination; server-side queries | components/organizer |
| Metric Card, Empty State, Error State | Reusable dashboard, empty/error boundaries | components/shared |
| Customer / Checkout Sticky Action Bar | Accessible mobile fixed/sticky action footer | components/payment |

**Important:** Stripe Payment Element, card validation, and 3DS Figma layers are **illustrative**. Mount Stripe's official Elements; do not implement custom card-number/CVC inputs that send card details to TicketFlow, and never build a fake issuer OTP modal in production.

## 5. Frontend data and rendering approach

- Server Components: initial public event listing/detail, account/booking page shells, metadata and route authorization redirects where safe.
- Client Components: filtering controls, quantity selection, form validation, reservation countdown, Stripe Elements, status polling, toasts and dialogs.
- TanStack Query: authenticated client mutations and bounded refetch; invalidate event, inventory and booking queries after success. It is already in package.json but a provider setup still needs implementing.
- Treat all UI availability as a stale **snapshot**; the only source of truth is the reservation transaction. Disable reserve when indicated unavailable, but always show a helpful conflict response if capacity vanished.
- Avoid Next.js caching of private booking, admission, or payment information. Public events may use planned revalidation/refresh rules only once data freshness is agreed.
- Format money from integer cents and ISO timestamp + IANA timezone; never store displayed amount strings as source data.
- Do not persist Better Auth session tokens or Stripe client secrets to localStorage. Configure secure cookies, trusted origins, and server-side authorization.
- Anonymous users may browse public events; booking and customer pages require authenticated, verified identity. Organizer routes require server-controlled organizer permission.

## 6. Proposed API contract inventory — **not implemented**

These names and payload envelopes are design proposals for the Express API team. Existing API only mounts Better Auth and /health; reconcile contracts and generate an OpenAPI schema before wiring the UI.

| Proposed operation | Request | Success UI effect | Errors to map |
| --- | --- | --- | --- |
| GET /api/events | q, category, city, date, sort, cursor/page | Event cards, empty state, pagination | VALIDATION_ERROR, SERVICE_UNAVAILABLE |
| GET /api/events/:eventId | Path eventId | Published event + ticket types with price/availability snapshot | NOT_FOUND, UNPUBLISHED |
| POST /api/bookings | body: eventId, ticketTypeId, quantity; Idempotency-Key header | Creates PENDING booking with expiresAt, price snapshot | EMAIL_NOT_VERIFIED, SOLD_OUT, SALES_NOT_OPEN, TICKET_LIMIT, IDEMPOTENCY_CONFLICT |
| GET /api/bookings | Authenticated, pagination | Customer booking history | UNAUTHORIZED |
| GET /api/bookings/:bookingId | Authenticated owner | Booking status, accepted payment state, expiresAt, history | FORBIDDEN/NOT_FOUND |
| GET /api/bookings/:bookingId/tickets | Authenticated owner | Issued admission tickets only if CONFIRMED | NOT_CONFIRMED, NOT_FOUND |
| POST /api/bookings/:bookingId/payment-intent | Authenticated owner; reuse stable attempt | Gets Stripe test-mode intent client secret and attempt reference | BOOKING_EXPIRED, PAYMENT_IN_PROGRESS, CONFLICT |
| GET /api/bookings/:bookingId/payment-status | Authenticated owner | Payment verification/recovery UI; never assume success solely from redirect | NOT_FOUND, RETRY_LATER |
| GET /api/organizer/events | Organizer session | Event list | FORBIDDEN |
| POST /api/organizer/events | Draft fields | New DRAFT event | VALIDATION_ERROR, FORBIDDEN |
| PATCH /api/organizer/events/:eventId | Draft fields + expectedVersion | Updated event state | VERSION_CONFLICT, FORBIDDEN |
| POST /api/organizer/events/:eventId/publish | expectedVersion | Published if validated | PUBLICATION_INVALID, VERSION_CONFLICT |
| POST /api/organizer/events/:eventId/ticket-types | Ticket configuration and inventory | Ticket type + inventory | VALIDATION_ERROR, CONFLICT |
| PATCH /api/organizer/ticket-types/:ticketTypeId/inventory | totalQuantity, reason, expectedVersion | Audit-safe inventory update | BELOW_ALLOCATED_MINIMUM, VERSION_CONFLICT |
| GET /api/organizer/bookings | Event scope + pagination | Organizer booking list | FORBIDDEN |
| GET /api/organizer/bookings/:bookingId | Organizer ownership | Booking detail and recovery state | NOT_FOUND, FORBIDDEN |

### Illustrative request and response shapes

~~~json
// POST /api/bookings (proposed)
{
  "eventId": "event-uuid",
  "ticketTypeId": "ticket-type-uuid",
  "quantity": 2
}

// Response (proposed)
{
  "data": {
    "id": "booking-uuid",
    "status": "PENDING",
    "quantity": 2,
    "currency": "USD",
    "unitPriceCents": 4900,
    "totalCents": 9800,
    "expiresAt": "2026-12-24T12:00:00Z"
  }
}

// Error envelope (proposed)
{
  "error": {
    "code": "SOLD_OUT",
    "message": "These tickets are no longer available.",
    "requestId": "req_..."
  }
}
~~~

The booking quantity shown is illustrative **only**. The final allowed range is a release blocker.

Payment initiation must be idempotent, associate the payment intent with the booking, avoid holding PostgreSQL locks during Stripe API calls, and never create a new charge just because the client refreshed. The server verifies webhook signatures and durably processes events; only the accepted confirming payment may issue tickets. A late successful test payment must trigger recovery/refund processing rather than resurrect an expired booking.

Use an explicit error-code union and Zod schema generated from/shared with approved API contracts; messages may be localized independently of server codes. The frontend must not decide business validity by parsing human messages.

## 7. Critical interaction and acceptance matrix

| Case | Expected UX | Backend guarantee |
| --- | --- | --- |
| Sign-in success/failure | Correct session/redirect; field and server errors | Better Auth session actually exists |
| Email not verified | Verify-email CTA, no reserve | Server refuses reservation |
| Sold out / sale future | Explain availability; reserve disabled | Reservation atomically rechecks |
| Quantity/customer cap reached | Inline guard; no submitting invalid amount | Database-enforced agreed limit |
| Reserve succeeds | Render unique booking/price snapshot and live expiresAt | One atomic PENDING hold, idempotency |
| Two buyers race for final stock | One succeeds; other sees SOLD_OUT without phantom booking | No oversell or negative inventory |
| Booking hold expires | Countdown ends and UI refetches EXPIRED; checkout unavailable | Server uses authoritative deadline |
| Payment invalid card | Stripe validation/error; no submission while invalid | No confirmation |
| Payment needs 3DS | Stripe/issuer challenge; hold does not pause | Server reconciles eventual result |
| Payment result unknown | Non-success delayed verification; poll/backoff; do not prompt blind duplicate payment | Single durable payment attempt / recovery |
| Stripe webhook duplicate or out-of-order | Stable status; no duplicate tickets | Idempotent webhook inbox/confirmation |
| Late success after expiry | Expired booking with refund recovery, not confirmed tickets | Durable recovery refund |
| My bookings/detail | Only own bookings | Ownership checks on every read |
| Organizer attempts another organizer's edit | Forbidden UI | AuthZ and ownership enforced |
| Stale event or inventory edit | Explain 409 and offer reload/compare | Compare-and-swap version |
| Inventory lower than sold + reserved | Inline minimum; save disabled | Constraint and transactional guard |
| Publish invalid event or sale window | Validation summary, preserve draft | No partial publication |
| Unavailable API/network | Retry and accessible error; preserve draft data | No false claim of confirmed mutation |

## 8. Accessibility, responsiveness, and test acceptance

Test at minimum Figma's representative desktop **1440 px** and mobile **390 px**, plus a **320 px narrow viewport** and an intermediate tablet width. Light/dark should use semantic theme tokens with contrast checked; the existence of Figma variants is not proof of production accessibility.

- Keyboard: visible focus, no focus traps outside dialogs, tab order, Escape close, disabled controls are truly disabled.
- Forms: programmatic labels, aria-invalid/aria-describedby, error summary, password autocomplete, sufficient touch targets.
- Loading/empty/failed states for search, bookings, inventory, checkout and email verification.
- Countdown: readable announcement without noisy per-second live-region updates; screen reader can hear expiry status.
- Payment: no custom collection/transmission of card or bank credentials. Preserve checkout state across 3DS round trips, browser refresh and callback.
- Privacy: no private caching or leaking admission tickets to nonowners.
- Motion: reduced-motion preference.
- Test with realistic long event titles, currency formatting, timezone boundaries, paging, and poor-network conditions.

**Suggested test gates** (implement in code before marking ready):
1. pnpm --filter @ticketflow/web typecheck
2. pnpm --filter @ticketflow/web lint
3. pnpm --filter @ticketflow/web build
4. Unit tests for currency, timezone, booking state presentation and countdown.
5. Component tests for forms, quantity/guard, 409, empty states.
6. Playwright critical path: register/verify/sign-in → browse → reserve → Stripe test result → confirmed tickets, plus failed payment, expiry, late success and unauthorized access (with deterministic test fixtures).
7. PostgreSQL integration tests for oversell, repeat idempotency keys, duplicate webhooks and expiry/payment races.
8. Screenshot review of the major Figma pages in light/dark, 390/1440, and narrow width.

These commands are a **planned checklist**, not evidence that they passed.

## 9. Implementation order and PR slices

- **Gate 0 — Decisions:** approve ticket quantity + aggregate allocation, Stripe test mode, defer cancellations/admin/check-in, define session origin.
- **Slice 1 — Foundations:** configure light/dark tokens; shadcn primitives; responsive site, customer and organizer shells; Query Provider; error boundary. Preserve existing event-discovery and auth-page work.
- **Slice 2 — Real auth:** Better Auth browser integration, credentials, email verification, reset, protected customer/organizer layouts, cross-origin/session/CSRF tests.
- **Slice 3 — Public discovery:** implement event/list endpoints and UI, server pagination, loaded/empty/error states, event cover and sales guards.
- **Slice 4 — Organizer events:** drafts, publish validation, version conflicts, ticket types and transactional inventory.
- **Slice 5 — Booking:** customer cap and reservation API, idempotency, countdown and pending/expired booking routes, concurrency tests.
- **Slice 6 — Stripe:** Payment Element, 3DS handling, payment status, webhook confirmation and late/duplicate refund recovery. Only now wire true success to issued admission tickets.
- **Slice 7 — Acceptance:** all required Figma flows across device/theme; unit/integration/E2E, accessibility, performance, and production-readiness review.

**Definition of handoff complete:** every P0/P1 design in the approved MVP has an assigned route, React component boundary, agreed API contract/error model, implementation issue, and passing acceptance test. This document is the *starting artifact* for that work, not its completion certificate.
