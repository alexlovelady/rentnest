# RentNest

A property-management web app for small landlords: track properties, units, tenants and leases, collect rent, handle maintenance, and screen applicants, with a separate portal for tenants.

Built with Next.js (App Router), TypeScript, Tailwind CSS 4, Prisma (PostgreSQL), Firebase Auth, Stripe (including Connect), and Resend for email. This is a portfolio project and is not a hosted product.

## What it covers

- **Portfolio:** landlords, properties and units, tenants, leases with co-tenants
- **Money:** rent payments, expenses, security-deposit deductions, reports
- **Leases:** generated PDFs, e-signature links, lease addenda with their own signatures
- **Maintenance:** requests and comments, vendor management
- **Tenant portal:** separate tenant login, documents, messages, maintenance requests
- **Screening and listings:** public listings, applicant screening quizzes with co-applicants, move-in/move-out inspection reports
- **Compliance records:** eviction records and tenant-visibility controls
- **Background jobs:** cron endpoints and Stripe webhooks under `app/api`

The data model lives in `prisma/schema.prisma`.

## Running it locally

1. Install dependencies: `npm install`
2. Create a `.env.local` with your own Firebase, Stripe, Resend and PostgreSQL settings. No keys are included in this repository.
3. Apply the schema: `npx prisma migrate dev`
4. Start the dev server: `npm run dev`

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Notes

`docs/testing-checklist.md` lists the manual test flows. `CLAUDE.md` and `AGENTS.md` describe how AI coding agents were used on this codebase.

By Alexander Lovelady, [alexanderlovelady.com/portfolio](https://alexanderlovelady.com/portfolio).
