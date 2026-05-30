"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Building2, Key, CreditCard, Wrench, FileText, BarChart2, Bell, ChevronRight } from "lucide-react";

// ─── Mini product mockups ────────────────────────────────────────────────────

function BrowserFrame({ children, url = "rentnest.app/dashboard" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-[#0d0d14]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#080810] border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        <div className="flex-1 mx-3 bg-white/5 rounded-md text-[10px] text-white/20 px-2.5 py-0.5">{url}</div>
      </div>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <BrowserFrame>
      <div className="flex h-[340px] text-[10px]">
        {/* Sidebar */}
        <div className="w-28 bg-[#12121e] border-r border-white/5 flex flex-col py-3 px-2 shrink-0">
          <div className="flex items-center gap-1.5 mb-5 px-1">
            <div className="w-5 h-5 rounded bg-primary/80 flex items-center justify-center">
              <Building2 size={10} className="text-white" />
            </div>
            <span className="text-white/80 font-bold text-[9px]">RentNest</span>
          </div>
          {["Overview", "Properties", "Tenants", "Leases", "Rent", "Maintenance", "Reports"].map((item, i) => (
            <div key={item} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-0.5 text-[9px] ${i === 0 ? "bg-primary text-white" : "text-white/40 hover:text-white/60"}`}>
              {item}
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-3 overflow-hidden">
          <p className="text-white/40 text-[9px] mb-2">May 2026</p>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { label: "Collected", val: "$8,400", color: "text-emerald-400" },
              { label: "Outstanding", val: "$1,650", color: "text-amber-400" },
              { label: "Overdue", val: "$0", color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-white/40 text-[8px] mb-0.5">{s.label}</p>
                <p className={`font-bold ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
          {/* Mini payments list */}
          <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
            <div className="px-2 py-1.5 border-b border-white/5 text-white/40 text-[8px] font-medium">Recent payments</div>
            {[
              { name: "Sarah M.", addr: "Unit 2A", amt: "$1,850", status: "paid", color: "bg-emerald-500/20 text-emerald-400" },
              { name: "James T.", addr: "Unit 1B", amt: "$1,400", status: "paid", color: "bg-emerald-500/20 text-emerald-400" },
              { name: "Amy K.", addr: "Unit 3C", amt: "$1,650", status: "pending", color: "bg-amber-500/20 text-amber-400" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between px-2 py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white/70 font-medium">{r.name}</p>
                  <p className="text-white/30 text-[8px]">{r.addr}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 font-medium">{r.amt}</p>
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${r.color}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function RentMockup() {
  return (
    <BrowserFrame url="rentnest.app/dashboard/rent">
      <div className="p-4 text-[10px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-sm">Rent Collection</p>
            <p className="text-white/40">May 2026</p>
          </div>
          <div className="flex gap-1.5">
            <div className="bg-primary text-white px-2.5 py-1 rounded-lg text-[9px] font-medium">+ Record Payment</div>
            <div className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg text-[9px]">Generate Charges</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Collected", val: "$8,400", bg: "bg-emerald-900/30 border-emerald-700/30 text-emerald-400" },
            { label: "Outstanding", val: "$1,650", bg: "bg-amber-900/30 border-amber-700/30 text-amber-400" },
            { label: "Prior unpaid", val: "$0", bg: "bg-red-900/30 border-red-700/30 text-red-400" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-2.5 border ${s.bg}`}>
              <p className="opacity-70 text-[8px] mb-0.5">{s.label}</p>
              <p className="font-bold text-sm">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-white/30 text-[8px]">
                <th className="text-left px-3 py-1.5">Property / Unit</th>
                <th className="text-left px-2 py-1.5">Tenant</th>
                <th className="text-right px-2 py-1.5">Amount</th>
                <th className="text-left px-2 py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { addr: "Oak St, Unit 2A", name: "Sarah M.", amt: "$1,850", status: "paid", c: "text-emerald-400 bg-emerald-500/10" },
                { addr: "Oak St, Unit 1B", name: "James T.", amt: "$1,400", status: "paid", c: "text-emerald-400 bg-emerald-500/10" },
                { addr: "Elm Ave, Unit 3C", name: "Amy K.", amt: "$1,650", status: "pending", c: "text-amber-400 bg-amber-500/10" },
              ].map((r) => (
                <tr key={r.name} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 text-white/60">{r.addr}</td>
                  <td className="px-2 py-2 text-white/60">{r.name}</td>
                  <td className="px-2 py-2 text-white/80 text-right font-medium">{r.amt}</td>
                  <td className="px-2 py-2"><span className={`text-[8px] px-2 py-0.5 rounded-full font-medium ${r.c}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BrowserFrame>
  );
}

function MaintenanceMockup() {
  return (
    <BrowserFrame url="rentnest.app/dashboard/maintenance">
      <div className="p-4 text-[10px] space-y-2.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-bold text-sm">Maintenance</p>
          <div className="bg-primary text-white px-2.5 py-1 rounded-lg text-[9px] font-medium">+ New Request</div>
        </div>
        {[
          { title: "Kitchen faucet leaking", unit: "Oak St · Unit 2A", cat: "Plumbing", status: "in progress", pri: "high", statusC: "bg-blue-500/20 text-blue-400", priC: "bg-red-500/20 text-red-400", date: "May 27" },
          { title: "HVAC not cooling", unit: "Elm Ave · Unit 3C", cat: "HVAC", status: "open", pri: "normal", statusC: "bg-amber-500/20 text-amber-400", priC: "bg-gray-500/20 text-gray-400", date: "May 29" },
          { title: "Broken window latch", unit: "Oak St · Unit 1B", cat: "Structural", status: "scheduled", pri: "normal", statusC: "bg-blue-500/20 text-blue-400", priC: "bg-gray-500/20 text-gray-400", date: "May 25" },
        ].map((r) => (
          <div key={r.title} className="bg-white/5 rounded-xl border border-white/5 p-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white/80 font-medium truncate">{r.title}</p>
              <p className="text-white/30 text-[8px] mt-0.5">{r.unit} · {r.cat} · {r.date}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${r.priC}`}>{r.pri}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${r.statusC}`}>{r.status}</span>
            </div>
          </div>
        ))}
        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 font-medium">Kitchen faucet leaking</p>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">in progress</span>
          </div>
          <p className="text-white/40 text-[8px] leading-relaxed">Vendor assigned: Mike's Plumbing · Scheduled May 31 · Estimated $180</p>
        </div>
      </div>
    </BrowserFrame>
  );
}

function DocumentsMockup() {
  return (
    <BrowserFrame url="rentnest.app/dashboard/leases/lease_01">
      <div className="p-4 text-[10px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-sm">Sarah Mitchell</p>
            <p className="text-white/40">Oak Street · Unit 2A · Active</p>
          </div>
          <div className="flex gap-1.5">
            <div className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg text-[9px]">Request Signature</div>
            <div className="bg-primary text-white px-2.5 py-1 rounded-lg text-[9px]">Upload Doc</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { name: "Lease Agreement 2026", type: "lease", signed: true, date: "Jan 1, 2026" },
            { name: "Move-In Inspection", type: "inspection", signed: true, date: "Jan 1, 2026" },
            { name: "Pet Addendum", type: "addendum", signed: true, date: "Jan 3, 2026" },
            { name: "Renters Insurance Certificate", type: "insurance", signed: false, date: "Jan 5, 2026" },
          ].map((d) => (
            <div key={d.name} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <FileText size={10} className="text-primary" />
                </div>
                <div>
                  <p className="text-white/70 font-medium">{d.name}</p>
                  <p className="text-white/30 text-[8px]">{d.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 capitalize">{d.type}</span>
                {d.signed && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✓ signed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function ReportsMockup() {
  const bars = [38, 52, 44, 61, 55, 72, 68, 80, 74, 88, 82, 95];
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  return (
    <BrowserFrame url="rentnest.app/dashboard/reports">
      <div className="p-4 text-[10px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-sm">Owner Statement</p>
            <p className="text-white/40">2026 · All properties</p>
          </div>
          <div className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg text-[9px]">Export CSV</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Total income", val: "$54,200", color: "text-emerald-400" },
            { label: "Total expenses", val: "$12,800", color: "text-red-400" },
            { label: "Net income", val: "$41,400", color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg p-2 border border-white/5">
              <p className="text-white/30 text-[8px] mb-0.5">{s.label}</p>
              <p className={`font-bold text-sm ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
          <p className="text-white/30 text-[8px] mb-3">Monthly rent collected</p>
          <div className="flex items-end gap-1 h-16">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm"
                  style={{ height: `${h}%`, background: i === 4 ? "#e07843" : "rgba(255,255,255,0.12)" }}
                />
                <span className="text-white/20 text-[7px]">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function TenantPortalMockup() {
  return (
    <div className="mx-auto w-64">
      {/* Phone frame */}
      <div className="bg-[#0d0d14] rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-[#080810]">
          <span className="text-white/40 text-[9px]">9:41</span>
          <div className="w-16 h-4 rounded-full bg-black mx-auto absolute left-1/2 -translate-x-1/2 mt-1" />
          <span className="text-white/40 text-[9px]">●●●</span>
        </div>
        {/* App header */}
        <div className="bg-[#12121e] border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white font-bold text-[11px]">RentNest</span>
          <span className="text-white/30 text-[9px]">Tenant Portal</span>
        </div>
        {/* Content */}
        <div className="p-3 space-y-2 text-[9px]">
          <div>
            <p className="text-white/40 text-[8px] mb-0.5">Hi, Sarah 👋</p>
            <p className="text-white/60 text-[8px]">Oak St, Unit 2A</p>
          </div>
          {/* Rent card */}
          <div className="bg-primary/15 border border-primary/30 rounded-xl p-3">
            <p className="text-white/40 text-[7px] uppercase tracking-wide mb-1">June 2026 Rent</p>
            <p className="text-white font-bold text-lg mb-1">$1,850</p>
            <p className="text-white/40 text-[8px] mb-2">Due June 1, 2026</p>
            <div className="bg-primary text-white text-center py-1.5 rounded-lg text-[9px] font-semibold">Pay Online</div>
          </div>
          {/* Maintenance */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-white/60 font-medium">Maintenance</p>
              <span className="text-primary text-[8px]">+ New</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/40">Kitchen faucet</p>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">in progress</span>
            </div>
          </div>
          {/* Bottom nav */}
          <div className="flex justify-around pt-1 border-t border-white/5">
            {["Home", "Payments", "Requests", "Docs"].map((t, i) => (
              <div key={t} className={`flex flex-col items-center gap-0.5 ${i === 0 ? "text-primary" : "text-white/30"}`}>
                <div className="w-3 h-3 rounded bg-current opacity-60" />
                <span className="text-[7px]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature showcase data ───────────────────────────────────────────────────

const FEATURES = [
  {
    id: "rent",
    icon: CreditCard,
    label: "Rent collection",
    title: "Get paid on time, every time.",
    body: "Tenants pay by card through their portal. Money lands in your bank within 2 business days. Automated reminders go out before due dates so you never have to chase.",
    mockup: <RentMockup />,
  },
  {
    id: "maintenance",
    icon: Wrench,
    label: "Maintenance tracking",
    title: "Every request, start to finish.",
    body: "Tenants submit requests with photos. You assign a vendor, schedule the work, track costs, and close it out — with a full history on every unit.",
    mockup: <MaintenanceMockup />,
  },
  {
    id: "documents",
    icon: FileText,
    label: "Leases & documents",
    title: "Sign it, store it, share it.",
    body: "Upload your lease, request e-signatures, and store every document in one place. Tenants can view and download from their portal anytime.",
    mockup: <DocumentsMockup />,
  },
  {
    id: "reports",
    icon: BarChart2,
    label: "Reports & expenses",
    title: "Know your numbers at a glance.",
    body: "Monthly owner statements, income vs. expenses, and per-property breakdowns. Export to CSV at tax time. Your accountant will love you.",
    mockup: <ReportsMockup />,
  },
];

const PLANS = [
  { id: "starter", name: "Starter", price: "$19", units: "Up to 5 units", desc: "Perfect for your first rental", highlight: false },
  { id: "grow", name: "Grow", price: "$49", units: "Up to 20 units", desc: "For growing portfolios", highlight: true },
  { id: "portfolio", name: "Portfolio", price: "$99", units: "Unlimited units", desc: "No unit cap, ever", highlight: false },
];

const LANDLORD_FAQS = [
  { q: "Does RentNest take a percentage of my rent?", a: "No, never. Flat monthly subscription. That's it." },
  { q: "Is there a free trial? Do I need a credit card?", a: "Every account gets a 14-day free trial with no credit card required. Trial accounts support up to 3 units." },
  { q: "What does my tenant need to use the portal?", a: "Just an email address. You send them a link — no app to download, no account to create." },
  { q: "How does online rent collection work?", a: "Stripe processes the payment. Funds hit your bank within 2 business days. Standard card fees apply (2.9% + $0.30) — we take nothing." },
  { q: "What if my tenant pays by check or cash?", a: "No problem. Record offline payments manually. Online payment is available but never required." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from account settings — no contracts, no cancellation fees." },
];

const TENANT_FAQS = [
  { q: "How do I get access to my tenant portal?", a: "Your landlord sends you a unique link by email. Just click it — no account to create, no password to set up." },
  { q: "Do I need to download an app?", a: "No. The portal works entirely in your browser on any device. Bookmark the link and you're set." },
  { q: "How do I pay rent online?", a: "Once your landlord has connected their bank account, you'll see a Pay button in your portal. Enter your card details and you're done — takes about 30 seconds." },
  { q: "What payment methods are accepted?", a: "Credit and debit cards via Stripe. Your landlord may also pass the small processing fee (2.9% + $0.30) through to you, or absorb it themselves — that's their call." },
  { q: "How do I submit a maintenance request?", a: "Go to Maintenance in your portal, hit New Request, describe the issue and attach photos if you have them. Your landlord gets notified right away." },
  { q: "Can I see my payment history?", a: "Yes — your full payment history is in the Payments tab, including dates, amounts, and receipts for every charge." },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingClient() {
  const [mode, setMode] = useState<"landlord" | "tenant">("landlord");
  const [activeFeature, setActiveFeature] = useState(0);
  const isLandlord = mode === "landlord";

  return (
    <div className="bg-[#080810] text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#080810]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="RentNest" className="h-8 w-auto" />
            <span className="font-bold text-white text-lg" style={{ fontFamily: "var(--font-lora, serif)" }}>RentNest</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/listings" className="hover:text-white transition">Browse rentals</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition">Sign in</Link>
            <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-0 sm:pt-24">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          {/* Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1">
              <button
                onClick={() => setMode("landlord")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${isLandlord ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white"}`}
              >
                <Building2 size={14} /> For Landlords
              </button>
              <button
                onClick={() => setMode("tenant")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${!isLandlord ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white"}`}
              >
                <Key size={14} /> For Tenants
              </button>
            </div>
          </div>

          {isLandlord ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-0">
              {/* Left */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
                  The landlord software that{" "}
                  <span className="text-primary">actually works</span>{" "}
                  for you.
                </h1>
                <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-lg">
                  Collect rent online, track maintenance, store leases, and give your tenants a portal — all for $19 a month. No percentage of rent. No per-lease fees. Ever.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link href="/signup" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition shadow-lg text-center">
                    Start Free 14-Day Trial
                  </Link>
                  <a href="#features" className="flex items-center justify-center gap-1.5 text-white/50 hover:text-white transition px-4 py-3.5 text-sm">
                    See how it works <ArrowRight size={14} />
                  </a>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/30">
                  {["No per-lease fees", "No % of rent", "Cancel anytime", "Free 14-day trial"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <Check size={12} className="text-primary shrink-0" />{t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Right — mockup */}
              <div className="relative lg:translate-y-8">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080810] to-transparent z-10 pointer-events-none" />
                <DashboardMockup />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-0">
              {/* Left */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6" style={{ fontFamily: "var(--font-lora, serif)" }}>
                  Renting made{" "}
                  <span className="text-primary">refreshingly simple.</span>
                </h1>
                <p className="text-lg text-white/50 mb-8 leading-relaxed max-w-lg">
                  Pay rent, submit maintenance requests, and stay connected with your landlord — all from a single link. No app to download, no account to create.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link href="/listings" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition shadow-lg text-center">
                    Browse Available Rentals
                  </Link>
                  <a href="#tenant-features" className="flex items-center justify-center gap-1.5 text-white/50 hover:text-white transition px-4 py-3.5 text-sm">
                    How it works <ArrowRight size={14} />
                  </a>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/30">
                  {["No account needed", "Pay by card", "Track every request", "Message your landlord"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <Check size={12} className="text-primary shrink-0" />{t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Right — phone mockup */}
              <div className="relative flex justify-center lg:justify-end lg:translate-y-8">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080810] to-transparent z-10 pointer-events-none" />
                <TenantPortalMockup />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats bar — landlord */}
      {isLandlord && (
        <section className="border-y border-white/5 px-6 py-8 mt-16">
          <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-white/5 text-center">
            {[
              { stat: "$0", label: "Per-lease fees" },
              { stat: "$19/mo", label: "Starting price" },
              { stat: "14 days", label: "Free trial, no card" },
            ].map((s) => (
              <div key={s.label} className="px-4 sm:px-8">
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{s.stat}</p>
                <p className="text-xs sm:text-sm text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature showcase — landlord */}
      {isLandlord && (
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-lora, serif)" }}>
                Everything you need.<br />Nothing you don't.
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left — feature list */}
              <div className="space-y-1">
                {FEATURES.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFeature(i)}
                    className={`w-full text-left rounded-xl p-5 transition-all ${activeFeature === i ? "bg-white/5 border border-white/10" : "border border-transparent hover:bg-white/3"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${activeFeature === i ? "bg-primary/20 text-primary" : "bg-white/5 text-white/30"}`}>
                        <f.icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm mb-1 transition-colors ${activeFeature === i ? "text-white" : "text-white/50"}`}>{f.label}</p>
                          <ChevronRight size={14} className={`transition-all ${activeFeature === i ? "text-primary rotate-90" : "text-white/20"}`} />
                        </div>
                        {activeFeature === i && (
                          <div>
                            <p className="text-white font-semibold mb-1.5">{f.title}</p>
                            <p className="text-white/50 text-sm leading-relaxed">{f.body}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {/* Right — mockup */}
              <div className="lg:sticky lg:top-24">
                {FEATURES[activeFeature].mockup}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tenant how it works */}
      {!isLandlord && (
        <section id="tenant-features" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>Three steps to a stress-free rental.</h2>
              <p className="text-white/40">Your landlord does the setup. You just click a link.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
              {[
                { step: "1", icon: "📨", title: "Get your portal link", body: "Your landlord sends you a unique link by email. No app, no sign-up form, no password." },
                { step: "2", icon: "🔓", title: "Tap to open your portal", body: "One click and you're in. Your lease, balance, and open requests are right there." },
                { step: "3", icon: "✅", title: "Pay rent & stay on top", body: "Pay by card in seconds, submit maintenance photos, download documents, and message your landlord — all in one place." },
              ].map((s) => (
                <div key={s.step} className="relative bg-white/3 rounded-2xl p-6 border border-white/5">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg">{s.step}</div>
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "💳", title: "Pay rent in seconds", body: "Pay by card through your portal. No checks, no Zelle requests, no awkward reminders." },
                { icon: "🔧", title: "Submit maintenance requests", body: "Describe the issue, attach photos, and submit. Track status from open to resolved." },
                { icon: "📄", title: "Access your documents", body: "Your lease and any shared documents are all in one place — no digging through old emails." },
                { icon: "💬", title: "Message your landlord", body: "Send and receive messages directly through your portal. Every conversation is logged." },
              ].map((b) => (
                <div key={b.title} className="flex gap-4 bg-white/3 rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition">
                  <div className="text-2xl">{b.icon}</div>
                  <div>
                    <h3 className="font-bold mb-1">{b.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cozy callout — landlord */}
      {isLandlord && (
        <section className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">For former Cozy users</p>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-lora, serif)" }}>Used Cozy before Apartments.com changed it?</h3>
                  <p className="text-white/40 text-sm">You'll feel right at home — same simplicity, no ads, no upsells, no one trying to list your properties.</p>
                </div>
                <Link href="/signup" className="shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition text-sm whitespace-nowrap">
                  Try RentNest Free →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing — landlord */}
      {isLandlord && (
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-lora, serif)" }}>Simple pricing</h2>
              <p className="text-white/40 text-lg">Scale up as you grow. Every plan includes every feature.</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl px-6 sm:px-10 py-6 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-5 text-center">Every plan includes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
                {["Online rent collection","Tenant portal","Maintenance tracking","Expense tracking & reports","Document storage","Automated reminders","Late fee tracking","CSV data export","Full payment history"].map((f) => (
                  <span key={f} className="flex items-center gap-2 text-sm text-white/50">
                    <Check size={12} className="text-primary shrink-0" />{f}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`rounded-2xl p-7 border flex flex-col ${plan.highlight ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 sm:-mt-3 sm:-mb-3" : "bg-white/3 border-white/5"}`}>
                  {plan.highlight && <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Most popular</p>}
                  <p className="text-sm mb-3 text-white/30">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold tracking-tight text-white">{plan.price}</span>
                    <span className="text-sm text-white/30">/mo</span>
                  </div>
                  <p className="font-semibold text-white mb-1">{plan.units}</p>
                  <p className="text-sm flex-1 mb-6 text-white/40">{plan.desc}</p>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold transition text-sm ${plan.highlight ? "bg-primary text-white hover:bg-primary-dark" : "border border-white/10 text-white hover:bg-white/5"}`}>
                    Start Free Trial
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/30 text-center mt-8">All plans include a 14-day free trial · No credit card required · Cancel any time</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "var(--font-lora, serif)" }}>Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8">
            {(isLandlord ? LANDLORD_FAQS : TENANT_FAQS).map((faq) => (
              <div key={faq.q} className="border-t border-white/5 pt-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[80px] -translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          {isLandlord ? (
            <>
              <h2 className="text-3xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>Ready to run a cleaner rental business?</h2>
              <p className="text-white/40 mb-10 max-w-lg mx-auto">Join landlords who replaced the spreadsheet and Venmo requests with something that actually works.</p>
              <Link href="/signup" className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition inline-block shadow-lg">
                Start Free Trial — No Credit Card Required
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-lora, serif)" }}>Find your next home.</h2>
              <p className="text-white/40 mb-10 max-w-lg mx-auto">Browse available rentals listed by landlords on RentNest.</p>
              <Link href="/listings" className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition inline-block shadow-lg">
                Browse Available Rentals
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="RentNest" className="h-6 w-auto opacity-50" />
            <span className="font-semibold text-white/40">RentNest</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/listings" className="hover:text-white transition">Browse rentals</Link>
            <Link href="/login" className="hover:text-white transition">Sign in</Link>
            <Link href="/signup" className="hover:text-white transition">Get started</Link>
          </div>
          <span>© 2026 RentNest. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
