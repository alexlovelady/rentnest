"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createExpense } from "./actions";
import { useRouter } from "next/navigation";

interface Property { id: string; nickname: string }

const CATEGORIES = ["mortgage", "taxes", "insurance", "repairs", "maintenance", "utilities", "management", "advertising", "legal", "supplies", "other"];

export function AddExpenseModal({ properties }: { properties: Property[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createExpense({
        category: fd.get("category") as string,
        description: fd.get("description") as string,
        amount: Number(fd.get("amount")),
        date: fd.get("date") as string,
        vendor: fd.get("vendor") as string,
        propertyId: (fd.get("propertyId") as string) || null,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Add Expense</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Category (Schedule E)" name="category" required>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </Select>
          <Input label="Description" name="description" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount ($)" name="amount" type="number" step="0.01" required />
            <Input label="Date" name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
          </div>
          <Input label="Vendor (optional)" name="vendor" />
          <Select label="Property (optional)" name="propertyId">
            <option value="">General / not property-specific</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
          </Select>
          <Textarea label="Notes (optional)" name="notes" rows={2} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Expense"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
