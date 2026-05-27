"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function TenantMessageForm({ tenantName }: { tenantName: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/tenant/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2 items-end border-t border-gray-100 pt-4">
      <div className="flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={`Message your landlord as ${tenantName}…`}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30 resize-none"
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <Button type="submit" size="sm" disabled={loading || !body.trim()} className="shrink-0">
        <Send size={14} className="mr-1" />
        {loading ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
