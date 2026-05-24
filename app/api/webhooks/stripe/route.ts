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

  // Rent payment webhook (from Stripe Connect)
  if (connectAccountId) {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const rentPaymentId = pi.metadata?.rentPaymentId;
      if (rentPaymentId) {
        const payment = await prisma.rentPayment.update({
          where: { id: rentPaymentId },
          data: {
            status: "paid",
            paidAt: new Date(),
            stripePaymentId: pi.id,
          },
          include: { lease: { include: { unit: { include: { property: true } } } }, tenant: true },
        });

        // Send receipt to tenant
        if (payment.tenant?.email) {
          const { resend, FROM } = await import("@/lib/resend");
          const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;
          await resend.emails.send({
            from: FROM,
            to: payment.tenant.email,
            subject: `Rent payment confirmed — ${addr}`,
            html: `<p>Hi ${payment.tenant.name},</p><p>We received your rent payment of <strong>$${payment.totalAmount.toFixed(2)}</strong> for ${addr}. Thank you!</p>`,
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  // SaaS billing webhooks
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
      await prisma.landlord.update({ where: { id: landlordId }, data: { stripeId } });
    }
  }

  return NextResponse.json({ ok: true });
}
