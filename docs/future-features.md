# Future Features — RentNest

Organized by category, roughly in order of priority within each section.

---

## In Progress / Already Planned
- **Full tenant application & screening** — SingleKey integration (credit/criminal/eviction), full apply-to-lease flow with background check (see `application-screening-flow.md`)

---

## High Priority (Core Product Gaps)

### Leasing
- **Rent increase notices** — generate state-compliant rent increase notice letters, track delivery
- **Lease templates by state** — pre-built lease templates with required state-specific clauses

### Rent & Payments
- **Auto-generate rent charges** — cron job creates rent charges 7 days before the due date for all active leases, eliminating the need for the landlord to do it manually
- **Partial payments** — allow tenants to pay partial rent and track the balance owed
- **Payment plans** — structured installment plans for overdue tenants (e.g. $200/week until caught up)
- **ACH / bank verification** — verify tenant bank account before first payment (Plaid or Stripe micro-deposit)

---

## Medium Priority (Retention & Stickiness)

### Financial
- **Accounting integrations** — QuickBooks Online and/or Wave export (beyond CSV)
- **Bank reconciliation** — match recorded rent payments against actual bank deposits
- **Tax document helpers** — 1099-NEC generation for contractors, Schedule E pre-fill worksheet

### Tenant Experience
- **SMS / text notifications** — rent reminders and maintenance updates via text, not just email

### Landlord Tools
- **Calendar / scheduling** — maintenance scheduling that syncs to Google Calendar or iCal

---

## Longer Term (Growth & Expansion)

### Platform
- **Mobile app** — native iOS + Android for landlords; the tenant portal is already mobile-friendly via browser
- **Multi-user / team access** — property manager accounts with role-based permissions (e.g. maintenance-only staff)
- **White label** — for property management companies that want to brand the portal as their own
- **API access** — for power users to build their own integrations or pull data into other tools
- **Zapier / Make integration** — connect RentNest to thousands of other tools without code

### Listings & Acquisition
- **External listing syndication** — post from RentNest to Zillow, Apartments.com, Facebook Marketplace (internal marketplace already built)
- **Tenant referral** — existing tenant refers a new applicant, tracked in the system

### Financial Products
- **Income verification via Plaid** — verify applicant income directly from bank data during screening
- **Rent guarantee / insurance** — partner with a provider to offer landlords protection against non-payment
- **Security deposit alternatives** — offer tenants a deposit waiver/insurance product instead of cash deposit

---

## Quality of Life / Polish
- **Bulk import** — CSV import for landlords migrating from Cozy, TurboTenant, or spreadsheets
- **Landlord mobile-optimized views** — current dashboard works on mobile but could be optimized further
