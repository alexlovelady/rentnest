"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLease } from "../actions";
import { createTenant } from "../../tenants/actions";

interface Unit { id: string; unitNumber: string; propertyId: string; property: { nickname: string } }
interface Tenant { id: string; name: string; email: string | null }

const STEPS = ["Unit", "Tenants", "Terms", "Review"];

interface LateFeeDefaults {
  lateFeeEnabled: boolean;
  lateFeeType: "flat" | "percent";
  lateFeeAmount: string;
  lateFeeGracePeriodDays: string;
}

export function NewLeaseClient({ defaults }: { defaults?: LateFeeDefaults }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUnitId = searchParams.get("unitId") || "";

  const [step, setStep] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({ name: "", email: "", phone: "" });
  const [newTenantLoading, setNewTenantLoading] = useState(false);
  const [newTenantError, setNewTenantError] = useState("");

  const [form, setForm] = useState({
    unitId: preselectedUnitId,
    tenantIds: [] as string[],
    primaryTenantId: "",
    startDate: "",
    endDate: "",
    leaseType: "fixed" as "fixed" | "month_to_month",
    monthlyRent: "",
    securityDeposit: "",
    securityDepositPaid: false,
    rentDueDay: "1",
    lateFeeEnabled: defaults?.lateFeeEnabled ?? false,
    lateFeeType: (defaults?.lateFeeType ?? "flat") as "flat" | "percent",
    lateFeeAmount: defaults?.lateFeeAmount ?? "",
    lateFeeGracePeriodDays: defaults?.lateFeeGracePeriodDays ?? "5",
    leaseDuration: "12",
    petsAllowed: false,
    petDeposit: "",
    petRent: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/landlord/vacant-units").then(r => r.json()).then(setUnits);
    fetch("/api/landlord/tenants").then(r => r.json()).then(setTenants);
  }, []);

  function toggleTenant(id: string) {
    setForm((f) => {
      const ids = f.tenantIds.includes(id)
        ? f.tenantIds.filter((t) => t !== id)
        : [...f.tenantIds, id];
      return { ...f, tenantIds: ids, primaryTenantId: ids[0] || "" };
    });
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!newTenantForm.name.trim()) return;
    setNewTenantLoading(true);
    setNewTenantError("");
    try {
      const tenant = await createTenant({ name: newTenantForm.name, email: newTenantForm.email, phone: newTenantForm.phone });
      setTenants((prev) => [...prev, { id: tenant.id, name: tenant.name, email: tenant.email }]);
      setForm((f) => {
        const ids = [...f.tenantIds, tenant.id];
        return { ...f, tenantIds: ids, primaryTenantId: f.primaryTenantId || tenant.id };
      });
      setNewTenantForm({ name: "", email: "", phone: "" });
      setShowNewTenant(false);
    } catch (err: unknown) {
      setNewTenantError(err instanceof Error ? err.message : "Failed to create tenant");
    } finally {
      setNewTenantLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const lease = await createLease({
        ...form,
        endDate: form.leaseType === "month_to_month" ? null : form.endDate || null,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit) || 0,
        rentDueDay: Number(form.rentDueDay),
        lateFeeAmount: Number(form.lateFeeAmount) || 0,
        lateFeeGracePeriodDays: Number(form.lateFeeGracePeriodDays),
        petDeposit: Number(form.petDeposit) || 0,
        petRent: Number(form.petRent) || 0,
      });
      router.push(`/dashboard/leases/${lease.id}?created=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create lease");
      setLoading(false);
    }
  }

  const selectedUnit = units.find((u) => u.id === form.unitId);
  const selectedTenants = tenants.filter((t) => form.tenantIds.includes(t.id));

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-2">New Lease</h1>

      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs py-1.5 rounded-full font-medium transition-colors ${i === step ? "bg-[#C4622D] text-white" : i < step ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Select Unit</h2>
            <Select label="Unit" value={form.unitId} onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}>
              <option value="">Select a vacant unit…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.property.nickname} — Unit {u.unitNumber}</option>
              ))}
            </Select>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Add Tenants</h2>
            {tenants.length > 0 && (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg max-h-60 overflow-y-auto">
                {tenants.map((t) => (
                  <label key={t.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.tenantIds.includes(t.id)} onChange={() => toggleTenant(t.id)} className="accent-[#C4622D]" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.email || "No email"}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {form.tenantIds.length > 1 && (
              <Select label="Primary tenant" value={form.primaryTenantId} onChange={(e) => setForm((f) => ({ ...f, primaryTenantId: e.target.value }))}>
                {selectedTenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            )}

            {showNewTenant ? (
              <form onSubmit={handleCreateTenant} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">New tenant</p>
                {newTenantError && <p className="text-sm text-red-500">{newTenantError}</p>}
                <Input
                  label="Full name"
                  value={newTenantForm.name}
                  onChange={(e) => setNewTenantForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={newTenantForm.email}
                    onChange={(e) => setNewTenantForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <Input
                    label="Phone (optional)"
                    value={newTenantForm.phone}
                    onChange={(e) => setNewTenantForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={() => { setShowNewTenant(false); setNewTenantError(""); }}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={newTenantLoading}>{newTenantLoading ? "Creating…" : "Create & select"}</Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewTenant(true)}
                className="text-sm text-[#C4622D] hover:underline"
              >
                + Create new tenant
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Lease Terms</h2>
            <Select label="Lease type" value={form.leaseType} onChange={(e) => setForm((f) => ({ ...f, leaseType: e.target.value as "fixed" | "month_to_month" }))}>
              <option value="fixed">Fixed term</option>
              <option value="month_to_month">Month-to-month</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start date" type="date" value={form.startDate} onChange={(e) => {
                const start = e.target.value;
                setForm((f) => {
                  if (f.leaseDuration && f.leaseDuration !== "custom" && start) {
                    const d = new Date(start + "T00:00:00");
                    d.setMonth(d.getMonth() + Number(f.leaseDuration));
                    d.setDate(d.getDate() - 1);
                    return { ...f, startDate: start, endDate: d.toISOString().slice(0, 10) };
                  }
                  return { ...f, startDate: start };
                });
              }} required />
              {form.leaseType === "fixed" && (
                <Select label="Duration" value={form.leaseDuration} onChange={(e) => {
                  const dur = e.target.value;
                  setForm((f) => {
                    if (dur !== "custom" && f.startDate) {
                      const d = new Date(f.startDate + "T00:00:00");
                      d.setMonth(d.getMonth() + Number(dur));
                      d.setDate(d.getDate() - 1);
                      return { ...f, leaseDuration: dur, endDate: d.toISOString().slice(0, 10) };
                    }
                    return { ...f, leaseDuration: dur };
                  });
                }}>
                  <option value="">Select…</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                  <option value="custom">Custom end date</option>
                </Select>
              )}
            </div>
            {form.leaseType === "fixed" && (form.leaseDuration === "custom" || !form.leaseDuration) && (
              <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            )}
            {form.leaseType === "fixed" && form.leaseDuration && form.leaseDuration !== "custom" && form.endDate && (
              <p className="text-xs text-gray-500">End date: {new Date(form.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Monthly rent ($)" type="number" value={form.monthlyRent} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))} required />
              <Input label="Security deposit ($)" type="number" value={form.securityDeposit} onChange={(e) => setForm((f) => ({ ...f, securityDeposit: e.target.value }))} />
            </div>
            <Input label="Rent due day (1-28)" type="number" min="1" max="28" value={form.rentDueDay} onChange={(e) => setForm((f) => ({ ...f, rentDueDay: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.lateFeeEnabled} onChange={(e) => setForm((f) => ({ ...f, lateFeeEnabled: e.target.checked }))} className="accent-[#C4622D]" />
              Enable late fees
            </label>
            {form.lateFeeEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select label="Fee type" value={form.lateFeeType} onChange={(e) => setForm((f) => ({ ...f, lateFeeType: e.target.value as "flat" | "percent" }))}>
                  <option value="flat">Flat fee</option>
                  <option value="percent">Percent</option>
                </Select>
                <Input label="Amount" type="number" value={form.lateFeeAmount} onChange={(e) => setForm((f) => ({ ...f, lateFeeAmount: e.target.value }))} />
                <Input label="Grace days" type="number" value={form.lateFeeGracePeriodDays} onChange={(e) => setForm((f) => ({ ...f, lateFeeGracePeriodDays: e.target.value }))} />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.petsAllowed} onChange={(e) => setForm((f) => ({ ...f, petsAllowed: e.target.checked }))} className="accent-[#C4622D]" />
              Pets allowed
            </label>
            {form.petsAllowed && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Pet deposit ($)" type="number" value={form.petDeposit} onChange={(e) => setForm((f) => ({ ...f, petDeposit: e.target.value }))} />
                <Input label="Pet rent ($/mo)" type="number" value={form.petRent} onChange={(e) => setForm((f) => ({ ...f, petRent: e.target.value }))} />
              </div>
            )}
            <Textarea label="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Review</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Unit</span><span>{selectedUnit?.property.nickname} — Unit {selectedUnit?.unitNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tenants</span><span>{selectedTenants.map(t => t.name).join(", ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rent</span><span>${Number(form.monthlyRent).toFixed(2)}/mo</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Start</span><span>{form.startDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">End</span><span>{form.leaseType === "month_to_month" ? "Month-to-month" : form.endDate || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Security deposit</span><span>${Number(form.securityDeposit).toFixed(2)}</span></div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-6">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 0 && !form.unitId) || (step === 1 && form.tenantIds.length === 0) || (step === 2 && (!form.startDate || !form.monthlyRent))}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Creating…" : "Create Lease"}</Button>
        )}
      </div>
    </div>
  );
}
