import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const connectAccountId = req.headers.get("stripe-account");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Rent + deposit webhooks (from Stripe Connect accounts) ────────────────
  if (connectAccountId) {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;

      // Rent payment
      const rentPaymentId = pi.metadata?.rentPaymentId;
      if (rentPaymentId) {
        const payment = await prisma.rentPayment.update({
          where: { id: rentPaymentId },
          data: { status: "paid", paidAt: new Date(), stripePaymentId: pi.id },
          include: { lease: { include: { unit: { include: { property: true } } } }, tenant: true },
        });

        if (payment.tenant?.email) {
          const { resend, FROM } = await import("@/lib/resend");
          const { emailBase, greeting, ep, detailTable, alertBox } = await import("@/lib/email");
          const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;
          await resend.emails.send({
            from: FROM,
            to: payment.tenant.email,
            subject: `Rent payment confirmed — ${addr}`,
            html: emailBase(
              alertBox("Your rent payment has been received. Thank you!", "success") +
              greeting(payment.tenant.name) +
              ep(`This confirms your rent payment for <strong>${addr}</strong>.`) +
              detailTable([
                ["Amount paid", `$${payment.totalAmount.toFixed(2)}`],
                ["Property", addr],
                ["Date", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
              ])
            ),
          });
        }
      }

      // Security deposit payment
      const depositLeaseId = pi.metadata?.depositLeaseId;
      if (depositLeaseId) {
        const lease = await prisma.lease.update({
          where: { id: depositLeaseId },
          data: { securityDepositPaid: true, securityDepositPaidAt: new Date() },
          include: {
            unit: { include: { property: true } },
            tenants: { where: { isPrimary: true }, include: { tenant: true } },
          },
        });

        const primaryTenant = lease.tenants[0]?.tenant;
        if (primaryTenant?.email) {
          const { resend, FROM } = await import("@/lib/resend");
          const { emailBase, greeting, ep, detailTable, alertBox } = await import("@/lib/email");
          const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
          await resend.emails.send({
            from: FROM,
            to: primaryTenant.email,
            subject: `Security deposit received — ${addr}`,
            html: emailBase(
              alertBox("Your security deposit has been received. Thank you!", "success") +
              greeting(primaryTenant.name) +
              ep(`This confirms your security deposit payment for <strong>${addr}</strong>.`) +
              detailTable([
                ["Amount paid", `$${lease.securityDeposit.toFixed(2)}`],
                ["Property", addr],
                ["Date", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
              ])
            ),
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── SaaS billing webhooks (platform account) ─────────────────────────────

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const stripeId = sub.customer as string;
    const priceId = sub.items.data[0]?.price.id;
    let plan = "starter";
    if (priceId === process.env.STRIPE_PRICE_ID_GROW) plan = "grow";
    if (priceId === process.env.STRIPE_PRICE_ID_PORTFOLIO) plan = "portfolio";
    await prisma.landlord.updateMany({ where: { stripeId }, data: { plan } });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const stripeId = sub.customer as string;
    await prisma.landlord.updateMany({ where: { stripeId }, data: { plan: "cancelled" } });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeId = session.customer as string;
    const landlordId = session.metadata?.landlordId;

    if (landlordId && stripeId) {
      const landlord = await prisma.landlord.update({ where: { id: landlordId }, data: { stripeId } });

      // Determine plan from price ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceId = lineItems.data[0]?.price?.id;
      let plan = "starter";
      if (priceId === process.env.STRIPE_PRICE_ID_GROW) plan = "grow";
      if (priceId === process.env.STRIPE_PRICE_ID_PORTFOLIO) plan = "portfolio";

      // Airtable conversion tracking (fire-and-forget)
      ;(async () => {
        try {
          const { airtableFindByEmail, airtablePatch, airtableCreate, today } = await import("@/lib/airtable");
          const recordId = await airtableFindByEmail("Trial Signups", landlord.email);
          if (recordId) {
            await airtablePatch("Trial Signups", recordId, { "Converted Date": today(), Plan: plan });
          } else {
            await airtableCreate("Trial Signups", {
              Product: "RentNest",
              "Owner Name": landlord.name,
              Email: landlord.email,
              Date: today(),
              "Converted Date": today(),
              Plan: plan,
            });
          }
        } catch (err) {
          console.error("[webhook] Airtable conversion log failed:", err);
        }
      })();
    }
  }

  return NextResponse.json({ ok: true });
}
