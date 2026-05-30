# RentNest — Testing Checklist

Manual QA checklist. Run through each section after making changes to a feature area.

---

## Auth

- [May 28, 2026] Sign up with a new email — account created, redirected to dashboard
- [May 28, 2026] Sign up with an existing email — error shown, no duplicate created
- [May 28, 2026] Log in with correct credentials — redirected to dashboard
- [May 28, 2026] Log in with wrong password — error shown
- [May 28, 2026] Unauthenticated visit to `/dashboard/*` — redirected to login
- [May 28, 2026] Session persists on page refresh

---

## Properties & Units

- [May 28, 2026] Create a new property — appears in properties list
- [May 28, 2026] Edit a property — changes saved and reflected
- [May 28, 2026] Add a unit to a property — unit appears on property detail page
- [May 28, 2026] Unit count shown correctly on property card
- [May 28, 2026] Inactive properties/units hidden from active flows (lease creation, etc.)

---

## Tenants

- [May 28, 2026] Create a tenant with email and phone — appears in tenant list
- [May 28, 2026] Create a tenant without email — no errors, fields optional
- [May 28, 2026] Edit a tenant — changes saved
- [May 28, 2026] Send portal link — email received, link works
- [May 28, 2026] Tenant portal loads with correct name and address after auth

---

## Leases

- [May 28, 2026] Create a lease for a unit with a tenant — lease appears in list and on unit
- [May 28, 2026] Lease detail page shows rent, dates, tenants, late fee settings
- [May 28, 2026] Month-to-month lease shows "Month-to-month" (no end date)
- [May 28, 2026] Terminate a lease — status changes to "terminated", no longer active
- [May 28, 2026] Lease with multiple tenants — all names shown, all get portal invites

### Lease Signing
- [May 28, 2026] "Request Signature" button sends email to tenant(s)
- [May 28, 2026] Signing link opens `/sign/[token]` with correct lease details shown
- [May 28, 2026] Lease document link shown if a document is attached to the lease
- [May 28, 2026] Typing the wrong name keeps Sign button disabled
- [May 28, 2026] Typing the exact name (case-insensitive) enables Sign button
- [May 28, 2026] Consent checkbox required before signing
- [May 28, 2026] Submitting signature → success screen shown, landlord receives email
- [May 28, 2026] Revisiting the signed link shows "Already signed" message
- [May 28, 2026] Expired link (past 30 days) shows "Link expired" message
- [May 28, 2026] Signature status appears on lease detail page for each tenant
- [May 28, 2026] "All tenants have signed" shown when all signatures are complete
- [May 28, 2026] Resend button re-sends the signing email

---

## Rent Collection

- [May 29, 2026] Generate rent charges — one charge created per active lease
- [May 29, 2026] Generating again for same month — no duplicates created
- [May 29, 2026] Rent page shows Collected / Outstanding / Overdue totals correctly
- [May 29, 2026] Overdue payments highlighted in red
- [May 29, 2026] Record payment modal opens and loads leases
- [May 29, 2026] Selecting a lease auto-fills the amount with monthly rent
- [May 29, 2026] Recording a payment marks it as paid, updates totals
- [ ] Recording a payment with days late beyond grace period — late fee auto-calculated
- [ ] Late fee field is manually editable (overrides auto-calculation)
- [ ] Total shown correctly as rent + late fee when late fee > 0
- [ ] Receipt email sent when "Email receipt to tenant" is checked
- [ ] Send reminders button — emails sent to pending tenants

### Auto Late Fees (cron)
- [ ] Cron job runs (verify in Vercel cron logs)
- [ ] Payment past grace period with `lateFeeEnabled: true` — late fee applied automatically
- [ ] Payment past grace period with `lateFeeEnabled: false` — no fee applied
- [ ] Payment already has `lateFeeApplied: true` — not double-charged
- [ ] Percentage late fee calculates correctly (e.g. 5% of $1,200 = $60)
- [ ] Flat late fee applies correct amount

---

## Maintenance Requests

