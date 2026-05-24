import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || !user.stripeId) return NextResponse.json({ error: "No billing account" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
