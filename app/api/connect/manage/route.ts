import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.stripeConnectId) return NextResponse.json({ error: "No connected account" }, { status: 400 });

  try {
    const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectId);
    return NextResponse.json({ url: loginLink.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[connect/manage]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
