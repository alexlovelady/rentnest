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
import { currentPeriod } from "@/lib/utils";

interface Lease { id: string; monthlyRent: number; unit: { unitNumber: string; property: { address: string } }; tenants: { tenant: { name: string } }[] }

export function RecordPaymentModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leases, setLeases] = useState<Lease[]>([]);
  const router = useRouter();
  const { month, year } = currentPeriod();

  useEffect(() => {
    if (open) {
      fetch("/api/landlord/active-leases").then(r => r.json()).then(setLeases);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await recordPayment({
        leaseId: fd.get("leaseId") as string,
        amount: Number(fd.get("amount")),
        periodMonth: Number(fd.get("periodMonth")),
        periodYear: Number(fd.get("periodYear")),
        paymentMethod: fd.get("paymentMethod") as string,
        paidAt: fd.get("paidAt") as string,
        notes: fd.get("notes") as string,
        sendReceipt: fd.get("sendReceipt") === "on",
      });
      setOpen(false);
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
      <Modal open={open} onClose={() => setOpen(false)} title="Record Manual Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lease" name="leaseId" required>
            <option value="">Select lease…</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.tenants.map(lt => lt.tenant.name).join(", ")} — {l.unit.property.address} Unit {l.unit.unitNumber}
              </option>
            ))}
          </Select>
          <Input label="Amount ($)" name="amount" type="number" step="0.01" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Month" name="periodMonth" defaultValue={month}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("en-US", { month: "long" })}</option>
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
          <Input label="Date received" name="paidAt" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
          <Textarea label="Notes (optional)" name="notes" rows={2} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="sendReceipt" className="accent-[#C4622D]" />
            Email receipt to tenant
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Record Payment"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
