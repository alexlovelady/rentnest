import Link from "next/link";
import { Check, Home, CreditCard, Wrench, FileText, BarChart2, Bell } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#FDFAF5] text-[#1A2332]">
      {/* Nav */}
      <nav className="border-b border-[#1A2332]/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg text-[#1A2332]">RentNest</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#1A2332]">Sign in</Link>
            <Link href="/signup" className="bg-[#C4622D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a8522a] transition">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
          The simple landlord software Cozy used to be.
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Collect rent online, track maintenance, store leases, and give your tenants a portal — for $19 a month.
          No per-lease fees. No percentage of rent. Ever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/signup" className="w-full sm:w-auto bg-[#C4622D] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#a8522a] transition shadow-sm text-center">
            Start Free 14-Day Trial
          </Link>
          <a href="#features" className="text-[#1A2332] text-base sm:text-lg hover:text-[#C4622D] transition">
            See how it works →
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-8 text-sm text-gray-500">
          {["No per-lease fees", "No % of rent", "Cancel anytime", "Free 14-day trial"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check size={13} className="text-[#5B7B5E] flex-shrink-0" />{t}
            </span>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "📊", title: "Spreadsheets aren't built for this", body: "Tracking rent payments, security deposits, and expenses across multiple units in Excel means something always falls through the cracks." },
              { icon: "📧", title: "Payment requests are embarrassing", body: "Texting your tenant a Venmo link every month is fine when you have one unit. At three, it's chaos." },
              { icon: "🔧", title: "Maintenance requests disappear", body: "A tenant texts you about a leak, you forget to follow up, and three weeks later you have a water damage claim." },
            ].map((p) => (
              <div key={p.title} className="text-center">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cozy callout — strategic marketing asset */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#FFF8F0] border border-[#C4622D]/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
              Used Cozy before Apartments.com changed it?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You&apos;ll feel right at home. RentNest does what Cozy did — simple rent collection, tenant communication,
              and document storage — with no ads, no upsells, and no one trying to list your properties on their site.
              We built RentNest because the small landlord deserves better than what the big portals want to give them.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 mt-5 bg-[#C4622D] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#a8522a] transition">
              Try RentNest Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              One flat monthly fee covers every feature. No add-ons, no per-unit pricing, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: CreditCard,
                badge: "Most popular",
                title: "Online rent collection",
                body: "Tenants pay by bank transfer or card through their portal. Money goes straight to your account. No percentage taken — only standard Stripe card processing fees when tenants pay by card.",
                callouts: ["Automated payment reminders", "Late fee tracking", "Full payment history"],
              },
              {
                icon: Home,
                title: "Tenant portal",
                body: "Every tenant gets a link to their portal: pay rent, submit maintenance requests, view their lease. Fewer texts to you. Works on any phone — no app download required.",
                callouts: ["No app to download", "One-click access via email", "Mobile-first design"],
              },
              {
                icon: Wrench,
                title: "Maintenance tracking",
                body: "Tenants submit requests with details and photos. You get notified, schedule a vendor, track the cost, and close it out. Every unit's full history is always there.",
                callouts: ["Photo attachments", "Vendor & cost tracking", "Status updates to tenants"],
              },
              {
                icon: BarChart2,
                title: "Expense tracking & reports",
                body: "Log every repair, mortgage payment, insurance bill, and supply purchase by Schedule E category. At year end, export your report. Your accountant will thank you.",
                callouts: ["Schedule E categories", "Per-property filtering", "CSV export"],
              },
              {
                icon: FileText,
                title: "Document storage",
                body: "Leases, addendums, inspection reports, and insurance certificates — all stored and organized by property. Share documents with tenants directly from the portal.",
                callouts: ["Lease & addendum storage", "Per-unit organization", "Tenant-visible docs"],
              },
              {
                icon: Bell,
                title: "Automated reminders",
                body: "Rent due soon? We remind your tenants automatically. Late payments get a follow-up. You stay informed without having to chase anyone.",
                callouts: ["Due-date reminders", "Overdue follow-ups", "Configurable timing"],
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#FDFAF5] rounded-2xl p-6 border border-[#1A2332]/8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C4622D]/10 flex items-center justify-center flex-shrink-0">
                    <f.icon size={18} className="text-[#C4622D]" />
                  </div>
                  <div>
                    {f.badge && (
                      <span className="bg-[#C4622D]/10 text-[#C4622D] text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 inline-block">{f.badge}</span>
                    )}
                    <h3 className="font-bold text-[#1A2332]" style={{ fontFamily: "var(--font-lora, serif)" }}>{f.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{f.body}</p>
                <ul className="space-y-1.5">
                  {f.callouts.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-xs text-gray-500">
                      <Check size={12} className="text-[#5B7B5E] flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 px-6 bg-[#FDFAF5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>Simple pricing</h2>
          <p className="text-gray-500 mb-12">All plans include every feature. No per-lease fees. No percentage of rent.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {[
              { id: "starter", name: "Starter", price: "$19", period: "/month", units: "Up to 5 units", features: ["All features included", "Tenant portal", "Online rent collection", "Document storage", "Maintenance tracking"] },
              { id: "grow", name: "Grow", price: "$49", period: "/month", units: "Up to 20 units", features: ["Everything in Starter", "Up to 20 units", "Income & expense reports", "Schedule E export"], highlight: true },
              { id: "portfolio", name: "Portfolio", price: "$99", period: "/month", units: "Unlimited units", features: ["Everything in Grow", "Unlimited units", "Priority support", "CSV data export"] },
            ].map((plan) => (
              <div key={plan.id} className={`rounded-2xl p-6 border ${plan.highlight ? "bg-[#1A2332] text-white border-[#1A2332] shadow-xl sm:-mt-4 sm:-mb-4" : "bg-white border-gray-200"}`}>
                {plan.highlight && (
                  <p className="text-xs font-semibold text-[#C4622D] mb-2 uppercase tracking-wide">Most popular</p>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-[#1A2332]"}`}>{plan.name}</h3>
                <div className="flex items-end gap-0.5 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-gray-300" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-gray-300" : "text-gray-500"}`}>{plan.units}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-gray-200" : "text-gray-600"}`}>
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-[#C4622D]" : "text-[#5B7B5E]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-3 rounded-xl font-medium transition ${plan.highlight ? "bg-[#C4622D] text-white hover:bg-[#a8522a]" : "border border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white"}`}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-10">All plans include a 14-day free trial. No credit card required. Cancel any time.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-lora, serif)" }}>What landlords are saying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { quote: "I was still using a Google Sheet and Venmo. Setting up RentNest took 20 minutes. My tenants actually prefer paying online.", name: "David K.", detail: "3-unit landlord, Austin TX" },
            { quote: "The maintenance tracking is worth it alone. I used to miss things. Now every request has a paper trail.", name: "Michelle T.", detail: "7-unit landlord, Columbus OH" },
            { quote: "I switched from Cozy when Apartments.com made it basically unusable. This is exactly what I needed.", name: "Ray S.", detail: "4-unit landlord, Denver CO" },
          ].map((t) => (
            <div key={t.name} className="bg-[#FDFAF5] rounded-2xl p-6 border border-[#1A2332]/10">
              <p className="text-sm text-gray-700 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm font-semibold text-[#1A2332]">{t.name}</p>
              <p className="text-xs text-gray-400">{t.detail}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 px-6 bg-[#FDFAF5]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-lora, serif)" }}>Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Does RentNest take a percentage of my rent?", a: "No, never. You pay a flat monthly subscription. That's it. We built RentNest because small landlords deserve a tool that doesn't take a cut of their income." },
              { q: "What does my tenant need to use the portal?", a: "Just an email address. They get a link and can access it without creating an account. No app to download, no new password to remember." },
              { q: "How does online rent collection work?", a: "We use Stripe to process payments. Tenants pay by bank transfer (ACH) or card. Funds go to your connected bank account within 2 business days. Standard Stripe processing fees apply — we take nothing." },
              { q: "Can I use RentNest if I only have one unit?", a: "Yes. The Starter plan at $19/month covers up to 5 units, so you're getting good value even if you only have one." },
              { q: "Can I import data from Cozy or TurboTenant?", a: "Yes. We support CSV import for tenant and payment history. Contact us after signing up and we'll help you migrate." },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-[#1A2332]/10 pb-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1A2332] text-white py-16 sm:py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>Ready to run a cleaner rental business?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">Join landlords who replaced the spreadsheet and Venmo requests with something that actually works.</p>
        <Link href="/signup" className="bg-[#C4622D] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#a8522a] transition inline-block">
          Start Free Trial — No Credit Card Required
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDFAF5] border-t border-[#1A2332]/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <span className="font-bold text-[#1A2332]">RentNest</span>
          <span>© 2026 RentNest. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
