import type { Metadata } from "next";
import Link from "next/link";
import { Check, Home, CreditCard, Wrench, FileText, BarChart2, Bell, ArrowRight } from "lucide-react";

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
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, never. You pay a flat monthly subscription. That's it. We built RentNest because small landlords deserve a tool that doesn't take a cut of their income.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a free trial? Do I need a credit card?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Every new account gets a 14-day free trial with no credit card required. Trial accounts support up to 3 units. Add your card only when you're ready to subscribe. If you don't — no charge, no hassle.",
          },
        },
        {
          "@type": "Question",
          name: "What does my tenant need to use the portal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Just an email address. You send them a portal invite and they click the link — no account to create, no app to download, no new password to remember.",
          },
        },
        {
          "@type": "Question",
          name: "How does online rent collection work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We use Stripe to process payments. Tenants pay by card through their portal. Funds go to your connected bank account typically within 2 business days. Standard card processing fees apply (2.9% + $0.30) — we take nothing. You can optionally pass the processing fee through to your tenant so you always receive the full rent amount.",
          },
        },
        {
          "@type": "Question",
          name: "What if my tenant pays by check or cash?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No problem. You can record offline payments manually in your dashboard. Online payment through the portal is available but never required — tenants can keep paying however works for them.",
          },
        },
        {
          "@type": "Question",
          name: "Can I cancel anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Cancel your subscription at any time from your account settings — no contracts, no cancellation fees. Your account stays active through the end of your current billing period.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use RentNest if I only have one unit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Starter plan at $19/month covers up to 5 units, so you're getting good value even with a single rental. All features are included on every plan.",
          },
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
      <div className="bg-cream text-slate-dark">

        {/* Nav — cream, sticky */}
        <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-slate-dark/10 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="RentNest" className="h-9 w-auto" />
              <span className="font-bold text-slate-dark text-lg" style={{ fontFamily: "var(--font-lora, serif)" }}>RentNest</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-slate-dark transition">Sign in</Link>
              <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition">
                Start Free Trial
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero — dark, bold */}
        <section className="bg-slate-dark text-white px-6 py-20 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              No percentage of rent. No per-lease fees. Ever.
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
              The simple landlord software Cozy used to be.
            </h1>
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Collect rent online, track maintenance, store leases, and give your tenants a portal — for $19 a month.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/signup" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition shadow-lg text-center">
                Start Free 14-Day Trial
              </Link>
              <a href="#features" className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm">
                See how it works <ArrowRight size={14} />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm text-white/40">
              {["No per-lease fees", "No % of rent", "Cancel anytime", "Free 14-day trial"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-sage shrink-0" />{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-gray-100 text-center">
            {[
              { stat: "$0", label: "Per-lease fees" },
              { stat: "$19/mo", label: "Starting price" },
              { stat: "14 days", label: "Free trial" },
            ].map((s) => (
              <div key={s.label} className="px-4 sm:px-8">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-1">{s.stat}</p>
                <p className="text-xs sm:text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="py-16 sm:py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Sound familiar?</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Managing rentals without the right tools is exhausting.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: "📊", title: "Spreadsheets aren't built for this", body: "Tracking rent payments, security deposits, and expenses across multiple units in Excel means something always falls through the cracks." },
                { icon: "📧", title: "Payment requests are embarrassing", body: "Texting your tenant a Venmo link every month is fine when you have one unit. At three, it's chaos." },
                { icon: "🔧", title: "Maintenance requests disappear", body: "A tenant texts you about a leak, you forget to follow up, and three weeks later you have a water damage claim." },
              ].map((p) => (
                <div key={p.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-bold mb-2 text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cozy callout */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-primary/20">
              <div className="bg-primary px-8 py-3">
                <p className="text-white text-sm font-medium">For former Cozy users</p>
              </div>
              <div className="bg-[#FFF8F0] px-8 py-7">
                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
                  Used Cozy before Apartments.com changed it?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  You&apos;ll feel right at home. RentNest does what Cozy did — simple rent collection, tenant communication,
                  and document storage — with no ads, no upsells, and no one trying to list your properties on their site.
                  We built RentNest because the small landlord deserves better than what the big portals want to give them.
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition">
                  Try RentNest Free →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features — 3-col grid, clean hover cards */}
        <section id="features" className="py-16 sm:py-24 px-6 bg-cream">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                One flat monthly fee. Every feature. No surprises.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: CreditCard,
                  badge: "Most popular",
                  title: "Online rent collection",
                  body: "Tenants pay by card through their portal and money lands in your account within 2 business days. No chasing, no Venmo, no percentage taken.",
                },
                {
                  icon: Home,
                  badge: null,
                  title: "Tenant portal",
                  body: "Send your tenant a link — no app or account required. From their portal they can pay rent, submit maintenance requests, and view their lease.",
                },
                {
                  icon: Wrench,
                  badge: null,
                  title: "Maintenance tracking",
                  body: "Tenants submit requests with photos. You get notified, assign a vendor, track the cost, and close it out. Every unit's full history stays organized.",
                },
                {
                  icon: BarChart2,
                  badge: null,
                  title: "Expense tracking & reports",
                  body: "Log repairs, mortgage payments, insurance, and supplies by Schedule E category. Export a CSV at year end. Your accountant will thank you.",
                },
                {
                  icon: FileText,
                  badge: null,
                  title: "Document storage",
                  body: "Leases, addendums, inspection reports, and insurance certificates — stored and organized by property. Share directly with tenants from their portal.",
                },
                {
                  icon: Bell,
                  badge: null,
                  title: "Automated reminders",
                  body: "Tenants get reminders before rent is due. Late payments trigger follow-ups automatically. You stay informed without having to chase anyone.",
                },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <f.icon size={20} className="text-primary" />
                    </div>
                    {f.badge && (
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{f.badge}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-lora, serif)" }}>{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-24 px-6 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>Simple pricing</h2>
              <p className="text-gray-500 text-lg max-w-sm mx-auto">Scale up as you grow. Every plan includes every feature.</p>
            </div>

            {/* What's included */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 sm:px-10 py-7 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 text-center">Every plan includes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
                {[
                  "Online rent collection",
                  "Tenant portal",
                  "Maintenance tracking",
                  "Expense tracking & reports",
                  "Document storage",
                  "Automated reminders",
                  "Late fee tracking",
                  "CSV data export",
                  "Full payment history",
                ].map((f) => (
                  <span key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={13} className="text-sage shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "starter", name: "Starter", price: "$19", units: "Up to 5 units", desc: "Perfect for your first rental", extra: "", highlight: false },
                { id: "grow", name: "Grow", price: "$49", units: "Up to 20 units", desc: "For growing portfolios", extra: "", highlight: true },
                { id: "portfolio", name: "Portfolio", price: "$99", units: "Unlimited units", desc: "No unit cap, ever", extra: "Priority support included", highlight: false },
              ].map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 border flex flex-col ${plan.highlight ? "bg-slate-dark border-slate-dark shadow-2xl sm:-mt-3 sm:-mb-3" : "bg-white border-gray-200"}`}
                >
                  {plan.highlight && (
                    <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Most popular</p>
                  )}
                  <p className="text-sm mb-3 text-gray-400">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-slate-dark"}`}>{plan.price}</span>
                    <span className="text-sm text-gray-400">/mo</span>
                  </div>
                  <p className={`font-semibold mb-1 ${plan.highlight ? "text-white" : "text-slate-dark"}`}>{plan.units}</p>
                  <p className={`text-sm flex-1 mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
                  {plan.extra && (
                    <p className={`flex items-center gap-1.5 text-xs mb-4 ${plan.highlight ? "text-gray-300" : "text-gray-500"}`}>
                      <Check size={11} className={plan.highlight ? "text-primary" : "text-sage"} />
                      {plan.extra}
                    </p>
                  )}
                  <Link
                    href="/signup"
                    className={`block text-center py-3 rounded-xl font-semibold transition text-sm ${plan.highlight ? "bg-primary text-white hover:bg-primary-dark" : "border-2 border-primary text-primary hover:bg-primary hover:text-white"}`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 text-center mt-10">All plans include a 14-day free trial · No credit card required · Cancel any time</p>
            <p className="text-xs text-gray-400 text-center mt-2">Trial accounts are limited to 3 units.</p>
          </div>
        </section>

        {/* FAQ — 2 columns on desktop */}
        <section className="py-16 sm:py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "var(--font-lora, serif)" }}>Questions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8">
              {[
                { q: "Does RentNest take a percentage of my rent?", a: "No, never. You pay a flat monthly subscription. That's it. We built RentNest because small landlords deserve a tool that doesn't take a cut of their income." },
                { q: "Is there a free trial? Do I need a credit card?", a: "Every new account gets a 14-day free trial with no credit card required. Trial accounts support up to 3 units — enough to kick the tires on your setup. Add your card only when you're ready to subscribe. If you don't — no charge, no hassle." },
                { q: "What does my tenant need to use the portal?", a: "Just an email address. You send them a portal invite and they click the link — no account to create, no app to download, no new password to remember." },
                { q: "How does online rent collection work?", a: "We use Stripe to process payments. Tenants pay by card through their portal. Funds go to your connected bank account typically within 2 business days. Standard card processing fees apply (2.9% + $0.30) — we take nothing. You can optionally pass the processing fee through to your tenant so you always receive the full rent amount." },
                { q: "What if my tenant pays by check or cash?", a: "No problem. You can record offline payments manually in your dashboard. Online payment through the portal is available but never required — tenants can keep paying however works for them." },
                { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time from your account settings — no contracts, no cancellation fees. Your account stays active through the end of your current billing period." },
                { q: "Can I use RentNest if I only have one unit?", a: "Yes. The Starter plan at $19/month covers up to 5 units, so you're getting good value even with a single rental. All features are included on every plan." },
              ].map((faq) => (
                <div key={faq.q} className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold mb-2 text-gray-900">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA — dot-grid texture */}
        <section className="bg-slate-dark text-white py-20 sm:py-28 px-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>
              Ready to run a cleaner rental business?
            </h2>
            <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
              Join landlords who replaced the spreadsheet and Venmo requests with something that actually works.
            </p>
            <Link href="/signup" className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition inline-block">
              Start Free Trial — No Credit Card Required
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-cream border-t border-slate-dark/10 px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <img src="/logo.jpg" alt="RentNest" className="h-7 w-auto" />
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-gray-600 transition">Sign in</Link>
              <Link href="/signup" className="hover:text-gray-600 transition">Get started</Link>
            </div>
            <span>© 2026 RentNest. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
