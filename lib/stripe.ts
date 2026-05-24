import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

// Keep backward-compatible named export for files that imported `stripe`
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLAN_LIMITS: Record<string, number> = {
  trial: 3,
  starter: 5,
  grow: 20,
  portfolio: Infinity,
  cancelled: 0,
};

export const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER!,
  grow: process.env.STRIPE_PRICE_ID_GROW!,
  portfolio: process.env.STRIPE_PRICE_ID_PORTFOLIO!,
};
