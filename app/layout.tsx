import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "RentNest — Simple Landlord Software",
  description: "Collect rent online, track maintenance, store leases, and give your tenants a portal. The simple landlord software Cozy used to be.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body className="h-full antialiased font-sans bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
