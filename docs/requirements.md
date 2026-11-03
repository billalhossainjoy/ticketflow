# TicketFlow — Product Requirements

Document version: 0.1  
Updated: 2026-11-03  
Target release: v0.1.0  
Status: Draft for owner review

## 1. Purpose and authority

TicketFlow helps organizers publish physical events and sell general admission tickets. Customers discover events, reserve tickets, complete simulated payment, and manage bookings.

The main engineering goal is correct booking behavior under concurrent requests, retries, and failures: the system must never oversell inventory or exceed a customer's allocation limit.

This document consolidates the existing project README into reviewable product requirements. It is a target specification, not a claim that features exist. Retained README policies are identified below; newly proposed choices are listed in section 15. Review those choices before implementing affected behavior.

Keep this file at `docs/requirements.md`. Architecture belongs in `docs/architecture.md`; tables and relationships belong in `docs/database/schema.dbml`; consequential implementation decisions belong in `docs/adr/`. GitHub Issues should reference requirement IDs from this document.

If the README conflicts with this draft, resolve the discrepancy explicitly before treating either description as approved. Once reviewed and accepted, this document becomes the product behavior reference.

## 2. Current project baseline

Per the project owner's latest update:

- API setup and project configuration are complete.
- Drizzle setup and the draft Events schema have been removed.
- Product feature implementation is restarting from reviewed requirements.
- No product feature below is marked implemented or verified by this document.

Earlier session evidence showed a working deployment pipeline, public API health endpoint, documentation-only release gating, and a development PostgreSQL connection. These are historical checks, not a fresh verification of the current checkout after removals.

PostgreSQL and Drizzle remain planned implementation choices; installing an ORM is not itself a product requirement. Retain existing configuration that still works rather than rebuilding the technical foundation unnecessarily.

## 3. Users and permissions

| Actor              | Responsibilities                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Visitor            | Browse published events and view public ticket information                               |
| Customer           | Reserve tickets, complete simulated payment, manage own bookings                         |
| Approved organizer | Manage own events, ticket types, inventory, and associated bookings                      |
| Admin              | Review organizer applications, suspend/reactivate users, inspect important audit history |

A registered user starts as a customer. Roles are additive: an approved organizer can also book tickets as a customer. Admin access is explicitly provisioned; public signup must not grant it.

Resource ownership is enforced on the server. Knowing an event or booking identifier does not grant access to private information or mutation operations.

## 4. Release scope

### Included

- Email/password authentication and verified email before booking.
- Organizer application and admin approval.
- Physical concerts, workshops, and conferences.
- Event drafts, publication, unpublication, cancellation, completion, and archiving.
- Multiple general admission ticket types per event.
- Ticket prices, sales windows, inventory, and adjustment history.
- Public search, filters, sorting, pagination, and event details.
- Ten-minute reservations and concurrency-safe allocation.
- Simulated payment attempts and full simulated refunds.
- Customer booking history and organizer booking management.
- Email notifications with tracked delivery and bounded retries.
- Minimal administration, audit history, and operational health checks.

### Excluded

- Assigned seating, virtual events, multi-event shopping carts, and ticket transfers.
- Real payment processing, partial refunds, taxes, discounts, and promotions.
- Waitlists, QR check-in, and resale workflows.
- Complex analytics or image-processing pipelines.
- Microservices, Redis, BullMQ, Kafka, Kubernetes, and Elasticsearch as initial requirements.

Excluded features require a deliberate scope change. Infrastructure should solve demonstrated needs rather than become a release checklist of technologies.

## 5. Authentication and account requirements

### AUTH-001 — Register, sign in, and sign out

- A customer can register with email/password, sign in, and sign out.
- Email uniqueness is enforced consistently.
- Invalid or expired sessions do not authorize protected operations.
- Sign-out invalidates the relevant session according to the authentication design.
- Credentials and session tokens are never returned in public responses or logs.

### AUTH-002 — Email verification

- A registered customer can verify their email through an expiring verification mechanism.
- An unverified customer may browse but cannot create a booking.
- Invalid, expired, and reused verification links are handled safely.
- Verification delivery failures are visible and retryable without exposing tokens.

### AUTH-003 — Organizer approval

