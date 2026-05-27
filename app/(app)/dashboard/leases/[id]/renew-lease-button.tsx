"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { renewLease } from "../actions";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface Props {
  leaseId: string;
  currentEndDate: Date | null;
  currentRent: number;
  currentLeaseType: string;
}

export function RenewLeaseButton({ leaseId, currentEndDate, currentRent, currentLeaseType }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const defaultStart = currentEndDate
    ? new Date(new Date(currentEndDate).getTime() + 86400000).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const defaultEnd = (() => {
    const d = new Date(defaultStart + "T00:00:00");
    d.setFullYear(d.getFullYear() + 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  const [form, setForm] = useState({
    leaseType: currentLeaseType,
    startDate: defaultStart,
    endDate: defaultEnd,
    monthlyRent: String(currentRent),
    increasePercent: "",
  });

  function applyIncrease(pct: string) {
    const n = parseFloat(pct);
    if (!isNaN(n)) {
      setForm((f) => ({ ...f, increasePercent: pct, monthlyRent: (currentRent * (1 + n / 100)).toFixed(2) }));
    } else {
      setForm((f) => ({ ...f, increasePercent: pct }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const newLease = await renewLease(leaseId, {
        startDate: form.startDate,
        endDate: form.leaseType === "month_to_month" ? null : form.endDate,
        monthlyRent: parseFloat(form.monthlyRent),
        leaseType: form.leaseType,
      });
      router.push(`/dashboard/leases/${newLease.id}?created=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to renew lease");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5">
        <RefreshCw size={13} /> Renew Lease
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-dark mb-1">Renew Lease</h2>
        <p className="text-sm text-gray-500 mb-5">Creates a new lease with the same tenants and terms. Security deposit is marked as already held.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lease type" value={form.leaseType} onChange={(e) => setForm((f) => ({ ...f, leaseType: e.target.value }))}>
            <option value="fixed">Fixed term</option>
            <option value="month_to_month">Month-to-month</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="New start date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
            {form.leaseType === "fixed" && (
              <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly rent ($)" type="number" step="0.01" value={form.monthlyRent} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))} required />
            <div>
              <Input
                label="Rent increase (%)"
                type="number"
                step="0.1"
                min="0"
                value={form.increasePercent}
                onChange={(e) => applyIncrease(e.target.value)}
                placeholder="e.g. 3"
              />
              {form.increasePercent && (
                <p className="text-xs text-gray-400 mt-0.5">{((currentRent * parseFloat(form.increasePercent || "0")) / 100).toFixed(2)}/mo increase</p>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Renewal"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
