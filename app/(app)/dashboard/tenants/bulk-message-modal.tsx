"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { sendBulkMessage } from "./actions";

export function BulkMessageModal({ recipientCount }: { recipientCount: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await sendBulkMessage({
        subject: fd.get("subject") as string,
        message: fd.get("message") as string,
      });
      setSent(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSent(false);
    setError("");
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Mail size={14} /> Message Tenants
      </Button>
      <Modal open={open} onClose={handleClose} title="Message All Tenants">
        {sent ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium text-gray-900 mb-1">Messages sent</p>
            <p className="text-sm text-gray-500 mb-4">Your message was sent to {recipientCount} tenant{recipientCount !== 1 ? "s" : ""}.</p>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              Sends an email to all <strong>{recipientCount} tenant{recipientCount !== 1 ? "s" : ""}</strong> with an active lease and an email address on file.
            </p>
            <Input label="Subject" name="subject" required placeholder="e.g. Water shutoff Thursday 9am–noon" />
            <Textarea label="Message" name="message" rows={5} required placeholder="Write your message here…" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={loading || recipientCount === 0}>
                {loading ? "Sending…" : `Send to ${recipientCount} tenant${recipientCount !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
