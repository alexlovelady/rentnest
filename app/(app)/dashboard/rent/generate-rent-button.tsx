"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateRent } from "./actions";
import { useRouter } from "next/navigation";

export function GenerateRentButton({ month, year }: { month: number; year: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await generateRent(month, year);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handle} disabled={loading}>
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Generating…" : "Generate Charges"}
    </Button>
  );
}
