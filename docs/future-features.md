# Future Features — RentNest

Organized by category, roughly in order of priority within each section.

---

## Completed
- **Automatic late fee application** — cron job applies fees daily when rent exceeds lease grace period
- **Digital lease signing** — token-based e-signature flow; landlord requests, tenant signs at `/sign/[token]`
- **Occupancy dashboard** — occupancy rate + per-property breakdown on the main dashboard overview
- **Bulk messaging** — "Message Tenants" on tenants page sends email to all active tenants with email on file
- **Maintenance cost reporting** — "Maintenance Costs" tab on reports page; totals by property and category
- **Tenant contact info** — landlord controls whether email/phone is visible in tenant portal (settings toggle)
- **Renters insurance tracking** — per-tenant provider, policy number, expiry; badge for expired/expiring; cron email when within 30 days
- **In-app onboarding checklist** — dashboard checklist guides new landlords through first property → unit → tenant → lease → rent setup; disappears when all steps complete
- **Utility tracking** — per-unit list of landlord-included utilities + optional note; shown in unit detail and tenant portal
- **Security deposit tracking** — mark deposit received, add itemized deductions, record return amount and date; shown on lease detail
- **Notification preferences** — granular per-event email toggles: payment, maintenance, overdue, lease expiring, insurance expiring, signature
- **Vendor management** — contractor address book with trade/phone/email; assign vendors to maintenance requests from request detail page
- **Lease renewal workflow** — "Renew Lease" button on lease detail pre-fills new lease from old terms; optional rent increase % field
- **Eviction tracking** — per-lease event log (notice, filing, hearing, judgment, writ, lockout) with dates and notes
- **Owner statements** — per-property monthly income/expense/net summary on reports page with month selector

## In Progress / Already Planned
- **Tenant application & screening** — SingleKey integration, full apply-to-lease flow

---

## High Priority (Core Product Gaps)

### Leasing
- **Lease renewal workflow** — ~~completed, see above~~
- **Rent increase notices** — generate state-compliant rent increase notice letters, track delivery
- **Lease templates by state** — pre-built lease templates with required state-specific clauses
- **Digital addendums** — pet addendum, parking addendum, etc. with e-sign

### Rent & Payments
- **Partial payments** — allow tenants to pay partial rent and track the balance owed
- **Payment plans** — structured installment plans for overdue tenants (e.g. $200/week until caught up)
- **ACH / bank verification** — verify tenant bank account before first payment (Plaid or Stripe micro-deposit)

### Maintenance
- **Move-in / move-out inspection** — checklist with photo documentation per room; ties to security deposit decisions
- **Vendor / contractor management** — ~~completed, see above~~

---

## Medium Priority (Retention & Stickiness)

### Financial
- **Owner statements** — ~~completed, see above~~
- **Security deposit tracking** — ~~completed, see above~~
- **Accounting integrations** — QuickBooks Online and/or Wave export (beyond CSV)
- **Bank reconciliation** — match recorded rent payments against actual bank deposits
- **Tax document helpers** — 1099-NEC generation for contractors, Schedule E pre-fill worksheet

### Tenant Experience
- **SMS / text notifications** — rent reminders and maintenance updates via text, not just email
- **Renters insurance tracking** — ~~completed, see above~~
- **Maintenance request photos from portal** — tenants can attach photos when submitting (not just landlord-side)
- **Tenant messaging** — in-app message thread between landlord and tenant, logged and searchable

### Landlord Tools
- **Calendar / scheduling** — maintenance scheduling that syncs to Google Calendar or iCal
- **Eviction tracking** — ~~completed, see above~~

---

## Longer Term (Growth & Expansion)

### Platform
- **Mobile app** — native iOS + Android for landlords; the tenant portal is already mobile-friendly via browser
- **Multi-user / team access** — property manager accounts with role-based permissions (e.g. maintenance-only staff)
- **White label** — for property management companies that want to brand the portal as their own
- **API access** — for power users to build their own integrations or pull data into other tools
- **Zapier / Make integration** — connect RentNest to thousands of other tools without code

### AI Features
- **AI maintenance triage** — categorize and prioritize incoming maintenance requests automatically
- **AI lease review** — flag unusual or missing clauses in uploaded leases
- **AI-drafted responses** — suggest replies to tenant messages or maintenance updates
- **Rent pricing suggestions** — based on unit details and market data, suggest competitive rent pricing

### Listings & Acquisition
- **Vacancy listings** — post vacant units to Zillow, Apartments.com, Facebook Marketplace from within RentNest
- **Applicant pre-screening quiz** — quick income/pets/move-in date filter before full application
- **Tenant referral** — existing tenant refers a new applicant, tracked in the system

### Financial Products
- **Income verification via Plaid** — verify applicant income directly from bank data during screening
- **Rent guarantee / insurance** — partner with a provider to offer landlords protection against non-payment
- **Security deposit alternatives** — offer tenants a deposit waiver/insurance product instead of cash deposit

---

## Quality of Life / Polish
- **Notification preferences** — ~~completed, see above~~
- **Dark mode**
- **Bulk import** — CSV import for landlords migrating from Cozy, TurboTenant, or spreadsheets
- **Landlord mobile-optimized views** — current dashboard works on mobile but could be optimized further
- **Property photo management** — unit photos stored and displayed in the dashboard
