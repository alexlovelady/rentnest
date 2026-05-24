"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { terminateLease } from "../actions";
import { useRouter } from "next/navigation";

export function TerminateLeaseButton({ leaseId }: { leaseId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleTerminate() {
    setLoading(true);
    await terminateLease(leaseId, reason);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Terminate Lease</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Terminate Lease">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">This will mark the lease as terminated. This action cannot be undone.</p>
          <Textarea label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Tenant gave notice, non-payment, etc." />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleTerminate} disabled={loading}>{loading ? "Terminating…" : "Terminate"}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
