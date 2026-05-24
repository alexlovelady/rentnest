"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createUnit } from "../actions";
import { useRouter } from "next/navigation";

export function AddUnitModal({ propertyId }: { propertyId: string }) {
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
      await createUnit(propertyId, {
        unitNumber: fd.get("unitNumber") as string,
        bedrooms: Number(fd.get("bedrooms")),
        bathrooms: Number(fd.get("bathrooms")),
        squareFeet: fd.get("squareFeet") ? Number(fd.get("squareFeet")) : null,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add unit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Add Unit</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Unit">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Unit number / identifier" id="unitNumber" name="unitNumber" placeholder="e.g. 2, B, Upper" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bedrooms" id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="1" required />
            <Input label="Bathrooms" id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" defaultValue="1" required />
          </div>
          <Input label="Square feet" id="squareFeet" name="squareFeet" type="number" />
          <Textarea label="Notes (optional)" id="notes" name="notes" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding…" : "Add Unit"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
