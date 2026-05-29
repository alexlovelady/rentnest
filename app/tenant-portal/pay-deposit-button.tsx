"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayDepositButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/connect/create-deposit-payment", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment link");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handle} disabled={loading} className="w-full" size="lg">
        {loading ? "Loading…" : "Pay Security Deposit Online"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
