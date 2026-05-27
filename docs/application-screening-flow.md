# Application & Tenant Screening Flow
## RentNest × SingleKey Integration Plan

---

## Overview

Full end-to-end flow from a landlord posting a vacancy to a signed lease, with background checks powered by SingleKey (credit, criminal, eviction via Equifax/TransUnion).

---

## User Roles

- **Landlord** — existing RentNest user, manages properties/units
- **Applicant** — prospective tenant, no RentNest account required
- **Tenant** — applicant who has been approved and onboarded

---

## Full Flow

### 1. Landlord Creates Application Link

- Landlord navigates to a vacant unit in their dashboard
- Clicks "Create Application Link" 
- Optionally configures requirements:
  - Minimum income (e.g. 3× rent)
  - Pets allowed
  - Move-in date range
  - Custom questions
- RentNest generates a unique token-based URL: `/apply/[token]`
- Landlord shares the link (email, text, Zillow listing, etc.)

**DB:** `ApplicationInvite` record created, linked to `Unit`, with token + expiry

---

### 2. Applicant Submits Application

Applicant opens the `/apply/[token]` link — no account needed.

**Application form collects:**

#### Personal Info
- Full legal name
- Date of birth
- Email + phone
- Current address + how long at current address
- Previous address (if < 2 years at current)

#### Employment & Income
- Employment status (employed / self-employed / retired / other)
- Employer name + phone
- Monthly gross income
- Secondary income (optional)

#### Rental History
- Current landlord name + phone
- Reason for leaving
- Prior landlord (optional)

#### Additional
- Number of occupants
- Pets (type, breed, weight)
- Vehicles (make, model, plate)
- Felony/eviction disclosure checkbox
- Personal references (1–2)

#### Consent
- Checkbox: consent to background and credit check
- Checkbox: agree to pay $29.99 screening fee (or landlord covers it — TBD)

On submit → `Application` record created with status `pending_screening`

---

### 3. Background Check via SingleKey

Immediately after application submit:

1. RentNest calls `POST /screen/embedded_flow_request` with applicant info
2. SingleKey returns a `purchase_token` and a hosted screening URL
3. Applicant is redirected to SingleKey's hosted form to:
   - Confirm identity
   - Pay $29.99
   - Consent to credit pull
4. SingleKey runs the check (~2–5 min):
   - Credit report + score (TransUnion/Equifax)
   - Criminal background check
   - Eviction history
   - Income verification
   - ID verification (liveness check + selfie)
5. SingleKey fires webhook to RentNest when complete
6. RentNest calls `GET /api/report/[token]` to fetch results
7. Application status updated to `screening_complete`
8. Landlord notified via email

**DB:** `BackgroundCheck` record stores SingleKey token, status, report URL, summary data

---

### 4. Landlord Reviews Application

In the RentNest dashboard, under the unit:

- List of all applicants with status badges (Pending / Screening Complete / Approved / Denied)
- Click applicant → full application details + screening report summary:
  - Credit score + rating
  - Criminal: clear / flags
  - Eviction: clear / flags
  - Income verified: yes/no
- Actions: **Approve**, **Conditional Approve**, **Deny**

---

### 5. Decision & Outcome

#### If Approved:
- Applicant notified via email ("Congratulations…")
- Landlord prompted: "Create lease for [Applicant Name]?"
- One click → pre-fills new lease form with applicant's info
- Applicant onboarded as Tenant, gets portal invite

#### If Denied:
- Applicant notified via email
- **Adverse action notice required by FCRA** — must include reason + SingleKey contact info
  - ⚠️ Verify with SingleKey: do they generate/send this, or does RentNest?

#### If Conditional:
- Landlord can add a note (e.g. "Approved with co-signer required")
- Applicant notified with conditions

---

## Database Models (New)

