"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check, CreditCard, Wrench, FileText, BarChart2, Bell,
  ArrowRight, Home, ShieldCheck, MessageSquare, ClipboardList,
  Building2, Wallet, Key,
} from "lucide-react";

const LANDLORD_FEATURES = [
  {
    icon: CreditCard,
    badge: "Most popular",
    title: "Online rent collection",
    body: "Tenants pay by card through their portal. Money lands in your account within 2 business days — no chasing, no Venmo, no percentage taken.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Home,
    badge: null,
    title: "Tenant portal",
    body: "Send your tenant a link — no app or account required. They can pay rent, submit maintenance requests, and view their lease from any device.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Wrench,
    badge: null,
    title: "Maintenance tracking",
    body: "Tenants submit requests with photos. Assign a vendor, track the cost, and close it out. Every unit's full history stays organized.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart2,
    badge: null,
    title: "Expense tracking & reports",
    body: "Log repairs by Schedule E category. Generate owner statements monthly. Export a CSV at year end — your accountant will thank you.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: FileText,
    badge: null,
    title: "Leases & documents",
    body: "Upload leases, send e-signature requests, and store addendums. Share documents directly with tenants from their portal.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Bell,
    badge: null,
    title: "Automated reminders",
    body: "Tenants get reminders before rent is due. Late payments trigger follow-ups automatically. You stay informed without having to chase anyone.",
    color: "bg-amber-50 text-amber-600",
  },
];

const TENANT_BENEFITS = [
  {
    icon: Wallet,
    title: "Pay rent in seconds",
    body: "Your landlord sends a link. You pay by card. Done. No checks, no Zelle requests, no awkward reminders.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Wrench,
    title: "Submit maintenance requests",
    body: "Describe the issue, attach photos, and submit. Your landlord gets notified instantly and you can track the status from open to resolved.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: FileText,
    title: "Access your documents",
    body: "Your lease, addendums, and any documents your landlord shares are all in one place — no digging through old emails.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Message your landlord",
    body: "Send and receive messages directly through your portal. Every conversation is logged so nothing gets lost in a text thread.",
    color: "bg-violet-50 text-violet-600",
  },
];

const PLANS = [
  { id: "starter", name: "Starter", price: "$19", units: "Up to 5 units", desc: "Perfect for your first rental", highlight: false },
  { id: "grow", name: "Grow", price: "$49", units: "Up to 20 units", desc: "For growing portfolios", highlight: true },
  { id: "portfolio", name: "Portfolio", price: "$99", units: "Unlimited units", desc: "No unit cap, ever", highlight: false },
];

