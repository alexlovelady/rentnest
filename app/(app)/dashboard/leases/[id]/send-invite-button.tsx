"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check } from "lucide-react";
import { sendPortalLink } from "../../tenants/actions";

export function SendInviteButton({ tenantId, leaseId }: { tenantId: string; leaseId: string }) {
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
    <Button size="sm" variant="secondary" onClick={handleSend} disabled={loading || sent}>
      {sent ? <><Check size={12} /> Sent</> : loading ? "Sending…" : <><Send size={12} /> Send Portal Link</>}
    </Button>
  );
}