```prisma
model ApplicationInvite {
  id          String   @id @default(cuid())
  landlordId  String
  unitId      String
  token       String   @unique
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  minIncome   Float?
  petsAllowed Boolean  @default(false)
  notes       String?
  createdAt   DateTime @default(now())

  unit         Unit          @relation(...)
  applications Application[]
}

model Application {
  id               String   @id @default(cuid())
  inviteId         String
  landlordId       String
  unitId           String
  
  // Personal
  fullName         String
  email            String
  phone            String
  dateOfBirth      String
  currentAddress   String
  timeAtAddress    String
  previousAddress  String?
  
  // Employment
  employmentStatus String
  employerName     String?
  employerPhone    String?
  monthlyIncome    Float?
  
  // Rental history
  currentLandlord  String?
  currentLandlordPhone String?
  reasonForLeaving String?
  
  // Other
  occupants        Int      @default(1)
  hasPets          Boolean  @default(false)
  petDetails       String?
  vehicles         String?
  priorEviction    Boolean  @default(false)
  references       String?
  
  // Status
  status           String   @default("pending_screening")
  // pending_screening | screening_complete | approved | conditional | denied
  
  notes            String?
  decidedAt        DateTime?
  createdAt        DateTime @default(now())

  invite           ApplicationInvite @relation(...)
  backgroundCheck  BackgroundCheck?
  convertedTenantId String?
}

model BackgroundCheck {
  id              String   @id @default(cuid())
  applicationId   String   @unique
  singlekeyToken  String?
  screeningUrl    String?
  status          String   @default("pending")
  // pending | in_progress | complete | failed
  
  creditScore     Int?
  creditRating    String?
  criminalClear   Boolean?
  evictionClear   Boolean?
  incomeVerified  Boolean?
  reportUrl       String?
  rawResult       Json?
  
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  application     Application @relation(...)
}
```

---

## New Pages / Routes

| Path | Who | What |
|---|---|---|
| `/apply/[token]` | Applicant (public) | Multi-step application form |
| `/apply/[token]/screening` | Applicant | Redirect to SingleKey, then confirmation page |
| `/apply/[token]/complete` | Applicant | "Application submitted" confirmation |
| `/dashboard/applications` | Landlord | All applications across all units |
| `/dashboard/properties/[id]/units/[unitId]/applications` | Landlord | Applications for a specific unit |
| `/api/webhooks/singlekey` | System | Receives SingleKey webhook on completion |

---

## Email Notifications

| Trigger | Recipient | Content |
|---|---|---|
| Application submitted | Landlord | New application received for Unit X |
| Screening complete | Landlord | Background check ready to review |
| Approved | Applicant | Congratulations, next steps |
| Denied | Applicant | Adverse action notice (FCRA) |
| Conditional | Applicant | Approved with conditions |

---

## Questions to Verify with SingleKey

1. **Adverse action notices** — do they generate and send these, or is that on us? (FCRA requires this when denying based on credit/background)
2. **Sandbox / test environment** — is there one for development?
3. **Webhook security** — how do we verify webhook authenticity (signing secret)?
4. **White-labeling** — does their hosted form show SingleKey branding, or can it be customized?
5. **Who pays** — can we configure tenant-pays vs landlord-pays per invite?
6. **Report data structure** — what exact fields come back in the webhook vs the GET report endpoint?
7. **Incomplete screenings** — what happens if applicant never completes the SingleKey form? Timeout/expiry?
8. **US coverage** — any states where criminal/eviction data is limited?
9. **Pricing for API** — is it still $29.99/report at API volume, or different?
10. **FCRA compliance obligations** — what does RentNest need to do vs what SingleKey handles?

---

## Open Decisions

- [ ] Who pays the $29.99 screening fee — tenant (default) or landlord option?
- [ ] Should application links expire (e.g. 30 days)?
- [ ] Do we support multiple applicants per unit (e.g. roommates, co-signers)?
- [ ] Do we want a "pre-screening" questionnaire before the full application (quick income/pets filter)?
- [ ] Stripe Identity for additional ID verification, or rely on SingleKey's built-in?
