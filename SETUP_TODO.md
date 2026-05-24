# RentNest — Manual Setup Checklist

Everything in the codebase is built and the production build passes. Complete these steps in order before deploying.

---

## 1. Railway PostgreSQL

1. Go to [railway.app](https://railway.app) → New Project → Add PostgreSQL
2. Once provisioned, open the Postgres service → **Variables** tab
3. Copy the `DATABASE_URL` (it looks like `postgresql://postgres:xxxx@...railway.app:5432/railway`)
4. Paste it into `.env`:
   ```
   DATABASE_URL="postgresql://postgres:xxxx@...railway.app:5432/railway?sslmode=require"
   ```
5. Run the database migration:
   ```bash
   npx prisma migrate dev --name init
   ```
   Or for production: `npx prisma migrate deploy`

---

## 2. Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create Project
2. **Authentication** → Sign-in method → Enable **Email/Password**
3. **Project Settings** → General → Add Web App → copy the config values into `.env`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```
4. **Project Settings** → Service Accounts → Generate new private key → download JSON
   - Copy values into `.env`:
   ```
   FIREBASE_ADMIN_PROJECT_ID=      ← "project_id" from JSON
   FIREBASE_ADMIN_CLIENT_EMAIL=    ← "client_email" from JSON
   FIREBASE_ADMIN_PRIVATE_KEY=     ← "private_key" from JSON (keep the \n literally, the code handles it)
   ```
5. **Storage** → Get Started → enable Firebase Storage
   - Storage rules: allow read/write for now during development, tighten before launch:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

---

## 3. Stripe

### SaaS Billing (Landlord pays RentNest)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → Products → Create:
   - **Starter** — $19/month recurring → copy Price ID → `STRIPE_PRICE_ID_STARTER`
   - **Grow** — $49/month recurring → copy Price ID → `STRIPE_PRICE_ID_GROW`
   - **Portfolio** — $99/month recurring → copy Price ID → `STRIPE_PRICE_ID_PORTFOLIO`
2. **Developers** → API Keys:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
3. **Webhooks** → Add endpoint → URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`
     - `payment_intent.succeeded` (for Connect payments — check "Listen to events on Connected accounts")
   - Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`
4. **Connect** → Settings → enable Stripe Connect (Express accounts)

### Stripe Connect (Tenant pays landlord)
- Landlords connect their bank from Settings → "Connect Bank Account" inside the app
- No additional Stripe setup needed; the app creates Express accounts on demand

---

## 4. Resend (Email)

1. Go to [resend.com](https://resend.com) → Create account → API Keys → Create
   ```
   RESEND_API_KEY=re_...
   ```
2. **Domains** → Add your sending domain and verify DNS records
3. Update `.env`:
   ```
   FROM_EMAIL=noreply@yourdomain.com
   ```

---

## 5. Secret Keys

Generate two strong random secrets (use `openssl rand -hex 32` or any generator):
```
CRON_SECRET=<32-char-random-string>
TENANT_JWT_SECRET=<different-32-char-random-string>
```
These must be different from each other.

---

## 6. Deploy to Railway

1. Create a new Railway service from your GitHub repo (or deploy from CLI)
2. Add all `.env` variables in Railway → Service → Variables
3. Set:
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NODE_ENV=production
   ```
4. Railway will auto-detect Next.js and run `npm run build` + `npm start`
5. After first deploy, run the migration:
   ```bash
   railway run npx prisma migrate deploy
   ```

---

## 7. Custom Domain

1. Railway → Service → Settings → Custom Domain → add your domain
2. Point your DNS `CNAME` to Railway's provided hostname
3. SSL is automatic

---

## 8. Cron Job (Automated Reminders)

The daily reminder cron hits `POST /api/cron/reminders` with `Authorization: Bearer {CRON_SECRET}`.

Options:
- **Railway Cron**: Create a new Railway service → Cron job → `curl -X POST https://yourdomain.com/api/cron/reminders -H "Authorization: Bearer $CRON_SECRET"` — schedule `0 8 * * *` (8am daily)
- **Upstash QStash**: Free tier, easy HTTP cron
- **GitHub Actions**: Free for public repos

---

## 9. Post-Launch: Stripe Connect Plan Limits

In `lib/stripe.ts`, the trial plan allows 3 units. Adjust `PLAN_LIMITS` as needed:
```ts
export const PLAN_LIMITS = {
  trial: 3,    // units allowed during trial
  starter: 5,
  grow: 20,
  portfolio: Infinity,
  cancelled: 0,
};
```

---

## 10. Optional: CSV Data Import for Cozy Migrants

The spec calls for a CSV import flow at onboarding. The API endpoint skeleton is not built yet — this is a good first feature to add post-launch to capture Cozy migrants. The import format should accept: tenant name, email, phone, property address, unit number, monthly rent, lease start, lease end.

---

## Quick Start (Dev)

```bash
# 1. Fill in .env
# 2. Run migration
npx prisma migrate dev --name init

# 3. Start dev server
npm run dev
```

App runs at `http://localhost:3000`

---

## File Structure Reference

```
lib/
  prisma.ts          — Prisma client singleton
  firebase.ts        — Firebase client SDK (lazy init)
  firebase-admin.ts  — Firebase Admin SDK (lazy init)
  auth.ts            — getServerUser() / requireServerUser()
  tenant-auth.ts     — getTenantUser() / signTenantToken() / sendTenantPortalInvite()
  stripe.ts          — Stripe client (lazy init) + plan limits
  resend.ts          — Resend client (lazy init)
  rent.ts            — generateMonthlyRent() / applyLateFees()
  utils.ts           — formatCurrency, formatDate, etc.

app/
  (marketing)/page.tsx        — Landing page
  (auth)/login|signup/        — Auth pages
  (app)/dashboard/            — All landlord-facing pages
  tenant-portal/              — Tenant-facing portal
  api/
    session/                  — Firebase session cookie
    tenant-session/           — Tenant JWT cookie
    webhooks/stripe/          — Stripe webhook handler
    cron/reminders/           — Daily automated reminders
    billing/checkout|portal/  — Stripe SaaS billing
    connect/onboard|create-payment/ — Stripe Connect
    landlord/                 — Internal API (units, tenants, leases for client components)
    tenant/maintenance/       — Tenant submits maintenance request
```