- [May 29, 2026] Tenant submits maintenance request from portal — appears in landlord dashboard
- [May 29, 2026] Landlord receives email notification for new request
- [May 29, 2026] Landlord can update status (open → in progress → resolved)
- [May 29, 2026] Tenant can see status update in portal
- [May 29, 2026] Unacknowledged requests trigger cron email after 24 hours
- [May 29, 2026] Resolved requests show in history with resolution notes

---

## Documents

- [May 29, 2026] Upload a document to a property — appears in document list
- [May 29, 2026] Upload a document to a lease — appears on lease detail page
- [May 29, 2026] Document link opens the file correctly
- [May 29, 2026] Tenant can view documents shared to their lease from the portal

---

## Expenses

- [May 29, 2026] Add an expense with category and amount — appears in expense list
- [May 29, 2026] Associate expense with a property — filtered correctly in reports
- [May 29, 2026] CSV export downloads with correct data

---

## Reports

- [May 29, 2026] Reports page loads with correct income and expense totals
- [May 29, 2026] Filtering by property works
- [May 29, 2026] CSV export produces a valid file with all rows

---

## Tenant Portal

- [May 29, 2026] Tenant auth via portal link — session created, correct name shown
- [May 29, 2026] Current month rent shown with correct total amount
- [May 29, 2026] "Includes $X late fee" notice shown when late fee > 0
- [May 29, 2026] Pay Now / Pay Online button present when rent is unpaid
- [May 29, 2026] Stripe payment link opens and shows correct amount
- [ ] After payment, status updates to paid
- [ ] Payment history shows last 6 months
- [May 29, 2026] Maintenance requests submittable from portal
- [May 29, 2026] Open maintenance requests shown on portal home
- [May 29, 2026] Documents page shows lease documents

---

## Billing & Stripe Connect

- [May 29, 2026] Landlord can initiate Stripe Connect onboarding
- [May 29, 2026] Stripe Connect status shows as ready after onboarding
- [May 29, 2026] Tenant payment charge reaches landlord's connected account
- [May 29, 2026] Fee passthrough option adds Stripe fee to tenant's amount
- [May 29, 2026] Stripe webhook marks payment as paid when completed
- [May 29, 2026] Subscription upgrade/downgrade via billing portal

---

## Notifications (Cron)

- [ ] Rent due reminder sent 3 days before due date
- [ ] Overdue notice sent to tenant on day 1, 7, 14, 30 past grace period
- [ ] Landlord overdue summary email sent
- [ ] Lease expiring in 60 days — landlord email sent
- [ ] Lease expiring in 30 days — landlord email sent
- [ ] Unacknowledged maintenance after 24h — landlord email sent

---

## Settings

- [May 29, 2026] Landlord can update name, email, phone
- [May 29, 2026] Default late fee settings save and apply to new leases
- [May 29, 2026] Notification toggles (payment, maintenance, overdue) save correctly
- [May 29, 2026] Timezone setting saves

---

## Branding & Favicon

- [May 29, 2026] Browser tab shows the house logo favicon on all pages
- [May 29, 2026] Mobile bookmark icon shows the logo (Apple touch icon)
- [May 29, 2026] Landing page header shows logo image (not text)
- [May 29, 2026] Landing page footer shows logo image
- [May 29, 2026] `/listings` header shows logo image
- [May 29, 2026] `/listings/[id]` header shows logo image
- [May 29, 2026] `/apply/[quizId]` header shows logo image
- [May 29, 2026] Thank-you page shows faded logo at the bottom

---

## Marketing / Public Pages

- [May 29, 2026] Landing page loads and is readable on mobile
- [May 29, 2026] "Start Free Trial" and "Sign in" links work
- [May 29, 2026] Pricing section shows correct plan names and prices
- [May 29, 2026] Cozy callout section displays correctly
- [May 29, 2026] FAQ answers are all accurate and up to date

---

## Tenant Contact Info

