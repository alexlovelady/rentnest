"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createProperty } from "./actions";
import { useRouter } from "next/navigation";

export function NewPropertyModal() {
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
      await createProperty({
        nickname: fd.get("nickname") as string,
        address: fd.get("address") as string,
        address2: fd.get("address2") as string || null,
        city: fd.get("city") as string,
        state: fd.get("state") as string,
        zip: fd.get("zip") as string,
        propertyType: fd.get("propertyType") as string,
        squareFeet: fd.get("squareFeet") ? Number(fd.get("squareFeet")) : null,
        unitBedrooms: fd.get("bedrooms") ? Number(fd.get("bedrooms")) : undefined,
        unitBathrooms: fd.get("bathrooms") ? Number(fd.get("bathrooms")) : undefined,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Property
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Property">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Property nickname" id="nickname" name="nickname" placeholder="e.g. Oak Street Duplex" required />
          <Input label="Street address" id="address" name="address" placeholder="123 Main St" required />
          <Input label="Apt / Suite / Unit (optional)" id="address2" name="address2" placeholder="Apt 2B" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" id="city" name="city" required />
            <Input label="State" id="state" name="state" placeholder="TX" maxLength={2} required />
          </div>
          <Input label="ZIP code" id="zip" name="zip" required />
          <Select label="Property type" id="propertyType" name="propertyType">
            <option value="single_family">Single Family</option>
            <option value="duplex">Duplex</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="commercial">Commercial</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bedrooms" id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="1" required />
            <Input label="Bathrooms" id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" defaultValue="1" required />
          </div>
          <Input label="Sq ft (optional)" id="squareFeet" name="squareFeet" type="number" placeholder="1200" />
          <Textarea label="Notes (optional)" id="notes" name="notes" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Property"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