const FAQS = [
  { q: "Does RentNest take a percentage of my rent?", a: "No, never. You pay a flat monthly subscription. That's it." },
  { q: "Is there a free trial? Do I need a credit card?", a: "Every new account gets a 14-day free trial with no credit card required. Trial accounts support up to 3 units." },
  { q: "What does my tenant need to use the portal?", a: "Just an email address. You send them a portal invite and they click the link — no account to create, no app to download." },
  { q: "How does online rent collection work?", a: "We use Stripe to process payments. Funds go to your connected bank account within 2 business days. Standard card processing fees apply (2.9% + $0.30) — we take nothing." },
  { q: "What if my tenant pays by check or cash?", a: "No problem. You can record offline payments manually. Online payment is available but never required." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings at any time — no contracts, no cancellation fees." },
];

export function LandingClient() {
  const [mode, setMode] = useState<"landlord" | "tenant">("landlord");
  const isLandlord = mode === "landlord";

  return (
    <div className="bg-cream text-slate-dark">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-slate-dark/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="RentNest" className="h-9 w-auto" />
            <span className="font-bold text-slate-dark text-lg" style={{ fontFamily: "var(--font-lora, serif)" }}>RentNest</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/listings" className="hidden sm:block text-sm text-gray-600 hover:text-slate-dark transition">Browse rentals</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-slate-dark transition">Sign in</Link>
            <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-dark text-white px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Toggle */}
          <div className="inline-flex bg-white/10 border border-white/20 rounded-full p-1 mb-10">
            <button
              onClick={() => setMode("landlord")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${isLandlord ? "bg-primary text-white shadow-md" : "text-white/60 hover:text-white"}`}
            >
              <Building2 size={14} /> For Landlords
            </button>
            <button
              onClick={() => setMode("tenant")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${!isLandlord ? "bg-primary text-white shadow-md" : "text-white/60 hover:text-white"}`}
            >
              <Key size={14} /> For Tenants
            </button>
          </div>

          {isLandlord ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/60 text-xs px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                No percentage of rent. No per-lease fees. Ever.
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
                The landlord software that <span className="text-primary">actually works</span> for you.
              </h1>
              <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                Collect rent online, track maintenance, store leases, and give your tenants a portal — all for $19 a month. No cuts. No surprises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/signup" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition shadow-lg text-center">
                  Start Free 14-Day Trial
                </Link>
                <a href="#features" className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm">
                  See all features <ArrowRight size={14} />
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm text-white/40">
                {["No per-lease fees", "No % of rent", "Cancel anytime", "Free 14-day trial"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={13} className="text-primary shrink-0" />{t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/60 text-xs px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                No app to download. No account to create.
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Renting made <span className="text-primary">refreshingly simple.</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                Pay rent, submit maintenance requests, and stay connected with your landlord — all from a single link. No passwords, no apps, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/listings" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition shadow-lg text-center">
                  Browse Available Rentals
                </Link>
                <a href="#tenant-features" className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm">
                  See how it works <ArrowRight size={14} />
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm text-white/40">
                {["No account needed", "Pay by card", "Track every request", "Message your landlord"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={13} className="text-primary shrink-0" />{t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stats strip — landlord only */}
      {isLandlord && (
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
      )}

      {/* Tenant how it works */}
      {!isLandlord && (
        <section id="tenant-features" className="bg-white py-16 sm:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Three steps to a stress-free rental.
              </h2>
              <p className="text-gray-500">Your landlord does the setup. You just click a link.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              {[
                { step: "1", icon: "📨", title: "Get your portal link", body: "Your landlord sends you a unique link by email. No app, no sign-up form, no password." },
                { step: "2", icon: "🔓", title: "Tap to open your portal", body: "One click and you're in. Your lease, balance, and open requests are right there." },
                { step: "3", icon: "✅", title: "Pay rent & stay on top", body: "Pay by card in seconds, submit maintenance photos, download documents, and message your landlord — all in one place." },
              ].map((s) => (
                <div key={s.step} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow">{s.step}</div>
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="font-bold mb-2 text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-lora, serif)" }}>Everything in your portal.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TENANT_BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                    <b.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Landlord problem section */}
      {isLandlord && (
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
                { icon: "📊", title: "Spreadsheets aren't built for this", body: "Tracking rent payments, deposits, and expenses across units in Excel means something always falls through the cracks." },
                { icon: "📧", title: "Payment requests are embarrassing", body: "Texting your tenant a Venmo link every month is fine at one unit. At three, it's chaos." },
                { icon: "🔧", title: "Maintenance requests disappear", body: "A tenant texts about a leak, you forget to follow up, and three weeks later you have a water damage claim." },
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
      )}

      {/* Landlord features */}
      {isLandlord && (
        <section id="features" className="py-16 sm:py-24 px-6 bg-cream">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Everything you need. Nothing you don't.
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">One flat monthly fee. Every feature. No surprises.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {LANDLORD_FEATURES.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${f.color}`}>
                      <f.icon size={20} />
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
      )}

      {/* Cozy callout — landlord only */}
      {isLandlord && (
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
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition">
                  Try RentNest Free →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tenant trust bar */}
      {!isLandlord && (
        <section className="bg-cream py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: ShieldCheck, title: "Secure payments", body: "Powered by Stripe — the same technology used by millions of businesses worldwide.", color: "text-emerald-600 bg-emerald-50" },
                { icon: Key, title: "No account needed", body: "Access your portal from a single link your landlord sends you. No password to create or forget.", color: "text-blue-600 bg-blue-50" },
                { icon: ClipboardList, title: "Always up to date", body: "Every payment, request, and message is logged automatically so there's never any confusion.", color: "text-violet-600 bg-violet-50" },
              ].map((t) => (
                <div key={t.title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${t.color}`}>
                    <t.icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing — landlord only */}
      {isLandlord && (
        <section id="pricing" className="py-16 sm:py-24 px-6 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>Simple pricing</h2>
              <p className="text-gray-500 text-lg max-w-sm mx-auto">Scale up as you grow. Every plan includes every feature.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-6 sm:px-10 py-7 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 text-center">Every plan includes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
                {["Online rent collection", "Tenant portal", "Maintenance tracking", "Expense tracking & reports", "Document storage", "Automated reminders", "Late fee tracking", "CSV data export", "Full payment history"].map((f) => (
                  <span key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={13} className="text-primary shrink-0" />{f}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`rounded-2xl p-7 border flex flex-col ${plan.highlight ? "bg-slate-dark border-slate-dark shadow-2xl sm:-mt-3 sm:-mb-3" : "bg-white border-gray-200"}`}>
                  {plan.highlight && <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Most popular</p>}
                  <p className="text-sm mb-3 text-gray-400">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-slate-dark"}`}>{plan.price}</span>
                    <span className="text-sm text-gray-400">/mo</span>
                  </div>
                  <p className={`font-semibold mb-1 ${plan.highlight ? "text-white" : "text-slate-dark"}`}>{plan.units}</p>
                  <p className={`text-sm flex-1 mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold transition text-sm ${plan.highlight ? "bg-primary text-white hover:bg-primary-dark" : "border-2 border-primary text-primary hover:bg-primary hover:text-white"}`}>
                    Start Free Trial
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-10">All plans include a 14-day free trial · No credit card required · Cancel any time</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "var(--font-lora, serif)" }}>Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold mb-2 text-gray-900">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-dark text-white py-20 sm:py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-2xl mx-auto">
          {isLandlord ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Ready to run a cleaner rental business?
              </h2>
              <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
                Join landlords who replaced the spreadsheet and Venmo requests with something that actually works.
              </p>
              <Link href="/signup" className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition inline-block shadow-lg">
                Start Free Trial — No Credit Card Required
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Find your next home.
              </h2>
              <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
                Browse available rentals listed by landlords on RentNest. See photos, pricing, and apply directly.
              </p>
              <Link href="/listings" className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition inline-block shadow-lg">
                Browse Available Rentals
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream border-t border-slate-dark/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <img src="/logo.jpg" alt="RentNest" className="h-7 w-auto" />
          <div className="flex items-center gap-6">
            <Link href="/listings" className="hover:text-gray-600 transition">Browse rentals</Link>
            <Link href="/login" className="hover:text-gray-600 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-600 transition">Get started</Link>
          </div>
          <span>© 2026 RentNest. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
