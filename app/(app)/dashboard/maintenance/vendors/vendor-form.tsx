"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createVendor, updateVendor, deleteVendor } from "./actions";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
}

interface Props {
  vendor?: Vendor;
  trades: string[];
}

export function VendorForm({ vendor, trades }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      trade: fd.get("trade") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      website: fd.get("website") as string,
      notes: fd.get("notes") as string,
    };
    if (vendor) {
      await updateVendor(vendor.id, data);
    } else {
      await createVendor(data);
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!vendor) return;
    setLoading(true);
    await deleteVendor(vendor.id);
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant={vendor ? "secondary" : "default"} onClick={() => setOpen(true)}>
        {vendor ? "Edit" : "Add Vendor"}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-[#1A2332] mb-5">{vendor ? "Edit Vendor" : "Add Vendor"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" name="name" defaultValue={vendor?.name} required placeholder="e.g. Mike's Plumbing" />
          <Select label="Trade" name="trade" defaultValue={vendor?.trade || "general"}>
            {trades.map((t) => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </Select>
          <Input label="Phone" name="phone" type="tel" defaultValue={vendor?.phone || ""} />
          <Input label="Email" name="email" type="email" defaultValue={vendor?.email || ""} />
          <Input label="Website" name="website" defaultValue={vendor?.website || ""} placeholder="https://" />
          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={vendor?.notes || ""}
              rows={2}
              placeholder="e.g. Only available weekdays, prefers cash"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : vendor ? "Save" : "Add Vendor"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            {vendor && (
              <Button type="button" variant="secondary" onClick={handleDelete} disabled={loading} className="ml-auto text-red-500 hover:text-red-600">
                Delete
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
