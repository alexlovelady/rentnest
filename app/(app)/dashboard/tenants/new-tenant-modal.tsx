"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createTenant } from "./actions";
import { useRouter } from "next/navigation";

export function NewTenantModal({ buttonLabel = "Add Tenant" }: { buttonLabel?: string }) {
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
      await createTenant({
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
      setError(err instanceof Error ? err.message : "Failed to add tenant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> {buttonLabel}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Tenant">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" id="name" name="name" required />
          <Input label="Email address" id="email" name="email" type="email" />
          <Input label="Phone" id="phone" name="phone" type="tel" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Emergency contact name" id="emergencyContactName" name="emergencyContactName" />
            <Input label="Emergency contact phone" id="emergencyContactPhone" name="emergencyContactPhone" />
          </div>
          <Textarea label="Notes" id="notes" name="notes" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Tenant"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
