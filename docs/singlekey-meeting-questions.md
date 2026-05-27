# SingleKey Meeting Questions
## RentNest Integration Discovery Call

---

## Compliance & Legal (Most Critical)

1. **Adverse action notices** — When a landlord denies an applicant based on the report, FCRA requires a written adverse action notice. Does SingleKey generate and send this automatically, or is that RentNest's responsibility?

2. **FCRA permissible purpose** — Since RentNest is a platform (not the landlord), who holds FCRA liability — us, the landlord, or SingleKey? Do we need to sign a reseller/CRA agreement?

3. **State-specific restrictions** — Are there any states where you can't pull criminal or eviction data, or where additional disclosures are required? (e.g. California, New York have strict rules)

4. **Data retention** — How long do you retain report data? Are we required to delete it after a certain period? Who is responsible for data deletion requests?

5. **FCRA dispute process** — If an applicant disputes their report, who handles it — SingleKey or us?

---

## API & Technical

6. **Sandbox environment** — Is there a test/sandbox mode for development with dummy data?

7. **Webhook security** — How do we verify that webhook calls are genuinely from SingleKey? Is there a signing secret or HMAC signature?

8. **Webhook payload** — What data is included in the webhook vs what requires a separate GET call to fetch the full report?

9. **Incomplete screenings** — If an applicant never completes the SingleKey form after being redirected, does the request expire? What's the timeout, and do we get notified?

10. **Failure handling** — What happens if a check can't be completed (e.g. thin credit file, name not found)? What status/error comes back?

11. **Rate limits** — Are there any API rate limits we should design around?

12. **API versioning** — How do you handle breaking changes to the API? What's the deprecation process?

---

## Product & Pricing

13. **Who pays the fee** — Can we configure it so the tenant pays on some invites and the landlord pays on others? Or is it one or the other per account?

14. **API pricing** — Is the $29.99/report price the same at API level, or is there volume pricing?

15. **Platform fee** — Is there any monthly platform/partner fee on top of the per-report cost?

16. **White-labeling** — When the applicant is redirected to your hosted form, does it show SingleKey branding? Can it be customized or co-branded with RentNest?

17. **Multiple applicants** — Can multiple applicants (e.g. roommates, co-signers) be screened under one rental unit/invite?

---

## Account & Onboarding

18. **Account structure** — Does each landlord need their own SingleKey account, or does RentNest hold one API account and screen on behalf of landlords?

19. **Getting started** — What does the onboarding process look like for a SaaS partner? Is there a partner agreement to sign?

20. **Timeline** — How long does API access/onboarding typically take after the agreement is signed?

---

## Things to Have Ready for the Meeting

- Brief product demo or screenshots of RentNest
- Estimated volume (how many landlords, avg units per landlord)
- Tech stack (Next.js, Node, PostgreSQL on Railway)
- Confirm LLC name for any agreement paperwork
