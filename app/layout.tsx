import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "RentNest — Online Rent Collection & Landlord Software",
    template: "%s | RentNest",
  },
  description:
    "Collect rent online, manage maintenance requests, store leases, and give tenants a portal. The simple property management software Cozy used to be — starting at $19/month.",
  keywords: [
    "landlord software",
    "online rent collection",
    "property management software",
    "tenant portal",
    "cozy alternative",
    "rent collection app",
    "small landlord software",
  ],
  authors: [{ name: "RentNest" }],
  creator: "RentNest",
  openGraph: {
    type: "website",
    siteName: "RentNest",
    title: "RentNest — Online Rent Collection & Landlord Software",
    description:
      "Collect rent online, manage maintenance requests, store leases, and give tenants a portal. Starting at $19/month. No per-lease fees, no percentage of rent.",
    url: APP_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "RentNest — Simple Landlord Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RentNest — Online Rent Collection & Landlord Software",
    description:
      "Collect rent online, manage maintenance, store leases, and give tenants a portal. Starting at $19/month. The simple software Cozy used to be.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body className="h-full antialiased font-sans bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