- [May 29, 2026] Settings page shows "Tenant Contact Info" section
- [May 29, 2026] Both toggles default to off for existing landlords
- [May 29, 2026] Enabling email toggle → tenant portal shows landlord email as mailto link
- [May 29, 2026] Enabling phone toggle → tenant portal shows landlord phone as tel link
- [May 29, 2026] Both enabled → both shown in portal
- [May 29, 2026] Both disabled → contact section hidden entirely in portal
- [May 29, 2026] Phone toggle shows note "add a phone number in Account first" when no phone is set
- [May 29, 2026] Saving toggles persists correctly on page refresh

---

## Occupancy Dashboard

- [May 29, 2026] Occupancy section visible on dashboard Overview when units exist
- [May 29, 2026] Total / occupied / vacant counts are correct
- [May 29, 2026] Occupancy % calculates correctly (occupied ÷ total)
- [May 29, 2026] Per-property progress bars shown when more than one property exists
- [May 29, 2026] Bar widths reflect actual occupancy per property
- [May 29, 2026] Section hidden when landlord has no units yet

---

## Bulk Messaging

- [May 29, 2026] "Message Tenants" button visible on Tenants page
- [May 29, 2026] Button shows correct recipient count (only tenants with email + active lease)
- [May 29, 2026] Modal opens with subject and message fields
- [May 29, 2026] Sending with empty fields blocked by required validation
- [May 29, 2026] Tenants without email addresses excluded from send
- [May 29, 2026] Tenants without active leases excluded from send
- [May 29, 2026] Success screen shows after sending, with correct sent count
- [May 29, 2026] Tenant receives email with correct subject and message body
- [May 29, 2026] Email includes landlord's "sent via RentNest" footer
- [May 29, 2026] "Message Tenants" button disabled (or shows 0) when no eligible tenants exist

---

## Maintenance Cost Reporting

- [May 29, 2026] "Maintenance Costs" tab visible on Reports page
- [May 29, 2026] Total spent, avg per job, and property count cards show correct values
- [May 29, 2026] "Cost by Property" table shows correct totals and job counts
- [May 29, 2026] "Cost by Category" table shows correct totals
- [May 29, 2026] "All Jobs with Costs" table lists jobs with vendor name and cost
- [May 29, 2026] Jobs without `actualCost` set are excluded
- [May 29, 2026] Empty state shown when no jobs have costs recorded
- [May 29, 2026] Totals row in jobs table matches sum of individual rows

---

## Renters Insurance Tracking

- [ ] Insurance section visible on tenant detail page
- [ ] "No insurance on file" shown when fields are empty
- [ ] "Add" button opens edit form; "Edit" button shown when data exists
- [ ] Provider, policy number, and expiry date save correctly
- [ ] Expired insurance shows red "Expired" badge
- [ ] Insurance expiring within 30 days shows yellow "Expires in Xd" badge
- [ ] Active insurance (> 30 days out) shows green "Active" badge
- [ ] Cron job sends landlord email when insurance expires within 30 days
- [ ] Cron email correctly groups tenants by landlord

---

## In-App Onboarding Checklist

- [May 29, 2026] Checklist card visible on dashboard when account has no data
- [May 29, 2026] "Add your first property" step marked complete after property is created
- [May 29, 2026] "Add a unit" step marked complete after unit exists
- [May 29, 2026] "Add a tenant" step marked complete after tenant is created
- [May 29, 2026] "Create a lease" step marked complete after an active lease exists
- [May 29, 2026] "Set up rent payments" step marked complete after rent charges are generated
- [May 29, 2026] Completed steps show strikethrough text and green check icon
- [May 29, 2026] Incomplete steps are clickable links to the relevant page
- [May 29, 2026] Completed steps are not clickable
- [May 29, 2026] Entire checklist card hidden once all 5 steps are complete

---

## Utility Tracking

- [May 29, 2026] "Utilities Included in Rent" section visible on unit detail page
- [May 29, 2026] "No utilities included" shown when list is empty
- [May 29, 2026] "Add" button opens edit form; "Edit" button shown when utilities exist
- [May 29, 2026] All 9 utility options displayed as toggles in edit mode
- [May 29, 2026] Selecting utilities highlights them; deselecting removes highlight
- [May 29, 2026] Optional note field saves and displays correctly
- [May 29, 2026] Saving with no utilities selected clears the list and shows empty state
- [May 29, 2026] Tenant portal shows utilities card when unit has utilities included
- [May 29, 2026] Tenant portal utilities card hidden when no utilities are set
- [May 29, 2026] Optional note shown in tenant portal when present

