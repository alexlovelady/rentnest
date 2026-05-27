"use client";
import { useState } from "react";
import { waiveLateFee } from "./actions";
import { useRouter } from "next/navigation";

export function WaiveLateFeeButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await waiveLateFee(paymentId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2 transition disabled:opacity-50"
    >
      {loading ? "…" : "waive fee"}
    </button>
  );
}
