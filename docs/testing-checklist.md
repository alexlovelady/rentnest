# RentNest — Testing Checklist

Manual QA checklist. Run through each section after making changes to a feature area.

---

## Auth

- [ ] Sign up with a new email — account created, redirected to dashboard
- [ ] Sign up with an existing email — error shown, no duplicate created
- [ ] Log in with correct credentials — redirected to dashboard
- [ ] Log in with wrong password — error shown
- [ ] Unauthenticated visit to `/dashboard/*` — redirected to login
- [ ] Session persists on page refresh

---

## Properties & Units

- [ ] Create a new property — appears in properties list
- [ ] Edit a property — changes saved and reflected
- [ ] Add a unit to a property — unit appears on property detail page
- [ ] Unit count shown correctly on property card
- [ ] Inactive properties/units hidden from active flows (lease creation, etc.)

---

## Tenants

- [ ] Create a tenant with email and phone — appears in tenant list
- [ ] Create a tenant without email — no errors, fields optional
- [ ] Edit a tenant — changes saved
- [ ] Send portal link — email received, link works
- [ ] Tenant portal loads with correct name and address after auth

---

## Leases

- [ ] Create a lease for a unit with a tenant — lease appears in list and on unit
- [ ] Lease detail page shows rent, dates, tenants, late fee settings
- [ ] Month-to-month lease shows "Month-to-month" (no end date)
- [ ] Terminate a lease — status changes to "terminated", no longer active
- [ ] Lease with multiple tenants — all names shown, all get portal invites

### Lease Signing
- [ ] "Request Signature" button sends email to tenant(s)
- [ ] Signing link opens `/sign/[token]` with correct lease details shown
- [ ] Lease document link shown if a document is attached to the lease
- [ ] Typing the wrong name keeps Sign button disabled
- [ ] Typing the exact name (case-insensitive) enables Sign button
- [ ] Consent checkbox required before signing
- [ ] Submitting signature → success screen shown, landlord receives email
- [ ] Revisiting the signed link shows "Already signed" message
- [ ] Expired link (past 30 days) shows "Link expired" message
- [ ] Signature status appears on lease detail page for each tenant
- [ ] "All tenants have signed" shown when all signatures are complete
- [ ] Resend button re-sends the signing email

---

## Rent Collection

- [ ] Generate rent charges — one charge created per active lease
- [ ] Generating again for same month — no duplicates created
- [ ] Rent page shows Collected / Outstanding / Overdue totals correctly
- [ ] Overdue payments highlighted in red
- [ ] Record payment modal opens and loads leases
- [ ] Selecting a lease auto-fills the amount with monthly rent
- [ ] Recording a payment marks it as paid, updates totals
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

- [ ] Tenant submits maintenance request from portal — appears in landlord dashboard
- [ ] Landlord receives email notification for new request
- [ ] Landlord can update status (open → in progress → resolved)
- [ ] Tenant can see status update in portal
- [ ] Unacknowledged requests trigger cron email after 24 hours
- [ ] Resolved requests show in history with resolution notes

---

## Documents

- [ ] Upload a document to a property — appears in document list
- [ ] Upload a document to a lease — appears on lease detail page
- [ ] Document link opens the file correctly
- [ ] Tenant can view documents shared to their lease from the portal

---

## Expenses

- [ ] Add an expense with category and amount — appears in expense list
- [ ] Associate expense with a property — filtered correctly in reports
- [ ] CSV export downloads with correct data

---

## Reports

- [ ] Reports page loads with correct income and expense totals
- [ ] Filtering by property works
- [ ] CSV export produces a valid file with all rows

---

## Tenant Portal

- [ ] Tenant auth via portal link — session created, correct name shown
- [ ] Current month rent shown with correct total amount
- [ ] "Includes $X late fee" notice shown when late fee > 0
- [ ] Pay Now / Pay Online button present when rent is unpaid
- [ ] Stripe payment link opens and shows correct amount
- [ ] After payment, status updates to paid
- [ ] Payment history shows last 6 months
- [ ] Maintenance requests submittable from portal
- [ ] Open maintenance requests shown on portal home
- [ ] Documents page shows lease documents

---

## Billing & Stripe Connect

- [ ] Landlord can initiate Stripe Connect onboarding
- [ ] Stripe Connect status shows as ready after onboarding
- [ ] Tenant payment charge reaches landlord's connected account
- [ ] Fee passthrough option adds Stripe fee to tenant's amount
- [ ] Stripe webhook marks payment as paid when completed
- [ ] Subscription upgrade/downgrade via billing portal

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

- [ ] Landlord can update name, email, phone
- [ ] Default late fee settings save and apply to new leases
- [ ] Notification toggles (payment, maintenance, overdue) save correctly
- [ ] Timezone setting saves

---

## Marketing / Public Pages

- [ ] Landing page loads and is readable on mobile
- [ ] "Start Free Trial" and "Sign in" links work
- [ ] Pricing section shows correct plan names and prices
- [ ] Cozy callout section displays correctly
- [ ] FAQ answers are all accurate and up to date

---

## Tenant Contact Info

- [ ] Settings page shows "Tenant Contact Info" section
- [ ] Both toggles default to off for existing landlords
- [ ] Enabling email toggle → tenant portal shows landlord email as mailto link
- [ ] Enabling phone toggle → tenant portal shows landlord phone as tel link
- [ ] Both enabled → both shown in portal
- [ ] Both disabled → contact section hidden entirely in portal
- [ ] Phone toggle shows note "add a phone number in Account first" when no phone is set
- [ ] Saving toggles persists correctly on page refresh

---

## Occupancy Dashboard

