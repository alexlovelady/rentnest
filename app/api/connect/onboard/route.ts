import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let connectId = user.stripeConnectId;

  if (!connectId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      metadata: { landlordId: user.id },
    });
    connectId = account.id;
    await prisma.landlord.update({ where: { id: user.id }, data: { stripeConnectId: connectId } });
  }

  const link = await stripe.accountLinks.create({
    account: connectId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connect=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