---

## Security Deposit Tracking

- [May 29, 2026] Security deposit section visible on lease detail when `securityDeposit > 0`
- [May 29, 2026] Section hidden when deposit is $0
- [May 29, 2026] "Mark received" button sets paid date and removes button
- [May 29, 2026] Received date displays correctly after marking
- [May 29, 2026] "Add Deduction" button opens inline form with description + amount fields
- [May 29, 2026] Deduction saves and appears in list with correct amount
- [May 29, 2026] Total deducted and "to return" amount update correctly after each deduction
- [May 29, 2026] Remove (trash) button deletes a deduction and recalculates totals
- [May 29, 2026] "Mark Returned" button records return date and hides action buttons
- [May 29, 2026] Return button shows correct return amount (deposit − deductions)
- [May 29, 2026] Remove button hidden after deposit is returned

---

## Notification Preferences

- [May 29, 2026] Settings page shows 6 email notification checkboxes
- [May 29, 2026] All 6 defaults are correct (payment/maintenance/overdue/expiring all default on)
- [May 29, 2026] Saving checkboxes persists on page refresh
- [May 29, 2026] Disabling "lease expiring" → cron no longer sends lease expiry emails for that landlord
- [May 29, 2026] Disabling "insurance expiring" → cron skips insurance emails for that landlord
- [May 29, 2026] Disabling "signature" → landlord does not receive email when tenant signs
- [May 29, 2026] Enabling "signature" → landlord receives email when tenant signs

---

## Vendor Management

- [ ] "Vendors" link visible on Maintenance page header
- [ ] Vendors page loads with empty state when no vendors exist
- [ ] "Add Vendor" button opens modal with all fields
- [ ] Creating a vendor — appears in vendor grid
- [ ] All trade options available in dropdown
- [ ] Phone, email, website all optional and displayed correctly
- [ ] Email field shown as mailto link; phone as tel link; website as external link
- [ ] "Edit" button on vendor card opens pre-filled modal
- [ ] Editing a vendor saves changes correctly
- [ ] "Delete" button in edit modal soft-deletes vendor (removed from list)
- [ ] Notes section shown on card when present
- [ ] On maintenance request detail: "Assign from vendor book" button visible when vendors exist
- [ ] Clicking assigns vendor, updates name/phone on request
- [ ] "Change" and "Remove" options shown after vendor is assigned
- [ ] Vendor book hidden on maintenance detail when no vendors are saved

---

## Lease Renewal

- [ ] "Renew Lease" button visible on active lease detail when an end date is set
- [ ] Button hidden on month-to-month leases (no end date)
- [ ] Modal pre-fills start date to the day after the current end date
- [ ] End date defaults to 12 months from new start
- [ ] Monthly rent pre-filled from current lease
- [ ] Rent increase % field updates the monthly rent field in real time
- [ ] Increase amount shown as "X/mo increase" below the % field
- [ ] Submitting creates a new lease and redirects to it with "created" banner
- [ ] New lease has same tenants, late fee settings, and pet settings as original
- [ ] New lease security deposit is $0 (already held) and marked paid
- [ ] Original lease still visible and not automatically terminated

---

## Eviction Tracking

- [ ] "Eviction Log" section visible on every lease detail page
- [ ] "No eviction events recorded" shown when empty
- [ ] "+ Add Event" button opens inline form
- [ ] All 7 event types available in dropdown
- [ ] Date and notes save correctly
- [ ] Event appears in list with correct type badge color and date
- [ ] Notes displayed under the date when present
- [ ] Trash icon deletes an event and updates list immediately
- [ ] Multiple events shown in chronological order

---

## Owner Statements

