"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { updateProperty, deleteProperty } from "../actions";
import { useRouter } from "next/navigation";

interface Props {
  property: {
    id: string;
    nickname: string;
    address: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    propertyType: string;
    squareFeet: number | null;
    notes: string | null;
  };
}

export function EditPropertyModal({ property }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProperty(property.id, {
        nickname: fd.get("nickname") as string,
        address: fd.get("address") as string,
        address2: fd.get("address2") as string || null,
        city: fd.get("city") as string,
        state: fd.get("state") as string,
        zip: fd.get("zip") as string,
        propertyType: fd.get("propertyType") as string,
        squareFeet: fd.get("squareFeet") ? Number(fd.get("squareFeet")) : null,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update property");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProperty(property.id);
      router.push("/dashboard/properties");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Pencil size={14} /> Edit
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setConfirmDelete(false); }} title="Edit Property">
        {confirmDelete ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Are you sure you want to delete <strong>{property.nickname}</strong>? This will deactivate the property and all its units. Existing leases will not be deleted.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? "Deleting…" : "Yes, delete"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Property nickname" id="nickname" name="nickname" defaultValue={property.nickname} required />
            <Input label="Street address" id="address" name="address" defaultValue={property.address} required />
            <Input label="Apt / Suite / Unit (optional)" id="address2" name="address2" defaultValue={property.address2 ?? ""} placeholder="Apt 2B" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" id="city" name="city" defaultValue={property.city} required />
              <Input label="State" id="state" name="state" defaultValue={property.state} maxLength={2} required />
            </div>
            <Input label="ZIP code" id="zip" name="zip" defaultValue={property.zip} required />
            <Select label="Property type" id="propertyType" name="propertyType" defaultValue={property.propertyType}>
              <option value="single_family">Single Family</option>
              <option value="duplex">Duplex</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="commercial">Commercial</option>
            </Select>
            <Input label="Sq ft (optional)" id="squareFeet" name="squareFeet" type="number" defaultValue={property.squareFeet ?? ""} />
            <Textarea label="Notes (optional)" id="notes" name="notes" defaultValue={property.notes ?? ""} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmDelete(true)} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 size={14} /> Delete Property
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
