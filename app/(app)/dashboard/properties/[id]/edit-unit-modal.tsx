"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { updateUnit } from "../actions";
import { useRouter } from "next/navigation";

interface Props {
  unit: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number | null;
    notes: string | null;
  };
}

export function EditUnitModal({ unit }: Props) {
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
      await updateUnit(unit.id, {
        unitNumber: fd.get("unitNumber") as string,
        bedrooms: Number(fd.get("bedrooms")),
        bathrooms: Number(fd.get("bathrooms")),
        squareFeet: fd.get("squareFeet") ? Number(fd.get("squareFeet")) : null,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update unit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="p-1.5 rounded-md text-gray-400 hover:text-[#C4622D] hover:bg-orange-50 transition-colors"
        title="Edit unit"
      >
        <Pencil size={14} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Edit Unit ${unit.unitNumber}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Unit number / identifier" id="unitNumber" name="unitNumber" defaultValue={unit.unitNumber} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bedrooms" id="bedrooms" name="bedrooms" type="number" min="0" defaultValue={unit.bedrooms} required />
            <Input label="Bathrooms" id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" defaultValue={unit.bathrooms} required />
          </div>
          <Input label="Square feet (optional)" id="squareFeet" name="squareFeet" type="number" defaultValue={unit.squareFeet ?? ""} />
          <Textarea label="Notes (optional)" id="notes" name="notes" defaultValue={unit.notes ?? ""} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
