import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lease = await prisma.lease.findUnique({
    where: { id: session.leaseId },
    include: { unit: { include: { property: true } } },
  });

  if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
  if (lease.securityDeposit <= 0) return NextResponse.json({ error: "No security deposit on this lease" }, { status: 400 });
  if (lease.securityDepositPaid) return NextResponse.json({ error: "Security deposit already paid" }, { status: 400 });

  const landlord = await prisma.landlord.findUnique({ where: { id: session.landlordId } });
  if (!landlord?.stripeConnectId || !landlord.stripeConnectReady) {
    return NextResponse.json({ error: "Landlord has not set up online payments" }, { status: 400 });
  }

  // Return cached URL if it exists
  if (lease.stripeDepositUrl) {
    return NextResponse.json({ url: lease.stripeDepositUrl });
  }

  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
  let amountCents = Math.round(lease.securityDeposit * 100);

  if (landlord.feePassthrough) {
    const grossAmount = (lease.securityDeposit + 0.30) / (1 - 0.029);
    amountCents = Math.round(grossAmount * 100);
  }

  const paymentLink = await stripe.paymentLinks.create(
    {
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `Security Deposit — ${addr}`,
            description: `Security deposit for lease at ${addr}`,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: { metadata: { depositLeaseId: lease.id } },
      metadata: { depositLeaseId: lease.id },
      after_completion: {
        type: "redirect",
        redirect: { url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant-portal?deposit_paid=1` },
      },
    },
    { stripeAccount: landlord.stripeConnectId }
  );

  await prisma.lease.update({
    where: { id: lease.id },
    data: { stripeDepositUrl: paymentLink.url },
  });

  return NextResponse.json({ url: paymentLink.url });
}
