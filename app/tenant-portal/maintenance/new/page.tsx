"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTenantMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/tenant/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        category: fd.get("category"),
        priority: fd.get("priority"),
      }),
    });
    if (res.ok) {
      router.push("/tenant-portal/maintenance");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit request");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/tenant-portal/maintenance" className="text-sm text-gray-500 flex items-center gap-1">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="text-xl font-bold text-[#1A2332]">Submit Maintenance Request</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="What's the issue?" name="title" placeholder="e.g. Kitchen faucet leaking" required />
          <Textarea label="Please describe the issue" name="description" required rows={4} placeholder="When did it start? How severe is it?" />
          <Select label="Category" name="category">
            {["plumbing", "electrical", "hvac", "appliance", "structural", "pest", "cleaning", "other"].map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </Select>
          <Select label="How urgent is this?" name="priority">
            <option value="low">Low — not urgent</option>
            <option value="normal">Normal</option>
            <option value="high">High — needs attention soon</option>
            <option value="emergency">Emergency — immediate danger</option>
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
