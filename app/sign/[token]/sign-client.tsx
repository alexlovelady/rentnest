"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface Props {
  token: string;
  tenantName: string;
  address: string;
  monthlyRent: number;
  startDate: string;
  endDate: string | null;
  documentUrl: string | null;
}

export function SignClient({ token, tenantName, address, monthlyRent, startDate, endDate, documentUrl }: Props) {
  const [typedName, setTypedName] = useState("");
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  async function handleSign() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: typedName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit signature");
      }
      setSigned(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (signed) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-dark mb-2">Lease signed</h2>
        <p className="text-gray-500 text-sm">Your signature has been recorded. Your landlord has been notified.</p>
      </div>
    );
  }

  const nameMatches = typedName.trim().toLowerCase() === tenantName.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-2">
        <div className="flex justify-between"><span className="text-gray-500">Property</span><span className="font-medium text-right max-w-[60%]">{address}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Monthly rent</span><span className="font-medium">${monthlyRent.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Start date</span><span className="font-medium">{startDate}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">End date</span><span className="font-medium">{endDate ?? "Month-to-month"}</span></div>
      </div>

      {documentUrl && (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center border border-primary text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary/5 transition"
        >
          View Lease Document →
        </a>
      )}

      <div className="border-t border-gray-100 pt-6 space-y-4">
        <p className="text-sm text-gray-600">
          By typing your full legal name below and clicking <strong>Sign Lease</strong>, you agree that this constitutes
          your electronic signature and that you have read and agree to the terms of this lease agreement.
        </p>
        <Input
          label={`Type your full name to sign: "${tenantName}"`}
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder={tenantName}
        />
        <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            className="mt-0.5 accent-primary"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
          />
          I have read the lease agreement and agree to its terms. I understand this electronic signature is legally binding.
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSign}
          disabled={!nameMatches || !consented || loading}
        >
          {loading ? "Signing…" : "Sign Lease"}
        </Button>
        {typedName.length > 0 && !nameMatches && (
          <p className="text-xs text-red-500 text-center">Name must match exactly: {tenantName}</p>
        )}
      </div>
    </div>
  );
}
