# CLAUDE CODE PROMPT — Build "RentNest" Small Landlord Property Management SaaS

## THE BUSINESS

**RentNest** is a multi-tenant SaaS for small independent landlords — people who own between 1 and 20 rental units and manage them themselves. It handles tenant management, online rent collection, maintenance requests, lease storage, expense tracking, and a tenant-facing portal. The goal is dead simple: replace the spreadsheet, the email thread, and the Venmo request with one clean tool that costs less than a tank of gas per month.

**The backstory that matters**: Cozy was the beloved free landlord tool used by millions. Apartments.com acquired it and killed it, replacing it with an inferior product. That created a massive displaced user base actively looking for an alternative. The opening is real and documented.

**Target market**: ~14 million small landlords in the US with fewer than 10 units. The vast majority self-manage. They are not tech-savvy and do not want enterprise software. They want something that works.

**Pricing**:
- **Starter** — $19/month: up to 5 units
- **Grow** — $49/month: up to 20 units
- **Portfolio** — $99/month: unlimited units

**To hit $100k ARR**: ~175 Starter customers, or a realistic mix across tiers. At $19/month, even the lowest tier is a strong value — comparable plans elsewhere charge $55+ (Buildium) or add per-lease fees on top of a free base (TurboTenant).

**Why this wins**:
- Price undercuts every serious paid competitor
- Simpler than everything in the market
- Tenant portal is included at every tier (competitors charge extra or restrict it)
- No per-lease fees, no transaction fees beyond Stripe's standard rate
- Communities to market into are massive: BiggerPockets (2M+ members), r/Landlord (700k+ members), r/realestateinvesting. A single honest post titled "I built the simple landlord tool Cozy used to be" would drive significant early traffic.

---

## TECH STACK

- **Framework**: Next.js 14 (App Router, server actions)
- **Database**: AWS RDS PostgreSQL via Prisma ORM
- **Auth**: Firebase Authentication — email/password for landlords; magic-link JWT cookie for tenants accessing the portal
- **File Storage**: Firebase Storage — lease PDFs, inspection photos, maintenance photos, expense receipts
- **Payments**: Stripe — SaaS subscriptions (landlord pays RentNest) + Stripe Connect or Payment Links for rent collection (tenant pays landlord)
- **Email**: Resend — rent reminders, maintenance updates, lease uploads, portal invites
- **PDF**: `@react-pdf/renderer` — rent receipts, expense reports
- **Charts**: Recharts — income/expense dashboards
- **Styling**: Tailwind CSS
- **Hosting**: Railway

**Auth pattern**: identical to StableIQ/PrintDesk/Sparkly — Firebase client SDK → ID token → `/api/session` → httpOnly cookie → `getServerUser()` helper in server actions. `FIREBASE_ADMIN_PRIVATE_KEY` replace `\n` with actual newlines in admin init.

---

## DATABASE SCHEMA

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// The landlord's account
model Landlord {
  id            String   @id @default(cuid())
  firebaseUid   String   @unique
  name          String
  email         String   @unique
  phone         String?
  stripeId      String?
  plan          String   @default("trial")  // trial | starter | grow | portfolio | cancelled
  trialEndsAt   DateTime?
  timezone      String   @default("America/Chicago")
  // Rent collection settings
  stripeConnectId     String?  // for Stripe Connect (landlord's connected account)
  stripeConnectReady  Boolean  @default(false)
  createdAt     DateTime @default(now())

  properties    Property[]
  expenses      Expense[]
  documents     Document[]
}

// A property is a physical address
model Property {
  id            String   @id @default(cuid())
  landlordId    String
  nickname      String   // e.g. "Oak Street Duplex", "Main St House"
  address       String
  city          String
  state         String
  zip           String
  propertyType  String   @default("single_family") // single_family | duplex | apartment | condo | townhouse | commercial
  yearBuilt     Int?
  squareFeet    Int?
  photoUrl      String?  // Firebase Storage
  notes         String?
  isActive      Boolean  @default(true)
  landlord      Landlord @relation(fields: [landlordId], references: [id])
  units         Unit[]
  expenses      Expense[]
  documents     Document[]
}

