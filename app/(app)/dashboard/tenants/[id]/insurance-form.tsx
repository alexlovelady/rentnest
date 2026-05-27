"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInsurance } from "../actions";
import { useRouter } from "next/navigation";

interface Props {
  tenantId: string;
  provider: string | null;
  policyNumber: string | null;
  expiresAt: Date | null;
}

export function InsuranceForm({ tenantId, provider, policyNumber, expiresAt }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updateInsurance(tenantId, {
      insuranceProvider: fd.get("insuranceProvider") as string,
      insurancePolicyNumber: fd.get("insurancePolicyNumber") as string,
      insuranceExpiresAt: fd.get("insuranceExpiresAt") as string,
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between">
        <div className="text-sm space-y-0.5">
          {provider ? (
            <>
              <p><span className="text-gray-500">Provider:</span> {provider}</p>
              {policyNumber && <p><span className="text-gray-500">Policy #:</span> {policyNumber}</p>}
              {expiresAt && <p><span className="text-gray-500">Expires:</span> {new Date(expiresAt).toLocaleDateString()}</p>}
            </>
          ) : (
            <p className="text-gray-400">No insurance on file</p>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          {provider ? "Edit" : "Add"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Insurance provider" name="insuranceProvider" defaultValue={provider || ""} placeholder="e.g. State Farm" />
      <Input label="Policy number" name="insurancePolicyNumber" defaultValue={policyNumber || ""} placeholder="Optional" />
      <Input label="Expiration date" name="insuranceExpiresAt" type="date" defaultValue={expiresAt ? new Date(expiresAt).toISOString().split("T")[0] : ""} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </form>
  );
}