- A customer can apply for organizer access.
- Application states are `PENDING`, `APPROVED`, and `REJECTED`.
- An admin can approve or reject a pending application.
- Approval grants organizer capabilities without removing customer capabilities.
- The decision, actor, timestamp, and reason where required are retained.
- Duplicate concurrent reviews cannot produce contradictory final decisions.

### AUTH-004 — Suspension and reactivation

- An admin can suspend or reactivate a user.
- Suspension preserves historical bookings, events, payments, and audit records.
- Protected mutations must check current suspension status, not only a cached role.
- Detailed consequences for existing bookings and public events require the decision in section 15.

## 6. Event management

### EVT-001 — Create and edit a draft

- Only an approved, active organizer can create an event.
- A new event is a draft and is not visible in public browsing.
- Its owner can view and edit it; other organizers cannot.
- Event information includes title, description, primary category, structured venue, start/end instants, event timezone, and optional cover image metadata.
- Venue information includes name, address, city, and country.
- Start/end instants are unambiguous; the event's IANA timezone is retained for display.
- Invalid dates are rejected, including an end time that is not after the start time.
- A stale edit must not silently overwrite a newer edit.

### EVT-002 — Publish an event

Proposed publication validation, pending review:

- Require a nonblank title and description, category, valid physical venue, timezone, and future start time.
- Require at least one active ticket type with positive inventory and a valid sales window.
- The owner can publish; another organizer cannot.
- Failed validation leaves the event unchanged.
- Retrying publication does not create a second event.
- Publication makes the event discoverable; ticket sales still depend on their sales windows.

### EVT-003 — Unpublish, complete, and archive

- Unpublishing removes the event from public discovery and stops new reservations.
- It does not erase bookings or silently cancel paid purchases.
- Completed and cancelled events cannot accept new reservations.
- Events and ticket types with business history are archived rather than hard-deleted.
- Event states retained from the README are `DRAFT`, `PUBLISHED`, `CANCELLED`, and `COMPLETED`; archive metadata is separate.
- Allowed transitions, handling of existing pending bookings, and the completion trigger must be agreed before these operations ship.

### EVT-004 — Cancel an event

- Only an authorized owner can cancel their event through the organizer flow.
- A cancellation reason is required.
- Cancellation stops new reservations and payment confirmation for affected bookings.
- Pending bookings are released; confirmed bookings enter the full-refund workflow.
- Cleanup is durable and retryable, with per-booking progress visible operationally.
- A failure halfway through cleanup must not reopen the event or duplicate refunds.

### EVT-005 — Cover image

- Authorized organizers can associate a cover image with their event.
- Supported formats are JPEG, PNG, and WebP.
- File size limit is proposed as 5 MB.
- Upload authorization is scoped to the requesting organizer and generated object key.
- Arbitrary client-provided storage paths are not trusted.
- Cover-image processing must not block inventory correctness.

## 7. Ticket types and inventory

### TKT-001 — Ticket configuration

- An event may have multiple named ticket types such as Regular and VIP.
- Each has a price, currency, sales start/end, active/archive state, and inventory.
- One event uses one currency; supported currencies and free-ticket handling remain open.
- Money uses integer minor units with the correct currency exponent, never floating-point arithmetic.
- Sales windows must be logically valid; their boundary and event-time rules are proposed in section 15.
- Changes to prices affect future bookings only.
- Ticket types with history cannot be hard-deleted.

### TKT-002 — Inventory guarantees

For every ticket type, at every committed state:

```text
totalQuantity >= 0
reservedQuantity >= 0
soldQuantity >= 0
reservedQuantity + soldQuantity <= totalQuantity
availableQuantity = totalQuantity - reservedQuantity - soldQuantity
```

- Pending reservations consume reserved inventory.
- Confirmation transfers quantity from reserved to sold; it does not consume it twice.
- Expiry or cancellation releases the appropriate quantity exactly once in durable business state.
- Displayed availability is a snapshot. A reservation must revalidate availability atomically.

### TKT-003 — Manual inventory adjustments

- The owner may increase inventory.
- Decreasing inventory cannot make total quantity smaller than reserved plus sold quantity.
- Every adjustment records actor, previous/new total, timestamp, and reason.
- Concurrent adjustments cannot overwrite newer state or violate inventory guarantees.
- The adjustment and its required audit history succeed or fail together.