// A unit is a rentable space within a property
// For single-family homes, there's one unit = the whole house
model Unit {
  id            String   @id @default(cuid())
  propertyId    String
  unitNumber    String   @default("1")  // e.g. "1", "2", "A", "Upper", "Basement"
  bedrooms      Int      @default(1)
  bathrooms     Float    @default(1)
  squareFeet    Int?
  notes         String?
  isActive      Boolean  @default(true)
  property      Property @relation(fields: [propertyId], references: [id])
  leases        Lease[]
  maintenanceRequests MaintenanceRequest[]
}

// A tenant (person renting)
model Tenant {
  id            String   @id @default(cuid())
  landlordId    String
  name          String
  email         String?
  phone         String?
  emergencyContactName  String?
  emergencyContactPhone String?
  notes         String?
  portalToken   String?  // JWT for magic-link portal access
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  // Tenant is scoped to a landlord (not global)
  leases        Lease[]
  maintenanceRequests MaintenanceRequest[]
  rentPayments  RentPayment[]
}

// A lease agreement between tenant(s) and landlord for a unit
model Lease {
  id              String   @id @default(cuid())
  unitId          String
  landlordId      String

  // Lease terms
  startDate       DateTime
  endDate         DateTime?   // null = month-to-month
  leaseType       String   @default("fixed") // fixed | month_to_month
  monthlyRent     Float
  securityDeposit Float    @default(0)
  securityDepositPaid Boolean @default(false)
  securityDepositHeld Float @default(0)  // amount currently held

  // Late fee settings
  lateFeeEnabled  Boolean  @default(false)
  lateFeeType     String   @default("flat") // flat | percent
  lateFeeAmount   Float    @default(0)
  lateFeeGracePeriodDays Int @default(5)

  // Rent due settings
  rentDueDay      Int      @default(1)  // day of month rent is due (1-28)

  // Pet policy
  petsAllowed     Boolean  @default(false)
  petDeposit      Float    @default(0)
  petRent         Float    @default(0)

  status          String   @default("active") // active | expired | terminated | future
  terminatedAt    DateTime?
  terminationReason String?
  notes           String?

  unit            Unit     @relation(fields: [unitId], references: [id])
  tenants         LeaseTenant[]  // support co-tenants
  rentPayments    RentPayment[]
  documents       Document[]
  maintenanceRequests MaintenanceRequest[]
}

// Join table: a lease can have multiple tenants (roommates, couples)
model LeaseTenant {
  id        String @id @default(cuid())
  leaseId   String
  tenantId  String
  isPrimary Boolean @default(false) // primary tenant is main point of contact
  lease     Lease  @relation(fields: [leaseId], references: [id])
  tenant    Tenant @relation(fields: [tenantId], references: [id])
  @@unique([leaseId, tenantId])
}

// Individual rent payment record
model RentPayment {
  id              String   @id @default(cuid())
  leaseId         String
  tenantId        String?  // which tenant made the payment (if multiple)
  landlordId      String

  amount          Float
  lateFee         Float    @default(0)
  totalAmount     Float    // amount + lateFee

  paymentMethod   String   @default("online") // online | cash | check | money_order | zelle | venmo | other
  status          String   @default("pending") // pending | paid | failed | refunded

  // Period this payment covers
  periodMonth     Int      // 1-12
  periodYear      Int

  paidAt          DateTime?
  dueDate         DateTime

  // Stripe payment tracking
  stripePaymentId String?
  stripePaymentUrl String?

  notes           String?
  receiptSent     Boolean  @default(false)

  lease           Lease    @relation(fields: [leaseId], references: [id])
  tenant          Tenant?  @relation(fields: [tenantId], references: [id])
}

