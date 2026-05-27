"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { recordPayment } from "./actions";
import { useRouter } from "next/navigation";
import { currentPeriod, formatCurrency } from "@/lib/utils";

interface Lease {
  id: string;
  monthlyRent: number;
  lateFeeEnabled: boolean;
  lateFeeType: string;
  lateFeeAmount: number;
  lateFeeGracePeriodDays: number;
  unit: { unitNumber: string; property: { address: string } };
  tenants: { tenant: { name: string } }[];
}

export function RecordPaymentModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [baseAmount, setBaseAmount] = useState("");
  const [daysLate, setDaysLate] = useState("");
  const [lateFee, setLateFee] = useState("");
  const router = useRouter();
  const { month, year } = currentPeriod();

  const selectedLease = leases.find((l) => l.id === selectedLeaseId);
  const total = (Number(baseAmount) || 0) + (Number(lateFee) || 0);

  useEffect(() => {
    if (open) {
      fetch("/api/landlord/active-leases").then((r) => r.json()).then(setLeases);
    }
  }, [open]);

  useEffect(() => {
    if (selectedLease) setBaseAmount(selectedLease.monthlyRent.toFixed(2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeaseId]);

  useEffect(() => {
    const days = Number(daysLate);
    if (!selectedLease || days <= 0 || !selectedLease.lateFeeEnabled || days <= selectedLease.lateFeeGracePeriodDays) {
      setLateFee("");
      return;
    }
    const fee =
      selectedLease.lateFeeType === "percentage"
        ? (selectedLease.monthlyRent * selectedLease.lateFeeAmount) / 100
        : selectedLease.lateFeeAmount;
    setLateFee(fee.toFixed(2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysLate, selectedLeaseId]);

  function handleClose() {
    setOpen(false);
    setSelectedLeaseId("");
    setBaseAmount("");
    setDaysLate("");
    setLateFee("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await recordPayment({
        leaseId: selectedLeaseId,
        amount: Number(baseAmount),
        lateFee: Number(lateFee) || 0,
        daysLate: Number(daysLate) || 0,
        periodMonth: Number(fd.get("periodMonth")),
        periodYear: Number(fd.get("periodYear")),
        paymentMethod: fd.get("paymentMethod") as string,
        paidAt: fd.get("paidAt") as string,
        notes: fd.get("notes") as string,
        sendReceipt: fd.get("sendReceipt") === "on",
      });
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Record Payment</Button>
      <Modal open={open} onClose={handleClose} title="Record Manual Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Lease"
            name="leaseId"
            required
            value={selectedLeaseId}
            onChange={(e) => setSelectedLeaseId(e.target.value)}
          >
            <option value="">Select lease…</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.tenants.map((lt) => lt.tenant.name).join(", ")} — {l.unit.property.address} Unit {l.unit.unitNumber}
              </option>
            ))}
          </Select>
          <Input
            label="Amount ($)"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Days late"
              name="daysLate"
              type="number"
              min="0"
              value={daysLate}
              onChange={(e) => setDaysLate(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Late fee ($)"
              name="lateFee"
              type="number"
              step="0.01"
              min="0"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
              placeholder="0.00"
            />
          </div>
          {Number(lateFee) > 0 && (
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Month" name="periodMonth" defaultValue={month}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </Select>
            <Input label="Year" name="periodYear" type="number" defaultValue={year} />
          </div>
          <Select label="Payment method" name="paymentMethod" required>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="zelle">Zelle</option>
            <option value="venmo">Venmo</option>
            <option value="money_order">Money order</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Date received"
            name="paidAt"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <Textarea label="Notes (optional)" name="notes" rows={2} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="sendReceipt" className="accent-primary" />
            Email receipt to tenant
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Record Payment"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
