"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { sendRentReminders } from "./actions";

export function SendRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function handle() {
    setLoading(true);
    const res = await sendRentReminders();
    setResult(res.sent);
    setLoading(false);
    setTimeout(() => setResult(null), 3000);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handle} disabled={loading}>
      <Send size={14} />
      {result !== null ? `Sent ${result}` : loading ? "Sending…" : "Send Reminders"}
    </Button>
  );
}
