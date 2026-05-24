"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createMaintenanceRequest } from "./actions";
import { useRouter } from "next/navigation";

interface Unit { id: string; unitNumber: string; property: { address: string } }

export function NewMaintenanceModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) fetch("/api/landlord/all-units").then(r => r.json()).then(setUnits);
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createMaintenanceRequest({
        unitId: fd.get("unitId") as string,
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        category: fd.get("category") as string,
        priority: fd.get("priority") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Request</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Unit" name="unitId" required>
            <option value="">Select unit…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.property.address} — Unit {u.unitNumber}</option>
            ))}
          </Select>
          <Input label="Title" name="title" placeholder="e.g. Kitchen sink leaking" required />
          <Textarea label="Description" name="description" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" name="category">
              {["plumbing", "electrical", "hvac", "appliance", "structural", "pest", "cleaning", "other"].map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </Select>
            <Select label="Priority" name="priority">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Submit Request"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
