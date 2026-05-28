"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { updateTenant, deactivateTenant } from "../actions";

interface Props {
  tenant: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    notes: string | null;
  };
}

export function EditTenantModal({ tenant }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateTenant(tenant.id, {
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string,
        emergencyContactName: fd.get("emergencyContactName") as string,
        emergencyContactPhone: fd.get("emergencyContactPhone") as string,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deactivateTenant(tenant.id);
      router.push("/dashboard/tenants");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil size={14} /> Edit
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setConfirmDelete(false); }} title="Edit Tenant">
        {confirmDelete ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Are you sure you want to remove <strong>{tenant.name}</strong>? This will deactivate the tenant and hide them from your tenant list.</p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button type="button" onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? "Removing…" : "Remove Tenant"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" id="name" name="name" required defaultValue={tenant.name} />
            <Input label="Email address" id="email" name="email" type="email" defaultValue={tenant.email ?? ""} />
            <Input label="Phone" id="phone" name="phone" type="tel" defaultValue={tenant.phone ?? ""} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Emergency contact name" id="emergencyContactName" name="emergencyContactName" defaultValue={tenant.emergencyContactName ?? ""} />
              <Input label="Emergency contact phone" id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={tenant.emergencyContactPhone ?? ""} />
            </div>
            <Textarea label="Notes" id="notes" name="notes" defaultValue={tenant.notes ?? ""} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={14} /> Remove tenant
              </button>
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
