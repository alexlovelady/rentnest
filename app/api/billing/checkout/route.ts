import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  let stripeId = user.stripeId;

  if (!stripeId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { landlordId: user.id } });
    stripeId = customer.id;
    await prisma.landlord.update({ where: { id: user.id }, data: { stripeId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    subscription_data: { trial_period_days: 14 },
    metadata: { landlordId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
