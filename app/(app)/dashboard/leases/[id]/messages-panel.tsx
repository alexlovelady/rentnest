"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendLandlordMessage } from "../actions";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: Date;
  tenant: { name: string } | null;
}

interface Props {
  leaseId: string;
  messages: Message[];
}

export function MessagesPanel({ leaseId, messages }: Props) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    await sendLandlordMessage(leaseId, body.trim());
    setBody("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <p className="text-sm text-gray-400">No messages yet.</p>
      )}

      {messages.length > 0 && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === "landlord" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === "landlord" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}>
                {m.senderRole === "tenant" && m.tenant && (
                  <p className="text-xs font-medium mb-1 opacity-70">{m.tenant.name}</p>
                )}
                <p>{m.body}</p>
                <p className={`text-xs mt-1 ${m.senderRole === "landlord" ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Type a message to your tenant(s)…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading || !body.trim()} className="shrink-0">
          <Send size={14} className="mr-1" />
          {loading ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
