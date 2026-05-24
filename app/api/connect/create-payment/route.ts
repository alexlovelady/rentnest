import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";

// Tenant calls this from portal to get a payment link for their current rent
export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rentPaymentId } = await req.json();

  const payment = await prisma.rentPayment.findUnique({
    where: { id: rentPaymentId },
    include: { lease: { include: { unit: { include: { property: true } } } } },
  });

  if (!payment || payment.status === "paid") {
    return NextResponse.json({ error: "Payment not found or already paid" }, { status: 400 });
  }

  // Verify this payment belongs to the authenticated tenant's lease
  if (payment.leaseId !== session.leaseId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const landlord = await prisma.landlord.findUnique({ where: { id: session.landlordId } });
  if (!landlord?.stripeConnectId || !landlord.stripeConnectReady) {
    return NextResponse.json({ error: "Landlord has not set up online payments" }, { status: 400 });
  }

  const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;

  // Gross-up amount if landlord passes Stripe processing fee to tenant
  let amountCents = Math.round(payment.totalAmount * 100);
  let productDescription = `${new Date(payment.periodYear, payment.periodMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}`;
  if (landlord.feePassthrough) {
    // Stripe fee: 2.9% + $0.30 — solve for gross amount so landlord receives exactly totalAmount
    const grossAmount = (payment.totalAmount + 0.30) / (1 - 0.029);
    amountCents = Math.round(grossAmount * 100);
    productDescription += " (includes Stripe processing fee)";
  }

  // TODO: migrate to PaymentIntent with transfer_data.destination for Stripe Connect v2
  // For now, using Payment Links for simplicity
  const paymentLink = await stripe.paymentLinks.create(
    {
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: `Rent — ${addr}`, description: productDescription },
        },
        quantity: 1,
      }],
      payment_intent_data: { metadata: { rentPaymentId: payment.id } },
      metadata: { rentPaymentId: payment.id },
      after_completion: { type: "redirect", redirect: { url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant-portal?paid=1` } },
    },
    { stripeAccount: landlord.stripeConnectId }
  );

  await prisma.rentPayment.update({
    where: { id: payment.id },
    data: { stripePaymentUrl: paymentLink.url },
  });

  return NextResponse.json({ url: paymentLink.url });
}