- [ ] "Owner Statements" tab visible on Reports page
- [ ] Month selector shows all 12 months; current month selected by default
- [ ] Clicking a different month updates the statement data
- [ ] Portfolio summary cards show correct total income, expenses, and net
- [ ] Only properties with activity in the selected month are shown
- [ ] Per-property card shows correct income (rent collected) and expenses
- [ ] Net shown as green (+) or red (−) correctly
- [ ] Expense detail section lists individual expenses with category and description
- [ ] Empty state shown when no income or expenses exist for the month
- [ ] Year selector still works alongside month selector

---

## Tenant Messaging

- [May 29, 2026] "Messages" section visible on lease detail page
- [May 29, 2026] "No messages yet" shown when empty
- [May 29, 2026] Landlord can type and send a message
- [May 29, 2026] Message appears in the thread bubble (right-aligned, orange)
- [May 29, 2026] Tenant receives email notification with message body
- [May 29, 2026] Tenant portal shows "Messages" quick link on home page
- [May 29, 2026] Tenant messages page loads with full thread
- [May 29, 2026] Tenant can send a message from the portal
- [May 29, 2026] Tenant message appears in thread (left-aligned, gray)
- [May 29, 2026] Landlord receives email notification when tenant sends a message
- [May 29, 2026] Messages display in chronological order

---

## Move-In / Move-Out Inspections

- [ ] "Inspections" section visible on lease detail page with "Open Inspection Reports" button
- [ ] Inspections page loads (linked from lease detail)
- [ ] "No inspection reports yet" shown when empty
- [ ] "+ New Inspection" button opens inline form
- [ ] Move-In and Move-Out type options available
- [ ] Date field required and saves correctly
- [ ] At least one room item required; "+ Add room" adds more
- [ ] Room dropdown shows all standard rooms
- [ ] Good / Fair / Poor condition buttons work and highlight correctly
- [ ] Per-room notes save correctly
- [ ] Overall notes (optional) save correctly
- [ ] Saving creates report and shows it in list
- [ ] Report shows correct type badge (blue = move-in, orange = move-out)
- [ ] Clicking report row expands to show all rooms with condition and notes
- [ ] Trash icon on report header deletes the report
- [ ] Multiple reports shown with most recent first

---

## Digital Addendums

- [May 29, 2026] "Addendums" section visible on lease detail page
- [May 29, 2026] "No addendums yet" shown when empty
- [May 29, 2026] "+ Add Addendum" opens inline form with Title and Body fields
- [May 29, 2026] Creating an addendum saves and appears in list
- [May 29, 2026] Addendum body text displays in the card
- [May 29, 2026] "Request Signatures" button sends emails to all tenants with email
- [May 29, 2026] Signing email contains addendum title and sign link
- [May 29, 2026] Sign link opens `/sign/addendum/[token]` with correct addendum title and body shown
- [May 29, 2026] Name matching logic works (case-insensitive, must be exact)
- [May 29, 2026] Consent checkbox required before signing
- [May 29, 2026] Submitting signature → success screen shown, landlord receives email
- [May 29, 2026] Revisiting signed link shows "Already signed" message
- [May 29, 2026] Expired link shows "Link expired" message
- [May 29, 2026] Signature status updates on lease detail page after signing
- [May 29, 2026] Trash icon deletes addendum from list
- [May 29, 2026] "Request Signatures" button hidden when lease has no tenants

---

## Listings & Marketplace

### Dashboard (landlord)
- [May 29, 2026] "Listings" link visible in sidebar navigation
- [May 29, 2026] Listings dashboard page loads with empty state when no listings exist
- [May 29, 2026] "New Listing" button opens modal with unit selector, rent, date, description, quiz fields
- [May 29, 2026] Unit selector shows only vacant units (no active lease, no active listing)
- [May 29, 2026] Title auto-fills based on selected unit (e.g. "2BD/1BA — Oak Street Duplex")
- [May 29, 2026] Creating a listing shows it on the dashboard with status dropdown
- [May 29, 2026] Status dropdown cycles: Active → Inactive (hidden) → Rented
- [May 29, 2026] "Copy link" copies the `/listings/[id]` URL to clipboard
- [May 29, 2026] "View public listing" opens the listing in a new tab
- [May 29, 2026] "Remove" button deletes the listing after confirmation prompt
- [May 29, 2026] Cancelled account — "New Listing" replaced with "Upgrade to list units" link
- [May 29, 2026] Unit detail page (vacant) shows "Listed on marketplace · Manage listing" when active listing exists
- [May 29, 2026] Unit detail page (vacant) shows "List unit" button when no active listing
- [May 29, 2026] Creating a lease for a listed unit auto-sets that listing to "rented"

