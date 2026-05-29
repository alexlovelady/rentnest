import type { Metadata } from "next";
import { LandingClient } from "./landing-client";

export const metadata: Metadata = {
  title: {
    absolute: "RentNest — The Simple Landlord Software Cozy Used to Be",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "RentNest",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app",
      description:
        "Online rent collection, maintenance tracking, lease storage, and tenant portal for small landlords. Starting at $19/month. No per-lease fees.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "19",
        highPrice: "99",
        priceCurrency: "USD",
        offerCount: "3",
      },
      featureList: [
        "Online rent collection",
        "Tenant portal",
        "Maintenance request tracking",
        "Document storage",
        "Expense tracking",
        "Automated payment reminders",
        "Late fee tracking",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does RentNest take a percentage of my rent?",
          acceptedAnswer: { "@type": "Answer", text: "No, never. You pay a flat monthly subscription. That's it." },
        },
        {
          "@type": "Question",
          name: "Is there a free trial? Do I need a credit card?",
          acceptedAnswer: { "@type": "Answer", text: "Every new account gets a 14-day free trial with no credit card required. Trial accounts support up to 3 units." },
        },
        {
          "@type": "Question",
          name: "What does my tenant need to use the portal?",
          acceptedAnswer: { "@type": "Answer", text: "Just an email address. You send them a portal invite and they click the link — no account to create, no app to download." },
        },
        {
          "@type": "Question",
          name: "How does online rent collection work?",
          acceptedAnswer: { "@type": "Answer", text: "We use Stripe to process payments. Funds go to your connected bank account within 2 business days. Standard card fees apply (2.9% + $0.30) — we take nothing." },
        },
        {
          "@type": "Question",
          name: "Can I cancel anytime?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel from your account settings at any time — no contracts, no cancellation fees." },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  );
}