## 8. Event discovery

### DISC-001 — Public browsing

- Visitors can list and view published, nonarchived events eligible for public display.
- Draft and private organizer data are never exposed through public endpoints.
- Customers can search title/description and filter by category, city, and date.
- Results have deterministic ordering and bounded pagination.
- Default page size is 20; maximum is 100.
- Sort options are explicitly allowed; arbitrary database field names are not accepted.
- Event details show ticket prices, sales windows, and current availability.
- Sold-out and not-yet-on-sale states are distinguishable in the interface.

## 9. Reservations and booking ownership

### BOOK-001 — Create a reservation

- The customer is authenticated, active, and email-verified.
- The event is published and accepting reservations.
- The ticket type belongs to the selected event, is active, and is on sale.
- A booking contains one ticket type and an immutable quantity of 1–4.
- The customer holds at most four active tickets per event across all ticket types and bookings.
- `PENDING` and `CONFIRMED` bookings count toward that limit.
- Sufficient inventory must exist at the moment the reservation commits.
- Successful reservation creates a unique booking ID/code, price snapshot, expiry instant, and status history.
- Pending reservations last ten minutes from creation.
- Allocation, inventory, booking, and required history changes commit atomically.
- Any failure leaves no partially reserved inventory or allocation.

### BOOK-002 — Idempotent creation

- Creation accepts an idempotency key scoped to the customer and operation.
- Repeating the same key and payload returns the original booking result.
- Reusing a key with different input is rejected without another booking.
- Simultaneous retries cannot create duplicate reservations.
- Retention and behavior after key expiry must be defined before release.

### BOOK-003 — View bookings

- A customer can list and inspect only their own bookings.
- Details include event, ticket type, quantity, price snapshot, total, currency, status, expiry where relevant, and booking code.
- Changing a ticket price does not change existing booking totals.
- List results are paginated and do not expose payment credentials or unrelated customer information.

### BOOK-004 — Reservation expiry

- A pending reservation becomes ineligible for confirmation at its expiry instant, even if a worker has not processed it yet.
- Expiry changes it to `EXPIRED`, releases reserved inventory and customer allocation, and appends history atomically.
- Repeated or concurrent expiry processing cannot release quantity twice.
- A failed processing attempt remains recoverable after restart.
- Expiry racing with payment has one durable outcome, preserving inventory and booking consistency.

## 10. Payments, cancellation, and refunds

### PAY-001 — Simulated payment

- Only the booking owner may initiate its customer payment flow.
- Only a valid, unexpired pending booking can be confirmed.
- A booking can have multiple attempts; attempts have explicit pending, succeeded, or failed outcomes.
- A failed attempt does not confirm the booking or extend the original reservation automatically.
- At most one successful attempt is accepted as the confirming payment.
- Repeated success processing cannot increment sold quantity twice.
- Payment confirmation and expiry/cancellation must compete through a shared state-transition rule.
- No real card details are collected; the interface clearly labels the simulation.

### CANCEL-001 — Customer cancellation

- Customers can cancel only their own eligible bookings.
- Confirmed customer cancellation is allowed only strictly before event start minus 24 hours.
- A confirmed cancellation requires the full simulated refund workflow.
- Repeated requests do not duplicate refunds or release inventory twice.
- Early abandonment of pending bookings and precise refund failure semantics remain decisions in section 15.

### CANCEL-002 — Organizer cancellation

- An active organizer can cancel a booking only for an event they own.
- A reason is required and recorded.
- Confirmed bookings require full simulated refunds.
- A payment racing with cancellation cannot leave a confirmed booking whose inventory was released.

### REF-001 — Refund tracking

- Refunds are separate, durable records with explicit state and attempt history.
- Only full refunds are supported in v0.1.
- Failed or interrupted processing can be retried without creating a second financial effect.
- The booking, refund, inventory, and customer allocation must follow one documented lifecycle.
- The precise release point, failed-refund behavior, and states are unresolved; do not implement them by assumption.

### Booking state vocabulary

Retained booking states are `PENDING`, `CONFIRMED`, `CANCELLED`, and `EXPIRED`.

