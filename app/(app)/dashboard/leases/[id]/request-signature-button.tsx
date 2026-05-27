"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSignature, Check, RefreshCw } from "lucide-react";
import { requestSignature } from "../actions";

export function RequestSignatureButton({ leaseId, allSigned }: { leaseId: string; allSigned: boolean }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      await requestSignature(leaseId);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  if (allSigned) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <Check size={14} /> All tenants have signed
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" variant="secondary" onClick={handle} disabled={loading || sent}>
        {sent ? (
          <><Check size={12} /> Sent</>
        ) : loading ? "Sending…" : (
          <><FileSignature size={12} /> {sent ? "Resend Signature Request" : "Request Signature"}</>
        )}
      </Button>
      {sent && (
        <button onClick={() => setSent(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <RefreshCw size={11} /> Resend
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