// Maintenance requests submitted by tenants or created by landlords
model MaintenanceRequest {
  id              String   @id @default(cuid())
  unitId          String
  leaseId         String?
  tenantId        String?  // null if landlord created it
  landlordId      String

  title           String
  description     String
  category        String   @default("other") // plumbing | electrical | hvac | appliance | structural | pest | cleaning | other
  priority        String   @default("normal") // low | normal | high | emergency
  status          String   @default("open")   // open | in_progress | scheduled | resolved | closed

  // Scheduling
  scheduledFor    DateTime?
  vendorName      String?
  vendorPhone     String?
  estimatedCost   Float?
  actualCost      Float?

  // Tracking
  submittedAt     DateTime @default(now())
  acknowledgedAt  DateTime?
  resolvedAt      DateTime?
  resolutionNotes String?

  photoUrls       String[] // Firebase Storage URLs (tenant uploads on submission)
  resolvedPhotoUrls String[] // Firebase Storage URLs (completion photos)

  // Tenant notifications
  lastUpdateSentAt DateTime?

  unit            Unit     @relation(fields: [unitId], references: [id])
  lease           Lease?   @relation(fields: [leaseId], references: [id])
  tenant          Tenant?  @relation(fields: [tenantId], references: [id])
}

// Property expenses for tax/income tracking
model Expense {
  id            String   @id @default(cuid())
  landlordId    String
  propertyId    String?  // null = not property-specific (e.g. general LLC expense)
  category      String   // mortgage | taxes | insurance | repairs | maintenance | utilities | management | advertising | legal | supplies | other
  description   String
  amount        Float
  date          DateTime
  vendor        String?
  receiptUrl    String?  // Firebase Storage
  notes         String?
  landlord      Landlord @relation(fields: [landlordId], references: [id])
  property      Property? @relation(fields: [propertyId], references: [id])
}

// Document storage (leases, inspection reports, notices, etc.)
model Document {
  id            String   @id @default(cuid())
  landlordId    String
  propertyId    String?
  leaseId       String?
  name          String
  docType       String   @default("other") // lease | addendum | inspection | notice | insurance | permit | other
  fileUrl       String   // Firebase Storage URL
  fileType      String?  // pdf | jpg | png | docx
  notes         String?
  uploadedAt    DateTime @default(now())
  landlord      Landlord @relation(fields: [landlordId], references: [id])
  property      Property? @relation(fields: [propertyId], references: [id])
  lease         Lease?   @relation(fields: [leaseId], references: [id])
}
```

---

## APPLICATION STRUCTURE

```
app/
├── (marketing)/
│   └── page.tsx                    # Landing page
│
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── tenant-portal/                  # Magic-link tenant portal (no landlord auth)
│   ├── page.tsx                    # Dashboard: rent, maintenance, documents
│   ├── pay/page.tsx                # Pay rent
│   └── maintenance/
│       ├── page.tsx                # View all requests
│       └── new/page.tsx            # Submit new request
│
├── api/
│   ├── session/route.ts
│   ├── webhooks/stripe/route.ts
│   └── cron/reminders/route.ts
│
└── (app)/                          # Protected landlord area
    └── dashboard/
        ├── page.tsx                # Overview
        ├── properties/
        │   ├── page.tsx
        │   ├── new/page.tsx
        │   └── [id]/
        │       ├── page.tsx        # Property detail + units
        │       └── units/[unitId]/page.tsx
        ├── tenants/
        │   ├── page.tsx
        │   └── [id]/page.tsx
        ├── leases/
        │   ├── page.tsx
        │   └── [id]/page.tsx
        ├── rent/
        │   ├── page.tsx            # Rent collection dashboard
        │   └── record/page.tsx     # Record manual payment
        ├── maintenance/
        │   ├── page.tsx
        │   └── [id]/page.tsx
        ├── expenses/page.tsx
        ├── documents/page.tsx
        ├── reports/page.tsx
        └── settings/page.tsx