| From      | To        | Trigger                                                        |
| --------- | --------- | -------------------------------------------------------------- |
| PENDING   | CONFIRMED | Accepted successful payment before expiry                      |
| PENDING   | EXPIRED   | Reservation expires                                            |
| PENDING   | CANCELLED | Event/organizer cancellation; customer abandonment if approved |
| CONFIRMED | CANCELLED | Authorized cancellation under the agreed refund lifecycle      |

Terminal bookings cannot be revived through retries. Refund progress must not be inferred solely from booking status.

## 11. Organizer, admin, and notifications

### ORG-001 — Organizer management

- Organizers can inspect bookings only for their own events.
- Management views show only customer information needed to operate the event.
- Simple totals summarize reserved, sold, and available inventory without presenting pending reservations as completed sales.
- Large analytics dashboards are outside scope.

### ADMIN-001 — Minimal administration

- Admins review organizer applications and suspend/reactivate users.
- Important administrative actions record actor, subject, reason, and timestamp.
- Audit records cannot be edited through ordinary application flows.
- Admin privileges do not implicitly create an unrestricted event-editing capability; additional powers require explicit requirements.

### NOTIF-001 — Email delivery

- Verification, booking confirmation, cancellation, and refund outcome notifications are planned triggers.
- Durable delivery state distinguishes pending, sent, retryable failure, and exhausted retries.
- Delivery failures cannot undo a committed booking or inventory transition.
- Retry delays and maximum attempts are configurable and finite.
- Restarting processing must not lose pending notifications.
- Duplicate external delivery remains possible after ambiguous send failures; the design must describe this limitation rather than promise exactly-once email.

## 12. Quality and operational requirements

### QUAL-001 — Correctness and consistency

- Inventory and per-customer limits hold under concurrent requests, process restarts, retries, and transaction failures.
- Database constraints protect essential invariants in addition to application validation.
- Stale event and inventory edits return a conflict rather than silently overwrite changes.
- Booking status history and required audit records are committed with the business transition they describe.

### QUAL-002 — Security and privacy

- Backend validation and authorization are mandatory regardless of frontend controls.
- Sessions use protected cookies and explicit trusted-origin rules.
- Unauthenticated, unauthorized, and suspended requests cannot mutate protected resources.
- Apply bounded input sizes and appropriate authentication/booking abuse protection before public feature release.
- Errors and logs exclude passwords, tokens, cookies, connection strings, and sensitive personal details.
- Production and development credentials are separate; real secrets never enter Git.

### QUAL-003 — API behavior and usability

- Business APIs use a versioned contract; existing health routes remain operational endpoints.
- Validation, authorization, not-found, conflict, and unexpected failures have consistent error responses.
- Unexpected failures do not expose SQL errors or stack traces.
- Public API documentation includes important request/response examples.
- User interfaces expose loading, empty, success, validation, and failure states.
- Core forms support keyboard operation, labeled inputs, and readable error messages.
- Dates display an explicit timezone context; prices show currency.

### QUAL-004 — Operations and recovery

- Liveness checks report process health; readiness checks dependency readiness separately.
- Requests carry correlation IDs; logs record outcome and duration without secrets.
- Shutdown stops new work and closes resources safely within a bounded period.
- Business state and recoverable work survive process/container restart.
- Database changes use versioned migrations, reviewed before deployment.
- PostgreSQL backup and restore procedures are documented and restore-tested before valuable user data is accepted.
- A failed deployment or migration has a documented recovery path; automatic rollback is not assumed.
- Existing home-server, Tailscale, Cloudflare Tunnel, and Infisical decisions are retained as current context; the older README's Railway recommendation is not reinstated here.

### QUAL-005 — Performance evidence

- Queries and public responses are bounded; avoid unnecessary repeated database calls.
- No latency, throughput, uptime, or recovery objective is claimed as already achieved.
- Before load-test acceptance, agree the environment, dataset, request mix, concurrency, and performance targets.
- A proposed correctness demonstration is 1,000 competing attempts for 100 available tickets: committed allocations must never exceed 100. This is a future experiment, not a benchmark result or a full capacity target.

## 13. Verification and definition of done

A requirement is complete when relevant implementation, validation, authorization, migrations, documentation, tests, CI checks, and deployed verification are complete. A schema or passing typecheck alone does not establish feature completion.

Minimum critical scenarios:

