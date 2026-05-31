import type { Metadata } from "next";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Start Free Trial",
  description: "Create your RentNest account. 14 days free, no credit card required. Collect rent online, manage maintenance, and give tenants a portal.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app"}/signup` },
};

export default function SignupPage() {
  return <SignupClient />;
}