- [ ] Occupancy section visible on dashboard Overview when units exist
- [ ] Total / occupied / vacant counts are correct
- [ ] Occupancy % calculates correctly (occupied ÷ total)
- [ ] Per-property progress bars shown when more than one property exists
- [ ] Bar widths reflect actual occupancy per property
- [ ] Section hidden when landlord has no units yet

---

## Bulk Messaging

- [ ] "Message Tenants" button visible on Tenants page
- [ ] Button shows correct recipient count (only tenants with email + active lease)
- [ ] Modal opens with subject and message fields
- [ ] Sending with empty fields blocked by required validation
- [ ] Tenants without email addresses excluded from send
- [ ] Tenants without active leases excluded from send
- [ ] Success screen shows after sending, with correct sent count
- [ ] Tenant receives email with correct subject and message body
- [ ] Email includes landlord's "sent via RentNest" footer
- [ ] "Message Tenants" button disabled (or shows 0) when no eligible tenants exist

---

## Maintenance Cost Reporting

- [ ] "Maintenance Costs" tab visible on Reports page
- [ ] Total spent, avg per job, and property count cards show correct values
- [ ] "Cost by Property" table shows correct totals and job counts
- [ ] "Cost by Category" table shows correct totals
- [ ] "All Jobs with Costs" table lists jobs with vendor name and cost
- [ ] Jobs without `actualCost` set are excluded
- [ ] Empty state shown when no jobs have costs recorded
- [ ] Totals row in jobs table matches sum of individual rows

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

- [ ] Checklist card visible on dashboard when account has no data
- [ ] "Add your first property" step marked complete after property is created
- [ ] "Add a unit" step marked complete after unit exists
- [ ] "Add a tenant" step marked complete after tenant is created
- [ ] "Create a lease" step marked complete after an active lease exists
- [ ] "Set up rent payments" step marked complete after rent charges are generated
- [ ] Completed steps show strikethrough text and green check icon
- [ ] Incomplete steps are clickable links to the relevant page
- [ ] Completed steps are not clickable
- [ ] Entire checklist card hidden once all 5 steps are complete

---

## Utility Tracking

- [ ] "Utilities Included in Rent" section visible on unit detail page
- [ ] "No utilities included" shown when list is empty
- [ ] "Add" button opens edit form; "Edit" button shown when utilities exist
- [ ] All 9 utility options displayed as toggles in edit mode
- [ ] Selecting utilities highlights them; deselecting removes highlight
- [ ] Optional note field saves and displays correctly
- [ ] Saving with no utilities selected clears the list and shows empty state
- [ ] Tenant portal shows utilities card when unit has utilities included
- [ ] Tenant portal utilities card hidden when no utilities are set
- [ ] Optional note shown in tenant portal when present

---

## Security Deposit Tracking

- [ ] Security deposit section visible on lease detail when `securityDeposit > 0`
- [ ] Section hidden when deposit is $0
- [ ] "Mark received" button sets paid date and removes button
- [ ] Received date displays correctly after marking
- [ ] "Add Deduction" button opens inline form with description + amount fields
- [ ] Deduction saves and appears in list with correct amount
- [ ] Total deducted and "to return" amount update correctly after each deduction
- [ ] Remove (trash) button deletes a deduction and recalculates totals
- [ ] "Mark Returned" button records return date and hides action buttons
- [ ] Return button shows correct return amount (deposit − deductions)
- [ ] Remove button hidden after deposit is returned

---

## Notification Preferences

- [ ] Settings page shows 6 email notification checkboxes
- [ ] All 6 defaults are correct (payment/maintenance/overdue/expiring all default on)
- [ ] Saving checkboxes persists on page refresh
- [ ] Disabling "lease expiring" → cron no longer sends lease expiry emails for that landlord
- [ ] Disabling "insurance expiring" → cron skips insurance emails for that landlord
- [ ] Disabling "signature" → landlord does not receive email when tenant signs
- [ ] Enabling "signature" → landlord receives email when tenant signs

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

- [ ] "Messages" section visible on lease detail page
- [ ] "No messages yet" shown when empty
- [ ] Landlord can type and send a message
- [ ] Message appears in the thread bubble (right-aligned, orange)
- [ ] Tenant receives email notification with message body
- [ ] Tenant portal shows "Messages" quick link on home page
- [ ] Tenant messages page loads with full thread
- [ ] Tenant can send a message from the portal
- [ ] Tenant message appears in thread (left-aligned, gray)
- [ ] Landlord receives email notification when tenant sends a message
- [ ] Messages display in chronological order

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

- [ ] "Addendums" section visible on lease detail page
- [ ] "No addendums yet" shown when empty
- [ ] "+ Add Addendum" opens inline form with Title and Body fields
- [ ] Creating an addendum saves and appears in list
- [ ] Addendum body text displays in the card
- [ ] "Request Signatures" button sends emails to all tenants with email
- [ ] Signing email contains addendum title and sign link
- [ ] Sign link opens `/sign/addendum/[token]` with correct addendum title and body shown
- [ ] Name matching logic works (case-insensitive, must be exact)
- [ ] Consent checkbox required before signing
- [ ] Submitting signature → success screen shown, landlord receives email
- [ ] Revisiting signed link shows "Already signed" message
- [ ] Expired link shows "Link expired" message
- [ ] Signature status updates on lease detail page after signing
- [ ] Trash icon deletes addendum from list
- [ ] "Request Signatures" button hidden when lease has no tenants

---

## General

- [ ] No console errors on any page
- [ ] All pages load on mobile (375px width)
- [ ] All forms show validation errors for missing required fields
- [ ] Loading states shown on all async buttons
- [ ] Error states shown on form submission failures