| Scenario                                            | Required outcome                                |
| --------------------------------------------------- | ----------------------------------------------- |
| Two customers compete for the last ticket           | At most one acquires it                         |
| One customer books across ticket types concurrently | Active total never exceeds four                 |
| Reservation fails after allocation changes          | All transaction changes roll back               |
| Same idempotency key retried simultaneously         | One booking and one inventory effect            |
| Payment races with expiry                           | One accepted terminal outcome                   |
| Worker processes the same booking again             | No duplicate inventory release                  |
| Event cancellation races with reservation           | No reservation accepted after cancellation wins |
| Old event version submitted                         | Conflict; newer data remains intact             |
| Organizer requests another organizer's bookings     | Access denied without private data exposure     |
| Refund/send processing crashes                      | Durable state supports bounded recovery         |

Test pure rules separately from integration behavior. Database locks, constraints, and transactions require real PostgreSQL tests. Keep deliberately unsafe demonstrations isolated from production paths.

## 14. Delivery slices and traceability

This is a proposed sequence, not a reason to redo completed setup:

1. Review this draft and resolve decisions needed by the next slice.
2. Document module ownership and initial ER diagram.
3. Establish database/migrations and authentication.
4. Add roles, organizer approval, event drafts, ticket types, and publication.
5. Add public discovery and booking ownership.
6. Add concurrency-safe reservations and expiry with real database tests.
7. Add simulated payment and cancellation/refund lifecycle.
8. Finish operational management, notifications, recovery checks, and release evidence.

Each issue should identify requirement IDs, its user-visible result, acceptance criteria, dependencies, and how it will be verified. Keep one small slice in progress. Do not ship an intentionally unsafe booking flow before adding concurrency protections.

## 15. Decisions requiring owner review

The following are deliberately unresolved. Record accepted outcomes here and in any affected architecture decision before implementation.

| ID     | Decision                            | Proposed starting point                                                                                            |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DEC-01 | Supported currencies                | One currency for the first release; choose it explicitly                                                           |
| DEC-02 | Free tickets                        | Decide whether zero-price tickets confirm immediately or remain outside v0.1                                       |
| DEC-03 | Publication validation              | Accept or revise EVT-002; a cover image need not be mandatory                                                      |
| DEC-04 | Sales boundaries                    | Include sales start, exclude sales end; require sales end no later than event start                                |
| DEC-05 | Published event edits               | Define which fields lock after bookings; avoid changing time/venue without a customer policy                       |
| DEC-06 | Unpublication                       | Stop new reservations; explicitly decide whether existing pending bookings can pay                                 |
| DEC-07 | Suspension consequences             | Define treatment of public events, pending reservations, payment, and cancellation access                          |
| DEC-08 | Pending customer cancellation       | Allow immediate abandonment with an atomic release; distinguish it from confirmed cancellation                     |
| DEC-09 | Refund lifecycle                    | Specify states, retries, failure visibility, and when sold inventory/allocation are released                       |
| DEC-10 | Organizer reapplication             | Define rejected reapplication and duplicate-pending rules                                                          |
| DEC-11 | Event completion and archiving      | Define transition trigger, eligibility, and historical public visibility                                           |
| DEC-12 | Idempotency retention               | Choose retention and behavior for in-progress requests and expired keys                                            |
| DEC-13 | Time boundaries                     | Use authoritative server time; accept confirmation only before expiry and customer cancellation only before cutoff |
| DEC-14 | Recovery and performance objectives | Choose measurable targets before claiming operational readiness                                                    |
| DEC-15 | Categories                          | Decide initial seed list and who may maintain it                                                                   |
| DEC-16 | Credential recovery                 | Decide password reset/account recovery scope before opening registration to real users                             |

An open decision blocks only the affected feature, not all project progress. Do not silently turn a proposed choice into an approved rule.

## 16. Review checklist

- [ ] Owner reviewed users, scope, and retained README policies.
- [ ] New proposals accepted, revised, or explicitly deferred.
- [ ] Decisions required for the first implementation slice resolved.
- [ ] Architecture and ER diagram reflect the reviewed behavior.
- [ ] First milestone issues reference requirement IDs and acceptance criteria.
- [ ] Current implementation status tracked separately from this target specification.

Once reviewed, change the document status and record the approval date in Git history. Evolve requirements through focused pull requests as the product becomes clearer.
