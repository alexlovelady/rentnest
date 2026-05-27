"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateAccount, updateNotifications, updateLateFeeDefaults, markConnectReady, updateContactVisibility } from "./actions";
import type { Landlord } from "@prisma/client";
import { useRouter } from "next/navigation";

interface Props {
  user: Landlord;
  daysLeft: number | null;
}

const PLANS = [
  { id: "starter", label: "Starter", price: "$19/mo", units: "5 units" },
  { id: "grow", label: "Grow", price: "$49/mo", units: "20 units" },
  { id: "portfolio", label: "Portfolio", price: "$99/mo", units: "Unlimited units" },
];

export function SettingsClient({ user, daysLeft }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  async function saveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving("account");
    const fd = new FormData(e.currentTarget);
    await updateAccount({ name: fd.get("name") as string, phone: fd.get("phone") as string, timezone: fd.get("timezone") as string });
    setSaving(null);
    router.refresh();
  }

  async function saveNotifications(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving("notifications");
    const fd = new FormData(e.currentTarget);
    await updateNotifications({
      notifyOnPayment: fd.has("notifyOnPayment"),
      notifyOnMaintenance: fd.has("notifyOnMaintenance"),
      notifyOnOverdue: fd.has("notifyOnOverdue"),
      notifyOnLeaseExpiring: fd.has("notifyOnLeaseExpiring"),
      notifyOnInsuranceExpiring: fd.has("notifyOnInsuranceExpiring"),
      notifyOnSignature: fd.has("notifyOnSignature"),
    });
    setSaving(null);
  }

  async function saveLateFees(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving("latefee");
    const fd = new FormData(e.currentTarget);
    await updateLateFeeDefaults({
      feePassthrough: fd.has("feePassthrough"),
      defaultLateFeeEnabled: fd.has("defaultLateFeeEnabled"),
      defaultLateFeeType: fd.get("defaultLateFeeType") as "flat" | "percent",
      defaultLateFeeAmount: Number(fd.get("defaultLateFeeAmount") || 0),
      defaultLateFeeGraceDays: Number(fd.get("defaultLateFeeGraceDays") || 5),
    });
    setSaving(null);
  }

  async function startConnect() {
    setConnectLoading(true);
    const res = await fetch("/api/connect/onboard", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setConnectLoading(false);
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setBillingLoading(false);
  }

  async function startCheckout(plan: string) {
    setBillingLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setBillingLoading(false);
  }

  async function checkConnectStatus() {
    setCheckLoading(true);
    await markConnectReady();
    router.refresh();
    setCheckLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveAccount} className="space-y-4">
            <Input label="Full name" name="name" defaultValue={user.name} required />
            <Input label="Email" name="email" type="email" defaultValue={user.email} disabled className="opacity-60" />
            <Input label="Phone" name="phone" type="tel" defaultValue={user.phone || ""} />
            <Select label="Timezone" name="timezone" defaultValue={user.timezone}>
              <option value="America/New_York">Eastern</option>
              <option value="America/Chicago">Central</option>
              <option value="America/Denver">Mountain</option>
              <option value="America/Los_Angeles">Pacific</option>
            </Select>
            <Button type="submit" disabled={saving === "account"}>{saving === "account" ? "Saving…" : "Save Account"}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={user.plan === "trial" ? "yellow" : user.plan === "cancelled" ? "red" : "green"} className="capitalize">{user.plan}</Badge>
            {daysLeft !== null && user.plan === "trial" && (
              <p className="text-sm text-gray-500">{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining in trial</p>
            )}
          </div>
          {user.plan === "trial" || user.plan === "cancelled" ? (
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-slate-dark">{p.label}</p>
                  <p className="text-primary font-semibold">{p.price}</p>
                  <p className="text-xs text-gray-500 mb-3">{p.units}</p>
                  <Button size="sm" className="w-full" onClick={() => startCheckout(p.id)} disabled={billingLoading}>Subscribe</Button>
                </div>
              ))}
            </div>
          ) : (
            <Button variant="secondary" onClick={openBillingPortal} disabled={billingLoading}>
              {billingLoading ? "Loading…" : "Manage Subscription"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stripe Connect */}
      <Card>
        <CardHeader><CardTitle>Online Rent Collection</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Connect your bank account so tenants can pay rent online. RentNest takes no percentage of rent — standard Stripe processing fees only.</p>
          {user.stripeConnectReady ? (
            <div className="flex items-center gap-3">
              <Badge variant="green">Connected</Badge>
              <p className="text-sm text-gray-500">Tenants can pay rent online.</p>
            </div>
          ) : user.stripeConnectId ? (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={startConnect} disabled={connectLoading}>Continue Setup</Button>
              <Button variant="ghost" onClick={checkConnectStatus} disabled={checkLoading}>{checkLoading ? "Checking…" : "Check Status"}</Button>
            </div>
          ) : (
            <Button onClick={startConnect} disabled={connectLoading}>{connectLoading ? "Loading…" : "Connect Bank Account"}</Button>
          )}
        </CardContent>
      </Card>

      {/* Payment Defaults */}
      <Card>
        <CardHeader><CardTitle>Payment Defaults</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveLateFees} className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Stripe Fee Passthrough</p>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="feePassthrough" defaultChecked={user.feePassthrough} className="accent-primary mt-0.5" />
                <span className="text-gray-600">Pass Stripe processing fees (~2.9% + $0.30) to the tenant. The tenant pays a slightly higher amount so you receive the full rent.</span>
              </label>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Default Late Fee Policy</p>
              <p className="text-xs text-gray-500 mb-3">Applied automatically when creating new leases. You can override per lease.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="defaultLateFeeEnabled" defaultChecked={user.defaultLateFeeEnabled} className="accent-primary" />
                  Enable late fees by default on new leases
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select label="Fee type" name="defaultLateFeeType" defaultValue={user.defaultLateFeeType}>
                    <option value="flat">Flat ($)</option>
                    <option value="percent">Percent (%)</option>
                  </Select>
                  <Input label={user.defaultLateFeeType === "percent" ? "Amount (%)" : "Amount ($)"} type="number" name="defaultLateFeeAmount" defaultValue={user.defaultLateFeeAmount} min={0} step="0.01" />
                  <Input label="Grace period (days)" type="number" name="defaultLateFeeGraceDays" defaultValue={user.defaultLateFeeGraceDays} min={0} max={30} />
                </div>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={saving === "latefee"}>{saving === "latefee" ? "Saving…" : "Save Payment Defaults"}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tenant contact info */}
      <Card>
        <CardHeader><CardTitle>Tenant Contact Info</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Choose what contact information tenants can see in their portal. Your email and phone are set in the Account section above.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving("contact");
              const fd = new FormData(e.currentTarget);
              await updateContactVisibility({
                showEmailToTenants: fd.has("showEmailToTenants"),
                showPhoneToTenants: fd.has("showPhoneToTenants"),
              });
              setSaving(null);
            }}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="showEmailToTenants" defaultChecked={user.showEmailToTenants} className="accent-primary" />
              Show my email address to tenants ({user.email})
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="showPhoneToTenants" defaultChecked={user.showPhoneToTenants} className="accent-primary" />
              Show my phone number to tenants{user.phone ? ` (${user.phone})` : " — add a phone number in Account first"}
            </label>
            <Button type="submit" size="sm" disabled={saving === "contact"}>{saving === "contact" ? "Saving…" : "Save"}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Email notifications */}
      <Card>
        <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveNotifications} className="space-y-3">
            {[
              { name: "notifyOnPayment", label: "When a tenant pays rent", checked: user.notifyOnPayment },
              { name: "notifyOnMaintenance", label: "When a maintenance request is submitted", checked: user.notifyOnMaintenance },
              { name: "notifyOnOverdue", label: "When rent is overdue (daily digest)", checked: user.notifyOnOverdue },
              { name: "notifyOnLeaseExpiring", label: "When a lease is expiring (60 and 30 days out)", checked: user.notifyOnLeaseExpiring },
              { name: "notifyOnInsuranceExpiring", label: "When a tenant's renters insurance is expiring", checked: user.notifyOnInsuranceExpiring },
              { name: "notifyOnSignature", label: "When a tenant signs their lease", checked: user.notifyOnSignature },
            ].map((n) => (
              <label key={n.name} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name={n.name} defaultChecked={n.checked} className="accent-primary" />
                {n.label}
              </label>
            ))}
            <Button type="submit" size="sm" disabled={saving === "notifications"}>{saving === "notifications" ? "Saving…" : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
