# TicketFlow v0.1 Frontend UI Roadmap

Implementation target: existing Figma design, with **UI-first development** in `apps/web`. Finish the visible flows with demo content before integrating the Express API. Never simulate successful login/payment or claim live inventory until the backend is connected.

## Milestones

- [x] **1. Foundation and event discovery** — Next.js App Router, TypeScript, Tailwind, shared UI primitive, discovery, filters, event previews. *Needs build and lockfile validation.*
- [x] **2. Authentication UI** — Sign in, register, verification help, input errors, password visibility, public navigation. *UI only; no actual session or email is created.*
- [ ] **3. Customer booking UI** — Event details polish, ticket selection (1–4), availability restrictions, reservation countdown, checkout, simulated-payment states, confirmation.
- [ ] **4. Customer account UI** — My Bookings, booking details, cancellation eligibility and confirmation, expired booking, empty states.
- [ ] **5. Organizer UI** — Dashboard, event list, create/edit, lifecycle confirmation, ticket types, inventory adjustment/conflicts, bookings/cancellation, simple metrics.
- [ ] **6. Admin UI** — Organizer application review, user details, suspend/reactivate, audit log.
- [ ] **7. Shared states and responsiveness** — Loading/empty/error/permission states, mobile/desktop variants, light/dark design tokens, accessibility checks.
- [ ] **8. UI acceptance and handoff** — Run install, typecheck, lint, build, representative UI tests and visual review against Figma.

## Scope boundaries

TicketFlow v0.1 is a modular monolith. No real payment provider, large analytics dashboard, Redis, Kafka or microservices. QR venue check-in is **optional future-scope UI** and should not block the MVP.

## Review discipline

Create a `feat/web-*` branch per milestone and keep PRs small. Do not merge unfinished frontend code without validation. Complete UI behavior with clearly labelled demo data; backend integration is a separate phase.

## Backend integration (after UI acceptance)

- Connect published events and exact inventory from Express and PostgreSQL.
- Integrate Better Auth, email verification and authorization.
- Enforce 10-minute holds, booking limits and idempotent simulated payment.
- Replace demo data, run concurrency tests and deploy the modular monolith.
