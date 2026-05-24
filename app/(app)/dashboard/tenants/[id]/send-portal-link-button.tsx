"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check } from "lucide-react";
import { sendPortalLink } from "../actions";

export function SendPortalLinkButton({ tenantId, leaseId }: { tenantId: string; leaseId: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      await sendPortalLink(tenantId, leaseId);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleSend} disabled={loading || sent}>
      {sent ? <><Check size={14} /> Sent!</> : loading ? "Sending…" : <><Send size={14} /> Send Portal Link</>}
    </Button>
  );
}