### Public marketplace (`/listings`)
- [May 29, 2026] Logo image appears in header; clicking navigates to landing page
- [May 29, 2026] All active listings shown as cards with photo, city/state, rent, beds/baths
- [May 29, 2026] Counter shows "X of Y units shown" when filters narrow the results
- [May 29, 2026] Location text input filters by city, state, or zip (case-insensitive, partial match)
- [May 29, 2026] City chips appear below location input when ≤ 8 distinct locations exist; clicking fills input and filters
- [May 29, 2026] Clear ✕ button inside location input clears the location filter
- [May 29, 2026] Bed filter buttons (Any / 1bd / 2bd / 3+bd) highlight active selection and filter results
- [May 29, 2026] "3+ bd" shows units with 3 or more bedrooms
- [May 29, 2026] Max rent input filters out listings above the entered value (applies on blur or Enter)
- [May 29, 2026] Sort dropdown: Newest / Rent low→high / Rent high→low / Most bedrooms all work correctly
- [May 29, 2026] "Clear all" button appears when any filter is active; clicking resets all filters
- [May 29, 2026] Filters are reflected in the URL (shareable/bookmarkable)
- [May 29, 2026] "No listings match your filters" empty state shown when filters eliminate everything
- [May 29, 2026] Listing card links to `/listings/[id]` detail page

### Public listing detail (`/listings/[id]`)
- [May 29, 2026] Logo in header; "← All listings" link navigates back
- [May 29, 2026] Photo banner shown when property has a photo
- [May 29, 2026] Full address, property type, beds/baths/sqft shown
- [May 29, 2026] Asking rent and available date shown in sticky apply card
- [May 29, 2026] "Apply Now" button present when quiz attached; links to `/apply/[quizId]`
- [May 29, 2026] Contact message shown instead when no quiz attached
- [May 29, 2026] Inactive or rented listings return 404
- [May 29, 2026] Browser tab shows listing title and rent (via metadata)

---

## Pre-Screening Quizzes

- [ ] "Screening" link visible in sidebar navigation
- [ ] Screening page loads with empty state when no quizzes exist
- [ ] "New Quiz" button opens modal with title field
- [ ] Creating a quiz redirects to the quiz detail page
- [ ] Quiz detail page shows 10 default questions
- [ ] Question list shows label, type, and required/optional indicator
- [ ] Trash icon on question removes it and refreshes list
- [ ] "Add custom question" opens inline form with label + type dropdown
- [ ] Adding a custom question appends it to the list
- [ ] "Copy link" button copies the `/apply/[quizId]` URL to clipboard
- [ ] "Preview" link opens the apply page in a new tab
- [ ] Apply page shows quiz title, property info, and landlord name
- [ ] Apply page renders all question types: text, yes/no, select, number
- [ ] Required questions block submission when empty
- [ ] "Add co-applicant" button adds a name/email/phone block
- [ ] Multiple co-applicants can be added
- [ ] Trash icon removes a co-applicant block
- [ ] Submitting the form redirects to the thank-you page
- [ ] Thank-you page shows success message
- [ ] Landlord receives email notification with all applicant answers
- [ ] Email includes co-applicant names and emails when present
- [ ] Response appears on quiz detail page with applicant name, email, status
- [ ] Co-applicants listed under the primary applicant in the response
- [ ] Status dropdown (Pending / Approved / Rejected) updates immediately
- [ ] Screening page shows response count per quiz
- [ ] Inactive quiz (deactivated) returns 404 on the apply page

---

## General

- [ ] No console errors on any page
- [ ] All pages load on mobile (375px width)
- [ ] All forms show validation errors for missing required fields
- [ ] Loading states shown on all async buttons
- [ ] Error states shown on form submission failures