```

---

## PAGES & FEATURES — DETAILED

### Dashboard (`/dashboard`)

The landlord's morning view. Immediate answers to: who owes rent, what needs attention, what's coming up.

- **Rent status this month**: Large summary cards — Paid (green), Outstanding (yellow), Overdue (red). Each card shows the dollar amount and unit count. Clicking drills into the rent page filtered by that status.
- **Overdue rent list**: Any leases where rent is past due date + grace period. Shows tenant name, unit, amount owed, days overdue. "Send Reminder" button per row → sends email to tenant via Resend.
- **Open maintenance requests**: Count by priority. Emergency requests shown as a banner at the top of the page with red background. Link to maintenance page.
- **Upcoming lease expirations**: Leases expiring in the next 60 days. Shows unit, tenant, end date, days remaining.
- **Upcoming rent due**: Leases where rent is due in the next 7 days and payment hasn't been recorded.
- **Recent activity feed**: Last 10 events — payment received, maintenance submitted, document uploaded, etc.

### Properties (`/dashboard/properties`)

List of all properties with a count of units, current occupancy rate, and monthly rent total.

**New property form**: nickname, address, property type, optional photo upload.

**Property detail page**:
- Property info header with photo, address, type
- **Units tab**: Grid of units. Each unit card: unit number, bed/bath, current tenant name (or "Vacant" badge), monthly rent, lease end date. "Add Unit" button. Click unit → unit detail page.
- **Documents tab**: All documents associated with this property. Upload button. File grid with name, type, date.
- **Expenses tab**: All expenses for this property. Monthly total. Category breakdown bar chart (Recharts).
- **Maintenance tab**: All maintenance requests across units in this property.

**Unit detail page**:
- Current lease summary (if active): tenant names, rent amount, dates, status
- Rent payment history for current lease
- Maintenance request history for this unit
- "Add Lease" button if vacant, "View Lease" if occupied

### Leases (`/dashboard/leases`)

List of all leases with status filter (active, expiring soon, expired, future).

**New lease flow** (multi-step):
1. Select unit (shows vacant units only)
2. Add tenant(s) — search existing tenants or create new inline. Support adding multiple tenants (roommates).
3. Lease terms: start date, end date (or month-to-month toggle), monthly rent, security deposit, rent due day, late fee settings, pet policy
4. Optional: upload signed lease document
5. Review and create
6. After creation: "Send Tenant Portal Invite" button — generates magic link JWT, emails to all tenants on the lease

**Lease detail page**:
- Lease terms summary (all fields, editable inline)
- Tenants listed with contact info and "Send Portal Link" button per tenant
- **Rent Ledger tab**: Chronological table of all rent periods: period (e.g. "May 2025"), due date, amount due, amount paid, date paid, method, status. Color-coded rows (paid=green, overdue=red, upcoming=grey).
- **Documents tab**: Lease document upload + any addendums
- "Terminate Lease" action: sets end date, records reason, marks status terminated

### Rent Collection (`/dashboard/rent`)

The most-used page after the dashboard.

**Rent dashboard**: Current month's rent status for every active lease. Table columns: property, unit, tenant, rent due, status (Paid/Outstanding/Overdue/Late Fee Applied), date paid, payment method.

**Generate rent charges**: On the 1st of each month (or manually triggered), a server action creates `RentPayment` records with status `pending` for every active lease, based on that lease's `monthlyRent` and `rentDueDay`. If it's past the grace period, automatically add the late fee. This can also be triggered manually from the UI.

**Record manual payment**: Simple form to mark a payment as received via cash, check, Zelle, etc. Select lease → enter amount → select period → enter date → select method → save. Creates `RentPayment` with status `paid`. Optionally send receipt to tenant via Resend.

**Online rent collection via Stripe**:
This is the most important feature. Tenants pay online through the tenant portal. When a landlord sets up Stripe Connect (a one-time process connecting their bank account), tenants can pay rent by ACH bank transfer or credit card directly to the landlord. Stripe's standard processing fees apply (landlord can choose to pass fees to tenant or absorb them — configurable in settings).

Flow:
1. Landlord completes Stripe Connect onboarding (link to Stripe's hosted onboarding from settings page)
2. Once connected, each pending `RentPayment` gets a Stripe Payment Intent created for the amount
3. Tenant portal shows a "Pay Now" button that opens Stripe's payment sheet
4. On payment success, Stripe webhook marks the `RentPayment` as paid, sets `paidAt`, sends receipt email to tenant via Resend, sends notification to landlord

**Send rent reminders**: Button that bulk-sends reminder emails to all tenants with outstanding or upcoming rent. Template: "Hi [Tenant Name], your rent of $[Amount] for [Unit] is due on [Date]. Pay online: [portal link] or contact [Landlord Name] for other arrangements."

### Tenants (`/dashboard/tenants`)

Searchable list of all tenants (current and past).

**Tenant detail page**:
- Contact info + edit
- Current unit and lease summary
- Lease history
- Payment history (all RentPayments across all leases)
- Maintenance requests submitted
- "Send Portal Link" button → generates fresh JWT, emails to tenant
- Notes field

### Maintenance (`/dashboard/maintenance`)

All maintenance requests across all properties. Filter by status, priority, property, category.

**Emergency requests get a red banner at the top** with a count. These should be impossible to miss.

**Request detail page**:
- Title, description, category, priority, status badge
- Property and unit
- Tenant who submitted (if applicable)
- Photos uploaded by tenant
- **Status workflow**: Open → In Progress → Scheduled → Resolved. Click to change status. Each status change prompts for optional notes.
- **Scheduling**: Set scheduled date, vendor name, vendor phone
- **Cost tracking**: Estimated cost → actual cost after resolution. Actual cost can optionally create an Expense record automatically ("Add to expenses" checkbox).
- **Tenant updates**: "Notify Tenant" button → sends status update email to tenant via Resend: "Your maintenance request '[Title]' has been updated: [Status]. [Notes]."
- Resolution photos upload
- Resolve button → sets status resolved, records resolution notes, sends resolution email to tenant

### Expenses (`/dashboard/expenses`)

Log and track all property-related expenses for tax time.

Add expense: category (dropdown with IRS Schedule E categories), description, amount, date, vendor, optional receipt upload (Firebase Storage), property assignment.

**Expense list**: Filter by property, category, date range. Running total.

**Year-end summary**: For a selected year, shows total income (sum of paid rent payments) vs total expenses by category. This is the data landlords need for Schedule E tax filing. Download as CSV. Simple bar chart (Recharts) showing income vs expense by month.

### Documents (`/dashboard/documents`)

Central document storage. All files across all properties and leases in one searchable view.

Upload document: name, type, assign to property and/or lease, upload file.

Files stored in Firebase Storage at `landlords/{landlordId}/documents/{filename}`.

Show file type icon based on extension. Preview PDFs inline. Download button.

### Reports (`/dashboard/reports`)

- **Rent roll**: Current snapshot of all units, tenants, monthly rent, lease end dates. Exportable as CSV/PDF. Classic landlord report.
- **Income & Expense report**: By property, by year. Totals per category.
- **Vacancy report**: Units that are currently vacant or upcoming vacancies (leases expiring in 60 days with no future lease).
- **Late payment history**: Which tenants have a history of late payments.

All reports exportable as CSV. Key ones also generate a PDF via `@react-pdf/renderer`.

### Settings (`/dashboard/settings`)

- **Account**: Name, email, phone, timezone
- **Billing**: Current plan, trial countdown, Stripe Customer Portal link
- **Rent Collection**: Stripe Connect setup/status. "Connect Bank Account" → opens Stripe hosted onboarding. Once connected shows connected bank name, status. Fee passing preference (landlord absorbs vs tenant pays processing fee).
- **Email notifications**: Toggle: receive email when tenant pays rent, when maintenance is submitted, when rent is 3 days overdue
- **Late fee defaults**: Default late fee settings applied to new leases (can override per lease)

---

## TENANT PORTAL (`/tenant-portal`)

Accessed via magic-link JWT emailed to tenant. Landlord sends the invite from the lease detail page or tenant detail page. JWT contains `{ tenantId, leaseId, landlordId, exp }`. Sets httpOnly cookie valid 30 days.

**Portal home**: Clean, simple, mobile-first. Shows:
- Greeting: "Hi [Tenant Name] — [Property Address], Unit [X]"
- **Current rent status**: Big card showing amount due, due date, and status. If outstanding: "Pay Now" button (Stripe). If paid: green "Paid ✓" with date paid.
- **Recent payment history**: Last 6 months of payments with status.
- **Open maintenance requests**: List of their open requests with status and last update.
- Quick links: Submit Maintenance Request, View Documents

**Pay Rent** (`/tenant-portal/pay`):
- Shows the current unpaid rent period with amount (including any late fee if applicable)
- "Pay with bank transfer (ACH)" — lowest cost, recommended
- "Pay with card" — faster, higher fee (shown to tenant if landlord passes fees)
- Stripe Elements embedded payment form (or redirect to Stripe Payment Link)
- On success: confirmation screen, receipt emailed automatically

**Maintenance** (`/tenant-portal/maintenance`):
- List of all their submitted requests with status timeline per request
- "Submit New Request" form: title, description, category, priority, photo upload (camera or library)
- On submit: creates `MaintenanceRequest`, sends email to landlord via Resend

**Documents** (`/tenant-portal/documents`):
- All documents associated with their lease (lease PDF, addendums, notices)
- Download button per document. No upload capability — read only.

---

## AUTOMATED REMINDERS

Cron at `/api/cron/reminders`, called daily:

1. **Rent due reminders**: 3 days before rent due date, email tenant: "Your rent of $[Amount] is due in 3 days." Include portal payment link.
2. **Rent overdue**: 1 day after grace period expires with no payment recorded. Email tenant with late fee notice if applicable. Email landlord with list of overdue accounts.
3. **Lease expiration**: 60 days and 30 days before lease end, email landlord: "[Tenant] at [Unit] lease expires in [X] days."
4. **Maintenance acknowledgment**: If a maintenance request has been open for 24 hours with no landlord acknowledgment, email landlord: "You have an unacknowledged maintenance request from [Tenant]."

---

## STRIPE INTEGRATION

### SaaS billing (landlord pays RentNest)
- Three Price IDs: Starter ($19/mo), Grow ($49/mo), Portfolio ($99/mo)
- 14-day free trial, no card required
- Trial expiry emails at day 11 and 14
- Webhook at `/api/webhooks/stripe` (separate from Connect webhooks):
  - `customer.subscription.updated` → sync plan
  - `customer.subscription.deleted` → set plan cancelled

### Rent collection (tenant pays landlord via Stripe Connect)
- Landlord onboards via Stripe Connect (Express account — simplest for marketplace-style payments)
- When a payment is created for a lease, create a `PaymentIntent` on the landlord's connected account
- Tenant pays through the portal
- Stripe routes funds to landlord's connected bank account (typically 2 business days)
- RentNest takes no cut of the rent — this is a key differentiator to advertise. "We don't take a percentage of your rent. Ever."
- Webhook events for Connect payments handled via `Stripe-Account` header in the webhook handler

**Alternative approach if Stripe Connect is too complex for v1**: Use Stripe Payment Links. When rent is generated, create a Payment Link for that amount. Store the URL in `RentPayment.stripePaymentUrl`. Tenant clicks the link, pays via Stripe's hosted page. Funds go to landlord's Stripe account. Less seamless but much simpler to implement. Mark this approach in code with a TODO to migrate to Connect.

**Plan gating**: Check unit count on property/unit creation. Starter max 5 units, Grow max 20, Portfolio unlimited.

---

## LANDING PAGE (`/`)

**Design direction**: Warm, residential, trustworthy. This is software for real people who own real homes — not a fintech startup aesthetic. Primary: warm cream (#FDFAF5). Dark text: deep slate (#1A2332). Accent: terracotta (#C4622D). Secondary accent: sage green (#5B7B5E). Typography: `Lora` for headlines (approachable serif), `DM Sans` for body. The feeling should be like a well-designed home — welcoming, organized, calm. No blue gradients, no tech-bro aesthetics, no stock photos of skyscrapers.

**Hero**: Headline: *"The simple landlord software Cozy used to be."* Subheadline: *"Collect rent online, track maintenance, store leases, and give your tenants a portal — for $19 a month. No per-lease fees. No percentage of rent. Ever."* Two CTAs: "Start Free 14-Day Trial" (primary, terracotta) and "See how it works →" (text link).

*The Cozy reference in the headline is intentional and strategic. It will resonate immediately with millions of displaced Cozy users. This is the hook.*

**Trust bar**: "No per-lease fees · No percentage of rent · Cancel anytime · Free 14-day trial"

**Problem section** (3 columns):
1. 📊 "Spreadsheets aren't built for this" — Tracking rent payments, security deposits, and expenses across multiple units in Excel means something always falls through the cracks.
2. 📧 "Payment requests are embarrassing" — Texting your tenant a Venmo link every month is fine when you have one unit. At three, it's chaos.
3. 🔧 "Maintenance requests disappear" — A tenant texts you about a leak, you forget to follow up, and three weeks later you have a water damage claim.

**Features section** (alternating layout, warm photography-style mockup screenshots):

1. **Online rent collection that's actually simple** — Tenants pay by bank transfer or card through their portal. Money goes straight to your account. You get notified. That's it. No percentage taken, no per-transaction platform fees beyond standard card processing.
2. **A real portal for your tenants** — Every tenant gets a link to their portal: pay rent, submit maintenance requests, view their lease. Fewer texts to you. Happier tenants.
3. **Maintenance, tracked from report to resolution** — Tenants submit with photos. You get notified. Schedule a vendor, track the cost, close it out. Every unit's history is right there when you need it.
4. **Lease storage and document management** — Upload your leases, addendums, and inspection reports. Tenants can view their documents from the portal. Never email a PDF again.
5. **Expense tracking for tax time** — Log every repair, mortgage payment, insurance bill, and supply purchase. At year end, export your Schedule E report. Your accountant will thank you.

**Pricing section**: Three clean cards.

| Starter | Grow | Portfolio |
|---------|------|-----------|
| $19/mo  | $49/mo | $99/mo |
| Up to 5 units | Up to 20 units | Unlimited units |
| All features included | Everything in Starter | Everything in Grow |
| Tenant portal | Tenant portal | Priority support |
| Rent collection | Rent collection | |

"All plans include a 14-day free trial. No credit card required. No per-lease fees. No percentage of your rent. Cancel any time."

**The Cozy migration callout box**: A warm-toned card that says: *"Used Cozy before Apartments.com changed it? You'll feel right at home. RentNest does what Cozy did — simple rent collection, tenant communication, and document storage — with no ads, no upsells, and no one trying to list your properties on their site."*

**Testimonials**:
- *"I was still using a Google Sheet and Venmo. Setting up RentNest took 20 minutes. My tenants actually prefer paying online."* — David K., 3-unit landlord, Austin TX
- *"The maintenance tracking is worth it alone. I used to miss things. Now every request has a paper trail."* — Michelle T., 7-unit landlord, Columbus OH
- *"I switched from Cozy when Apartments.com made it basically unusable. This is exactly what I needed."* — Ray S., 4-unit landlord, Denver CO

**FAQ** (accordion):
- Does RentNest take a percentage of my rent? No, never. You pay a flat monthly subscription. That's it.
- What does my tenant need to use the portal? Just an email address. They get a link and can access it without creating an account.
- How does online rent collection work? We use Stripe to process payments. Tenants pay by bank transfer (ACH) or card. Funds go to your connected bank account within 2 business days. Standard Stripe processing fees apply.
- Can I use RentNest if I only have one unit? Yes. The Starter plan at $19/month covers up to 5 units.
- Is my data secure? Yes. Data is encrypted at rest and in transit. We use Firebase for authentication and AWS for database hosting.
- Can I import my data from Cozy or TurboTenant? We support CSV import for tenant and payment history.

**Final CTA**: "Ready to run a cleaner rental business?" + "Start Free Trial — No Credit Card Required"

---

## ENVIRONMENT VARIABLES

```bash
DATABASE_URL="postgresql://user:pass@your-rds.rds.amazonaws.com:5432/rentnest?sslmode=require"
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STARTER=
STRIPE_PRICE_ID_GROW=
STRIPE_PRICE_ID_PORTFOLIO=
RESEND_API_KEY=
FROM_EMAIL=noreply@rentnest.app
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
TENANT_JWT_SECRET=        # separate secret for signing tenant portal tokens
```

---

## BUILD ORDER

1. **Firebase + RDS setup** — same auth session pattern as other projects. Prisma schema, first migration.
2. **Landlord account setup** — signup, login, account settings page.
3. **Properties + Units** — CRUD, property detail page, unit detail page.
4. **Tenants** — CRUD, tenant detail page.
5. **Leases** — multi-step new lease form, lease detail page, lease termination.
6. **Rent generation + manual payment recording** — generate monthly charges, record cash/check payments, rent ledger per lease.
7. **Tenant portal** — magic link JWT, portal home, rent status display, maintenance submission.
8. **Stripe Connect setup** — landlord onboarding flow, payment intent creation per rent charge, webhook handling, tenant pays via portal.
9. **Maintenance requests** — submit (tenant + landlord), status workflow, notifications, cost tracking.
10. **Expense tracking** — log expenses, property assignment, CSV export.
11. **Documents** — upload for landlord, view for tenant in portal.
12. **Automated reminders cron** — rent due alerts, overdue alerts, lease expiration alerts.
13. **Reports** — rent roll, income/expense, vacancy, export to CSV and PDF.
14. **Stripe SaaS billing** — Checkout, webhooks, plan gating on unit count.
15. **Landing page** — after product works, with the Cozy callout.
16. **Polish** — dashboard charts (Recharts), year-end Schedule E summary, receipt PDFs.

---

## TECHNICAL NOTES

- **Tenant portal JWT**: Sign with `TENANT_JWT_SECRET` (separate from cron secret). Payload: `{ tenantId, leaseId, landlordId, exp }`. Verify on each portal request in a middleware or server action helper `getTenantUser()` that mirrors `getServerUser()`. Set as httpOnly cookie `tenant_session` valid 30 days.
- **Monthly rent generation**: Server action `generateMonthlyRent(landlordId, month, year)` that queries all active leases for the landlord, creates `RentPayment` records with status `pending` for the given period if none exist yet. Idempotent — if records already exist for that period, skip. Trigger manually from the rent page dashboard. Also run automatically via cron on the 1st of each month.
- **Late fee application**: When a `RentPayment` with status `pending` exists and `dueDate + gracePeriodDays < today`, update the payment to add the late fee amount. Only apply once per payment. Track with a `lateFeeApplied` boolean field (add to schema if needed).
- **Stripe Connect vs Payment Links**: If implementing Payment Links first (simpler v1), store the Payment Link URL on the `RentPayment`. When tenant pays, Stripe webhook fires — identify the payment by metadata `{ rentPaymentId }` embedded when creating the link. Update payment status to `paid`. For Connect (v2), use `PaymentIntent` with `transfer_data.destination: landlord.stripeConnectId`.
- **The Cozy callout on landing page is a marketing asset** — it's not just flavor text. It speaks directly to a huge pool of displaced users. Make sure it's prominent and has its own visual container.
- **Rent roll PDF** (`@react-pdf/renderer`): Classic landlord document. Table with columns: Property | Unit | Tenant | Monthly Rent | Lease Start | Lease End | Status. Subtotal per property. Grand total at bottom. Date and landlord name in header.
- **Schedule E export**: The IRS Schedule E categories map to expense categories. Income = sum of paid rent payments for the year per property. Group expenses by the correct Schedule E line (line 5: advertising, line 6: auto/travel, line 9: insurance, line 12: mortgage interest, line 16: taxes, line 18: repairs, etc.). This is a highly valued feature for small landlords.
- **Unit count plan gating**: On unit creation, query count of active units for the landlord. If at plan limit, block creation and show upgrade modal. Starter = 5, Grow = 20, Portfolio = unlimited.
- **Maintenance priority "emergency"** should trigger an immediate email to the landlord regardless of notification settings. Burst pipes, no heat in winter, gas leaks — these cannot wait for a daily cron.
- **CSV import for migration**: Add a simple CSV upload on onboarding that accepts columns: tenant name, email, phone, property address, unit number, monthly rent, lease start, lease end. Creates the records programmatically. This is the hook for Cozy and TurboTenant migrants.
- Use `zod` for all form validation.
- `loading.tsx` for all major routes.
- `FIREBASE_ADMIN_PRIVATE_KEY`: replace `\\n` → `\n` in admin init.
- The tenant portal must be exceptional on mobile — most tenants will pay rent from their phone. Large tap targets, simple layout, clear CTAs.
